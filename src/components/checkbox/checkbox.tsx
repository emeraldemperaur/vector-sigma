import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, Checkbox as RadixCheckbox, Grid, Tooltip } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type CheckBoxDesign = 'checkbox' | 'checkbox-material' | 'checkbox-outline' | 'checkbox-neumorphic';

export interface CheckboxGroup {
   /**
   * * The design variation of the Checkbox Group input. 
   * Default: 'checkbox-outline' 
   * Variants: 'checkbox', 'checkbox-outline', 'checkbox-material', 'checkbox-neumorphic'.
   * * @example
   * inputtype="checkbox-neumorphic"
   */
  inputtype?: CheckBoxDesign & {};
  /**
   * * The required unique identifier for the input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="carteBlanche"
   */
  alias: string;
  /**
   * * The optional input label or description for the Checkbox Group input field. 
   * * @example
   * inputLabel="Select VΣ Product Categories"
   */
  inputLabel?: string; 
  /**
   * * The required viewport column width for the Checkbox Group input field.
   * i.e. 1 - 12
   * * @example
   * width={6}
   */
  width: number; 
   /**
   * * Option to render Checkbox Group input field on new row.
   * * @example
   * newRow
   */
  newRow?: boolean;
   /**
   * * Option to disable edits for Checkbox Group input field.
   * * @example
   * readOnly
   */
  readOnly?: boolean;
  /**
     * * Option to enable a hint for Checkbox Group input field.
     * * @example
     * isHinted
     */
  isHinted?: boolean; 
  /**
   * * Option to specify hint text for Checkbox Group input field.
   * * @example
   * hintText="This is a hint for a VΣ Checkbox Group"
   */
  hintText?: string; 
  /**
   * * Option to specify a hint url reference or resource for Checkbox Group input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */
  hintUrl?: string;
  /**
   * * Required  inputOptions{} for the Checkbox Group input field.
   * * @example
   * inputOptions={
   * [
   * {optionid: 1, optionvalue: "Kaiju", optionurl:"https://github.com/emeraldemperaur", text: "Kaiju"},
   * {optionid: 2, optionvalue: "MekaGodzilla", optionurl:"https://github.com/emeraldemperaur", text: "MekaGodzilla"},
   * {optionid: 3, optionvalue: "Zaibatsu", optionurl:"https://github.com/emeraldemperaur", text: "Zaibatsu"},
   * ]}
  */
  inputOptions: InputOption[];
  /**
   * * Option to specify the isRequired error text for the Checkbox Group input field.
   * * @example
   * errorText="A VΣ category selection is required"
   */
  errorText?: ReactNode | string | null,
   /**
   * * Option to specify CSS layout direction for the Checkbox Group input field.
   * Default: "row"
   * * @example
   * direction="column"
   */
  direction?: 'row' | 'column';
  /**
   * * Option to specify CSS grid template columns for the Checkbox Group input field.
   * * @example
   * columns="1fr 1fr"
   */
  columns?: string;
  /**
   * * Option to specify the .scss class selector for the Checkbox Group input field.
   * * @example
   * className="teletraan-1-checkbox"
   */
  className?: string;
  /**
   * * Option to inject custom CSS the Checkbox Group input field.
   * * @example
   * style={{ color: "#000000" }}
   */
  style?: React.CSSProperties;
  /**
   * * Optional explicit Formik context. Useful when bypassing duplicate 
   * context issues in monorepos or bundled npm packages.
   */
  formikContext?: FormikContextType<any>;
}

export const CheckboxGroupInput = ({
  inputtype = 'checkbox-outline',
  alias, readOnly, width,
  inputLabel,
  style, inputOptions,
  newRow, isHinted, hintText, hintUrl, errorText,
  direction = 'row',
  columns, 
  className, 
  formikContext,
  ...props
}: CheckboxGroup) => {
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`CheckboxGroupInput '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const currentValues = (Array.isArray(fieldValue) ? fieldValue : []) as string[];
  const hasError = Boolean(fieldTouched && fieldError);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  
  const inputId = `${alias}FormInput`;
  const errorId = `${alias}-error`;

  const handleCheckedChange = (checked: boolean, value: string) => {
    let newValues = [...currentValues];
    if (checked) {
      newValues.push(value);
    } else {
      newValues = newValues.filter((v) => String(v) !== String(value));
    }
    setFieldValue(alias, newValues);
    setTimeout(() => setFieldTouched(alias, true, false), 0);
  };

  useEffect(() => {
    if (inputtype === 'checkbox-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      setNeuVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': adjustColor(parentBg, -20), 
        '--neu-shadow-light': adjustColor(parentBg, 20),
        '--neu-check-color': 'var(--accent-9)',
      } as React.CSSProperties);
    }
  }, [inputtype]);

  return (
    <Column span={width} newLine={newRow}>
    <Flex 
      direction="column"
      gap="2" 
      width="100%" 
      ref={containerRef} 
      style={style} 
      className={className}
    >
      {inputtype === 'checkbox-neumorphic' && (
        <style dangerouslySetInnerHTML={{__html: `
          .neu-checkbox .rt-CheckboxButton { 
            background-color: var(--neu-bg);
            border: none;
            box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
            border-radius: 4px;
            width: 20px; height: 20px; transition: all 0.2s ease;
          }
          .neu-checkbox[data-state='checked'] .rt-CheckboxButton {
            box-shadow: inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light);
            background-color: var(--neu-bg); 
          }
          .neu-checkbox .rt-CheckboxIndicator { color: var(--neu-check-color); }
        `}} />
      )}

      <Grid 
        width="100%" 
        columns={columns || (direction === 'row' ? 'repeat(auto-fit, minmax(100px, 1fr))' : '1')} 
        gap="3"
        style={neuVars} 
        id={inputId}
        aria-labelledby={`${alias}InputLabel`}
        role="group"
      >
        {inputOptions.map((inputoption, idx) => {
          const optionVal = String(inputoption.optionvalue);
          const isChecked = currentValues.some(val => String(val) === optionVal);
          
          const itemKey = `${alias}-chk-${inputoption.optionid || idx}`;
          const itemId = `${alias}FormInput${inputoption.optionid || idx}`;

          return (
            <Text 
              as="label" 
              key={itemKey} 
              size="2" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: 'pointer' 
              }}
            >
              <RadixCheckbox 
                name={alias}
                id={itemId}
                disabled={readOnly}
                value={optionVal}
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckedChange(checked as boolean, optionVal)}
                variant={inputtype === 'checkbox-outline' ? 'soft' : 'surface'}
                className={inputtype === 'checkbox-neumorphic' ? 'neu-checkbox' : ''}
                style={{
                   ...(inputtype === 'checkbox-outline' ? { 
                      border: isChecked ? '2px solid var(--accent-9)' : '2px solid var(--gray-8)',
                      backgroundColor: 'transparent'
                   } : {})
                }}
              />
              <span style={{ userSelect: 'none' }}>{inputoption.text}</span>
            </Text>
          );
        })}
      </Grid>

      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Text id={`${alias}InputLabel`} as="div" size="2" weight="bold">{inputLabel}</Text>
          {isHinted && (
            <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                  <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                </a> 
            </Tooltip>
          )} 
          {hasError && (
            <Text id={errorId} size="1" color="red" className='core-input-label-error'>
                {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
            </Text>
          )} 
       </div>
    </Flex>
    </Column>
  );
};