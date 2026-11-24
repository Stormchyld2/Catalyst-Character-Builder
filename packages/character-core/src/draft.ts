import type {CharacterDraft,CharacterRecord,Json} from "./types.ts";
import {validateDraft,parseJson,fail} from "./schema.ts";
export function createDraft(id:string,character:CharacterRecord,graph:string,step:string):CharacterDraft{return validateDraft({schemaVersion:1,draftId:id,revision:0,character,stepGraphVersion:graph,stepId:step,pending:[],validation:[]});}
export function checkpointDraft(draft:CharacterDraft,expected:number,step:string,character:CharacterRecord,pending:Json[],validation:Json[]):CharacterDraft {
 const d=validateDraft(draft);if(d.revision!==expected)fail("REVISION_CONFLICT","draft.revision");if(d.character.characterId!==character.characterId)fail("IMMUTABLE_IDENTITY","draft.character");return validateDraft({...d,revision:expected+1,stepId:step,character,pending,validation});
}
export function serializeDraft(d:CharacterDraft):string{return JSON.stringify(validateDraft(d),null,2)+"\n";}
export function parseDraft(text:string):CharacterDraft{return validateDraft(parseJson(text));}
