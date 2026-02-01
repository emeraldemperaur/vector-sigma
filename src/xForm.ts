class xForm {
    uuid: string = crypto.randomUUID();
    title: string;
    jsonDefinition: string;
    formStatus: number;
    timeStampOrigin: string;
    timeStampInProgress: string;
    timeStampComplete: string;
    errors: any[];
    output: any[];


    constructor(
        uuid: string,  title: string, jsonDefinition: string, formStatus: number, timeStampOrigin: string,
        timeStampInProgress: string, timeStampComplete: string, errors: any[], output: any[]){
        this.uuid = uuid;
        this.title = title;
        this.jsonDefinition = jsonDefinition;
        this.formStatus = formStatus;
        this.timeStampOrigin = timeStampOrigin;
        this.timeStampInProgress = timeStampInProgress;
        this.timeStampComplete = timeStampComplete;
        this.errors = errors;
        this.output = output;
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