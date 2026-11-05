import React, { ReactNode, useEffect, useRef, useState, useId, useMemo } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, Slider as RadixSlider, Tooltip, Badge } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type SliderDesign = 
  | 'slider' 
  | 'slider-material' 
  | 'slider-outline' 
  | 'slider-neumorphic';

/**
 * SliderInputProps Interface
 * @description Configuration properties for the VectorSigma SliderInput component.
 * Emits a single scalar primitive `number` to satisfy VectorSigma's `Yup.number()` validation engine.
 * Features enterprise-grade aesthetics (Outline, Material, n8n Neumorphic),
 * real-time numeric badges, responsive typography overrides, and strict Formik integration.
 */
export interface SliderInputProps {
  /**
   * The required unique identifier for the SliderInput field in Formik context.
   * Alias referenced as `name` attribute and Formik state key.
   * Stores a scalar primitive number (e.g., `4`).
   * @example "numberOfRentalRooms"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the slider track.
   * @example "Number of Rental Rooms"
   */
  inputLabel?: string;

  /**
   * The aesthetic design variation of the slider track and thumb.
   * - `slider-outline`: Minimalist enterprise border track with accent thumb (Default).
   * - `slider-material`: Elevated solid track with halo drop shadows.
   * - `slider-neumorphic`: Soft-UI with recessed track and extruded thumbs.
   * @default "slider-outline"
   */
  inputtype?: SliderDesign;

  /**
   * Alternative prop name matching standard VectorSigma prop conventions.
   */
  inputvariant?: SliderDesign;

  /**
   * Defines the responsive grid column span for the component (1-12 based on the parent grid).
   * @example 6
   */
  width: number;

  /**
   * Forces the component to break into a new Flex/Grid row within the Form layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Minimum allowable numerical boundary for the slider.
   * @default 0
   */
  minvalue?: number;

  /**
   * Alias for `minvalue` matching standard HTML slider conventions.
   */
  min?: number;

  /**
   * Maximum allowable numerical boundary for the slider.
   * @default 100
   */
  maxvalue?: number;

  /**
   * Alias for `maxvalue` matching standard HTML slider conventions.
   */
  max?: number;

  /**
   * Incremental granularity step interval between values.
   * @default 1
   */
  stepvalue?: number;

  /**
   * Alias for `stepvalue` matching standard HTML slider conventions.
   */
  step?: number;

  /**
   * Disables interaction, mutating the visual state to reflect read-only mode.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Toggles the visibility of the contextual hint icon and tooltip next to the label.
   * @default false
   */
  isHinted?: boolean;

  /**
   * The text payload displayed inside the Tooltip when `isHinted` is true.
   * @example "Select the maximum room occupancy for seasonal listings."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/properties/rooms"
   */
  hintUrl?: string;

  /**
   * Toggles the real-time value pill/badge in the top-right header row.
   * @default true
   */
  showValueBadge?: boolean;

  /**
   * Optional formatting callback for rendering the number in the header badge.
   * @example (val) => `${val} Rooms`
   * @example (val) => `$${val.toLocaleString()}`
   */
  valueFormatter?: (value: number) => string;

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid number of rooms is required."
   */
  errorText?: ReactNode | string | null;

  /**
   * Sizing scale for the slider track and thumb.
   * @default "2"
   */
  size?: "1" | "2" | "3";

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of tracks, badges, and containers */
    background?: string;
    /** Overrides the stroke/border color of track outlines and thumbs */
    stroke?: string;
    /** Overrides the text color of labels and numeric readouts */
    textColor?: string;
    /** Overrides the primary active fill color of the slider range and thumb */
    accent?: string;
  };

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string;

  /**
   * Inline React CSS properties applied to the outermost Flex wrapper.
   */
  style?: React.CSSProperties;

  /**
   * Injects an explicit Formik context. Required if the component operates outside 
   * a standard `<FormikProvider>` tree.
   */
  formikContext?: FormikContextType<any>;
}

export type SliderProps = SliderInputProps;

