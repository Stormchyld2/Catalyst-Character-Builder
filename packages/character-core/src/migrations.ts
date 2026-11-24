import {parseJson,object,fail,validateCharacter} from "./schema.ts";
import type {CharacterRecord} from "./types.ts";
export interface MigrationPreview {from:1;to:1;original:string;candidate:CharacterRecord;changes:readonly string[];}
/** Version 1 is the first released schema; no fictional legacy format is accepted. */
export function previewMigration(text:string):MigrationPreview {
 const raw=parseJson(text);if(object(raw,"$").schemaVersion!==1)fail("UNSUPPORTED_SCHEMA","schemaVersion");
 return {from:1,to:1,original:text,candidate:validateCharacter(raw),changes:[]};
}
export function applyMigration(preview:MigrationPreview,confirmed:boolean):CharacterRecord {
 if(!confirmed)fail("CONFIRMATION_REQUIRED","migration");return validateCharacter(preview.candidate);
}
