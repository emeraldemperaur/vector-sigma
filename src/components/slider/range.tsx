import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, Slider, Tooltip } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type RangeDesign = 'range' | 'range-material' | 'range-outline' | 'range-neumorphic';

interface RangeProps {
   /**
   * * The required unique identifier for the RangeSlider input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="coverageRange"
   */
  alias: string; 
  /**
   * * The optional input label or description for the RangeSlider input field. 
   * * @example
   * inputLabel="Specify the desired coverage radius"
   */
  inputLabel?: string; 
  /**
   * * The design variation of the RangeSlider input. 
   * Default: 'range-outline' 
   * Variants: 'range', 'range-outline', 'range-material', 'range-neumorphic'.
   * * @example
   * inputtype="range-neumorphic"
   */
  inputtype?: RangeDesign & {};
   /**
   * * The required viewport column width for the RangeSlider input field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */ 
  width: number;
   /**
   * * Option to render RangeSlider input field on new row.
   * * @example
   * newRow
   */
  newRow?: boolean; 
   /**
   * * Option to specify the isRequired error text for the RangeSlider input field.
   * * @example
   * errorText="A coverage range selection is required"
   */
  errorText?: ReactNode | string | null;
  /**
   * * Option to disable edits for RangeSlider input field.
   * * @example
   * readOnly
   */
  readOnly?: boolean;
  /**
     * * Option to enable a hint for RangeSlider input field.
     * * @example
     * isHinted
     */
  isHinted?: boolean; 
  /**
   * * Option to specify hint text for RangeSlider input field.
   * * @example
   * hintText="This is a hint for a VΣ RangeSlider"
   */
  hintText?: string;
  /**
   * * Option to specify a hint url reference or resource for RangeSlider input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */ 
  hintUrl?: string;
   /**
   * * Option to specify a minimum value for RangeSlider input field.
   * * @example
   * minvalue={10}
   */ 
  minvalue?: number;
    /**
   * * Option to specify a maximum value for RangeSlider input field.
   * * @example
   * minvalue={100}
   */ 
  maxvalue?: number;
    /**
   * * Option to specify an incremental step value for RangeSlider input field.
   * * @example
   * minvalue={10}
   */ 
  stepvalue?: number;
   /**
   * * Option to specify a number for the minimum steps expected between values for RangeSlider input field.
   * * @example
   * minvalue={10}
   */ 
  minStepsBetweenThumbs?: number;
  /**
   * * Option to specify the .scss class selector for the RangeSlider input field.
   * * @example
   * className="teletraan-1-rangeslider"
   */
  className?: string;
  /**
   * * Option to inject custom CSS the RangeSlider input field.
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


export const RangeSlider = ({
  inputtype = 'range-outline',
  alias, readOnly, width, inputLabel,
  newRow, isHinted, hintText, hintUrl, errorText,
  minvalue = 0,
  maxvalue = 100,
  stepvalue = 1,
  minStepsBetweenThumbs = 0,
  className,
  style, 
  formikContext,
  ...props
}: RangeProps) => {
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`RangeSlider '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldVal = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);
  
  const isRange = Array.isArray(fieldVal);
  const sliderValue = isRange ? fieldVal : [fieldVal || minvalue];
  const hasError = Boolean(fieldTouched && fieldError);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  const errorId = `${alias}-error`;
  const labelId = `${alias}InputLabel`;

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
    <Column span={width} newLine={newRow}>
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
          {sliderValue.join(' - ')}
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
        .neu-slider .rt-SliderRange { background-color: var(--neu-accent); border-radius: 99px; }
        .neu-slider .rt-SliderThumb {
          background-color: var(--neu-bg); border: 2px solid var(--neu-bg);
          width: 24px; height: 24px;
          box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
        }
        .neu-slider .rt-SliderThumb:hover { transform: scale(1.1); cursor: grab; }
        .neu-slider .rt-SliderThumb:active { transform: scale(0.95); cursor: grabbing; }

        /* Outline */
        .outline-slider .rt-SliderTrack { height: 4px; background-color: transparent; border: 1px solid var(--gray-8); }
        .outline-slider .rt-SliderRange { background-color: var(--accent-9); }
        .outline-slider .rt-SliderThumb { background-color: white; border: 2px solid var(--accent-9); box-shadow: none; }
      `}} />

      <Slider 
        name={alias}
        id={`${alias}FormInput`} 
        disabled={readOnly}
        aria-labelledby={labelId}
        min={minvalue} 
        max={maxvalue} 
        step={stepvalue}
        minStepsBetweenThumbs={minStepsBetweenThumbs}
        value={sliderValue}
        onValueChange={(val) => {
          setFieldValue(alias, isRange ? val : val[0]);
        }}
        onValueCommit={() => setFieldTouched(alias, true, false)}
        className={inputtype === 'range-neumorphic' ? 'neu-slider' : inputtype === 'range-outline' ? 'outline-slider' : ''}
        style={neuVars}
      />

      <div>
            <Text id={labelId} as="div" size="2" weight="bold" style={{ display: 'inline' }}>
               {inputLabel}
            </Text>
                &nbsp;
                {isHinted && (
                        <>
                        <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                            <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                            <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                        </>
                )} 
                 {hasError && (
                        <>
                        <p id={errorId} className='core-input-label-error'>
                            {errorText || (typeof fieldError === 'string' ? fieldError : `Required field`)}
                        </p>
                        </>
                 )} 
      </div>
    </Flex>
    </Column>
  );
};