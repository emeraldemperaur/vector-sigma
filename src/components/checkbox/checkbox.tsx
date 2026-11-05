import React, { ReactNode, useEffect, useRef, useState, useId } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, Checkbox as RadixCheckbox, Grid, Tooltip } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type CheckBoxDesign = 'checkbox' | 'checkbox-material' | 'checkbox-outline' | 'checkbox-neumorphic';

/**
 * CheckboxGroup Interface
 * @description Configuration properties for the VectorSigma Checkbox Group component.
 * Supports enterprise-grade aesthetics, Formik array bindings, grid layouts, 
 * typography overrides, and context-aware neumorphic rendering.
 */
export interface CheckboxGroup {
  /**
   * The aesthetic design language of the Checkbox Group component.
   * - `checkbox-outline`: Minimalist, Cohere-inspired outlined aesthetic (Default).
   * - `checkbox-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `checkbox-neumorphic`: n8n-inspired soft-UI with extruded inset/outset shadows.
   * @default "checkbox-outline"
   */
  inputtype?: CheckBoxDesign;

  /**
   * The unique identifier bridging the group to the Formik state array.
   * Must exactly match the schema property key.
   * @example "selectedCategories"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the Checkbox Group.
   * @example "Select Target Cloud Providers"
   */
  inputLabel?: string; 

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
   * Disables interaction, mutating the visual state to reflect read-only/disabled mode.
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
   * @example "Multi-region deployments require enterprise billing."
   */
  hintText?: string; 

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/deployments"
   */
  hintUrl?: string;
  
  /**
   * Optional typographic color overrides. Allows explicit targeting of the checkbox's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the checkbox's checked fill color (or tick color in neumorphic) */
    background?: string;
    /** Overrides the checkbox's border/stroke color */
    stroke?: string;
    /** Overrides the option label text color */
    textColor?: string;
  };

  /**
   * The array of discrete options rendered within the Checkbox Group.
   * Each object requires an `optionid`, string `optionvalue`, and display `text`.
   * @example [{ optionid: 1, optionvalue: "AWS", text: "Amazon Web Services" }]
   */
  inputOptions: InputOption[];

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "At least one provider must be selected."
   */
  errorText?: ReactNode | string | null;

  /**
   * The CSS flex direction for internal grid rendering if explicit columns aren't provided.
   * @default "row"
   */
  direction?: 'row' | 'column';

  /**
   * Explicit CSS grid-template-columns definition for complex structural layouts.
   * @example "1fr 2fr 1fr"
   */
  columns?: string;

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string;

  /**
   * Inline React CSS properties applied to the outmost Flex wrapper.
   */
  style?: React.CSSProperties;

  /**
   * Injects an explicit Formik context. Required if the component operates outside 
   * a standard `<FormikProvider>` tree.
   */
  formikContext?: FormikContextType<any>;
}

