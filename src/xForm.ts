import { Argonaut } from "utils/argonaut";
import { getTimeStamp } from "utils/chronos";

export class xForm {
    uuid: string;
    title: string;
    jsonDefinition: object;
    jsonObject: JSON;
    formStatus: number;
    timeStampOrigin: string;
    timeStampInProgress: string | null;
    timeStampComplete: string | null;
    errors: any[] | null;
    data: any[];
    component: object


    constructor( 
        jsonDefinition: string,  
        formStatus: number  = 0, 
        title?: string,
        timeStampOrigin?: string, 
        uuid?: string, 
        timeStampInProgress?: string | null, 
        timeStampComplete?: string | null, 
        errors?: any[], data?: any[], component?: object){
            const jsonArgonaut = new Argonaut(jsonDefinition);
            this.uuid = uuid || crypto.randomUUID();
            this.title = title || this.uuid;
            this.jsonDefinition = jsonArgonaut.object;
            this.jsonObject = jsonArgonaut.json();
            this.formStatus = formStatus;
            this.timeStampOrigin =  timeStampOrigin || getTimeStamp();
            this.timeStampInProgress = timeStampInProgress || null;
            this.timeStampComplete = timeStampComplete || null;
            this.errors = errors || [];
            this.data = data || [];
            this.component = component || {};
    }

    log(): void{
        console.log(`${this.uuid}::${this.title}`)
    }

    render(): void{
        console.log(`${this.uuid}::${this.title}`)
    }

    transform(): void{
        console.log(`${this.uuid}::${this.title}`)
    }

}