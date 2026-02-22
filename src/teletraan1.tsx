import { AvatarInput } from 'components/avatar/avatar';
import { ButtonInput } from 'components/button/button';
import { CheckboxGroupInput } from 'components/checkbox/checkbox';
import { DatePicker } from 'components/datepicker/datepicker';
import { Dropdown } from 'components/dropdown/dropdown';
import { DateRangePicker } from 'components/daterangepicker/daterangepicker';
import React from 'react'
import { InputOption, InputOptionsPlaceholder } from "utils/vinci";
import { avatarInputType, buttonInputType, checkboxInputType, conditionalInputType, creditCardInputType, 
    currencyInputType, datePickerInputType, dateRangePickerInputType, dateTimePickerInputType, dropdownInputType, 
    fileInputType, fileMultipleInputType, imageOutputType, passwordInputType, phoneInputType, radioInputType, 
    rangeSliderInputType, sectionTitleOutputType, selectInputType, selectMultipleInputType, sliderInputType, 
    stockInputType, textInputType, toggleInputType } from "utils/voltaire";
import { File } from 'components/file/file';
import { FileMultiple } from 'components/file/filemultiple';
import { ImageOutput } from 'components/image/image';
import { Input } from 'components/input/input';
import { PasswordInput } from 'components/input/passwordInput';
import { PhoneInput } from 'components/input/phoneInput';
import { CreditCardInput } from 'components/input/xCreditCardInput';
import { CurrencyInput } from 'components/inputcurrency/inputcurrency';
import { StockInput } from 'components/inputcurrency/stockInput';
import { RadioGroupInput } from 'components/radio/radio';
import { OptionSelect } from 'components/select/select';
import { MultipleSelect } from 'components/selectmultiple/selectmultiple';
import { SliderInput } from 'components/slider/slider';
import { RangeSlider } from 'components/slider/range';
import { Toggle } from 'components/toggle/toggle';
import { ConditionalTrigger } from 'components/conditional/conditional';
import { xForm } from 'utils/architect';
import { Row } from 'layouts/row/row';
import { Accordion, AccordionItem } from 'layouts/accordion/accordion';
import { Codex, CodexItem } from 'layouts/codex/codex';
import { CodexControls } from 'layouts/codex/codexcontrols';
import { SectionTitle } from 'components/xtitle/xtitle';
import { Icon } from 'components/icons/icons';

export type teletraan1Display = 'accordion' | 'codice' | 'codex' | 'dual';


