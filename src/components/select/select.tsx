import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Select, Flex, Text, Tooltip } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from "utils/vinci";
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { useField, useFormikContext } from 'formik';
import '../../styles/main.scss';


export type OptionSelectDesign = 'select' | 'select-material' | 'select-outline' | 'select-neumorphic';

interface OptionSelectProps {
    inputtype?: OptionSelectDesign,
    alias: string, inputLabel?: string, icon?: React.ReactNode,
    width: number, defaultValue?: string, value: string, newRow?: boolean, 
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
    onValueChange?: (value: string) => void, 
    inputoptions: InputOption[], errorText?: ReactNode | string | null,
    className?: string,
    style?: React.CSSProperties
}

export const OptionSelect = ({
  inputtype = 'select',
  alias, readOnly, width,
  placeholder = '',
  style, value, inputoptions,
  className, ...props
}: OptionSelectProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  
  const hasError = Boolean(meta.touched && meta.error);

  useEffect(() => {
    if (inputtype === 'select-neumorphic' && triggerRef.current) {
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

  // --- STYLES ---
  const materialTrigger: React.CSSProperties = {
    backgroundColor: 'var(--color-surface)',
    border: hasError ? '1px solid var(--red-9)' : 'none', 
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    height: '32px',
    fontWeight: 500,
  };
  
  const outlineTrigger: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: hasError ? '2px solid var(--red-9)' : '2px solid var(--gray-7)', 
    borderRadius: '4px',
    height: '32px',
    fontWeight: 600,
  };

  const neumorphicTrigger: React.CSSProperties = {
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--red-9)' : 'var(--neu-text)',
    border: 'none',
    borderRadius: '12px',
    height: '40px',
    fontWeight: 600,
    padding: '0 12px',
    boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
    transition: 'all 0.2s ease',
  };

  const activeTriggerStyle = 
    inputtype === 'select' ? materialTrigger :
    inputtype === 'select-material' ? materialTrigger :
    inputtype === 'select-outline' ? outlineTrigger :
    { ...neumorphicTrigger, ...neuVars };

  return (
    <Column span={width} newLine={props.newRow}>
    <Flex direction="column" gap="2" style={{ width: '100%' }}>
      {inputtype === 'select-neumorphic' && (
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
        aria-describedby={`${alias}InputLabel`}
        defaultValue={props.defaultValue || value}
        value={field.value || value}
        onValueChange={(val) => {
          setFieldValue(alias, val);
          setTimeout(() => setFieldTouched(alias, true), 0);
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
          placeholder={placeholder}
          className={`${inputtype === 'select-neumorphic' ? 'neu-select-trigger' : ''} ${className || ''}`}
          style={{ ...activeTriggerStyle, ...style }}
        />

        <Select.Content position="popper" sideOffset={5}>
          {inputoptions.map((option) => (
            <Select.Item 
              id={String(option.optionid) || ''}
              key={option.optionid} 
              value={option.optionvalue}
              className={inputtype === 'select-neumorphic' ? 'neu-select-item' : ''}
            >
              {option.text}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <div>
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{props.inputLabel}</Text>
            
                {hasError ?
                        <>
                        <p className='core-input-label-error'>
                            {props.errorText || `Required field`}
                        </p>
                        </> : null } 
            
                {props.isHinted ?
                        <>
                        <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                            <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                            <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                        </> : null} 
      </div>
    </Flex>
    </Column>
  );
};