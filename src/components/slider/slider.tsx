import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, Slider as RadixSlider, Tooltip } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type SliderDesign = 'slider' | 'slider-material' | 'slider-outline' | 'slider-neumorphic';

interface SliderProps {
  /**
     * * The required unique identifier for the SliderInput field in useFormikContext(). 
     * Alias referenced as `name` attribute and Formik state key.
     * * @example
     * alias="numberOfRentalRooms"
     */
    alias: string; 
    /**
     * * The optional input label or description for the SliderInput field. 
     * * @example
     * inputLabel="Specify number of rooms for rental"
     */
    inputLabel?: string; 
    /**
     * * The design variation of the SliderInput field. 
     * Default: 'slider-outline' 
     * Variants: 'slider', 'slider-outline', 'slider-material', 'slider-neumorphic'.
     * * @example
     * inputtype="slider-neumorphic"
     */
    inputtype?: SliderDesign & {};
     /**
     * * The required viewport column width for the SliderInput field.
     * i.e. 1 - 12
     * * @example
     * width={5}
     */ 
    width: number;
     /**
     * * Option to render SliderInput field on new row.
     * * @example
     * newRow
     */
    newRow?: boolean; 
     /**
     * * Option to specify the isRequired error text for the SliderInput field.
     * * @example
     * errorText="A number range selection is required"
     */
    errorText?: ReactNode | string | null;
    /**
     * * Option to disable edits for SliderInput field.
     * * @example
     * readOnly
     */
    readOnly?: boolean;
    /**
       * * Option to enable a hint for SliderInput field.
       * * @example
       * isHinted
       */
    isHinted?: boolean; 
    /**
     * * Option to specify hint text for SliderInput field.
     * * @example
     * hintText="This is a hint for a VΣ SliderInput"
     */
    hintText?: string;
    /**
     * * Option to specify a hint url reference or resource for SliderInput field.
     * * @example
     * hintUrl="https://www.mekaegwim.ca"
     */ 
    hintUrl?: string;
     /**
     * * Option to specify a minimum value for SliderInput field.
     * * @example
     * minvalue={10}
     */ 
    minvalue?: number;
      /**
     * * Option to specify a maximum value for SliderInput field.
     * * @example
     * minvalue={100}
     */ 
    maxvalue?: number;
      /**
     * * Option to specify an incremental step value for SliderInput field.
     * * @example
     * minvalue={10}
     */ 
    stepvalue?: number;
    /**
     * * Option to specify the .scss class selector for the SliderInput field.
     * * @example
     * className="teletraan-1-sliderinput"
     */
    className?: string;
    /**
     * * Option to inject custom CSS the SliderInput field.
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


export const SliderInput = ({
  inputtype = 'slider-outline',
  alias, readOnly, width, inputLabel,
  newRow, isHinted, hintText, hintUrl, errorText,
  minvalue = 0,
  maxvalue = 100,
  stepvalue = 1,
  className,
  style, 
  formikContext,
  ...props
}: SliderProps) => {
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`SliderInput '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldVal = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const fieldValue = Array.isArray(fieldVal) ? fieldVal : [fieldVal || minvalue];
  const hasError = Boolean(fieldTouched && fieldError);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  const labelId = `${alias}InputLabel`;
  const errorId = `${alias}-error`;

  useEffect(() => {
    if (inputtype === 'slider-neumorphic' && containerRef.current) {
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
          {fieldValue[0]}
        </Text>
      </Flex>

      <style dangerouslySetInnerHTML={{__html: `
        /* --- NEUMORPHIC --- */
        
        /* Groove (Track) */
        .neu-slider .rt-SliderTrack {
          background-color: var(--neu-bg);
          height: 8px; /* Thicker track for the groove effect */
          box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), 
                      inset -2px -2px 5px var(--neu-shadow-light);
          border-radius: 99px;
        }

        /* Fill (Range) */
        .neu-slider .rt-SliderRange {
          background-color: var(--neu-accent);
          border-radius: 99px;
          /* Optional: Add inner glow to the fill */
          box-shadow: inset 0 0 2px rgba(0,0,0,0.2); 
        }

        /* Puck (Thumb) */
        .neu-slider .rt-SliderThumb {
          background-color: var(--neu-bg);
          border: 2px solid var(--neu-bg); /* subtle border */
          width: 24px;
          height: 24px;
          /* Floating effect */
          box-shadow: 3px 3px 6px var(--neu-shadow-dark), 
                      -3px -3px 6px var(--neu-shadow-light);
        }
        
        /* Thumb Hover/Active */
        .neu-slider .rt-SliderThumb:hover {
          transform: scale(1.1);
          cursor: grab;
        }
        .neu-slider .rt-SliderThumb:active {
          cursor: grabbing;
          /* Press it slightly */
          transform: scale(0.95);
        }

        /* --- OUTLINE --- */
        .outline-slider .rt-SliderTrack {
           height: 4px;
           background-color: transparent;
           border: 1px solid var(--gray-8);
        }
        .outline-slider .rt-SliderRange {
           background-color: var(--accent-9);
        }
        .outline-slider .rt-SliderThumb {
           background-color: white;
           border: 2px solid var(--accent-9);
           box-shadow: none;
        }
      `}} />

      <RadixSlider 
        name={alias}
        id={`${alias}FormInput`} 
        disabled={readOnly}
        aria-labelledby={labelId}
        min={minvalue} 
        max={maxvalue} 
        step={stepvalue}
        value={fieldValue}
        onValueChange={(val) => {
          setFieldValue(alias, val[0]);
        }}
        onValueCommit={() => {
          setFieldTouched(alias, true, false);
        }}
        
        className={ inputtype === 'slider-neumorphic' ? 'neu-slider' : inputtype === 'slider-outline' ? 'outline-slider' : ''}
        style={neuVars}
      />

      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
            {inputLabel && (
                <Text id={labelId} as="div" size="2" weight="bold">
                  {inputLabel}
                </Text>
                )}
                
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