export const teletraan1 = (xFormModel: xForm, readOnlyMode: boolean, displayMode: teletraan1Display, brandColor: string = "#000000") => {
    let jsonModel = JSON.stringify(xFormModel, null, 2);

    
    const inputAlphaTrion = (
        inputAlias: string, inputType: string, inputWidth: number, inputLabel: string, 
        inputMinValue: number | string, inputMaxValue: number | string, defaultValue: any, inputOptions: InputOption[],
        stepValue?: number | string, inputHeight?: number | string, toggledInput?: React.ReactNode,
        newRow?: boolean, inputPlaceholder?: string, readOnly?: boolean, isHinted?: boolean, 
        hintText?: string, hintUrl?: string, errorText?: string, inputUID?: string) => {


            if(inputWidth == null || inputWidth > 12) inputWidth = 4;
            if(inputHeight == null) inputHeight = 4;
            if(inputUID == null) inputUID = crypto.randomUUID();
            if(readOnlyMode) readOnly = true;
            switch(true){
                case avatarInputType.includes(inputType.toLocaleLowerCase()):
                    return <AvatarInput alias={inputAlias} width={inputWidth} inputLabel={inputLabel} key={inputUID} 
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} errorText={errorText}/>
                case buttonInputType.includes(inputType.toLocaleLowerCase()):
                    return <ButtonInput alias={inputAlias} width={inputWidth} readOnly={readOnly} newRow={newRow} 
                    children={<>{defaultValue}</>} key={inputUID}/>
                case checkboxInputType.includes(inputType.toLocaleLowerCase()):
                    return <CheckboxGroupInput alias={inputAlias} width={inputWidth} inputLabel={inputLabel} 
                    inputOptions={inputOptions} newRow={newRow} readOnly={readOnly} isHinted={isHinted} 
                    hintText={hintText} hintUrl={hintUrl} key={inputUID} errorText={errorText}/>
                case conditionalInputType.includes(inputType.toLocaleLowerCase()):
                    return <ConditionalTrigger alias={inputAlias} width={inputWidth} inputLabel={inputLabel} 
                    inputOptions={inputOptions} newRow={newRow} readOnly={readOnly} isHinted={isHinted} triggerValue={defaultValue}
                    hintText={hintText} hintUrl={hintUrl} key={inputUID} errorText={errorText} children={toggledInput}/>
                case datePickerInputType.includes(inputType.toLocaleLowerCase()):
                    return <DatePicker alias={inputAlias} inputLabel={inputLabel} width={inputWidth} 
                    placeholder={inputPlaceholder} newRow={newRow} readOnly={readOnly} isHinted={isHinted} 
                    hintText={hintText} hintUrl={hintUrl} key={inputUID} errorText={errorText}/>
                case dateRangePickerInputType.includes(inputType.toLocaleLowerCase()):
                    return <DateRangePicker alias={inputAlias} inputLabel={inputLabel} width={inputWidth} 
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case dateTimePickerInputType.includes(inputType.toLocaleLowerCase()):
                    return <DateRangePicker alias={inputAlias} inputLabel={inputLabel} width={inputWidth} newRow={newRow}
                    readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case dropdownInputType.includes(inputType.toLocaleLowerCase()):
                    return <Dropdown alias={inputAlias} inputLabel={inputLabel} width={inputWidth} inputOptions={inputOptions} 
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText} />
                case fileInputType.includes(inputType.toLocaleLowerCase()):
                    return <File alias={inputAlias} inputLabel={inputLabel} width={inputWidth} 
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText} preview/>
                case fileMultipleInputType.includes(inputType.toLocaleLowerCase()):
                    return <FileMultiple alias={inputAlias} inputLabel={inputLabel} width={inputWidth} placeholder={inputPlaceholder}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText} preview/>
                case imageOutputType.includes(inputType.toLocaleLowerCase()):
                    return <ImageOutput id={inputAlias} src={defaultValue} alt={inputPlaceholder} width={inputWidth} 
                    height={inputHeight}/>
                case textInputType.includes(inputType.toLocaleLowerCase()):
                    return <Input alias={inputAlias} inputLabel={inputLabel} width={inputWidth} placeholder={inputPlaceholder}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case passwordInputType.includes(inputType.toLocaleLowerCase()):
                    return <PasswordInput alias={inputAlias} inputLabel={inputLabel} width={inputWidth} placeholder={inputPlaceholder}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case phoneInputType.includes(inputType.toLocaleLowerCase()):
                    return <PhoneInput alias={inputAlias} inputLabel={inputLabel} width={inputWidth} placeholder={inputPlaceholder}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case creditCardInputType.includes(inputType.toLocaleLowerCase()):
                    return <CreditCardInput alias={inputAlias} inputLabel={inputLabel} width={inputWidth} placeholder={inputPlaceholder}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case currencyInputType.includes(inputType.toLocaleLowerCase()):
                    return <CurrencyInput alias={inputAlias} inputLabel={inputLabel} width={inputWidth} placeholder={inputPlaceholder}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case stockInputType.includes(inputType.toLocaleLowerCase()):
                    return <StockInput alias={inputAlias} inputLabel={inputLabel} width={inputWidth} 
                    placeholder={inputPlaceholder} defaultvalue={defaultValue}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case radioInputType.includes(inputType.toLocaleLowerCase()):
                    return <RadioGroupInput alias={inputAlias} inputLabel={inputLabel} width={inputWidth} inputOptions={inputOptions}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case selectInputType.includes(inputType.toLocaleLowerCase()):
                    return <OptionSelect alias={inputAlias} inputLabel={inputLabel} width={inputWidth} inputOptions={inputOptions}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case selectMultipleInputType.includes(inputType.toLocaleLowerCase()):
                    return <MultipleSelect alias={inputAlias} inputLabel={inputLabel} width={inputWidth} inputOptions={inputOptions}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case sliderInputType.includes(inputType.toLocaleLowerCase()):
                    return <SliderInput alias={inputAlias} inputLabel={inputLabel} width={inputWidth} stepvalue={Number(stepValue)}
                    minvalue={Number(inputMinValue)} maxvalue={Number(inputMaxValue)}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case rangeSliderInputType.includes(inputType.toLocaleLowerCase()):
                    return <RangeSlider alias={inputAlias} inputLabel={inputLabel} width={inputWidth} stepvalue={Number(stepValue)}
                    minvalue={Number(inputMinValue)} maxvalue={Number(inputMaxValue)}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
                case toggleInputType.includes(inputType.toLocaleLowerCase()):
                    return <Toggle alias={inputAlias} inputLabel={inputLabel} width={inputWidth}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText} icon={defaultValue}/>
                default:
                    return <Input alias={inputAlias} inputLabel={inputLabel} width={inputWidth} placeholder={inputPlaceholder}
                    newRow={newRow} readOnly={readOnly} isHinted={isHinted} hintText={hintText} hintUrl={hintUrl} 
                    key={inputUID} errorText={errorText}/>
            }
    }

    return(
    <>
    <Row>
    {displayMode === "dual" ? 
    <>
    Dual Display
    </> 
    : displayMode === "accordion" ? 
    <>
    Accordion Display
    <Accordion allowMultiple brandcolor={brandColor} titleColor='#ffffff'>
      {xFormModel.model.map( (formsection) => (
        <React.Fragment key={formsection.sectionId}>
            <AccordionItem key={formsection.sectionId} 
            sectionId={String(formsection.sectionId)} title={formsection.title}>
                <Row key={formsection.sectionId}>
                    {formsection.queries ? 
                    formsection.queries.map((xFormelement) => (
                        <React.Fragment key={xFormelement.queryId}>
                            {inputAlphaTrion(xFormelement.inputAlias, xFormelement.inputType, xFormelement.inputWidth,
                                xFormelement.inputLabel, Number(xFormelement.minValue), Number(xFormelement.maxValue), xFormelement.defaultValue,
                                [InputOptionsPlaceholder], xFormelement.stepValue, xFormelement.inputHeight,

                                xFormelement.toggledInput? inputAlphaTrion(xFormelement.toggledInput.inputAlias, xFormelement.toggledInput.inputType, xFormelement.toggledInput.inputWidth,
                                xFormelement.toggledInput.inputLabel, Number(xFormelement.toggledInput.minValue), Number(xFormelement.toggledInput.maxValue), xFormelement.toggledInput.defaultValue,
                                [InputOptionsPlaceholder], xFormelement.toggledInput.stepValue, xFormelement.toggledInput.inputHeight, null,  xFormelement.toggledInput.newRow, xFormelement.toggledInput.inputPlaceholder, 
                                readOnlyMode, xFormelement.toggledInput.isHinted, xFormelement.toggledInput.hintText || "", xFormelement.toggledInput.hintUrl || "",
                                xFormelement.toggledInput.errorText, String(xFormelement.toggledInput.queryId) || crypto.randomUUID()) : null,

                                xFormelement.newRow, xFormelement.inputPlaceholder, readOnlyMode, xFormelement.isHinted, xFormelement.hintText || "", xFormelement.hintUrl || "",
                                xFormelement.errorText, String(xFormelement.queryId) || crypto.randomUUID()
                            )}
                        </React.Fragment>
                    ))
                    : null}
                </Row>
            </AccordionItem>
        </React.Fragment>
    ))}
    </Accordion>
    </> 
    : displayMode === "codex" ? 
    <>Codex Display
    <Codex brandColor={brandColor}>
    {xFormModel.model.map( (formsection, index, array) => {
        
        const prevStepId = index > 0 ? String(array[index - 1].sectionId) : undefined;
        const nextStepId = index < array.length - 1 ? String(array[index + 1].sectionId) : undefined;
        
        return(
            <CodexItem key={formsection.sectionId} stepId={String(formsection.sectionId)} title={formsection.title}>
                <Row key={formsection.sectionId}>
                     {formsection.queries ? 
                    formsection.queries.map((xFormelement) => (
                        <React.Fragment key={xFormelement.queryId}>
                            {inputAlphaTrion(xFormelement.inputAlias, xFormelement.inputType, xFormelement.inputWidth,
                                xFormelement.inputLabel, Number(xFormelement.minValue), Number(xFormelement.maxValue), xFormelement.defaultValue,
                                [InputOptionsPlaceholder], xFormelement.stepValue, xFormelement.inputHeight,

                                xFormelement.toggledInput? inputAlphaTrion(xFormelement.toggledInput.inputAlias, xFormelement.toggledInput.inputType, xFormelement.toggledInput.inputWidth,
                                xFormelement.toggledInput.inputLabel, Number(xFormelement.toggledInput.minValue), Number(xFormelement.toggledInput.maxValue), xFormelement.toggledInput.defaultValue,
                                [InputOptionsPlaceholder], xFormelement.toggledInput.stepValue, xFormelement.toggledInput.inputHeight, null,  xFormelement.toggledInput.newRow, xFormelement.toggledInput.inputPlaceholder, 
                                readOnlyMode, xFormelement.toggledInput.isHinted, xFormelement.toggledInput.hintText || "", xFormelement.toggledInput.hintUrl || "",
                                xFormelement.toggledInput.errorText, String(xFormelement.toggledInput.queryId) || crypto.randomUUID()) : null,

                                xFormelement.newRow, xFormelement.inputPlaceholder, readOnlyMode, xFormelement.isHinted, xFormelement.hintText || "", xFormelement.hintUrl || "",
                                xFormelement.errorText, String(xFormelement.queryId) || crypto.randomUUID()
                            )}
                        </React.Fragment>
                    ))
                    : null}
                </Row>
                <CodexControls prevStepId={prevStepId} nextStepId={nextStepId}
                    onPrev={() => console.log(`Teletraan-1 Codex :: ${formsection.title} :: onPrev()`)}
                    onNext={() => console.log(`Teletraan-1 Codex :: ${formsection.title} :: onNext()`)}
                    onFinish={() => console.log(`Teletraan-1 Codex :: ${formsection.title} :: onFinish()`)}
                    />
            </CodexItem>
            )
    })}
    </Codex>
    </> 
    : 
    <>Codice/Script Display
    <React.Fragment key={xFormModel.uuid}>
        {xFormModel.model.map( (formsection) => (
        <React.Fragment key={formsection.sectionId || crypto.randomUUID()}>
            <SectionTitle key={formsection.sectionId} title={formsection.title} icon={<Icon name={String(formsection.icon)}/>}/>
            <Row key={formsection.sectionId}>
                    {formsection.queries ? 
                    formsection.queries.map((xFormelement) => (
                        <React.Fragment key={xFormelement.queryId}>
                            {inputAlphaTrion(xFormelement.inputAlias, xFormelement.inputType, xFormelement.inputWidth,
                                xFormelement.inputLabel, Number(xFormelement.minValue), Number(xFormelement.maxValue), xFormelement.defaultValue,
                                [InputOptionsPlaceholder], xFormelement.stepValue, xFormelement.inputHeight,

                                xFormelement.toggledInput? inputAlphaTrion(xFormelement.toggledInput.inputAlias, xFormelement.toggledInput.inputType, xFormelement.toggledInput.inputWidth,
                                xFormelement.toggledInput.inputLabel, Number(xFormelement.toggledInput.minValue), Number(xFormelement.toggledInput.maxValue), xFormelement.toggledInput.defaultValue,
                                [InputOptionsPlaceholder], xFormelement.toggledInput.stepValue, xFormelement.toggledInput.inputHeight, null,  xFormelement.toggledInput.newRow, xFormelement.toggledInput.inputPlaceholder, 
                                readOnlyMode, xFormelement.toggledInput.isHinted, xFormelement.toggledInput.hintText || "", xFormelement.toggledInput.hintUrl || "",
                                xFormelement.toggledInput.errorText, String(xFormelement.toggledInput.queryId) || crypto.randomUUID()) : null,

                                xFormelement.newRow, xFormelement.inputPlaceholder, readOnlyMode, xFormelement.isHinted, xFormelement.hintText || "", xFormelement.hintUrl || "",
                                xFormelement.errorText, String(xFormelement.queryId) || crypto.randomUUID()
                            )}
                        </React.Fragment>
                    ))
                    : null}
                </Row>
        
        </React.Fragment>
    ))}

    </React.Fragment>
    </>}
    </Row>
    </>
    )

}