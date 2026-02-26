import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Select, Flex, Text, Tooltip, Separator } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from "utils/vinci";
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import '../../styles/main.scss';

export type OptionSelectDesign = 'dropdown' | 'dropdown-material' | 'dropdown-outline' | 'dropdown-neumorphic';

export interface SelectProps {
  /**
   * * The required unique identifier for the OptionSelect input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="productCategory"
   */
  alias: string;
  /**
   * * The design variation of the OptionSelect input field. 
   * Default: 'dropdown-outline' 
   * Variants: 'dropdown', 'dropdown-outline', 'dropdown-material', 'dropdown-neumorphic'.
   * * @example
   * inputtype="dropdown-neumorphic"
   */ 
  inputtype?: OptionSelectDesign & {};
  /**
   * * The optional input label or description for the OptionSelect input field. 
   * * @example
   * inputLabel="Choose a VΣ category"
   */
  inputLabel?: string;
  /**
   * * The required viewport column width for the OptionSelect input field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */
  width: number;
  /**
   * * Option to render OptionSelect input field on new row.
   * * @example
   * newRow
   */
  newRow?: boolean;
   /**
   * * Option to force set the placeholder text for a OptionSelect input field.
   * * @example
   * placeholder="Select a category"
   */
  placeholder?: string;
   /**
   * * Option to disable edits for OptionSelect input field.
   * * @example
   * readOnly
   */
  readOnly?: boolean;
  /**
     * * Option to enable a hint for OptionSelect input field.
     * * @example
     * isHinted
     */
  isHinted?: boolean;
  /**
   * * Option to specify hint text for OptionSelect input field.
   * * @example
   * hintText="This is a hint for a VΣ OptionSelect"
   */
  hintText?: string;
  /**
   * * Option to specify a hint url reference or resource for OptionSelect input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */ 
  hintUrl?: string;
  /**
    * * onValueChange event handler function for OptionSelect input field.
    * * @example
    * props.onValueChange(finalVal)
    */
  onValueChange?: (value: string) => void;
  /**
   * * Option to specify the isRequired error text for the OptionSelect input field.
   * * @example
   * errorText="VΣ category is required"
   */
  errorText?: ReactNode | string | null;
  /**
   * * Required  inputOptions{} for the OptionSelect input field.
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
   * * Option to specify the .scss class selector for the OptionSelect input field.
   * * @example
   * className="teletraan-1-optionselect"
   */
  className?: string;
  /**
   * * Option to inject custom CSS the OptionSelect input field.
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

export const OptionSelect = ({
  inputtype = 'dropdown-outline',
  alias, 
  readOnly, 
  width, 
  inputLabel,
  placeholder, 
  inputOptions,
  style,
  newRow,
  isHinted,
  hintText,
  hintUrl,
  errorText,
  formikContext,
  ...props
}: SelectProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`OptionSelect '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);
   const RESET_ID = `__RESET__${alias}`;

  const hasError = Boolean(fieldTouched && fieldError);
  const errorId = `${alias}-error`;

  useEffect(() => {
    if (inputtype === 'dropdown-neumorphic' && triggerRef.current) {
      const parentBg = getNearestParentBackground(triggerRef.current.parentElement);
      const shadowDark = adjustColor(parentBg, -30);
      const shadowLight = adjustColor(parentBg, 30);

      setNeuVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': shadowDark,
        '--neu-shadow-light': shadowLight,
        '--neu-text': 'var(--gray-12)',
      } as React.CSSProperties);
    }
  }, [inputtype]);

  const openLink = (inputUrl: string) => {
    window.open(inputUrl, '_blank', 'noopener,noreferrer');
  };

  // --- STYLES ---

  const materialTrigger: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    border: 'none',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    height: '32px',
    fontWeight: 500,
  };
  const materialContent = {
    borderRadius: '4px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)', 
  };

  const outlineTrigger: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: '2px solid var(--gray-7)',
    borderRadius: '4px',
    height: '32px',
    fontWeight: 600,
  };
  const outlineContent = {
    border: '2px solid var(--gray-7)',
    borderRadius: '4px',
    boxShadow: 'none',
  };

  const neumorphicTrigger: React.CSSProperties = {
    backgroundColor: 'var(--neu-bg)',
    color: 'var(--neu-text)',
    border: 'none',
    borderRadius: '12px',
    height: '40px', 
    fontWeight: 600,
    padding: '0 12px',
    boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
    transition: 'all 0.2s ease',
  };
  const neumorphicContent = {
    backgroundColor: 'var(--neu-bg)',
    borderRadius: '12px',
    border: 'none',
    boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
  };

  const activeTriggerStyle = 
    inputtype === 'dropdown' ? materialTrigger :
    inputtype === 'dropdown-material' ? materialTrigger :
    inputtype === 'dropdown-outline' ? outlineTrigger :
    { ...neumorphicTrigger, ...neuVars };

  const activeContentStyle = 
    inputtype === 'dropdown' ? materialContent :
    inputtype === 'dropdown-material' ? materialContent :
    inputtype === 'dropdown-outline' ? outlineContent :
    { ...neumorphicContent, ...neuVars };

  return (
    <Column span={width} newLine={newRow}>
      <Flex direction="column" gap="2" style={{ width: '100%' }}>
        {inputtype === 'dropdown-neumorphic' && (
          <style dangerouslySetInnerHTML={{__html: `
            .neu-select-trigger[data-state='open'] {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), 
                          inset -6px -6px 12px var(--neu-shadow-light) !important;
            }
            .neu-select-item:hover {
              background-color: rgba(0,0,0,0.05) !important;
              cursor: pointer;
            }
          `}} />
        )}

        <Select.Root
          name={alias}
          disabled={readOnly}
          value={fieldValue || ""} 
          onValueChange={(val) => {
            const finalVal = val === RESET_ID ? "" : val;
            
            setFieldValue(alias, finalVal);
            setTimeout(() => setFieldTouched(alias, true, false), 0);
            
            if (props.onValueChange) props.onValueChange(finalVal);
          }}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
               setFieldTouched(alias, true, false);
            }
          }}
        >
          <Select.Trigger 
            id={`${alias}FormInput`}
            ref={triggerRef}
            variant="ghost" 
            placeholder={placeholder || "Select an option"}
            className={`${inputtype === 'dropdown-neumorphic' ? 'neu-select-trigger' : ''} ${props.className || ''}`}
            style={{ ...activeTriggerStyle, ...style }}
            {...props} 
          />

          <Select.Content position="popper" sideOffset={5} style={activeContentStyle}>
            <Select.Item 
              value={RESET_ID}
              className={inputtype === 'dropdown-neumorphic' ? 'neu-select-item' : ''}
              style={{ color: 'var(--gray-10)', fontStyle: 'italic' }}
            >
               {placeholder || "Select an option"}
            </Select.Item>
            
            <Separator size="4" style={{ margin: '4px 0', opacity: 0.5 }} />
            {inputOptions.map((inputoption) => (
              <React.Fragment key={inputoption.optionid || crypto.randomUUID()}>
                {inputoption.optionurl ? (
                  <Select.Item 
                    id={String(inputoption.optionid) || ''}
                    value={String(inputoption.optionvalue) || `__empty_${inputoption.optionid}`}
                    className={inputtype === 'dropdown-neumorphic' ? 'neu-select-item' : ''}
                  >
                    <a 
                      onClick={(e) => { e.stopPropagation(); openLink(inputoption.optionurl || "#"); }} 
                      style={{textDecoration: 'none', color: 'inherit'}}
                    >
                      {inputoption.text}
                    </a>
                  </Select.Item>
                ) : (
                  <Select.Item 
                    id={String(inputoption.optionid) || ''}
                    value={String(inputoption.optionvalue) || `__empty_${inputoption.optionid}`}
                    className={inputtype === 'dropdown-neumorphic' ? 'neu-select-item' : ''}
                  >
                    {inputoption.text}
                  </Select.Item>
                )}
              </React.Fragment>
            ))}
          </Select.Content>
        </Select.Root>

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
              {hasError && (
                <>
                <p id={errorId} className='core-input-label-error'>
                    {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
                </p>
                </> 
              )} 
        </div>
      </Flex>
    </Column>
  );
};