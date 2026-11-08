import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Select, Flex, Text, Tooltip, Separator } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from "utils/vinci";
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import '../../styles/main.scss';

export type xDropDownDesign = 'dropdown' | 'dropdown-material' | 'dropdown-outline' | 'dropdown-neumorphic';

/**
 * xDropDownProps Interface
 * @description Configuration properties for the VectorSigma Dropdown component.
 * Equipped with enterprise-grade aesthetics, intelligent context-aware neumorphism, 
 * typography overrides, and strict Formik integration. Designed for LLM/MCP workflows.
 */
export interface xDropDownProps {
  /**
   * The aesthetic design language of the Dropdown trigger and menu.
   * - `dropdown-outline`: Minimalist, outlined aesthetic (Default).
   * - `dropdown-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `dropdown-neumorphic`: Soft-UI with extruded inset/outset shadows.
   * @default "dropdown-outline"
   */
  inputtype?: xDropDownDesign;

  /**
   * The unique identifier bridging the input field to the Formik state.
   * Must exactly match the schema property key.
   * @example "mercedesCarModels"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the Dropdown field.
   * @example "Choose Auto Fleet"
   */
  inputLabel?: string;

  /**
   * Defines the responsive grid column span for the component (1-12 based on the parent grid).
   * @example 5
   */
  width: number;

  /**
   * Forces the component to break into a new Flex/Grid row within the Form layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Placeholder text utilized when the state is empty or null.
   * Acts as the reset trigger within the dropdown menu.
   * @example "Select an auto model..."
   */
  placeholder?: string;

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
   * @example "Fleet models determine your base insurance rate."
   */ 
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/fleet"
   */ 
  hintUrl?: string;

  /**
   * Optional callback fired when the internal dropdown value changes.
   * Executes alongside the standard Formik state update.
   */
  onValueChange?: (value: string) => void;

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid fleet model is required."
   */
  errorText?: ReactNode | string | null;

  /**
   * The array of discrete options rendered within the Dropdown.
   * Each object requires an `optionid`, string `optionvalue`, and display `text`.
   * @example [{ optionid: 1, optionvalue: "EQS", text: "Mercedes EQS SUV" }]
   */
  inputOptions: InputOption[];

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the trigger and dropdown canvas */
    background?: string;
    /** Overrides the border/stroke color of the trigger and dropdown canvas */
    stroke?: string;
    /** Overrides the text color of the trigger and list items */
    textColor?: string;
    /** Overrides the primary color used for selection checkboxes and hover states */
    accent?: string;
  };

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

