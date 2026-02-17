import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Select, Flex, Text, Tooltip, Separator } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { useField, useFormikContext } from 'formik';
import '../../styles/main.scss';

export type xDropDownDesign = 'dropdown' | 'dropdown-material' | 'dropdown-outline' | 'dropdown-neumorphic';

export interface xDropDownProps {
  inputtype?: xDropDownDesign & {};
  alias: string;
  inputLabel?: string;
  icon?: React.ReactNode;
  width: number;
  defaultvalue?: string;
  value?: string;
  newRow?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  isHinted?: boolean;
  hintText?: string;
  hintUrl?: string;
  onValueChange?: (value: string) => void;
  errorText?: ReactNode | string | null;
  inputOptions: { 
    optionid: number | string; 
    text: string; 
    optionvalue: string; 
    tag?: string; 
    score?: number | string;
    note?: string; 
    optionurl?: string;
  }[];
  className?: string;
  style?: React.CSSProperties;
}

export const Dropdown = ({
  inputtype = 'dropdown-outline',
  alias, readOnly, width, inputLabel,
  placeholder, value, inputOptions,
  style, newRow, isHinted, hintText,
  hintUrl, defaultvalue, errorText, className,
  ...props
}: xDropDownProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  const inputId = `${alias}FormInput` || crypto.randomUUID();
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

  // OUTLINE
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

  // NEUMORPHIC
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
    <>
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
        value={field.value || ""} 
        onValueChange={(val) => {
          const finalVal = val === "__RESET__" ? "" : val;
          setFieldValue(alias, finalVal);
          setTimeout(() => setFieldTouched(alias, true), 0);
          if (props.onValueChange) props.onValueChange(finalVal);
        }}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
             setFieldTouched(alias, true);
          }
        }}
      >
        <Select.Trigger 
          id={`${alias}FormInput`}
          ref={triggerRef}
          variant="ghost" 
          placeholder={placeholder || "Select an option"}
          className={`${inputtype === 'dropdown-neumorphic' ? 'neu-select-trigger' : ''} ${className || ''}`}
          style={{ ...activeTriggerStyle, ...style }}
          {...props} 
        />

        <Select.Content position="popper" sideOffset={5} style={activeContentStyle}>
          <Select.Item 
            value="__RESET__" 
            className={inputtype === 'dropdown-neumorphic' ? 'neu-select-item' : ''}
            style={{ color: 'var(--gray-10)', fontStyle: 'italic' }}
          >
             {placeholder || "Select an option"}
          </Select.Item>
          
          <Separator size="4" style={{ margin: '4px 0', opacity: 0.5 }} />

          {inputOptions.map((inputoption) => (
            <React.Fragment key={inputoption.optionid || crypto.randomUUID()}>
            {inputoption.optionurl ?            
            <Select.Item 
              id={String(inputoption.optionid) || ''}
              value={inputoption.optionvalue}
              className={inputtype === 'dropdown-neumorphic' ? 'neu-select-item' : ''}>
              <a onClick={(e) => { e.stopPropagation(); openLink(inputoption.optionurl || "#"); }} style={{textDecoration: 'none', color: 'inherit'}}>
                {inputoption.text}
              </a>
            </Select.Item>
            : 
            <Select.Item 
              id={String(inputoption.optionid) || ''}
              value={inputoption.optionvalue}
              className={inputtype === 'dropdown-neumorphic' ? 'neu-select-item' : ''}
            >
              {inputoption.text}
            </Select.Item>
            }
            </React.Fragment>
            
          ))}
        </Select.Content>
      </Select.Root>

       <div>
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={inputId}>{inputLabel}</Text>
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
                  {errorText || meta.error || "Required field"}
              </p>
              </> : null } 
      </div>
    </Flex>
    </Column>
    </>
  );
};