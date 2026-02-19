import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Popover, Flex, Text, Checkbox, ScrollArea, Box, Tooltip, Select } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from "utils/vinci";
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { useField, useFormikContext } from 'formik';
import '../../styles/main.scss';

export type MultipleSelectDesign = 'multiselect' | 'multiselect-material' | 'multiselect-outline' | 'multiselect-neumorphic';

interface MultipleSelectProps {
    /**
   * * The required unique identifier for the MultipleSelect input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="productCategories"
   */
    alias: string; 
   /**
   * * The design variation of the MultipleSelect input. 
   * Default: 'multiselect-outline' 
   * Variants: 'multiselect', 'multiselect-outline', 'multiselect-material', 'multiselect-neumorphic'.
   * * @example
   * inputtype="multiselect-neumorphic"
   */
    inputtype?: MultipleSelectDesign & {};
    /**
   * * The optional input label or description for the MultipleSelect input field. 
   * * @example
   * inputLabel="Choose at least one VΣ category"
   */
    inputLabel?: string;
    /**
   * * The required viewport column width for the MultipleSelect input field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */ 
    width: number;
    /**
   * * Option to render MultipleSelect input field on new row.
   * * @example
   * newRow
   */
    newRow?: boolean;
    /**
   * * Option to force set the placeholder text for a MultipleSelect input field.
   * * @example
   * placeholder="Select products of interest"
   */
    placeholder?: string;
    /**
   * * Option to disable edits for MultipleSelect input field.
   * * @example
   * readOnly
   */
    readOnly?: boolean;
    /**
     * * Option to enable a hint for MultipleSelect input field.
     * * @example
     * isHinted
     */
    isHinted?: boolean; 
    /**
   * * Option to specify hint text for MultipleSelect input field.
   * * @example
   * hintText="This is a hint for a VΣ MultipleSelect"
   */
    hintText?: string;
    /**
   * * Option to specify a hint url reference or resource for MultipleSelect input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */ 
    hintUrl?: string;
    /**
   * * Required  inputOptions{} for the MultipleSelect input field.
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
   * * Option to specify the isRequired error text for the MultipleSelect input field.
   * * @example
   * errorText="At least one product category selection is required"
   */
    errorText?: ReactNode | string | null;
    /**
   * * Option to specify the .scss class selector for the MultipleSelect input field.
   * * @example
   * className="teletraan-1-multipleselect"
   */
    className?: string;
    /**
   * * Option to inject custom CSS the MultipleSelect input field.
   * * @example
   * style={{ color: "#000000" }}
   */
    style?: React.CSSProperties;
}

export const MultipleSelect = ({
  inputtype = 'multiselect-outline',
  alias, readOnly, width, inputLabel,
  placeholder = '', newRow, isHinted, hintText, hintUrl, errorText,
  style, inputOptions,
  className, ...props
}: MultipleSelectProps) => {
  
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const selectedValues = (Array.isArray(field.value) ? field.value : []) as string[];
  const hasError = Boolean(meta.touched && meta.error);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  const [isOpen, setIsOpen] = useState(false);
  const errorId = `${alias}-error`;

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value) // Remove Unselected Values
      : [...selectedValues, value]; // Add Selected Values
    
    setFieldValue(alias, newValues);
    setTimeout(() => setFieldTouched(alias, true), 0);
  };

  const displayLabel = selectedValues.length > 0
    ? inputOptions
        .filter(inputoption => selectedValues.includes(inputoption.optionvalue))
        .map(inputoption => inputoption.text)
        .join(', ')
    : placeholder;

  useEffect(() => {
    if (inputtype === 'multiselect-neumorphic' && triggerRef.current) {
      const parentBg = getNearestParentBackground(triggerRef.current.parentElement);
      setNeuVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': adjustColor(parentBg, -30),
        '--neu-shadow-light': adjustColor(parentBg, 30),
        '--neu-text': 'var(--gray-12)',
        '--neu-error': 'var(--red-9)',
      } as React.CSSProperties);
    }
  }, [inputtype]);

  // --- STYLES ---

  const baseTrigger: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0 12px',
    fontSize: 'var(--font-size-2)',
    fontFamily: 'var(--default-font-family)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const materialTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--color-surface)',
    border: hasError ? '1px solid var(--red-9)' : 'none',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    height: '32px',
    fontWeight: 500,
  };

  const outlineTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'transparent',
    border: hasError ? '2px solid var(--red-9)' : '2px solid var(--gray-7)',
    borderRadius: '4px',
    height: '32px',
    fontWeight: 600,
  };

  const neumorphicTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--neu-error)' : 'var(--neu-text)',
    border: 'none',
    borderRadius: '12px',
    height: '40px',
    fontWeight: 600,
    boxShadow: isOpen 
      ? 'inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light)'
      : '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
    transition: 'all 0.2s ease',
  };

  const activeTrigger = 
    inputtype === 'multiselect-material' ? materialTrigger :
    inputtype === 'multiselect-outline' ? outlineTrigger :
    { ...neumorphicTrigger, ...neuVars };

  return (
    <Column span={width} newLine={newRow}>
    <Flex direction="column" gap="2" style={{ width: '100%' }}>
      <input type="hidden" name={alias} value={JSON.stringify(selectedValues)}/>
      <Popover.Root onOpenChange={setIsOpen}>
        <Popover.Trigger>
          <button
            id={`${alias}FormInput`}
            type="button" 
            ref={triggerRef}
            className={className}
            style={{ ...activeTrigger, ...style }}
            aria-describedby={`${alias}InputLabel`}
          >
            <span style={{ 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              color: selectedValues.length === 0 ? 'var(--gray-8)' : 'inherit' 
            }}>
              {displayLabel}
            </span>
            <Icon name='chevrondown' style={{ flexShrink: 0, opacity: 0.5 }} />
          </button>
        </Popover.Trigger>

        <Popover.Content 
          align="start" 
          sideOffset={5}
          style={{ 
            width: triggerRef.current?.offsetWidth,
            padding: 0,
            overflow: 'hidden',
            backgroundColor: inputtype === 'multiselect-neumorphic' ? 'var(--neu-bg)' : 'var(--color-panel-solid)',
            ...neuVars 
          }}
        >
          <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 200 }}>
            <Box p="2">
              <Flex direction="column" gap="1">
                {inputOptions.map((inputoption) => {
                    const isSelected = selectedValues.some((val: string | number) => String(val) 
                    === String(inputoption.optionvalue));
                  return (
                    <Flex 
                      id={String(inputoption.optionid) || ''}
                      key={inputoption.optionid} 
                      align="center" 
                      gap="2"
                      onClick={() => handleToggle(inputoption.optionvalue)}
                      style={{ 
                        padding: '8px', 
                        cursor: 'pointer', 
                        borderRadius: '4px',
                        backgroundColor: isSelected ? 'var(--accent-a3)' : 'transparent',
                        transition: 'background-color 0.1s'
                      }}
                      className="multiselect-item"
                    >
                      <Checkbox 
                        disabled={readOnly}
                        checked={isSelected} 
                        style={{ pointerEvents: 'none' }} 
                      />
                      <Text size="2">{inputoption.text}</Text>
                    </Flex>
                  );
                })}
                
              </Flex>
            </Box>
          </ScrollArea>
        </Popover.Content>
      </Popover.Root>

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
                                  {errorText || `Required field`}
                              </p>
                              </> : null } 
       </div>
    </Flex>
    </Column>
  );
};