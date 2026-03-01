import React, { useState } from 'react';
import { AvatarInput } from 'components/avatar/avatar';
import { ButtonInput } from 'components/button/button';
import { CheckboxGroupInput } from 'components/checkbox/checkbox';
import { DatePicker } from 'components/datepicker/datepicker';
import { Dropdown } from 'components/dropdown/dropdown';
import { DateRangePicker } from 'components/daterangepicker/daterangepicker';
import { InputOption, InputOptionsPlaceholder } from "utils/vinci";
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
import { Row } from 'layouts/row/row';
import { Accordion, AccordionItem } from 'layouts/accordion/accordion';
import { Codex, CodexItem } from 'layouts/codex/codex';
import { CodexControls } from 'layouts/codex/codexcontrols';
import { SectionTitle } from 'components/xtitle/xtitle';
import { Icon } from 'components/icons/icons';
import { 
    avatarInputType, buttonInputType, checkboxInputType, conditionalInputType, countrydropdownInputType, countrymultiselectInputType, creditCardInputType, 
    currencyInputType, datePickerInputType, dateRangePickerInputType, dateTimePickerInputType, dropdownInputType, 
    fileInputType, fileMultipleInputType, imageOutputType, passwordInputType, phoneInputType, radioInputType, 
    rangeSliderInputType, selectInputType, selectMultipleInputType, sliderInputType, 
    stockInputType, textInputType, toggleInputType 
} from "utils/voltaire";
import { XFormType, XFormQuery } from 'utils/voltron';
import { DateTimePicker } from 'components/datetimepicker/datetimepicker';
import { CountrySelect } from 'components/dropdown/countrydropdown';

export type teletraan1Display = 'accordion' | 'codice' | 'codex' | 'dual';

export interface Teletraan1Props {
    /**
     * * The required xFormModel {} schema object that will be rendered as an xForm. 
     * Renders all form sections and queries with the input and validation specified.
     * * @example
     * xFormModel={xFormJSONPrototype}
     */
    xFormModel: XFormType;
    /**
     * * Option to render xForm as readonly (inputs disabled). 
     * * @example
     * readOnlyMode
     */
    readOnlyMode?: boolean;
    /**
     * * Option to specify the xForm display mode. 
     * Default: 'codice'
     * * @example
     * displayMode="codex"
     */
    displayMode?: teletraan1Display;
    /**
     * * Option to specify the xForm primary color. 
     * Default: '#000000'
     * * @example
     * brandColor="#800020"
     */
    brandColor?: string;
     /**
     * * Optional callback for Codex display controls triggered before navigating to a previous step.
     * Useful for triggering logic on clicking to previous step.
     * * @example
     * onPrev={console.log("Teletraan-1 Codex :: onPrev()")}
     */
    onPrev?: () => void;
    /**
     * * Optional callback for Codex display controls triggered before navigating to a next step.
     * Useful for handling form validation.
     * * @example
     * onNext={console.log("Teletraan-1 Codex :: onNext()")}
     */
    onNext?: () => void;
    /**
     * * Optional callback for Codex display control triggered when the Finish button is clicked.
     * Useful for handling application logic on finish/submit step.
     * * @example
     * onFinish={console.log("Teletraan-1 Codex :: onFinish()")}
     */
    onFinish?: () => void;

}