export const Dropdown = ({
  inputtype = 'dropdown-outline',
  alias, 
  readOnly, 
  width, 
  inputLabel,
  placeholder = "Select an option...", 
  inputOptions,
  style, 
  newRow, 
  isHinted, 
  hintText,
  hintUrl, 
  errorText, 
  typography,
  className,
  formikContext,
  onValueChange,
  ...props
}: xDropDownProps) => {
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  const RESET_ID = `__RESET__${alias}`;

  if (!activeContext) {
      console.error(`[VectorSigma]: Dropdown '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const hasError = Boolean(fieldTouched && fieldError);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  
  const inputId = `${alias}FormInput`;
  const errorId = `${alias}-error`;

  useEffect(() => {
    if (inputtype === 'dropdown-neumorphic' && triggerRef.current) {
      const parentBg = getNearestParentBackground(triggerRef.current.parentElement);
      const computedBg = typography?.background || parentBg;

      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -30),
        '--neu-shadow-light': adjustColor(computedBg, 30),
      } as React.CSSProperties);
    }
  }, [inputtype, typography?.background]);

  const openLink = (inputUrl: string) => {
    window.open(inputUrl, '_blank', 'noopener,noreferrer');
  };

  const typographyVars = {
    '--vs-dd-bg': typography?.background || 'var(--color-surface)',
    '--vs-dd-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-dd-text': typography?.textColor || 'var(--gray-12)',
    '--vs-dd-accent': typography?.accent || 'var(--accent-9)',
  } as React.CSSProperties;

  const baseTrigger: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: readOnly ? 'not-allowed' : 'pointer',
    textAlign: 'left',
    padding: '0 12px',
    fontSize: 'var(--font-size-2)',
    fontFamily: 'inherit',
    color: 'var(--vs-dd-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    boxSizing: 'border-box',
    opacity: readOnly ? 0.7 : 1,
    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const materialTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--vs-dd-bg)',
    border: hasError ? '1px solid var(--red-9)' : `1px solid ${typography?.stroke ? 'var(--vs-dd-stroke)' : 'transparent'}`,
    boxShadow: '0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
    borderRadius: '4px',
    height: '36px',
    fontWeight: 500,
  };
  const materialContent: React.CSSProperties = {
    borderRadius: '4px',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.1)', 
    backgroundColor: 'var(--vs-dd-bg)',
  };

  const outlineTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: typography?.background || 'transparent',
    border: hasError ? '1.5px solid var(--red-9)' : '1.5px solid var(--vs-dd-stroke)',
    borderRadius: '6px',
    height: '36px',
    fontWeight: 500,
  };
  const outlineContent: React.CSSProperties = {
    border: '1px solid var(--vs-dd-stroke)',
    borderRadius: '8px',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.1)',
    backgroundColor: 'var(--vs-dd-bg)',
  };

  const neumorphicTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--red-9)' : 'var(--vs-dd-text)',
    border: 'none',
    borderRadius: '12px',
    height: '40px', 
    fontWeight: 500,
    boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
  };
  const neumorphicContent: React.CSSProperties = {
    backgroundColor: 'var(--neu-bg)',
    borderRadius: '12px',
    border: 'none',
    boxShadow: '8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light)',
  };

  const activeTriggerStyle = 
    inputtype.includes('material') ? materialTrigger :
    inputtype.includes('neumorphic') ? { ...neumorphicTrigger, ...neuVars } :
    outlineTrigger;

  const activeContentStyle = 
    inputtype.includes('material') ? materialContent :
    inputtype.includes('neumorphic') ? { ...neumorphicContent, ...neuVars } :
    outlineContent;

  return (
    <Column span={width} newLine={newRow}>
      <Flex 
        direction="column" 
        gap="2" 
        style={{ width: '100%', fontFamily: "'Libre Franklin', sans-serif", ...typographyVars, ...style }} 
        className={className}
      >
        <style>
          {`
            .vs-dropdown-trigger:not(:disabled):hover {
              border-color: var(--vs-dd-accent) !important;
            }
            .vs-dropdown-trigger-material:not(:disabled):hover {
              box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
            }
            .vs-dropdown-trigger-neumorphic:not(:disabled):hover {
              box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light) !important;
            }
            .vs-dropdown-trigger-neumorphic[data-state='open'] {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
            }

            @keyframes vs-dropdown-enter {
              from { opacity: 0; transform: scale(0.96) translateY(-4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes vs-dropdown-exit {
              from { opacity: 1; transform: scale(1) translateY(0); }
              to { opacity: 0; transform: scale(0.96) translateY(-4px); }
            }

            .vs-animated-dropdown[data-state="open"] {
              animation: vs-dropdown-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              transform-origin: top center;
            }
            .vs-animated-dropdown[data-state="closed"] {
              animation: vs-dropdown-exit 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              transform-origin: top center;
            }

            .vs-dropdown-item {
              color: var(--vs-dd-text) !important;
              border-radius: 6px !important;
              padding: 8px 12px !important;
              margin: 0 4px 4px 4px !important;
              transition: all 0.15s ease;
            }
            .vs-dropdown-item:hover, .vs-dropdown-item[data-highlighted] {
              background-color: var(--accent-a3) !important;
              cursor: pointer;
            }
            
            .vs-dropdown-item-neumorphic {
              color: var(--vs-dd-text) !important;
              border-radius: 6px !important;
              padding: 8px 12px !important;
              margin: 0 4px 4px 4px !important;
              transition: all 0.15s ease;
            }
            .vs-dropdown-item-neumorphic:hover, .vs-dropdown-item-neumorphic[data-highlighted] {
              background-color: transparent !important;
              box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light) !important;
              color: var(--vs-dd-accent) !important;
              cursor: pointer;
            }
          `}
        </style>

        {(inputLabel || isHinted) && (
          <Flex align="center" gap="2" style={{ paddingLeft: '2px' }}>
            {inputLabel && (
              <Text id={`${alias}InputLabel`} as="label" size="2" weight="medium" style={{ color: typography?.textColor || 'var(--gray-11)' }} htmlFor={inputId}>
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
        
        <Select.Root
          name={alias}
          disabled={readOnly}
          value={fieldValue || ""} 
          onValueChange={(val) => {
            const finalVal = val === RESET_ID ? "" : val;
            setFieldValue(alias, finalVal);
            setTimeout(() => setFieldTouched(alias, true, false), 0);
            if (onValueChange) onValueChange(finalVal);
          }}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
               setFieldTouched(alias, true, false);
            }
          }}
        >
          <Select.Trigger 
            id={inputId}
            ref={triggerRef}
            variant="ghost" 
            placeholder={placeholder}
            aria-describedby={inputLabel ? `${alias}InputLabel` : undefined}
            className={`vs-dropdown-trigger ${
              inputtype.includes('material') ? 'vs-dropdown-trigger-material' : 
              inputtype.includes('neumorphic') ? 'vs-dropdown-trigger-neumorphic' : ''
            }`}
            style={activeTriggerStyle}
          />

          <Select.Content 
            position="popper" 
            sideOffset={6} 
            className="vs-animated-dropdown"
            style={{ 
              ...activeContentStyle,
              width: triggerRef.current?.offsetWidth || 'auto',
              minWidth: 'var(--radix-select-trigger-width)',
              fontFamily: 'inherit'
            }}
          >
            <Select.Item 
              value={RESET_ID} 
              className={inputtype.includes('neumorphic') ? 'vs-dropdown-item-neumorphic' : 'vs-dropdown-item'}
              style={{ color: 'var(--gray-10) !important', fontStyle: 'italic', marginTop: '4px' }}
            >
               {placeholder}
            </Select.Item>
            
            <Separator size="4" style={{ margin: '4px 0', opacity: 0.5, backgroundColor: 'var(--vs-dd-stroke)' }} />

            {inputOptions.map((inputoption, idx) => (
              <React.Fragment key={`${alias}-opt-${inputoption.optionid || idx}`}>
                {inputoption.optionurl ?             
                  <Select.Item 
                    value={String(inputoption.optionvalue) || `__empty_${idx}`}
                    className={inputtype.includes('neumorphic') ? 'vs-dropdown-item-neumorphic' : 'vs-dropdown-item'}
                  >
                    <a 
                      onClick={(e) => { e.stopPropagation(); openLink(inputoption.optionurl || "#"); }} 
                      style={{ textDecoration: 'none', color: 'inherit', display: 'block', width: '100%' }}
                    >
                      {inputoption.text}
                    </a>
                  </Select.Item>
                : 
                  <Select.Item 
                    value={String(inputoption.optionvalue) || `__empty_${idx}`}
                    className={inputtype.includes('neumorphic') ? 'vs-dropdown-item-neumorphic' : 'vs-dropdown-item'}
                  >
                    {inputoption.text}
                  </Select.Item>
                }
              </React.Fragment>
            ))}
          </Select.Content>
        </Select.Root>

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};