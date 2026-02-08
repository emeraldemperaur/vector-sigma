import React, { useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Flex, Text, Checkbox as RadixCheckbox, Grid, Tooltip } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type CheckBoxDesign = 'checkbox' | 'checkbox-material' | 'checkbox-outline' | 'checkbox-neumorphic';

interface CheckboxGroup {
  inputtype?: CheckBoxDesign,
  alias: string, inputLabel?: string, icon?: React.ReactNode,
  width: number, defaultValue?: any[], value: any[], newRow?: boolean, isEdit?: boolean,
  placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
  inputoptions: InputOption[];
  direction?: 'row' | 'column'; // CSS Layout direction
  columns?: string; // CSS grid template columns (e.g., "1fr 1fr")
  className?: string;
  style?: React.CSSProperties;
}

export const CheckboxGroup = ({
  inputtype = 'checkbox',
  alias, readOnly, width,
  placeholder = '',
  style, value, inputoptions,
  direction = 'column',
  columns, 
  className, ...props
}: CheckboxGroup) => {
  
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  
  const currentValues = (Array.isArray(field.value) ? field.value : []) as string[];
  const hasError = Boolean(meta.touched && meta.error);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  // Add/Remove Checked Values
  const handleCheckedChange = (checked: boolean, value: string) => {
    let newValues = [...currentValues];
    if (checked) {
      newValues.push(value);
    } else {
      newValues = newValues.filter((v) => String(v) !== String(value));
    }
    setFieldValue(alias, newValues);
    setTimeout(() => setFieldTouched(alias, true), 0);
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
    <Column span={width} newLine={props.newRow}>
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
          /* Hide default Radix checkbox appearance to replace with our own */
          .neu-checkbox .rt-CheckboxButton { 
            background-color: var(--neu-bg);
            border: none;
            box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
            border-radius: 4px;
            width: 20px;
            height: 20px;
            transition: all 0.2s ease;
          }
          /* Checked State: Pressed In */
          .neu-checkbox[data-state='checked'] .rt-CheckboxButton {
            box-shadow: inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light);
            background-color: var(--neu-bg); /* Keep bg same, let icon show color */
          }
          /* The Check Icon Color */
          .neu-checkbox .rt-CheckboxIndicator {
            color: var(--neu-check-color);
          }
        `}} />
      )}

      <Grid 
        columns={columns || (direction === 'row' ? 'repeat(auto-fit, minmax(100px, 1fr))' : '1')} 
        gap="3"
        style={neuVars} 
      >
        {inputoptions.map((inputoption) => {
          const isChecked = currentValues.some(val => String(val) === String(inputoption.optionvalue));
          return (
            <Text 
              as="label" 
              key={inputoption.optionvalue} 
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
                id={`${alias}FormInput${inputoption.optionid}`}
                aria-describedby={`${alias}InputLabel${inputoption.optionid}`}
                disabled={readOnly}
                value={inputoption.optionvalue}
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckedChange(checked as boolean, inputoption.optionvalue)}
                
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

      <div>
                  <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{props.inputLabel}</Text>
                  
                      {hasError ?
                              <>
                              <p className='core-input-label-error'>
                                  {meta.error}
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