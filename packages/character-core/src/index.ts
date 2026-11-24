/** C01 initial pure identity and revision primitives. No host dependencies. */
export type RecordIdentity = Readonly<{ characterId: string; revision: number }>;
export function createIdentity(id: string): RecordIdentity {
  if (typeof id !== "string" || !id.trim() || id.length > 256) throw new Error("INVALID_ID");
  return { characterId: id, revision: 0 };
}
export function nextRevision<T extends RecordIdentity>(record: T, expected: number): T {
  if (!Number.isSafeInteger(record.revision) || record.revision < 0 || record.revision >= Number.MAX_SAFE_INTEGER) throw new Error("INVALID_REVISION");
  if (record.revision !== expected) throw new Error("REVISION_CONFLICT");
  return { ...record, revision: record.revision + 1 };
}

export * from "./types.ts";
export * from "./schema.ts";
export * from "./character.ts";
export * from "./draft.ts";
export * from "./repository-port.ts";
export * from "./migrations.ts";