export const CheckboxGroupInput = ({
  inputtype = 'checkbox-outline',
  alias, 
  readOnly, 
  width,
  inputLabel,
  style, 
  inputOptions,
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  typography,
  direction = 'row',
  columns, 
  className, 
  formikContext,
  ...props
}: CheckboxGroup) => {
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: CheckboxGroupInput '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
    return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const currentValues = (Array.isArray(fieldValue) ? fieldValue : []) as string[];
  const hasError = Boolean(fieldTouched && fieldError);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  
  const fallbackId = useId();
  const inputId = `${alias}FormGroup-${fallbackId}`;
  const errorId = `${alias}-error`;

  const handleCheckedChange = (checked: boolean, value: string) => {
    if (readOnly) return;
    let newValues = [...currentValues];
    if (checked) {
      newValues.push(value);
    } else {
      newValues = newValues.filter((v) => String(v) !== String(value));
    }
    setFieldValue(alias, newValues);
    setTimeout(() => setFieldTouched(alias, true, false), 0);
  };

  useEffect(() => {
    if (inputtype === 'checkbox-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      setNeuVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': adjustColor(parentBg, -20), 
        '--neu-shadow-light': adjustColor(parentBg, 20),
      } as React.CSSProperties);
    }
  }, [inputtype]);

  const resolvedColumns = columns || (direction === 'row' ? 'repeat(auto-fit, minmax(140px, 1fr))' : '1fr');

  const typographyVars = {
    '--vs-chk-bg': typography?.background || 'var(--accent-9)',
    '--vs-chk-stroke': typography?.stroke || 'var(--gray-8)',
    '--vs-chk-checked-stroke': typography?.stroke || typography?.background || 'var(--accent-9)',
    '--vs-chk-text': typography?.textColor || 'var(--gray-12)',
  } as React.CSSProperties;

  return (
    <Column span={width} newLine={newRow}>
      <Flex 
        direction="column"
        gap="3" 
        width="100%" 
        ref={containerRef} 
        style={{ fontFamily: "'Libre Franklin', sans-serif", ...typographyVars, ...style }} 
        className={className}
      >
        <style>
          {`
            .vs-checkbox-label {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              cursor: pointer;
              transition: opacity 0.2s ease;
              color: var(--vs-chk-text) !important;
            }
            .vs-checkbox-label.vs-readonly {
              cursor: not-allowed;
              opacity: 0.6;
            }
            .vs-checkbox-label:not(.vs-readonly):hover .rt-CheckboxButton {
              transform: scale(1.05);
            }

            .vs-checkbox-outline .rt-CheckboxButton {
              border: 1.5px solid var(--vs-chk-stroke) !important;
              background-color: transparent !important;
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .vs-checkbox-outline[data-state='checked'] .rt-CheckboxButton {
              border-color: var(--vs-chk-checked-stroke) !important;
              background-color: var(--vs-chk-bg) !important;
            }
            .vs-checkbox-outline.vs-has-error .rt-CheckboxButton {
              border-color: var(--red-9) !important;
            }

            .vs-checkbox-material .rt-CheckboxButton {
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              border: 1px solid var(--gray-5) !important;
              background-color: var(--color-panel-solid, #ffffff) !important;
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .vs-checkbox-material[data-state='checked'] .rt-CheckboxButton {
              background-color: var(--vs-chk-bg) !important;
              border-color: var(--vs-chk-checked-stroke) !important;
            }
            .vs-checkbox-material.vs-has-error .rt-CheckboxButton {
              border-color: var(--red-9) !important;
            }

            .vs-checkbox-neumorphic .rt-CheckboxButton { 
              background-color: var(--neu-bg) !important;
              border: none !important;
              box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
              border-radius: 6px;
              width: 22px; 
              height: 22px; 
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .vs-checkbox-neumorphic[data-state='checked'] .rt-CheckboxButton {
              box-shadow: inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light);
            }
            .vs-checkbox-neumorphic .rt-CheckboxIndicator { 
              color: var(--vs-chk-bg) !important; 
            }
            .vs-checkbox-neumorphic.vs-has-error .rt-CheckboxButton {
              box-shadow: 2px 2px 5px rgba(255,0,0,0.2), inset 1px 1px 3px var(--red-9);
            }
          `}
        </style>

        {(inputLabel || isHinted) && (
          <Flex align="center" gap="2" style={{ paddingLeft: '2px' }}>
            {inputLabel && (
              <Text id={`${alias}InputLabel`} as="label" size="2" weight="medium" style={{ color: 'var(--gray-11)' }}>
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

        <Grid 
          width="100%" 
          columns={resolvedColumns} 
          gap="4"
          style={neuVars} 
          id={inputId}
          aria-labelledby={inputLabel ? `${alias}InputLabel` : undefined}
          role="group"
        >
          {inputOptions.map((inputoption, idx) => {
            const optionVal = String(inputoption.optionvalue);
            const isChecked = currentValues.some(val => String(val) === optionVal);
            
            const itemKey = `${alias}-chk-${inputoption.optionid || idx}`;
            const itemId = `${alias}FormInput-${inputoption.optionid || idx}`;

            const designClass = inputtype === 'checkbox-neumorphic' 
              ? 'vs-checkbox-neumorphic' 
              : inputtype === 'checkbox-material' 
                ? 'vs-checkbox-material' 
                : 'vs-checkbox-outline';

            return (
              <Text 
                as="label" 
                key={itemKey} 
                size="2"
                weight="regular"
                htmlFor={itemId}
                className={`vs-checkbox-label ${designClass} ${readOnly ? 'vs-readonly' : ''} ${hasError ? 'vs-has-error' : ''}`}
              >
                <RadixCheckbox 
                  name={alias}
                  id={itemId}
                  disabled={readOnly}
                  value={optionVal}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleCheckedChange(checked as boolean, optionVal)}
                  variant={inputtype === 'checkbox-outline' ? 'soft' : 'surface'}
                  size="2"
                />
                <span style={{ userSelect: 'none', lineHeight: 1.2 }}>{inputoption.text}</span>
              </Text>
            );
          })}
        </Grid>

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};