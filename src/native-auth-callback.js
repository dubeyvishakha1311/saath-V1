// Never log callback URLs, authorization codes or provider error descriptions.
// Android can deliver the same deep link through both launch URL and appUrlOpen.
export function createNativeAuthHandler({
  exchangeCode,
  closeBrowser,
  onError,
}) {
  const pending = new Map();
  const consumed = new Set();
  const close = async () => {
    try {
      await closeBrowser();
    } catch {
      /* Unsupported by some Android browsers. */
    }
  };
  return async function handle(url) {
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return false;
    }
    if (
      parsed.protocol !== "in.saath.wellness:" ||
      parsed.host !== "auth" ||
      parsed.pathname !== "/callback" ||
      parsed.username ||
      parsed.password
    )
      return false;
    const fragment = new URLSearchParams(parsed.hash.slice(1));
    const code = parsed.searchParams.get("code");
    if (
      ["error", "error_code", "error_description"].some(
        (key) => parsed.searchParams.has(key) || fragment.has(key),
      ) ||
      !code ||
      code.length > 2048 ||
      parsed.searchParams.getAll("code").length !== 1
    ) {
      await close();
      onError();
      return true;
    }
    if (consumed.has(code)) return true;
    if (pending.has(code)) return pending.get(code);
    const task = Promise.resolve()
      .then(async () => {
        try {
          const result = await exchangeCode(code);
          if (result?.error) throw new Error("Code exchange failed");
          consumed.add(code);
          // Memory-only, bounded duplicate protection; never persist codes.
          if (consumed.size > 32)
            consumed.delete(consumed.values().next().value);
          await close();
        } catch {
          await close();
          onError();
        }
        return true;
      })
      .finally(() => pending.delete(code));
    pending.set(code, task);
    return task;
  };
}
