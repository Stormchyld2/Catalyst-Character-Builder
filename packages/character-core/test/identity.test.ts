import { test } from "node:test";
import assert from "node:assert/strict";
import { createIdentity, nextRevision } from "../src/index.ts";
test("identity survives immutable revision increment", () => {
  const original = Object.freeze(createIdentity("fixture-character"));
  assert.deepEqual(nextRevision(original, 0), {characterId:"fixture-character", revision:1});
  assert.equal(original.revision, 0);
});
test("stale and invalid revisions are rejected", () => {
  assert.throws(() => nextRevision(createIdentity("fixture"), 1), /REVISION_CONFLICT/);
  assert.throws(() => nextRevision({characterId:"fixture", revision:-1}, -1), /INVALID_REVISION/);
  assert.throws(() => createIdentity(" "), /INVALID_ID/);
});
