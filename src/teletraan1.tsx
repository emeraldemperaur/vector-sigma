import { InputOption } from "utils/vinci";
import { xForm } from "xForm"

export const teletraan1 = (xFormModel: xForm, readOnlyMode: boolean) => {
    let jsonModel = JSON.stringify(xFormModel, null, 2);
    
    const inputAlphaTrion = (
        inputAlisa: string, inputType: string, inputWidth: number, inputLabel: string, 
        inputOptions: InputOption[], inputMinValue: number | string, inputMaxValue: number | string, 
        stepValue?: number | string, inputHeight?: number | string,
        newRow?: boolean, inputPlaceholder?: string, readOnly?: boolean, isHinted?: boolean, 
        hintText?: string, hintUrl?: string, inputUID?: string) => {

            if(inputWidth == null || inputWidth > 12) inputWidth = 4;
            if(inputHeight == null) inputHeight = 4;
            if(inputUID == null) inputUID = crypto.randomUUID();
            if(readOnlyMode) readOnly = true;
            switch(inputType.toLocaleLowerCase()){
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                case "":
                    return ""
                default:
                    return ""
            }

    }

}