import type {CharacterRecord,CharacterDraft} from "./types.ts";
export interface CharacterRepositoryPort {
 load(id:string):Promise<CharacterRecord|undefined>;
 save(record:CharacterRecord,expectedRevision:number|null):Promise<void>;
 loadDraft(id:string):Promise<CharacterDraft|undefined>;
 saveDraft(draft:CharacterDraft,expectedRevision:number|null):Promise<void>;
 /** Host must atomically promote and remove draft, with idempotent operation ID. */
 finalizeDraft(draftId:string,expectedRevision:number,record:CharacterRecord,operationId:string):Promise<void>;
}
