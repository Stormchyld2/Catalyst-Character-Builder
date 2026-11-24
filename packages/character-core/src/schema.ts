import type {CharacterRecord,CharacterDraft,Json} from "./types.ts";
export class CoreError extends Error {
 readonly code:string; readonly path:string;
 constructor(code:string, path:string) { super(code+" at "+path); this.code=code; this.path=path; }
}
export function fail(code:string,path:string):never {throw new CoreError(code,path);}
export function object(v:unknown,p:string):Record<string,unknown>{
 if(!v || typeof v!=="object" || Array.isArray(v)) return fail("EXPECTED_OBJECT",p);
 return v as Record<string,unknown>;
}
export function string(v:unknown,p:string):string {
 if(typeof v!=="string" || !v.trim() || v.length>4096) return fail("INVALID_STRING",p); return v;
}
export function revision(v:unknown,p:string):number {
 if(typeof v!=="number" || !Number.isSafeInteger(v) || v<0) return fail("INVALID_REVISION",p); return v;
}
export function array(v:unknown,p:string):unknown[]{if(!Array.isArray(v)) return fail("EXPECTED_ARRAY",p);return v;}
export function safeJson(v:unknown):Json {
 let nodes=0; const active=new Set<object>();
 function walk(x:unknown,p:string,d:number):Json {
 if(++nodes>200000 || d>48) return fail("LIMIT",p);
 if(x===null || typeof x==="boolean" || typeof x==="string") return x;
 if(typeof x==="number" && Number.isFinite(x)) return x;
 if(typeof x!=="object" || !x) return fail("INVALID_JSON",p);
 if(active.has(x)) return fail("CYCLE",p); active.add(x);
 try {
 if(Array.isArray(x)) return Array.from(x,(y,i)=>walk(y,p+"."+i,d+1));
 const proto=Object.getPrototypeOf(x); if(proto!==Object.prototype && proto!==null) return fail("INVALID_OBJECT",p);
 const out:Record<string,Json>={};
 for(const k of Object.keys(x).sort()){if(["__proto__","constructor","prototype"].includes(k)) return fail("UNSAFE_KEY",p+"."+k);const desc=Object.getOwnPropertyDescriptor(x,k);if(!desc || !("value" in desc)) return fail("INVALID_PROPERTY",p);out[k]=walk(desc.value,p+"."+k,d+1);}
 return out;
 } finally {active.delete(x);}
 }
 const result=walk(v,"$",0);if(JSON.stringify(result).length>8_000_000) return fail("LIMIT","$");return result;
}
export function parseJson(text:string):Json {if(text.length>8_000_000) return fail("LIMIT","$");let raw:unknown;try{raw=JSON.parse(text);}catch{return fail("INVALID_JSON","$");}return safeJson(raw);}
function version(o:Record<string,unknown>){if(o.schemaVersion!==1) fail("UNSUPPORTED_SCHEMA","schemaVersion");}
function entries(v:unknown,p:string){const ids=new Set<string>();return array(v,p).map((x,i)=>{const e=object(x,p+"."+i);const id=string(e.id,p+".id");if(ids.has(id))fail("DUPLICATE_ID",p);ids.add(id);return e;});}
export function validateCharacter(input:unknown):CharacterRecord {
 const data=safeJson(input),o=object(data,"$");version(o);string(o.characterId,"characterId");revision(o.revision,"revision");
 for(const k of ["createdAt","updatedAt"]){const t=string(o[k],k);if(!Number.isFinite(Date.parse(t)))fail("INVALID_DATE",k);}
 string(object(o.identity,"identity").name,"identity.name");
 if(!["manual","guided","hybrid"].includes(String(o.creationMode)))fail("INVALID_MODE","creationMode");
 const ctx=object(o.rulesContext,"rulesContext");string(ctx.systemId,"systemId");string(ctx.editionId,"editionId");
 const pins=new Set<string>();for(const x of array(ctx.packs,"packs")){const p=object(x,"pack");const id=string(p.packId,"packId");if(pins.has(id))fail("DUPLICATE_ID","packs");pins.add(id);string(p.version,"version");string(p.digest,"digest");}
 for(const k of ["selections","values","overrides","inventory","abilities","features","actions","notes","attachments","advancement"])entries(o[k],k);
 for(const e of entries(o.values,"values")){const t=string(e.valueType,"valueType");string(e.provenance,"provenance");const v=e.value;const valid=t==="number"?typeof v==="number":t==="integer"?Number.isSafeInteger(v):t==="boolean"?typeof v==="boolean":["string","enum","reference","dice"].includes(t)?typeof v==="string":["list","set"].includes(t)?Array.isArray(v):["object","richText"].includes(t)?!!v&&typeof v==="object":false;if(!valid)fail("INVALID_VALUE","values");}
 const session=object(o.sessionState,"sessionState");entries(session.resources,"resources");entries(session.conditions,"conditions");object(o.sheet,"sheet");object(o.audit,"audit");
 return data as unknown as CharacterRecord;
}
export function validateDraft(input:unknown):CharacterDraft {
 const data=safeJson(input),o=object(data,"$");version(o);string(o.draftId,"draftId");revision(o.revision,"revision");validateCharacter(o.character);string(o.stepGraphVersion,"stepGraphVersion");string(o.stepId,"stepId");array(o.pending,"pending");array(o.validation,"validation");return data as unknown as CharacterDraft;
}