export const Teletraan1 = ({ 
    xFormModel, 
    readOnlyMode = false, 
    displayMode = 'codice', 
    brandColor = "#000000",
    onPrev, onNext, onFinish
}: Teletraan1Props) => {

    const [dualToggled, setDualToggled] = useState(false);
      const [neuVars] = useState<React.CSSProperties>({
          '--neu-bg': '#ecf0f3',
          '--neu-shadow-light': '#ffffff',
          '--neu-shadow-dark': '#d1d9e6'
      } as React.CSSProperties);

    const inputAlphaTrion = (
        inputAlias: string, inputType: string, inputWidth: number, inputLabel: string, 
        inputMinValue: number | string, inputMaxValue: number | string, defaultValue: any, inputOptions?: InputOption[],
        stepValue?: number | string, inputHeight?: number | string, toggledInput?: React.ReactNode, triggerValue?: any,
        newRow?: boolean, inputPlaceholder?: string, readOnly?: boolean, isHinted?: boolean, 
        hintText?: string, hintUrl?: string, errorText?: string, inputUID?: string
    ) => {
        if(inputWidth == null || inputWidth > 12) inputWidth = 4;
        if(inputHeight == null) inputHeight = 4;
        if(inputUID == null) inputUID = crypto.randomUUID();
        if(readOnlyMode) readOnly = true;

        const normalizedType = inputType.toLocaleLowerCase();

        const layoutProps = {
            alias: inputAlias,
            width: inputWidth,
            inputLabel: inputLabel,
            key: inputUID,
            newRow: newRow,
            readOnly: readOnly,
            isHinted: isHinted,
            hintText: hintText,
            hintUrl: hintUrl,
            errorText: errorText
        };

        switch(true){
            case avatarInputType.includes(normalizedType):
                return <AvatarInput {...layoutProps} />
            case buttonInputType.includes(normalizedType):
                return <ButtonInput {...layoutProps}>{defaultValue}</ButtonInput>
            case checkboxInputType.includes(normalizedType):
                return <CheckboxGroupInput {...layoutProps} direction='row' inputOptions={inputOptions || [InputOptionsPlaceholder]} />
            case conditionalInputType.includes(normalizedType):
                return <ConditionalTrigger {...layoutProps} inputOptions={inputOptions} 
                inputtype={inputType as any} 
                triggerValue={triggerValue} children={toggledInput}/>
            case datePickerInputType.includes(normalizedType):
                return <DatePicker {...layoutProps} placeholder={inputPlaceholder} />
            case dateRangePickerInputType.includes(normalizedType):
                return <DateRangePicker {...layoutProps} placeholder={inputPlaceholder}/>
            case dateTimePickerInputType.includes(normalizedType):
                return <DateTimePicker {...layoutProps} placeholder={inputPlaceholder}/>
            case dropdownInputType.includes(normalizedType):
                return <Dropdown {...layoutProps} placeholder={inputPlaceholder} inputOptions={inputOptions || [InputOptionsPlaceholder]} />
            case countrydropdownInputType.includes(normalizedType):
                return <CountrySelect displayFlag enableSearch {...layoutProps} placeholder={inputPlaceholder} />
            case countrymultiselectInputType.includes(normalizedType):
                return <CountrySelect displayFlag enableSearch multiselect {...layoutProps} placeholder={inputPlaceholder} />
            case fileInputType.includes(normalizedType):
                return <File {...layoutProps} preview/>
            case fileMultipleInputType.includes(normalizedType):
                return <FileMultiple {...layoutProps} placeholder={inputPlaceholder} preview/>
            case imageOutputType.includes(normalizedType):
                return <ImageOutput id={inputAlias} src={defaultValue} alt={inputPlaceholder} width={inputWidth} height={inputHeight as number} key={inputUID}/>
            case textInputType.includes(normalizedType):
                return <Input {...layoutProps} placeholder={inputPlaceholder} />
            case passwordInputType.includes(normalizedType):
                return <PasswordInput {...layoutProps} placeholder={inputPlaceholder} />
            case phoneInputType.includes(normalizedType):
                return <PhoneInput {...layoutProps} placeholder={inputPlaceholder} />
            case creditCardInputType.includes(normalizedType):
                return <CreditCardInput {...layoutProps} placeholder={inputPlaceholder} />
            case currencyInputType.includes(normalizedType):
                return <CurrencyInput {...layoutProps} placeholder={inputPlaceholder} />
            case stockInputType.includes(normalizedType):
                return <StockInput {...layoutProps} placeholder={inputPlaceholder} defaultvalue={defaultValue} />
            case radioInputType.includes(normalizedType):
                return <RadioGroupInput {...layoutProps} direction="row" inputOptions={inputOptions || [InputOptionsPlaceholder]} />
            case selectInputType.includes(normalizedType):
                return <OptionSelect {...layoutProps} placeholder={inputPlaceholder} inputOptions={inputOptions || [InputOptionsPlaceholder]} />
            case selectMultipleInputType.includes(normalizedType):
                return <MultipleSelect {...layoutProps} placeholder={inputPlaceholder} inputOptions={inputOptions || [InputOptionsPlaceholder]} />
            case sliderInputType.includes(normalizedType):
                return <SliderInput {...layoutProps} stepvalue={Number(stepValue)} minvalue={Number(inputMinValue)} maxvalue={Number(inputMaxValue)} />
            case rangeSliderInputType.includes(normalizedType):
                return <RangeSlider {...layoutProps} stepvalue={Number(stepValue)} minvalue={Number(inputMinValue)} maxvalue={Number(inputMaxValue)} />
            case toggleInputType.includes(normalizedType):
                return <Toggle {...layoutProps} icon="layers"/>
            default:
                return <Input {...layoutProps} placeholder={inputPlaceholder} />
        }
    };

    const renderQueries = (queries: XFormQuery[]) => {
        if (!queries) return null;
        return queries.map((xFormelement) => {
            const childInput = xFormelement.toggledInput ? inputAlphaTrion(
                xFormelement.toggledInput.inputAlias, xFormelement.toggledInput.inputType, xFormelement.toggledInput.inputWidth, 
                xFormelement.toggledInput.inputLabel, String(xFormelement.toggledInput.minValue), String(xFormelement.toggledInput.maxValue), 
                xFormelement.toggledInput.defaultValue, xFormelement.toggledInput.inputOptions, xFormelement.toggledInput.stepValue, 
                xFormelement.toggledInput.inputHeight, null, 
                null, xFormelement.toggledInput.newRow, 
                xFormelement.toggledInput.inputPlaceholder, readOnlyMode, xFormelement.toggledInput.isHinted, xFormelement.toggledInput.hintText || "", 
                xFormelement.toggledInput.hintUrl || "", xFormelement.toggledInput.errorText, String(xFormelement.toggledInput.queryId) || crypto.randomUUID()
            ) : null;

            return inputAlphaTrion(
                xFormelement.inputAlias, xFormelement.inputType, xFormelement.inputWidth, xFormelement.inputLabel,
                String(xFormelement.minValue), String(xFormelement.maxValue), xFormelement.defaultValue, xFormelement.inputOptions, 
                xFormelement.stepValue, xFormelement.inputHeight, 
                childInput,
                xFormelement.triggerValue, xFormelement.newRow, 
                xFormelement.inputPlaceholder, readOnlyMode, xFormelement.isHinted, xFormelement.hintText || "", 
                xFormelement.hintUrl || "", xFormelement.errorText, String(xFormelement.queryId) || crypto.randomUUID()
            );
        });
    };

    const renderDisplayMode = () => {
        switch (displayMode) {
            case 'dual':
                return (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div 
                                className="neu-toggle-wrapper"
                                style={{ ...neuVars, opacity: readOnlyMode ? 0.6 : 1, pointerEvents: readOnlyMode ? 'none' : 'auto' }}
                                onClick={() => setDualToggled(!dualToggled)}
                            >
                                <style dangerouslySetInnerHTML={{__html: `
                                    .neu-toggle-wrapper { isolation: isolate; position: relative; height: 30px; width: 60px; border-radius: 15px; overflow: hidden; cursor: pointer; background: var(--neu-bg); box-shadow: -8px -4px 8px 0px var(--neu-shadow-light), 8px 4px 12px 0px var(--neu-shadow-dark), 4px 4px 4px 0px var(--neu-shadow-dark) inset, -4px -4px 4px 0px var(--neu-shadow-light) inset; }
                                    .neu-toggle-state { display: none; }
                                    .neu-indicator { height: 100%; width: 200%; background: var(--neu-bg); border-radius: 15px; transform: translate3d(-75%, 0, 0); transition: transform 0.4s cubic-bezier(0.85, 0.05, 0.18, 1.35); box-shadow: -8px -4px 8px 0px var(--neu-shadow-light), 8px 4px 12px 0px var(--neu-shadow-dark); }
                                    .neu-toggle-state:checked ~ .neu-indicator { transform: translate3d(25%, 0, 0); }
                                `}} />
                                <input className="neu-toggle-state" type="checkbox" checked={dualToggled} readOnly />
                                <div className="neu-indicator"></div>
                            </div>
                            <Icon name="layers" height="20" width="20" color={brandColor} style={{ opacity: readOnlyMode ? 0.5 : 1, cursor: 'pointer' }} onClick={() => setDualToggled(!dualToggled)} />
                        </div>
                        {dualToggled ? 
                            <Accordion defaultOpenId={xFormModel.model?.[0]?.sectionId ? String(xFormModel.model[0].sectionId) : ''} allowMultiple brandcolor={brandColor} titleColor='#ffffff'>
                                {xFormModel.model.map((formsection) => (
                                    <AccordionItem key={formsection.sectionId} sectionId={String(formsection.sectionId)} title={formsection.title} 
                                    subtitle={ formsection.subtitle ? formsection.subtitle : undefined } icon={<Icon name={formsection.icon || "fontfamily"}/>}>
                                        <Row key={formsection.sectionId}>{renderQueries(formsection.queries)}</Row>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        : 
                            xFormModel.model.map((formsection) => (
                                <React.Fragment key={formsection.sectionId || crypto.randomUUID()}>
                                    <SectionTitle withSeparator={false} backgroundColor={brandColor} titleColor='#FFFFFF' title={formsection.title} 
                                    subtitleColor='#FFFFFF'
                                    subTitle={formsection.subtitle ? formsection.subtitle : undefined} icon={<Icon name={formsection.icon || "fontfamily"}/>}/>
                                    <Row>{renderQueries(formsection.queries)}</Row>
                                </React.Fragment>
                            ))
                        }
                    </>
                );

            case 'accordion':
                return (
                    <Accordion defaultOpenId={xFormModel.model?.[0]?.sectionId ? String(xFormModel.model[0].sectionId) : ''} allowMultiple brandcolor={brandColor} titleColor='#ffffff'>
                        {xFormModel.model.map((formsection) => (
                            <AccordionItem key={formsection.sectionId} sectionId={String(formsection.sectionId)} title={formsection.title} 
                            subtitle={ formsection.subtitle ? formsection.subtitle : undefined } icon={<Icon name={formsection.icon || "fontfamily"}/>}>
                                <Row key={formsection.sectionId}>{renderQueries(formsection.queries)}</Row>
                            </AccordionItem>
                        ))}
                    </Accordion>
                );

            case 'codex':
                return (
                    <Codex brandColor={brandColor}>
                        {xFormModel.model.map((formsection, index, array) => (
                            <CodexItem key={formsection.sectionId} stepId={String(formsection.sectionId)} title={formsection.title}
                            subtitleDescription={formsection.subtitle ? formsection.subtitle : undefined} icon={<Icon name={formsection.icon || "fontfamily"}/>}>
                                <Row key={formsection.sectionId}>{renderQueries(formsection.queries)}</Row>
                                <CodexControls 
                                    prevStepId={index > 0 ? String(array[index - 1].sectionId) : undefined} 
                                    nextStepId={index < array.length - 1 ? String(array[index + 1].sectionId) : undefined}
                                    onPrev={onPrev}
                                    onNext={onNext}
                                    onFinish={onFinish}
                                />
                            </CodexItem>
                        ))}
                    </Codex>
                );

            case 'codice':
            default:
                return (
                    <React.Fragment key={xFormModel.uuid}>
                        {xFormModel.model.map((formsection) => (
                            <React.Fragment key={formsection.sectionId || crypto.randomUUID()}>
                                <SectionTitle withSeparator={false} backgroundColor={brandColor} titleColor='#FFFFFF' title={formsection.title}
                                subtitleColor='#FFFFFF' 
                                subTitle={formsection.subtitle ? formsection.subtitle : undefined} icon={<Icon name={String(formsection.icon)}/>}/>
                                <Row>{renderQueries(formsection.queries)}</Row>
                            </React.Fragment>
                        ))}
                    </React.Fragment>
                );
        }
    };

    return (
        <>
            {renderDisplayMode()}
        </>
    );
};