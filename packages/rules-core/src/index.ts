import {safeJson,object,string,array,fail,CoreError} from "../../character-core/src/schema.ts";
import type {Json,RulesContext} from "../../character-core/src/types.ts";
export type PackKind="base-rules"|"expansion"|"content"|"homebrew"|"overlay";
export interface Dependency {packId:string;version:string;optional:boolean}
export interface Definition {id:string;category:string;label:string;data:Json}
export interface PackManifest {schemaVersion:1;packId:string;version:string;systemId:string;editionIds:string[];kind:PackKind;title:string;publisher:string;license:string;attribution:string;distribution:"local-only"|"redistributable";dependencies:Dependency[];conflicts:string[];capabilities:string[];coreSchemaVersion:1}
export interface RulesPack {manifest:PackManifest;definitions:Definition[]}
export interface InstalledPack {pack:RulesPack;digest:string}
export interface Diagnostic {code:string;path:string}
export type Resolution={ok:true;context:RulesContext;definitions:readonly (Definition & {packId:string;version:string})[];capabilities:readonly string[];snapshotKey:string}|{ok:false;diagnostics:Diagnostic[]};
export type DigestProvider=(canonical:string)=>string;
const idPattern=/^[a-z0-9][a-z0-9._:-]{0,127}$/;
function id(v:unknown,p:string):string{const s=string(v,p);if(!idPattern.test(s))fail("INVALID_ID",p);return s;}
function version(v:unknown,p:string):string{const s=string(v,p);if(!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(s))fail("INVALID_VERSION",p);return s;}
function unique<T>(items:T[],key:(x:T)=>string,p:string):T[]{const seen=new Set<string>();for(const x of items){const k=key(x);if(seen.has(k))fail("DUPLICATE_ID",p);seen.add(k);}return items;}
function ids(v:unknown,p:string):string[]{return unique(array(v,p).map(x=>id(x,p)),x=>x,p);}
function digest(v:unknown):string{const s=string(v,"digest");if(!/^[a-f0-9]{64}$/.test(s))fail("INVALID_DIGEST","digest");return s;}
function rejectExecutable(v:Json):void{if(Array.isArray(v)){v.forEach(rejectExecutable);return;}if(v&&typeof v==="object"){for(const [k,x] of Object.entries(v)){if(/^(script|javascript|executable|eval|code|runtimeUrl)$/i.test(k))fail("EXECUTABLE_CONTENT",k);rejectExecutable(x);}}}
export function parsePack(input:unknown):RulesPack{
 const raw=safeJson(input);rejectExecutable(raw);const o=object(raw,"pack"),m=object(o.manifest,"manifest");
 if(m.schemaVersion!==1||m.coreSchemaVersion!==1)fail("UNSUPPORTED_SCHEMA","manifest");
 id(m.packId,"packId");version(m.version,"version");id(m.systemId,"systemId");
 if(!ids(m.editionIds,"editionIds").length)fail("EMPTY_EDITIONS","editionIds");
 if(!["base-rules","expansion","content","homebrew","overlay"].includes(String(m.kind)))fail("INVALID_KIND","kind");
 for(const k of ["title","publisher","license","attribution"])string(m[k],k);
 if(m.distribution!=="local-only"&&m.distribution!=="redistributable")fail("INVALID_DISTRIBUTION","distribution");
 unique(array(m.dependencies,"dependencies").map(x=>{const d=object(x,"dependency");id(d.packId,"dependency.packId");version(d.version,"dependency.version");if(typeof d.optional!=="boolean")fail("INVALID_DEPENDENCY","optional");return d;}),d=>String(d.packId),"dependencies");
 ids(m.conflicts,"conflicts");ids(m.capabilities,"capabilities");
 unique(array(o.definitions,"definitions").map(x=>{const d=object(x,"definition");id(d.id,"definition.id");id(d.category,"category");string(d.label,"label");if(!Object.hasOwn(d,"data"))fail("MISSING_DATA","definition");return d;}),d=>String(d.id),"definitions");
 return raw as unknown as RulesPack;
}
export function validatePack(input:unknown):Diagnostic[]{try{parsePack(input);return [];}catch(e){if(e instanceof CoreError)return [{code:e.code,path:e.path}];throw e;}}
function canonical(pack:RulesPack):string{return JSON.stringify(safeJson(pack));}
function freeze<T>(v:T):T{if(v&&typeof v==="object"){for(const x of Object.values(v))freeze(x);Object.freeze(v);}return v;}
export class RulesRegistry {
 private readonly packs=new Map<string,InstalledPack>();
 private readonly hash:DigestProvider;
 constructor(hash:DigestProvider){this.hash=hash;}
 install(input:unknown,expectedDigest:string,confirmed:boolean):InstalledPack{
 if(!confirmed)fail("CONFIRMATION_REQUIRED","install");
 const pack=parsePack(input),actual=digest(this.hash(canonical(pack)));
 if(actual!==digest(expectedDigest))fail("DIGEST_MISMATCH","pack");
 const key=pack.manifest.packId+"@"+pack.manifest.version,old=this.packs.get(key);
 if(old&&old.digest!==actual)fail("IMMUTABLE_VERSION",key);
 const item=freeze({pack,digest:actual});this.packs.set(key,item);return item;
 }
 list():readonly InstalledPack[]{return [...this.packs.values()].sort((a,b)=>compare(a.pack.manifest.packId+"@"+a.pack.manifest.version,b.pack.manifest.packId+"@"+b.pack.manifest.version));}
 remove(packId:string,version:string,protectedContexts:readonly RulesContext[]):void{if(protectedContexts.some(c=>c.packs.some(p=>p.packId===packId&&p.version===version)))fail("PACK_IN_USE",packId);this.packs.delete(packId+"@"+version);}
 resolve(context:RulesContext):Resolution{
 try{
 const c=safeJson(context) as unknown as RulesContext;id(c.systemId,"systemId");id(c.editionId,"editionId");
 const selected=new Map<string,InstalledPack>();
 for(const pin of unique(c.packs,p=>p.packId,"pins")){
 id(pin.packId,"packId");version(pin.version,"version");digest(pin.digest);
 const item=this.packs.get(pin.packId+"@"+pin.version);if(!item)fail("MISSING_PACK",pin.packId);
 if(item.digest!==pin.digest)fail("DIGEST_MISMATCH",pin.packId);
 const m=item.pack.manifest;if(m.systemId!==c.systemId||!m.editionIds.includes(c.editionId))fail("INCOMPATIBLE_EDITION",pin.packId);
 selected.set(pin.packId,item);
 }
 if(c.systemId!=="system-neutral"&&[...selected.values()].filter(x=>x.pack.manifest.kind==="base-rules").length!==1)fail("BASE_RULES_REQUIRED","packs");
 const active=new Set<string>(),done=new Set<string>(),ordered:InstalledPack[]=[];
 const visit=(key:string)=>{if(active.has(key))fail("DEPENDENCY_CYCLE",key);if(done.has(key))return;const item=selected.get(key);if(!item)fail("MISSING_DEPENDENCY",key);active.add(key);
 for(const conflict of item.pack.manifest.conflicts)if(selected.has(conflict))fail("PACK_CONFLICT",conflict);
 for(const dep of [...item.pack.manifest.dependencies].sort((a,b)=>compare(a.packId,b.packId))){const found=selected.get(dep.packId);if(!found){if(dep.optional)continue;fail("MISSING_DEPENDENCY",dep.packId);}if(found.pack.manifest.version!==dep.version)fail("DEPENDENCY_VERSION",dep.packId);visit(dep.packId);}
 active.delete(key);done.add(key);ordered.push(item);};
 for(const key of [...selected.keys()].sort())visit(key);
 const definitions: (Definition & {packId:string;version:string})[]=[];const seen=new Set<string>(),caps=new Set<string>();
 for(const item of ordered){const m=item.pack.manifest;if(m.kind==="overlay")fail("OVERLAY_NOT_SUPPORTED",m.packId);for(const cap of m.capabilities)caps.add(cap);for(const d of item.pack.definitions){if(seen.has(d.id))fail("DEFINITION_CONFLICT",d.id);seen.add(d.id);definitions.push({...d,packId:m.packId,version:m.version});}}
 definitions.sort((a,b)=>compare(a.id,b.id));c.packs.sort((a,b)=>compare(a.packId,b.packId));
 return freeze({ok:true,context:c,definitions,capabilities:[...caps].sort(),snapshotKey:digest(this.hash(JSON.stringify(safeJson(c))))});
 }catch(e){if(e instanceof CoreError)return {ok:false,diagnostics:[{code:e.code,path:e.path}]};throw e;}
 }
}
function compare(a:string,b:string):number{return a<b?-1:a>b?1:0;}
export function listOptions(resolved:Extract<Resolution,{ok:true}>,category:string){return resolved.definitions.filter(d=>d.category===category);}
export function inspectProvenance(resolved:Extract<Resolution,{ok:true}>,id:string){const d=resolved.definitions.find(x=>x.id===id);return d?{packId:d.packId,version:d.version}:undefined;}
export function previewPackChange(registry:RulesRegistry,current:RulesContext,target:RulesContext){const before=registry.resolve(current),after=registry.resolve(target);const old=new Set(before.ok?before.definitions.map(d=>d.id):[]),next=new Set(after.ok?after.definitions.map(d=>d.id):[]);return {before,after,removed:[...old].filter(x=>!next.has(x)).sort(),added:[...next].filter(x=>!old.has(x)).sort(),requiresConfirmation:true as const};}
