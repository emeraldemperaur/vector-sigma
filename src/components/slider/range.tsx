import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Flex, Text, Slider, Tooltip } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type RangeDesign = 'range' | 'range-material' | 'range-outline' | 'range-neumorphic';

interface RangeProps {
  inputtype?: RangeDesign,
  alias: string, inputLabel?: string, icon?: React.ReactNode,
  width: number, defaultValue?: string, value: string, newRow?: boolean, errorText?: ReactNode | string | null,
  placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
  minvalue?: number,
  maxvalue?: number,
  stepvalue?: number,
  minStepsBetweenThumbs?: number,
  design?: RangeDesign,
  className?: string, 
  style?: React.CSSProperties;
}


export const RangeSlider = ({
  inputtype = 'range',
  alias, readOnly, width,
  placeholder = '',
  value,
  minvalue = 0,
  maxvalue = 100,
  stepvalue = 1,
  minStepsBetweenThumbs = 0,
  className,
  style, ...props
}: RangeProps) => {
  
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  
  // Range Formik Logic 
  // Synopsis
  // Radix slider component requires an array. 
  // If field.value is [20, 80] pass [20, 80].
  // If field.value is 50 we pass [50].
  // If field.value is undefined, default to [min] or [min, max].
  const isRange = Array.isArray(field.value);
  const fieldValue = isRange ? field.value : [field.value || minvalue];
  
  const hasError = Boolean(meta.touched && meta.error);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (inputtype === 'range-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      setNeuVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': adjustColor(parentBg, -20),
        '--neu-shadow-light': adjustColor(parentBg, 20),
        '--neu-accent': 'var(--accent-9)',
      } as React.CSSProperties);
    }
  }, [inputtype]);

  return (
    <Column span={width} newLine={props.newRow}>
    <Flex 
      direction="column" 
      gap="3" 
      width="100%" 
      ref={containerRef} 
      style={style} 
      className={className}
    >
      <Flex justify="between" align="center">
        <Text size="2" color="gray" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fieldValue.join(' - ')}
        </Text>
      </Flex>

      <style dangerouslySetInnerHTML={{__html: `
        /* Neumorphic */
        .neu-slider .rt-SliderTrack {
          background-color: var(--neu-bg);
          height: 8px;
          box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light);
          border-radius: 99px;
        }
        .neu-slider .rt-SliderRange {
          background-color: var(--neu-accent);
          border-radius: 99px;
        }
        .neu-slider .rt-SliderThumb {
          background-color: var(--neu-bg);
          border: 2px solid var(--neu-bg);
          width: 24px; height: 24px;
          box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
        }
        .neu-slider .rt-SliderThumb:hover { transform: scale(1.1); cursor: grab; }
        .neu-slider .rt-SliderThumb:active { transform: scale(0.95); cursor: grabbing; }

        /* Outline */
        .outline-slider .rt-SliderTrack {
           height: 4px; background-color: transparent; border: 1px solid var(--gray-8);
        }
        .outline-slider .rt-SliderRange { background-color: var(--accent-9); }
        .outline-slider .rt-SliderThumb {
           background-color: white; border: 2px solid var(--accent-9); box-shadow: none;
        }
      `}} />

      <Slider 
        name={alias}
        id={`${alias}FormInput`} 
        disabled={readOnly}
        aria-describedby={`${alias}InputLabel`}
        min={minvalue} 
        max={maxvalue} 
        step={stepvalue}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        value={fieldValue}
        onValueChange={(val) => {
          // LOGIC SYNOPSIS:
          // If Range, set value as array.
          // If Slider, set value as first value.
          setFieldValue(alias, isRange ? val : val[0]);
        }}
        onValueCommit={() => setFieldTouched(alias, true)}
        className={inputtype === 'range-neumorphic' ? 'neu-slider' : inputtype === 'range-outline' ? 'outline-slider' : ''}
        style={neuVars}
      />

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