export const SliderInput = ({
  alias,
  inputLabel,
  inputtype = 'slider-outline',
  inputvariant,
  width,
  newRow,
  minvalue,
  min = 0,
  maxvalue,
  max = 100,
  stepvalue,
  step = 1,
  readOnly = false,
  isHinted,
  hintText,
  hintUrl,
  showValueBadge = true,
  valueFormatter,
  errorText,
  size = "2",
  typography,
  className,
  style,
  formikContext,
}: SliderInputProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: SliderInput '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
    return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldVal = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const labelId = `${alias}InputLabel`;
  const errorId = `${alias}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  const resolvedVariant = inputvariant || inputtype || 'slider-outline';
  const resolvedMin = minvalue !== undefined ? minvalue : min;
  const resolvedMax = maxvalue !== undefined ? maxvalue : max;
  const resolvedStep = stepvalue !== undefined ? stepvalue : step;

  const sliderValue: number[] = useMemo(() => {
    if (typeof fieldVal === 'number' && !isNaN(fieldVal)) {
      return [fieldVal];
    }
    if (Array.isArray(fieldVal) && fieldVal.length > 0) {
      const parsed = Number(fieldVal[0]);
      return [isNaN(parsed) ? resolvedMin : parsed];
    }
    if (fieldVal !== undefined && fieldVal !== null && fieldVal !== '') {
      const parsed = Number(fieldVal);
      return [isNaN(parsed) ? resolvedMin : parsed];
    }
    return [resolvedMin];
  }, [fieldVal, resolvedMin]);

  const hasError = Boolean(fieldTouched && fieldError);

  useEffect(() => {
    if (resolvedVariant.includes('neumorphic') && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = typography?.background || parentBg;

      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -20),
        '--neu-shadow-light': adjustColor(computedBg, 20),
      } as React.CSSProperties);
    }
  }, [resolvedVariant, typography?.background]);

  const typographyVars = {
    '--vs-sl-bg': typography?.background || 'var(--color-surface)',
    '--vs-sl-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-sl-text': typography?.textColor || 'var(--gray-12)',
    '--vs-sl-accent': typography?.accent || 'var(--accent-9)',
  } as React.CSSProperties;

  const formattedDisplayValue = useMemo(() => {
    const currentValue = sliderValue[0];
    if (valueFormatter) {
      return valueFormatter(currentValue);
    }
    return currentValue.toString();
  }, [sliderValue, valueFormatter]);

  return (
    <Column span={width} newLine={newRow}>
      <Flex 
        direction="column" 
        gap="2" 
        style={{ width: '100%', fontFamily: "'Libre Franklin', sans-serif", ...typographyVars, ...style }} 
        ref={containerRef} 
        className={className}
      >
        <style>
          {`
            .vs-single-slider-root {
              position: relative;
              display: flex;
              align-items: center;
              user-select: none;
              touch-action: none;
              width: 100%;
              cursor: ${readOnly ? 'not-allowed' : 'pointer'};
              padding: 6px 0;
            }
            .vs-single-slider-root.vs-readonly {
              opacity: 0.6;
              pointer-events: none;
            }

            .vs-single-slider-outline .rt-SliderTrack {
              background-color: var(--gray-3);
              border: 1px solid ${hasError ? 'var(--red-9)' : 'var(--vs-sl-stroke)'};
              height: ${size === '1' ? '4px' : size === '3' ? '8px' : '6px'};
              border-radius: 9999px;
            }
            .vs-single-slider-outline .rt-SliderRange {
              background-color: ${hasError ? 'var(--red-9)' : 'var(--vs-sl-accent)'};
              border-radius: 9999px;
            }
            .vs-single-slider-outline .rt-SliderThumb {
              background-color: #ffffff;
              border: 2px solid ${hasError ? 'var(--red-9)' : 'var(--vs-sl-accent)'};
              width: ${size === '1' ? '16px' : size === '3' ? '24px' : '20px'};
              height: ${size === '1' ? '16px' : size === '3' ? '24px' : '20px'};
              border-radius: 50%;
              box-shadow: 0 1px 3px rgba(0,0,0,0.15);
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .vs-single-slider-outline .rt-SliderThumb:hover {
              transform: scale(1.12);
              box-shadow: 0 0 0 4px var(--accent-a3);
            }
            .vs-single-slider-outline .rt-SliderThumb:focus-visible {
              outline: none;
              box-shadow: 0 0 0 5px var(--accent-a4);
            }

            .vs-single-slider-material .rt-SliderTrack {
              background-color: var(--gray-4);
              height: ${size === '1' ? '4px' : size === '3' ? '8px' : '6px'};
              border-radius: 9999px;
              box-shadow: inset 0 1px 2px rgba(0,0,0,0.06);
            }
            .vs-single-slider-material .rt-SliderRange {
              background-color: ${hasError ? 'var(--red-9)' : 'var(--vs-sl-accent)'};
              border-radius: 9999px;
            }
            .vs-single-slider-material .rt-SliderThumb {
              background-color: var(--vs-sl-accent);
              border: 2px solid #ffffff;
              width: ${size === '1' ? '16px' : size === '3' ? '24px' : '20px'};
              height: ${size === '1' ? '16px' : size === '3' ? '24px' : '20px'};
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.22);
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .vs-single-slider-material .rt-SliderThumb:hover {
              transform: scale(1.15);
              box-shadow: 0 4px 12px rgba(0,0,0,0.28), 0 0 0 6px var(--accent-a3);
            }
            .vs-single-slider-material .rt-SliderThumb:focus-visible {
              outline: none;
              box-shadow: 0 0 0 8px var(--accent-a4);
            }

            .vs-single-slider-neumorphic .rt-SliderTrack {
              background-color: var(--neu-bg);
              height: ${size === '1' ? '6px' : size === '3' ? '10px' : '8px'};
              border-radius: 9999px;
              box-shadow: inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light);
            }
            .vs-single-slider-neumorphic .rt-SliderRange {
              background-color: var(--vs-sl-accent);
              border-radius: 9999px;
            }
            .vs-single-slider-neumorphic .rt-SliderThumb {
              background-color: var(--neu-bg);
              border: 2px solid var(--neu-bg);
              width: ${size === '1' ? '18px' : size === '3' ? '26px' : '22px'};
              height: ${size === '1' ? '18px' : size === '3' ? '26px' : '22px'};
              border-radius: 50%;
              box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
              transition: transform 0.15s ease, box-shadow 0.15s ease;
            }
            .vs-single-slider-neumorphic .rt-SliderThumb:hover {
              transform: scale(1.1);
              box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
            }
            .vs-single-slider-neumorphic .rt-SliderThumb:active {
              transform: scale(0.96);
              box-shadow: inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light);
            }

            /* Readout Pill Badge */
            .vs-single-slider-badge {
              font-family: inherit;
              font-variant-numeric: tabular-nums;
              font-weight: 600;
              letter-spacing: 0.02em;
            }
          `}
        </style>

        <Flex justify="between" align="center" style={{ minHeight: '24px', paddingLeft: '2px', paddingRight: '2px' }}>
          <Flex align="center" gap="2">
            {inputLabel && (
              <Text id={labelId} as="label" size="2" weight="medium" style={{ color: 'var(--gray-11)' }} htmlFor={inputId}>
                {inputLabel}
              </Text>
            )}
            {isHinted && (
              <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5}>
                <a href={hintUrl || "#"} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon name="questionmarkcircled" height="15" width="15" style={{ cursor: 'pointer', color: 'var(--gray-9)', transition: 'color 0.2s' }} />
                </a> 
              </Tooltip>
            )}
          </Flex>

          {showValueBadge && (
            <Badge 
              size={size === "3" ? "2" : "1"} 
              variant={resolvedVariant.includes('neumorphic') ? "surface" : "soft"} 
              color="gray"
              className="vs-single-slider-badge"
              style={{
                backgroundColor: resolvedVariant.includes('neumorphic') 
                  ? 'transparent' 
                  : typography?.accent 
                    ? adjustColor(typography.accent, 85) 
                    : undefined,
                color: typography?.accent ? typography.accent : undefined,
                boxShadow: resolvedVariant.includes('neumorphic')
                  ? '2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)'
                  : undefined,
              }}
            >
              {formattedDisplayValue}
            </Badge>
          )}
        </Flex>

        <RadixSlider
          name={alias}
          id={inputId}
          disabled={readOnly}
          aria-labelledby={inputLabel ? labelId : undefined}
          aria-describedby={hasError ? errorId : undefined}
          min={resolvedMin}
          max={resolvedMax}
          step={resolvedStep}
          value={sliderValue}
          onValueChange={(val: number[]) => {
            setFieldValue(alias, val[0]);
          }}
          onValueCommit={() => {
            setFieldTouched(alias, true, false);
          }}
          className={`vs-single-slider-root ${
            resolvedVariant.includes('material') ? 'vs-single-slider-material' : 
            resolvedVariant.includes('neumorphic') ? 'vs-single-slider-neumorphic' : 
            'vs-single-slider-outline'
          } ${readOnly ? 'vs-readonly' : ''}`}
          style={neuVars}
        />

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "A valid selection is required")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};