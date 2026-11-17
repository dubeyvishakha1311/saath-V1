import { test } from "node:test";
import assert from "node:assert/strict";
import {
  riskSignal,
  reflect,
  scoreScreening,
  instruments,
} from "../src/features.js";
test("scales reject missing, fractional, out-of-range and extra answers", () => {
  for (const kind of Object.keys(instruments)) {
    const size = instruments[kind].items.length;
    assert.equal(scoreScreening(kind, new Array(size)), null);
    assert.equal(scoreScreening(kind, []), null);
    assert.equal(scoreScreening(kind, Array(size + 1).fill(0)), null);
    assert.equal(scoreScreening(kind, Array(size).fill(-1)), null);
    assert.equal(scoreScreening(kind, Array(size).fill(4)), null);
    assert.equal(scoreScreening(kind, Array(size).fill(0.5)), null);
    assert.equal(scoreScreening(kind, Array(size).fill("1")), null);
    assert.equal(
      scoreScreening(kind, Array(size).fill(3)).score,
      instruments[kind].max,
    );
  }
  assert.equal(scoreScreening("other", []), null);
});
test("PHQ item 9 alone triggers risk regardless of total", () => {
  for (let n = 1; n <= 3; n++) {
    const result = scoreScreening("phq9", [0, 0, 0, 0, 0, 0, 0, 0, n]);
    assert.equal(result.score, n);
    assert.equal(result.risk, true);
  }
  assert.equal(scoreScreening("phq9", Array(9).fill(0)).risk, false);
  assert.equal(scoreScreening("gad7", Array(7).fill(3)).risk, false);
});
test("English, Hindi and common Roman Hindi safety fixtures pause themes", () => {
  for (const text of [
    "I want to kill myself",
    "I am thinking of self harm",
    "better off dead",
    "आत्महत्या",
    "खुद को नुकसान",
    "मैं मरना चाहता हूँ",
    "I do not want to live",
    "marna chahta hun",
  ]) {
    assert.equal(riskSignal(text), true, text);
    assert.equal(reflect(text).risk, true);
    assert.deepEqual(reflect(text).themes, []);
  }
  assert.equal(riskSignal("I went for a walk"), false);
});
test("themes are tentative word matches with evidence, including Hindi", () => {
  assert.equal(reflect("").themes.length, 0);
  const r = reflect("I am lonely and tired but have hope");
  assert.deepEqual(
    r.themes.map((x) => x.id),
    ["connection", "tired", "hope"],
  );
  assert.equal(r.themes[0].evidence, "lonely");
  assert.equal(reflect("आज मैं अकेला और थका हूँ").themes.length, 2);
  assert.equal(reflect("a blossom").themes.length, 0);
});
