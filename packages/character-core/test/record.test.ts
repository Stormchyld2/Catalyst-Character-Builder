import {test} from "node:test";
import assert from "node:assert/strict";
import {createCharacter,editCharacter,parseCharacter,serializeCharacter,createDraft,checkpointDraft,parseDraft,serializeDraft,previewMigration,applyMigration} from "../src/index.ts";
const now="2026-11-24T00:00:00Z";
test("manual record roundtrip preserves identity, authored values and extensions",()=>{
 const c=createCharacter("char-1","A",now);
 const n=editCharacter(c,0,now,x=>{x.identity.name="B";x.identity.custom={origin:"fixture"};x.values.push({id:"user:luck",valueType:"integer",value:7,provenance:"manual"});});
 assert.equal(c.identity.name,"A");assert.equal(n.characterId,c.characterId);assert.equal(n.revision,1);
 assert.deepEqual(parseCharacter(serializeCharacter(n)),n);
 assert.equal(serializeCharacter(parseCharacter(serializeCharacter(n))),serializeCharacter(n));
 assert.throws(()=>editCharacter(n,0,now,()=>{}),/REVISION_CONFLICT/);
});
test("draft checkpoint resumes incomplete selections",()=>{
 const c=createCharacter("char-2","Draft",now);const d=createDraft("draft-1",c,"v1","start");
 const n=checkpointDraft(d,0,"choices",c,["pending"],[]);
 assert.deepEqual(parseDraft(serializeDraft(n)),n);assert.equal(d.stepId,"start");
});
test("unsafe and unsupported records rejected",()=>{
 assert.throws(()=>parseCharacter('{"schemaVersion":2}'),/UNSUPPORTED_SCHEMA/);
 assert.throws(()=>parseCharacter('{"__proto__":{}}'),/UNSAFE_KEY/);
 assert.throws(()=>parseCharacter('{'),/INVALID_JSON/);
 const c=createCharacter("char-3","A",now);
 assert.throws(()=>editCharacter(c,0,now,x=>{x.inventory.push({id:"same"},{id:"same"});}),/DUPLICATE_ID/);
});
test("migration preview preserves original and requires confirmation",()=>{
 const c=createCharacter("char-4","A",now);const raw=serializeCharacter(c);const p=previewMigration(raw);
 assert.equal(p.original,raw);assert.throws(()=>applyMigration(p,false),/CONFIRMATION_REQUIRED/);assert.deepEqual(applyMigration(p,true),c);
});
