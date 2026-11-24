import type {CharacterRecord,RulesContext,CreationMode} from "./types.ts";
import {validateCharacter,parseJson,fail} from "./schema.ts";
export function createCharacter(id:string,name:string,now:string,rulesContext:RulesContext={systemId:"system-neutral",editionId:"manual",packs:[]},creationMode:CreationMode="manual"):CharacterRecord {
 return validateCharacter({schemaVersion:1,characterId:id,revision:0,createdAt:now,updatedAt:now,identity:{name},rulesContext,creationMode,selections:[],values:[],overrides:[],inventory:[],abilities:[],features:[],actions:[],notes:[],attachments:[],advancement:[],sessionState:{resources:[],conditions:[]},sheet:{},audit:{}});
}
export function editCharacter(current:CharacterRecord,expected:number,now:string,edit:(copy:CharacterRecord)=>void):CharacterRecord {
 const copy=validateCharacter(current);if(copy.revision!==expected)fail("REVISION_CONFLICT","revision");
 edit(copy);if(copy.characterId!==current.characterId||copy.createdAt!==current.createdAt||copy.schemaVersion!==current.schemaVersion||copy.revision!==expected)fail("IMMUTABLE_IDENTITY","character");
 copy.revision=expected+1;copy.updatedAt=now;return validateCharacter(copy);
}
export function serializeCharacter(record:CharacterRecord):string{return JSON.stringify(validateCharacter(record),null,2)+"\n";}
export function parseCharacter(text:string):CharacterRecord{return validateCharacter(parseJson(text));}
