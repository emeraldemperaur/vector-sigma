import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, RadioGroup, Grid, Tooltip } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type RadioDesign = 'radio' | 'radio-material' | 'radio-outline' | 'radio-neumorphic';

interface RadioGroupProps {
    /**
   * * The required unique identifier for the Radio Group input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="productSKUPrice"
   */
    alias: string; 
    /**
   * * The optional input label or description for the Radio Group input field. 
   * * @example
   * inputLabel="VΣ Stock Price"
   */ 
    inputLabel?: string;
    /**
   * * The optional input value type for the Radio Group input field. 
   * Default: 'text'
   * Options: "number" | "hidden" | "date" | "datetime-local" | 
   * "email" | "month" | "password" | "search" | 
   * "tel" | "text" | "time" | "url" | "week"
   * * @example
   * inputtype="email"
   */ 
    inputtype?: RadioDesign & {};
    /**
   * * The required viewport column width for the Radio Group input field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */
    width: number;
    /**
   * * Option to render Radio Group input field on new row.
   * * @example
   * newRow
   */
    newRow?: boolean;
    /**
   * * Option to disable edits for Radio Group input field.
   * * @example
   * readOnly
   */
    readOnly?: boolean;
    /**
     * * Option to enable a hint for Radio Group input field.
     * * @example
     * isHinted
     */
    isHinted?: boolean;
    /**
   * * Option to specify hint text for Radio Group input field.
   * * @example
   * hintText="This is a hint for a VΣ RadioGroup"
   */
    hintText?: string;
    /**
   * * Option to specify a hint url reference or resource for Radio Group input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */ 
    hintUrl?: string;
    /**
   * * Required  inputOptions{} for the Radio Group input field.
   * * @example
   * inputOptions={
            [
              {optionid: 1, optionvalue: "Kaiju", optionurl:"https://github.com/emeraldemperaur", text: "Kaiju"},
              {optionid: 2, optionvalue: "MekaGodzilla", optionurl:"https://github.com/emeraldemperaur", text: "MekaGodzilla"},
              {optionid: 3, optionvalue: "Zaibatsu", optionurl:"https://github.com/emeraldemperaur", text: "Zaibatsu"},
              ]}
    */
    inputOptions: InputOption[];
    /**
   * * Option to specify CSS layout direction for the Radio Group input field.
   * Default: "row"
   * * @example
   * direction="column"
   */
    direction?: 'row' | 'column';
    /**
   * * Option to specify CSS grid template columns for the Radio Group input field.
   * * @example
   * columns="1fr 1fr"
   */
    columns?: string;
    /**
   * * Option to specify the .scss class selector for the Radio Group input field.
   * * @example
   * className="teletraan-1-stockinput"
   */
    className?: string; 
    /**
   * * Option to specify the isRequired error text for the Radio Group input field.
   * * @example
   * errorText="VΣ product price is required"
   */ 
    errorText?: ReactNode | string | null;
    /**
   * * Option to inject custom CSS the Radio Group input field.
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

export const RadioGroupInput = ({
  inputtype = 'radio-outline',
  alias, readOnly, width, inputLabel,
  newRow, isHinted, hintText, hintUrl, errorText,
  style, inputOptions,
  direction = 'column',
  columns, 
  className, 
  formikContext,
  ...props
}: RadioGroupProps) => {
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`RadioGroupInput '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const hasError = Boolean(fieldTouched && fieldError);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  const errorId = `${alias}-error`;

  useEffect(() => {
    if (inputtype === 'radio-neumorphic' && containerRef.current) {
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

      {inputtype === 'radio-neumorphic' && (
        <style dangerouslySetInnerHTML={{__html: `
          /* Target the specific Radio Item button class */
          .neu-radio .rt-RadioGroupItem { 
            background-color: var(--neu-bg);
            border: none;
            /* Circular Shadows */
            box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
            width: 20px;
            height: 20px;
            transition: all 0.2s ease;
          }
          
          /* Checked State: Inset Shadow (Pressed In) */
          .neu-radio .rt-RadioGroupItem[data-state='checked'] {
            box-shadow: inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light);
            background-color: var(--neu-bg); 
          }

          /* The Inner Dot Indicator */
          .neu-radio .rt-RadioGroupIndicator {
             background-color: var(--neu-check-color);
             width: 50%;
             height: 50%;
             border-radius: 50%;
          }
          
          /* Hover Effect */
          .neu-radio .rt-RadioGroupItem:hover {
            transform: scale(1.05);
          }
          .neu-radio .rt-RadioGroupItem[data-state='checked']:hover {
            transform: none; /* Don't scale if pressed in */
          }
        `}} />
      )}

      <RadioGroup.Root 
        name={alias}
        id={`${alias}FormInput`}
        aria-describedby={`${alias}InputLabel`}
        disabled={readOnly}
        value={fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : undefined}
        onValueChange={(val) => {
          setFieldValue(alias, val);
          setTimeout(() => setFieldTouched(alias, true, false), 0);
        }}
      >
        <Grid 
          columns={columns || (direction === 'row' ? 'repeat(auto-fit, minmax(100px, 1fr))' : '1')} 
          gap="3"
          style={neuVars}
        >
          {inputOptions.map((inputoption) => {
             const isChecked = String(fieldValue) === String(inputoption.optionvalue);

             return (
              <Flex asChild key={inputoption.optionvalue} align="center" gap="2">
                <Text as="label" size="2" style={{ cursor: 'pointer' }}>
                  
                  <RadioGroup.Item 
                    value={inputoption.optionvalue}
                    className={inputtype === 'radio-neumorphic' ? 'neu-radio' : ''}
                    style={{
                      ...(inputtype === 'radio-outline' ? {
                        border: isChecked ? '2px solid var(--accent-9)' : '2px solid var(--gray-8)',
                        backgroundColor: 'transparent'
                      } : {})
                    }}
                  />
                  <span style={{ userSelect: 'none' }}>{inputoption.text}</span>
                </Text>
              </Flex>
             );
          })}
        </Grid>
      </RadioGroup.Root>

      <div>
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={`${alias}FormInput`}>{inputLabel}</Text>
            &nbsp;
            {isHinted ?
                <>
                    <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                                  <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                                  <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                                  </a> 
                              </Tooltip>
                </> : null} 
             {hasError ?
                <>
                    <p id={errorId} className='core-input-label-error'>
                            {errorText || (typeof fieldError === 'string' ? fieldError : `Required field`)}
                    </p>
                </> : null } 
     </div>
    </Flex>
    </Column>
  );
};