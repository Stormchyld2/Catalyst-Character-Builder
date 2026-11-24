export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type ObjectData = { [key: string]: Json };
export type PackPin = {packId:string; version:string; digest:string};
export type RulesContext = {systemId:string; editionId:string; packs:PackPin[]};
export type CreationMode = "manual" | "guided" | "hybrid";
export type Entry = ObjectData & {id:string};
export type AuthoredValue = Entry & {valueType:string; value:Json; provenance:string};
export interface CharacterRecord {
 schemaVersion:1; characterId:string; revision:number; createdAt:string; updatedAt:string;
 identity:ObjectData & {name:string}; rulesContext:RulesContext; creationMode:CreationMode;
 selections:Entry[]; values:AuthoredValue[]; overrides:Entry[]; inventory:Entry[]; abilities:Entry[];
 features:Entry[]; actions:Entry[]; notes:Entry[]; attachments:Entry[]; advancement:Entry[];
 sessionState:ObjectData & {resources:Json[]; conditions:Json[]}; sheet:ObjectData; audit:ObjectData;
}
export interface CharacterDraft {
 schemaVersion:1; draftId:string; revision:number; character:CharacterRecord;
 stepGraphVersion:string; stepId:string; pending:Json[]; validation:Json[];
}
