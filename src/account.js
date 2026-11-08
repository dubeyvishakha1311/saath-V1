import { encryptNotebook, decryptNotebook, notebookSnapshot } from "./vault.js";

export const accountPages = [
  "login",
  "signup",
  "forgot-password",
  "reset-password",
  "account",
  "cloud",
];
// The controller accepts its SDK and UI callbacks so auth/cloud flows can be
// tested without real accounts, emails, privileged keys, or network access.
export function createAccountController(c) {
  let user = null,
    busy = false,
    message = "",
    problem = false,
    recovery = false,
    booted = false,
    authEpoch = 0;
  const getUser = () => user;
  const notify = (text, error = false) => {
    message = text;
    problem = error;
    const el =
      c.root.querySelector("#account-status") ||
      c.root.querySelector("#global-status");
    if (el) {
      el.textContent = text;
      el.classList.toggle("error", error);
    }
  };
  const tr = (en, hi) => c.t(en, hi);
  const sameUser = (id) => user?.id === id;
  function refresh() {
    if (accountPages.includes(c.getPage()) || c.getPage() === "settings")
      c.render();
  }
  function status() {
    return `<p id="account-status" role="status" aria-live="polite" class="status ${problem ? "error" : ""}">${c.escape(message)}</p>`;
  }
  function authError(error) {
    if (error?.code === "google_provider_disabled")
      return tr(
        "Google sign-in is not enabled for Saath yet. The project owner must configure Google OAuth in Supabase. Email sign-in and guest mode are still available.",
        "साथ में Google साइन-इन अभी सक्षम नहीं है। प्रोजेक्ट मालिक को Supabase में Google OAuth सेट करना होगा। ईमेल साइन-इन और अतिथि मोड उपलब्ध हैं।",
      );
    if (
      error?.status === 429 ||
      ["over_email_send_rate_limit", "over_request_rate_limit"].includes(
        error?.code,
      )
    )
      return tr(
        "Too many attempts or emails. Please wait before trying again.",
        "बहुत अधिक कोशिशें या ईमेल। कुछ देर बाद फिर कोशिश करें।",
      );
    if (error?.code === "email_not_confirmed")
      return tr(
        "Confirm your email before signing in. You can request another confirmation below.",
        "साइन इन से पहले ईमेल की पुष्टि करें। नीचे फिर पुष्टि ईमेल माँग सकते हैं।",
      );
    return tr(
      "Could not complete the request. Check your details and connection, then try again.",
      "अनुरोध पूरा नहीं हुआ। जानकारी और कनेक्शन जाँचकर फिर कोशिश करें।",
    );
  }
  async function run(task) {
    if (busy) return;
    busy = true;
    notify("");
    c.root
      .querySelectorAll('#account-form button, [data-action="google-signin"]')
      .forEach((el) => (el.disabled = true));
    c.root.querySelector("#account-form")?.setAttribute("aria-busy", "true");
    try {
      await task();
    } catch (error) {
      notify(authError(error), true);
    } finally {
      busy = false;
      c.root
        .querySelectorAll('#account-form button, [data-action="google-signin"]')
        .forEach((el) => (el.disabled = false));
      c.root.querySelector("#account-form")?.removeAttribute("aria-busy");
      c.root
        .querySelectorAll("#auth-password, #vault-password")
        .forEach((el) => (el.value = ""));
    }
  }
  async function receive(session, event) {
    const epoch = ++authEpoch;
    if (event === "SIGNED_OUT" || !session) {
      if (user) {
        user = null;
        recovery = false;
        message = "";
        c.switchNotebook(null);
      }
      return;
    }
    if (event === "TOKEN_REFRESHED" && sameUser(session.user?.id)) return;
    const { data, error } = await c.client.auth.getUser();
    if (epoch !== authEpoch) return;
    if (error || !data?.user) {
      user = null;
      recovery = false;
      c.switchNotebook(null);
      notify(
        tr(
          "Your session could not be verified. Please sign in again.",
          "सत्र की पुष्टि नहीं हुई। फिर साइन इन करें।",
        ),
        true,
      );
      return;
    }
    const changed = !sameUser(data.user.id);
    user = data.user;
    if (changed) c.switchNotebook(user.id);
    if (event === "PASSWORD_RECOVERY") {
      recovery = true;
      c.go("reset-password");
    } else refresh();
  }
  async function boot() {
    if (booted || !c.client) return;
    booted = true;
    c.client.auth.onAuthStateChange((event, session) => {
      queueMicrotask(() => {
        receive(session, event).catch(() =>
          notify(
            tr(
              "Session unavailable. Try signing in again.",
              "सत्र उपलब्ध नहीं। फिर साइन इन करें।",
            ),
            true,
          ),
        );
      });
    });
    try {
      const { data, error } = await c.client.auth.getSession();
      if (!error && data?.session)
        await receive(data.session, "INITIAL_SESSION");
    } catch {
      /* Guest notebook and emergency tools remain usable offline. */
    }
  }
  function intro() {
    if (user) return settingsCard();
    return `<div class="account-entry"><span class="eyebrow">${tr("AN ACCOUNT IS OPTIONAL", "खाता वैकल्पिक है")}</span><h2>${tr("Your notebook can stay with you.", "आपकी डायरी आपके साथ रह सकती है।")}</h2><p>${tr("Sign in for an optional encrypted cloud backup, or keep writing only on this device.", "वैकल्पिक एन्क्रिप्टेड क्लाउड बैकअप के लिए साइन इन करें, या केवल इस डिवाइस पर लिखें।")}</p><div class="row">${c.button(tr("Sign in", "साइन इन"), "login", "quiet")}${c.button(tr("Create account", "खाता बनाएँ"), "signup", "quiet")}</div></div>`;
  }
  function settingsCard() {
    return `<div class="card account-summary"><div class="eyebrow">${tr("ACCOUNT", "खाता")}</div><h2>${user ? tr("Signed in", "साइन इन है") : tr("On this device only", "केवल इस डिवाइस पर")}</h2><p>${user ? c.escape(user.email || "") : tr("No account needed for local journaling or Calm.", "स्थानीय डायरी या सुकून के लिए खाता ज़रूरी नहीं।")}</p>${c.button(user ? tr("Account & backup", "खाता और बैकअप") : tr("Sign in / create account", "साइन इन / खाता बनाएँ"), user ? "account" : "login", "quiet wide")}</div>`;
  }
  function googleOption() {
    return `<div class="google-option">${status()}<label class="check-row"><input id="google-consent" type="checkbox"><span>${tr("I am 18+ and choose to share my Google email and basic profile with Supabase for sign-in. This device stores my session; my notebook is not uploaded.", "मैं 18+ हूँ और साइन-इन के लिए अपना Google ईमेल और बुनियादी प्रोफ़ाइल Supabase से साझा करना चुनता/चुनती हूँ। यह डिवाइस सत्र रखता है; डायरी अपलोड नहीं होती।")}</span></label>${c.button(tr("Continue with Google", "Google से जारी रखें"), "google-signin", "quiet wide google-button")}<p class="auth-divider">${tr("or use email", "या ईमेल उपयोग करें")}</p></div>`;
  }
  function renderPage(page) {
    if (!accountPages.includes(page)) return null;
    if ((page === "account" || page === "cloud") && !user) page = "login";
    if (["login", "signup", "forgot-password"].includes(page) && user)
      return `<h1>${tr("You’re signed in.", "आप साइन इन हैं।")}</h1>${c.button(tr("Open account", "खाता खोलें"), "account", "primary")}`;
    const b = c.button,
      e = c.escape;
    if (
      ["login", "signup", "forgot-password", "reset-password"].includes(page)
    ) {
      const signup = page === "signup",
        forgot = page === "forgot-password",
        reset = page === "reset-password";
      if (reset && (!user || !recovery))
        return `<h1>${tr("Open your recovery link", "अपना रिकवरी लिंक खोलें")}</h1><p>${tr("Use the password-reset link from your email on the same device where you requested it. If it expired, request a new link.", "उसी डिवाइस पर ईमेल का पासवर्ड-रीसेट लिंक खोलें जहाँ से माँगा था। समय समाप्त हो तो नया लिंक माँगें।")}</p>${b(tr("Request reset email", "रीसेट ईमेल माँगें"), "forgot-password", "primary")}${status()}`;
      return `<div class="eyebrow">SAATH / ${tr("YOUR ACCOUNT", "आपका खाता")}</div><h1>${signup ? tr("A place to come back to.", "फिर लौटने की एक जगह।") : forgot ? tr("Forgot your password?", "पासवर्ड भूल गए?") : reset ? tr("Choose a new password.", "नया पासवर्ड चुनें।") : tr("Welcome back.", "फिर स्वागत है।")}</h1><p class="muted">${forgot ? tr("We’ll email a link if recovery is available for that address.", "उस पते के लिए रिकवरी उपलब्ध हो तो ईमेल लिंक भेजेंगे।") : tr("Cloud backup is optional. Signing in does not upload your notebook.", "क्लाउड बैकअप वैकल्पिक है। साइन इन करने से डायरी अपलोड नहीं होती।")}</p>${!forgot && !reset ? googleOption() : ""}<form id="account-form" data-auth-form="${page}">${!reset ? `<label for="auth-email">${tr("Email address", "ईमेल पता")}</label><input id="auth-email" type="email" autocomplete="email" maxlength="254" required inputmode="email">` : ""}${!forgot ? `<label for="auth-password">${reset ? tr("New password", "नया पासवर्ड") : tr("Password", "पासवर्ड")}</label><div class="password-field"><input id="auth-password" type="password" autocomplete="${signup || reset ? "new-password" : "current-password"}" minlength="${signup || reset ? 12 : 1}" maxlength="1024" required><button type="button" data-action="show-password" aria-pressed="false">${tr("Show", "दिखाएँ")}</button></div>${signup || reset ? `<small>${tr("Use at least 12 characters. Do not reuse your backup passphrase.", "कम से कम 12 अक्षर रखें। बैकअप पासफ़्रेज़ अलग रखें।")}</small>` : ""}` : ""}${signup ? `<label class="check-row"><input id="auth-consent" type="checkbox" required><span>${tr("I am 18+ and agree to send my email and authentication requests to Supabase. This device will store my sign-in session. Notebook backup needs a separate choice.", "मैं 18+ हूँ और ईमेल व प्रमाणीकरण अनुरोध Supabase को भेजने से सहमत हूँ। इस डिवाइस पर साइन-इन सत्र रहेगा। डायरी बैकअप के लिए अलग चुनाव होगा।")}</span></label>` : ""}<button type="submit" class="primary wide">${signup ? tr("Create account", "खाता बनाएँ") : forgot ? tr("Send reset link", "रीसेट लिंक भेजें") : reset ? tr("Save new password", "नया पासवर्ड सेव करें") : tr("Sign in", "साइन इन")}</button>${forgot || reset ? status() : ""}${page === "login" ? b(tr("Resend confirmation email", "पुष्टि ईमेल फिर भेजें"), "resend-confirmation", "text-button") : ""}</form>${page === "login" ? `<div class="auth-links">${b(tr("Forgot password?", "पासवर्ड भूल गए?"), "forgot-password", "text-button")}${b(tr("Create an account", "खाता बनाएँ"), "signup", "text-button")}</div>` : ""}${signup || forgot ? b(tr("Back to sign in", "साइन इन पर वापस"), "login", "text-button") : ""}${!reset ? b(tr("Continue without an account", "बिना खाते के जारी रखें"), "account-guest", "quiet wide") + b(tr("Open Calm without signing in", "बिना साइन इन सुकून खोलें"), "panic", "text-button") : ""}<p class="notice">${tr("Calm and crisis help never require login. Local writing is not encrypted at app level. Supabase stores your account email/session; cloud backups are separately encrypted with your own passphrase.", "सुकून और संकट सहायता के लिए लॉगिन ज़रूरी नहीं। स्थानीय लिखावट ऐप-स्तर पर एन्क्रिप्टेड नहीं है। Supabase आपका खाता ईमेल/सत्र रखता है; क्लाउड बैकअप आपकी पासफ़्रेज़ से अलग एन्क्रिप्ट होता है।")}</p>`;
    }
    if (page === "account")
      return `<h1>${tr("Your account.", "आपका खाता।")}</h1><p>${e(user.email || "")}</p><div class="card"><h2>${tr("Private by choice", "गोपनीयता, आपकी पसंद")}</h2><p>${tr("This account has its own notebook on this device. Nothing is uploaded automatically. Cloud backup is a manual, encrypted snapshot—not live sync.", "इस खाते की इस डिवाइस पर अपनी डायरी है। अपने आप कुछ अपलोड नहीं होता। क्लाउड बैकअप मैन्युअल एन्क्रिप्टेड प्रति है—लाइव सिंक नहीं।")}</p>${b(tr("Encrypted cloud backup", "एन्क्रिप्टेड क्लाउड बैकअप"), "cloud", "primary wide")}${b(tr("Copy my guest notebook into this account", "इस खाते में अतिथि डायरी की कॉपी लाएँ"), "import-guest", "quiet wide")}</div><div id="account-form"><div class="row">${b(tr("Sign out on this device", "इस डिवाइस पर साइन आउट"), "signout", "quiet")}${b(tr("Back to my notebook", "मेरी डायरी पर वापस"), "account-guest", "quiet")}</div>${status()}<details class="card"><summary>${tr("Delete this account", "यह खाता मिटाएँ")}</summary><p>${tr("Permanently deletes this Supabase account, its cloud backup and this account’s notebook on this device. Other offline devices and Supabase provider backups are not remotely wiped. Guest notebooks are separate.", "यह Supabase खाता, उसका क्लाउड बैकअप और इस डिवाइस पर इस खाते की डायरी हमेशा के लिए मिटेगी। दूसरे ऑफलाइन डिवाइस और Supabase प्रदाता बैकअप दूर से नहीं मिटते। अतिथि डायरी अलग है।")}</p><label for="delete-confirm">${tr("Type DELETE to confirm", "पुष्टि के लिए DELETE लिखें")}</label><input id="delete-confirm" autocomplete="off"><button type="button" class="danger" data-action="delete-account">${tr("Delete account permanently", "खाता हमेशा के लिए मिटाएँ")}</button></details></div>`;
    return `<h1>${tr("A backup, only if you want one.", "बैकअप, अगर आप चाहें।")}</h1><p>${tr("One encrypted backup per account. Upload replaces the previous cloud copy; restore replaces this account’s local notebook. There is no automatic upload or merge.", "हर खाते का एक एन्क्रिप्टेड बैकअप। अपलोड पिछली क्लाउड कॉपी बदलता है; रिस्टोर इस खाते की स्थानीय डायरी बदलता है। अपने आप अपलोड या मर्ज नहीं होता।")}</p><div class="notice">${tr("Use a separate backup passphrase. It is never saved or sent to Supabase. If you forget it, neither a password reset nor support can unlock your backup. Account email, backup timestamps and encrypted size are visible to the service; notebook content is encrypted before upload. Local storage remains unencrypted.", "अलग बैकअप पासफ़्रेज़ रखें। इसे सेव या Supabase को नहीं भेजा जाता। भूलने पर पासवर्ड रीसेट या सहायता बैकअप नहीं खोल सकती। सेवा को खाता ईमेल, बैकअप समय और एन्क्रिप्टेड आकार दिखता है; डायरी अपलोड से पहले एन्क्रिप्ट होती है। स्थानीय स्टोरेज बिना एन्क्रिप्शन के है।")}</div><form id="account-form" data-cloud-form><label for="vault-password">${tr("Backup passphrase (12+ characters)", "बैकअप पासफ़्रेज़ (12+ अक्षर)")}</label><input id="vault-password" type="password" minlength="12" maxlength="1024" autocomplete="off" required><label class="check-row"><input id="cloud-consent" type="checkbox" required><span>${tr("I choose to transfer this account’s notebook, including journal entries, drafts, mood, reflections, contact and screening answers, as encrypted data. I understand the replacement and passphrase limits above.", "मैं इस खाते की डायरी—पन्ने, ड्राफ़्ट, मन की बात, चिंतन, संपर्क और स्क्रीनिंग उत्तर—एन्क्रिप्टेड डेटा के रूप में ट्रांसफ़र करना चुनता हूँ। ऊपर दिए बदलाव और पासफ़्रेज़ की सीमाएँ समझता हूँ।")}</span></label><div class="row"><button type="submit" value="upload" class="primary">${tr("Encrypt & upload", "एन्क्रिप्ट और अपलोड")}</button><button type="submit" value="restore" class="quiet">${tr("Unlock & restore", "खोलें और रिस्टोर करें")}</button></div>${status()}${b(tr("Delete cloud backup only", "केवल क्लाउड बैकअप मिटाएँ"), "delete-cloud", "text-button")}</form><p class="notice">${tr("Not an audited encryption product. Keep important records elsewhere. For a shared device, sign out; app-level local encryption and secure native token storage remain production work.", "यह ऑडिट किया हुआ एन्क्रिप्शन उत्पाद नहीं है। ज़रूरी रिकॉर्ड कहीं और रखें। साझा डिवाइस पर साइन आउट करें; ऐप-स्तर स्थानीय एन्क्रिप्शन और सुरक्षित नेटिव टोकन स्टोरेज का काम बाकी है।")}</p>`;
  }
  function bind() {
    c.root
      .querySelector("[data-auth-form]")
      ?.addEventListener("submit", (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (!form.reportValidity()) return;
        const kind = form.dataset.authForm,
          email = form.querySelector("#auth-email")?.value.trim(),
          password = form.querySelector("#auth-password")?.value;
        run(async () => {
          if (!c.client) throw Error();
          let result;
          if (kind === "signup") {
            result = await c.client.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: c.redirectURL() },
            });
            if (result.error) throw result.error;
            notify(
              tr(
                "Check your email to confirm your account, then sign in. Open the link on the same device. Email delivery must be enabled for your address.",
                "खाता पुष्टि के लिए ईमेल देखें, फिर साइन इन करें। लिंक उसी डिवाइस पर खोलें। आपके पते के लिए ईमेल डिलीवरी उपलब्ध होनी चाहिए।",
              ),
            );
          } else if (kind === "forgot-password") {
            result = await c.client.auth.resetPasswordForEmail(email, {
              redirectTo: c.redirectURL(true),
            });
            if (result.error) throw result.error;
            notify(
              tr(
                "If recovery is available for that address, check your inbox. Open the link on this device.",
                "उस पते के लिए रिकवरी उपलब्ध हो तो इनबॉक्स देखें। लिंक इसी डिवाइस पर खोलें।",
              ),
            );
          } else if (kind === "reset-password") {
            if (!user || !recovery) throw Error();
            result = await c.client.auth.updateUser({ password });
            if (result.error) throw result.error;
            recovery = false;
            notify(
              tr(
                "Password updated. Your backup passphrase has not changed.",
                "पासवर्ड अपडेट हुआ। बैकअप पासफ़्रेज़ नहीं बदली।",
              ),
            );
            c.go("account");
          } else {
            result = await c.client.auth.signInWithPassword({
              email,
              password,
            });
            if (result.error) throw result.error;
            await receive(result.data.session, "SIGNED_IN");
            if (!["panic", "crisis"].includes(c.getPage())) c.go("account");
          }
        });
      });
    c.root
      .querySelector("[data-cloud-form]")
      ?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        const operation = event.submitter?.value;
        if (!["upload", "restore"].includes(operation)) return;
        const passphrase = c.root.querySelector("#vault-password").value;
        if (!c.root.querySelector("#cloud-consent").checked) return;
        const id = user?.id;
        if (!id) return;
        if (
          !c.confirm(
            operation === "upload"
              ? tr(
                  "Replace your cloud backup with this account’s current notebook?",
                  "इस खाते की वर्तमान डायरी से क्लाउड बैकअप बदलें?",
                )
              : tr(
                  "Replace this account’s current local notebook with its cloud backup? Unsaved local changes will be replaced.",
                  "इस खाते की स्थानीय डायरी क्लाउड बैकअप से बदलें? स्थानीय बदलाव बदल जाएँगे।",
                ),
          )
        )
          return;
        run(async () => {
          const { data: existing, error } = await c.client
            .from("saath_vaults")
            .select("*")
            .eq("user_id", id)
            .maybeSingle();
          if (error) throw error;
          if (!sameUser(id)) throw Error();
          if (operation === "upload") {
            const encrypted = await encryptNotebook(
              c.getNotebook(),
              passphrase,
              id,
            );
            if (!sameUser(id)) throw Error();
            const query = existing
              ? c.client
                  .from("saath_vaults")
                  .update(encrypted)
                  .eq("user_id", id)
                  .eq("revision", existing.revision)
              : c.client
                  .from("saath_vaults")
                  .insert({ ...encrypted, user_id: id });
            const result = await query.select("revision").maybeSingle();
            if (result.error || !result.data) throw Error();
            notify(
              tr(
                "Encrypted backup saved. Further writing stays local until you upload again.",
                "एन्क्रिप्टेड बैकअप सेव है। दोबारा अपलोड तक नई लिखावट स्थानीय रहेगी।",
              ),
            );
          } else {
            if (!existing) {
              notify(
                tr(
                  "No cloud backup exists for this account.",
                  "इस खाते का कोई क्लाउड बैकअप नहीं है।",
                ),
                true,
              );
              return;
            }
            let notebook;
            try {
              notebook = await decryptNotebook(existing, passphrase, id);
            } catch {
              notify(
                tr(
                  "Could not unlock the backup. Check the passphrase and account; no local data was changed.",
                  "बैकअप नहीं खुला। पासफ़्रेज़ और खाता जाँचें; स्थानीय डेटा नहीं बदला।",
                ),
                true,
              );
              return;
            }
            if (!sameUser(id)) throw Error();
            c.applyNotebook(notebook);
            notify(
              tr(
                "Backup restored on this device. Nothing was merged or uploaded.",
                "बैकअप इस डिवाइस पर रिस्टोर हुआ। मर्ज या अपलोड नहीं हुआ।",
              ),
            );
          }
        });
      });
  }
  async function removeCloud(id) {
    if (!sameUser(id)) throw Error();
    const { error } = await c.client.rpc("saath_delete_my_data", {
      expected_user_id: id,
    });
    if (error) throw error;
  }
  function handle(action) {
    if (
      busy &&
      [
        "signout",
        "import-guest",
        "delete-cloud",
        "delete-account",
        "delete",
        "resend-confirmation",
        "google-signin",
      ].includes(action)
    )
      return true;
    if (accountPages.includes(action)) {
      message = "";
      problem = false;
      c.go(action);
      return true;
    }
    if (action === "google-signin") {
      if (!c.root.querySelector("#google-consent")?.checked) {
        notify(
          tr(
            "Please confirm the Google sign-in choice above first.",
            "पहले ऊपर Google साइन-इन की सहमति दें।",
          ),
          true,
        );
        return true;
      }
      run(async () => {
        await c.startGoogleSignIn();
        notify(
          tr(
            "Complete sign-in in your browser. If you cancelled, you can try again.",
            "ब्राउज़र में साइन-इन पूरा करें। रद्द किया हो तो फिर कोशिश कर सकते हैं।",
          ),
        );
      });
      return true;
    }
    if (action === "show-password") {
      const input = c.root.querySelector("#auth-password"),
        button = c.root.querySelector('[data-action="show-password"]');
      input.type = input.type === "password" ? "text" : "password";
      button.textContent =
        input.type === "password" ? tr("Show", "दिखाएँ") : tr("Hide", "छिपाएँ");
      button.setAttribute("aria-pressed", String(input.type === "text"));
      return true;
    }
    if (action === "account-guest") {
      c.go(c.getNotebook().consent ? "home" : "welcome");
      return true;
    }
    if (action === "resend-confirmation") {
      const email = c.root.querySelector("#auth-email");
      if (!email?.reportValidity() || !email.value.trim()) return true;
      run(async () => {
        const { error } = await c.client.auth.resend({
          type: "signup",
          email: email.value.trim(),
          options: { emailRedirectTo: c.redirectURL() },
        });
        if (error) throw error;
        notify(
          tr(
            "If confirmation is available, check your inbox.",
            "पुष्टि उपलब्ध हो तो इनबॉक्स देखें।",
          ),
        );
      });
      return true;
    }
    if (action === "signout") {
      run(async () => {
        const { error } = await c.client.auth.signOut({ scope: "local" });
        if (error) throw error;
        await receive(null, "SIGNED_OUT");
      });
      return true;
    }
    if (action === "import-guest") {
      if (!user) return true;
      if (
        !c.confirm(
          tr(
            "Copy the guest notebook into this account’s local notebook? This replaces the current account notebook on this device, but does not upload it. The guest copy is kept.",
            "अतिथि डायरी इस खाते की स्थानीय डायरी में कॉपी करें? इस डिवाइस की वर्तमान खाता डायरी बदलेगी, अपलोड नहीं होगी। अतिथि कॉपी रहेगी।",
          ),
        )
      )
        return true;
      try {
        c.applyNotebook(notebookSnapshot(c.getGuestNotebook()));
        notify(
          tr(
            "Guest notebook copied locally. No upload took place.",
            "अतिथि डायरी स्थानीय रूप से कॉपी हुई। अपलोड नहीं हुआ।",
          ),
        );
      } catch {
        notify(
          tr(
            "Could not copy the guest notebook.",
            "अतिथि डायरी कॉपी नहीं हुई।",
          ),
          true,
        );
      }
      return true;
    }
    if (action === "delete-cloud") {
      if (
        !user ||
        !c.confirm(
          tr(
            "Permanently delete this account’s cloud backup? Local writing is kept.",
            "इस खाते का क्लाउड बैकअप हमेशा के लिए मिटाएँ? स्थानीय लिखावट रहेगी।",
          ),
        )
      )
        return true;
      const id = user.id;
      run(async () => {
        await removeCloud(id);
        notify(
          tr(
            "Cloud backup deleted. Local notebook kept.",
            "क्लाउड बैकअप मिटा। स्थानीय डायरी रखी गई।",
          ),
        );
      });
      return true;
    }
    if (action === "delete" && user) {
      if (
        !c.confirm(
          tr(
            "Delete this account’s notebook on this device AND its cloud backup? Your sign-in account is kept; other offline devices are not wiped.",
            "इस डिवाइस की खाता डायरी और उसका क्लाउड बैकअप मिटाएँ? साइन-इन खाता रहेगा; दूसरे ऑफलाइन डिवाइस नहीं मिटेंगे।",
          ),
        )
      )
        return true;
      const id = user.id;
      run(async () => {
        await removeCloud(id);
        if (!sameUser(id)) throw Error();
        c.clearNotebook();
      });
      return true;
    }
    if (action === "delete-account") {
      if (
        !user ||
        c.root.querySelector("#delete-confirm")?.value !== "DELETE"
      ) {
        notify(
          tr(
            "Type DELETE to confirm account deletion.",
            "खाता मिटाने के लिए DELETE लिखें।",
          ),
          true,
        );
        return true;
      }
      const id = user.id;
      run(async () => {
        const { data, error } = await c.client.functions.invoke(
          "saath-delete-account",
          { body: { confirm: "DELETE", expected_user_id: id } },
        );
        if (error || data?.deleted !== true) throw error || Error();
        if (!sameUser(id)) throw Error();
        c.clearNotebook();
        await c.client.auth.signOut({ scope: "local" });
        await receive(null, "SIGNED_OUT");
        c.go("welcome");
      });
      return true;
    }
    return false;
  }
  return {
    getUser,
    boot,
    renderPage,
    bind,
    handle,
    intro,
    settingsCard,
    notify,
    receive,
    isBusy: () => busy,
  };
}
