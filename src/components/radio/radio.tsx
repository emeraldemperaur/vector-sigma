import React, { ReactNode, useEffect, useRef, useState, useId } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, RadioGroup, Grid, Tooltip, Box } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type RadioDesign = 'radio' | 'radio-material' | 'radio-outline' | 'radio-neumorphic';

/**
 * RadioGroupInputProps Interface
 * @description Configuration properties for the VectorSigma RadioGroupInput component.
 * Equipped with responsive layouts (stack, inline, or grid), optional card mode,
 * enterprise-grade aesthetics (Outline, Material, Neumorphic), and Formik integration.
 */
export interface RadioGroupInputProps {
  /**
   * The required unique identifier for the RadioGroup field in Formik context.
   * Alias referenced as `name` attribute and Formik state key.
   * @example "deploymentRegion"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the RadioGroup field.
   * @example "Primary Cloud Deployment Region"
   */
  inputLabel?: string;

  /**
   * The design aesthetic of the RadioGroup component.
   * - `radio-outline`: Minimalist, outlined aesthetic (Default).
   * - `radio-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `radio-neumorphic`: Soft-UI with extruded inset/outset shadows.
   * @default "radio-outline"
   */
  inputtype?: RadioDesign;

  /**
   * Alternative prop name matching standard VectorSigma prop conventions.
   */
  inputvariant?: RadioDesign;

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
   * Disables interaction across all radio options, mutating visual state to reflect read-only mode.
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
   * @example "Select the region closest to your primary database replica."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/infrastructure/regions"
   */
  hintUrl?: string;

  /**
   * Array of selectable radio options.
   * Each option requires an `optionid`, string `optionvalue`, and display `text`.
   * @example [
   *   { optionid: 1, optionvalue: "us-east-1", text: "US East (N. Virginia)" },
   *   { optionid: 2, optionvalue: "eu-central-1", text: "Europe (Frankfurt)" }
   * ]
   */
  inputOptions: InputOption[];

  /**
   * Layout orientation for the radio items.
   * - `column`: Vertical stack.
   * - `row`: Horizontal inline flow.
   * @default "column"
   */
  direction?: 'row' | 'column';

  /**
   * Explicit CSS grid template columns (e.g. `"repeat(3, 1fr)"` or `"1fr 1fr"`).
   * Overrides `direction` when supplied.
   * @example "repeat(auto-fit, minmax(180px, 1fr))"
   */
  columns?: string;

  /**
   * When enabled, renders each radio option within an interactive, elevated selectable tile.
   * @default false
   */
  cardMode?: boolean;

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of radio items / card tiles */
    background?: string;
    /** Overrides the stroke/border color */
    stroke?: string;
    /** Overrides the text color of the option labels */
    textColor?: string;
    /** Overrides the active selection indicator color */
    accent?: string;
  };

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "Please select a deployment region to proceed."
   */
  errorText?: ReactNode | string | null;

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

