// Validate string literal as JSON. 
// Throw error if invalid JSON or schema. 
// Return JSON object if valid JSON and schema
import { xForm, xFormSchema, xFormSection } from "./architect";

export class Argonaut{
    isValid: boolean;
    jsonDefinition: string;
    object: xForm
    name: string;
    id: string;
    model: Array<xFormSection>;
    sectionCount: number;

    constructor(jsonDefinition: string){
        const result = xFormSchema.safeParse(jsonDefinition)
        this.isValid = result.success;
        if (this.isValid && result.data){
            this.jsonDefinition = jsonDefinition;
            this.object = result.data;
            this.name = result.data.name;
            this.id = result.data.uuid;
            this.model = result.data.model
            this.sectionCount = result.data.model.length;
            console.log(`JSON {} Validation successful...`);
        }
        else{
            console.log(result.error?.issues);
            throw new Error(`JSON {} Invalid...\n::${result.error?.issues}\n::${result.error?.message}`);
        }
    }

    json(): JSON {
        return JSON.parse(this.jsonDefinition);
    }
}