import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Flex, Text, RadioGroup, Grid, Tooltip } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type RadioDesign = 'radio' | 'radio-material' | 'radio-outline' | 'radio-neumorphic';

interface RadioGroupProps {
    inputtype?: RadioDesign & {},
    alias: string, inputlabel?: string, icon?: React.ReactNode,
    width: number, defaultValue?: any[], value?: any[], newRow?: boolean, isEdit?: boolean,
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
    inputoptions: InputOption[];
    direction?: 'row' | 'column'; // CSS Layout direction
    columns?: string; // CSS grid template columns (e.g., "1fr 1fr")
    className?: string,  errorText?: ReactNode | string | null,
    style?: React.CSSProperties;
}

export const RadioGroupInput = ({
  inputtype = 'radio-outline',
  alias, readOnly, width, inputlabel,
  placeholder = '',
  style, inputoptions,
  direction = 'column',
  columns, 
  className, ...props
}: RadioGroupProps) => {
  
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
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
    <Column span={width} newLine={props.newRow}>
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
        value={field.value}
        onValueChange={(val) => {
          setFieldValue(alias, val);
          setTimeout(() => setFieldTouched(alias, true), 0);
        }}
      >
        <Grid 
          columns={columns || (direction === 'row' ? 'repeat(auto-fit, minmax(100px, 1fr))' : '1')} 
          gap="3"
          style={neuVars}
        >
          {inputoptions.map((inputoption) => {
             const isChecked = String(field.value) === String(inputoption.optionvalue);

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
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputlabel}</Text>
            &nbsp;
            {props.isHinted ?
                <>
                    <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                                  <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                                  <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                                  </a> 
                              </Tooltip>
                </> : null} 
             {hasError ?
                <>
                    <p id={errorId} className='core-input-label-error'>
                            {props.errorText || `Required field`}
                    </p>
                </> : null } 
     </div>
    </Flex>
    </Column>
  );
};