export const RadioGroupInput = ({
  alias,
  inputLabel,
  inputtype,
  inputvariant,
  width,
  newRow,
  readOnly = false,
  isHinted,
  hintText,
  hintUrl,
  inputOptions = [],
  direction = 'column',
  columns,
  cardMode = false,
  typography,
  errorText,
  className,
  style,
  formikContext,
}: RadioGroupInputProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: RadioGroupInput '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
    return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const hasError = Boolean(fieldTouched && fieldError);

  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const labelId = `${alias}InputLabel`;
  const errorId = `${alias}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  const resolvedVariant = inputvariant || inputtype || 'radio-outline';

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
    '--vs-rad-bg': typography?.background || 'var(--color-surface)',
    '--vs-rad-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-rad-text': typography?.textColor || 'var(--gray-12)',
    '--vs-rad-accent': typography?.accent || 'var(--accent-9)',
  } as React.CSSProperties;

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
            .vs-radio-item-wrapper {
              display: flex;
              align-items: center;
              gap: 10px;
              cursor: ${readOnly ? 'not-allowed' : 'pointer'};
              user-select: none;
              font-family: inherit;
              color: var(--vs-rad-text);
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
              padding: 4px 6px;
              border-radius: 6px;
            }

            .vs-radio-item-wrapper:not(.vs-readonly):hover {
              color: var(--vs-rad-accent);
            }

            .vs-radio-item-wrapper.vs-readonly {
              opacity: 0.65;
            }

            .vs-radio-card-tile {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 14px;
              border-radius: 8px;
              cursor: ${readOnly ? 'not-allowed' : 'pointer'};
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
              box-sizing: border-box;
            }

            .vs-radio-card-outline {
              border: 1.5px solid var(--vs-rad-stroke);
              background-color: ${typography?.background ? 'var(--vs-rad-bg)' : 'transparent'};
            }
            .vs-radio-card-outline:not(.vs-readonly):hover {
              border-color: var(--vs-rad-accent);
            }
            .vs-radio-card-outline.vs-selected {
              border-color: var(--vs-rad-accent);
              background-color: var(--accent-a3);
            }

            .vs-radio-card-material {
              background-color: var(--vs-rad-bg);
              box-shadow: 0 2px 5px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
              border: 1px solid var(--vs-rad-stroke);
            }
            .vs-radio-card-material:not(.vs-readonly):hover {
              box-shadow: 0 4px 10px rgba(0,0,0,0.1);
              transform: translateY(-1px);
            }
            .vs-radio-card-material.vs-selected {
              border-color: var(--vs-rad-accent);
              box-shadow: 0 0 0 1.5px var(--vs-rad-accent), 0 4px 12px rgba(0,0,0,0.08);
            }

            .vs-radio-card-neumorphic {
              background-color: var(--neu-bg);
              box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
              border: none;
            }
            .vs-radio-card-neumorphic.vs-selected {
              box-shadow: inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light);
              color: var(--vs-rad-accent);
            }

            .vs-radix-radio .rt-RadioGroupItem {
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }

            .vs-radio-style-outline .rt-RadioGroupItem {
              border: 1.5px solid ${hasError ? 'var(--red-9)' : 'var(--vs-rad-stroke)'} !important;
              background-color: transparent !important;
            }
            .vs-radio-style-outline .rt-RadioGroupItem[data-state="checked"] {
              border-color: ${hasError ? 'var(--red-9)' : 'var(--vs-rad-accent)'} !important;
            }
            .vs-radio-style-outline .rt-RadioGroupIndicator {
              background-color: ${hasError ? 'var(--red-9)' : 'var(--vs-rad-accent)'} !important;
            }

            .vs-radio-style-material .rt-RadioGroupItem {
              background-color: var(--vs-rad-bg) !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.12) !important;
              border: 1px solid var(--vs-rad-stroke) !important;
            }
            .vs-radio-style-material .rt-RadioGroupItem[data-state="checked"] {
              border-color: var(--vs-rad-accent) !important;
            }
            .vs-radio-style-material .rt-RadioGroupIndicator {
              background-color: var(--vs-rad-accent) !important;
            }

            .vs-radio-style-neumorphic .rt-RadioGroupItem {
              background-color: var(--neu-bg) !important;
              border: none !important;
              box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light) !important;
            }
            .vs-radio-style-neumorphic .rt-RadioGroupItem[data-state="checked"] {
              box-shadow: inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light) !important;
            }
            .vs-radio-style-neumorphic .rt-RadioGroupIndicator {
              background-color: var(--vs-rad-accent) !important;
            }
          `}
        </style>

        {(inputLabel || isHinted) && (
          <Flex align="center" gap="2" style={{ paddingLeft: '2px' }}>
            {inputLabel && (
              <Text id={labelId} as="label" size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
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
        )}

        <RadioGroup.Root
          name={alias}
          id={inputId}
          aria-labelledby={inputLabel ? labelId : undefined}
          aria-describedby={hasError ? errorId : undefined}
          disabled={readOnly}
          value={fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : ""}
          onValueChange={(val) => {
            setFieldValue(alias, val);
            setFieldTouched(alias, true, false);
          }}
          className={`vs-radix-radio ${
            resolvedVariant.includes('material') ? 'vs-radio-style-material' : 
            resolvedVariant.includes('neumorphic') ? 'vs-radio-style-neumorphic' : 
            'vs-radio-style-outline'
          }`}
          style={{ width: '100%', ...neuVars }}
        >
          <Grid
            width="100%"
            columns={columns || (direction === 'row' ? 'repeat(auto-fit, minmax(130px, 1fr))' : '1')}
            gap={cardMode ? "3" : "2"}
          >
            {inputOptions.map((option, idx) => {
              const optionValue = String(option.optionvalue);
              const isChecked = String(fieldValue) === optionValue;
              const optionId = `${alias}-opt-${option.optionid || idx}`;

              if (cardMode) {
                const cardClass = resolvedVariant.includes('material') ? 'vs-radio-card-material' : 
                                  resolvedVariant.includes('neumorphic') ? 'vs-radio-card-neumorphic' : 
                                  'vs-radio-card-outline';

                return (
                  <Box
                    asChild
                    key={optionId}
                    className={`vs-radio-card-tile ${cardClass} ${isChecked ? 'vs-selected' : ''} ${readOnly ? 'vs-readonly' : ''}`}
                    onClick={() => {
                      if (!readOnly) {
                        setFieldValue(alias, optionValue);
                        setFieldTouched(alias, true, false);
                      }
                    }}
                  >
                    <label htmlFor={`${inputId}-${idx}`}>
                      <RadioGroup.Item
                        id={`${inputId}-${idx}`}
                        value={optionValue}
                        disabled={readOnly}
                      />
                      <Text size="2" weight={isChecked ? "medium" : "regular"} style={{ flex: 1, userSelect: 'none' }}>
                        {option.text}
                      </Text>
                    </label>
                  </Box>
                );
              }

              return (
                <Flex
                  asChild
                  key={optionId}
                  className={`vs-radio-item-wrapper ${readOnly ? 'vs-readonly' : ''}`}
                  onClick={() => {
                    if (!readOnly) {
                      setFieldValue(alias, optionValue);
                      setFieldTouched(alias, true, false);
                    }
                  }}
                >
                  <label htmlFor={`${inputId}-${idx}`}>
                    <RadioGroup.Item
                      id={`${inputId}-${idx}`}
                      value={optionValue}
                      disabled={readOnly}
                    />
                    <Text size="2" weight={isChecked ? "medium" : "regular"} style={{ userSelect: 'none' }}>
                      {option.text}
                    </Text>
                  </label>
                </Flex>
              );
            })}
          </Grid>
        </RadioGroup.Root>

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};