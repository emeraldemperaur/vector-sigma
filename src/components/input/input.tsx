import React, { ReactNode, useEffect, useRef, useState, useId } from "react";
import { FormikContextType, useFormikContext, getIn } from "formik";
import { Column } from "layouts/column/column"; 
import { TextField, Text, Tooltip, Flex } from '@radix-ui/themes';
import { Icon } from "components/icons/icons";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import '../../styles/main.scss';

export type InputType = 'date' | 'datetime-local' | 'email' | 'hidden' | 'month' | 'number' 
    | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url' | 'week';

export type InputDesign = "input" | "input-material" | "input-outline" | "input-neumorphic";

/**
 * xInputFieldProps Interface
 * @description Configuration properties for the VectorSigma Input component.
 * Equipped with enterprise-grade aesthetics, intelligent context-aware neumorphism, 
 * typography overrides, and strict Formik integration.
 */
export type xInputFieldProps = Omit<React.ComponentProps<typeof TextField.Root>, 'size'> & {
  /**
   * The aesthetic design language of the Input field.
   * - `input-outline`: Minimalist, outlined aesthetic (Default).
   * - `input-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `input-neumorphic`: Soft-UI with extruded inset shadows.
   * @default "input-outline"
   */
  inputvariant?: InputDesign;

  /**
   * The unique identifier bridging the input field to the Formik state.
   * Must exactly match the schema property key.
   * @example "userEmailAddress"
   */
  alias: string; 

  /**
   * The primary semantic label rendered above the Input field.
   * @example "Work Email Address"
   */
  inputLabel?: string; 

  /**
   * The HTML input type attribute governing native browser behavior and soft keyboards.
   * @default "text"
   * @example "email"
   */
  inputtype?: InputType; 

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
   * Placeholder text utilized when the state is empty.
   * @example "name@company.com"
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
   * @example "We will never share this email."
   */
  hintText?: string; 

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/privacy"
   */
  hintUrl?: string; 

  /**
   * Optional ReactNode to render an icon inside the left boundary of the input field.
   * @example <Icon name="mail" />
   */
  icon?: React.ReactNode; 

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the input strut */
    background?: string;
    /** Overrides the border/stroke color of the input strut */
    stroke?: string;
    /** Overrides the text color of the typed value */
    textColor?: string;
  };

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid corporate email is required."
   */
  errorText?: ReactNode | string | null; 

  /**
   * The physical height sizing scale for the Radix TextField.
   * @default "2"
   */
  size?: "1" | "2" | "3";

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
};

export const Input = ({
  alias,
  inputtype = "text",
  width, 
  inputLabel, 
  readOnly = false,
  placeholder = '', 
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  typography,
  className, 
  size = "2",
  style,
  inputvariant = 'input-outline',
  icon,
  formikContext,
  ...props 
}: xInputFieldProps) => {
    
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`[VectorSigma]: Input '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
      return null;
  }

  const { values, touched, errors, handleChange, handleBlur } = activeContext;

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

  useEffect(() => {
    if (inputvariant === 'input-neumorphic' && containerRef.current) {
        const parentBg = getNearestParentBackground(containerRef.current.parentElement);
        const computedBg = typography?.background || parentBg;

        setNeuVars({
            '--neu-bg': computedBg,
            '--neu-shadow-dark': adjustColor(computedBg, -20),
            '--neu-shadow-light': adjustColor(computedBg, 20),
        } as React.CSSProperties);
    }
  }, [inputvariant, typography?.background]);

  const typographyVars = {
    '--vs-in-bg': typography?.background || 'var(--color-surface)',
    '--vs-in-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-in-text': typography?.textColor || 'var(--gray-12)',
  } as React.CSSProperties;

  return (
    <Column span={width} newLine={newRow}>
      <Flex direction="column" gap="2" style={{ width: '100%', fontFamily: "'Libre Franklin', sans-serif", ...typographyVars, ...style }} ref={containerRef} className={className}>
        
        <style>
          {`
            .vs-input-wrapper {
              width: 100%;
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .vs-input-wrapper input {
              color: var(--vs-in-text) !important;
            }
            .vs-input-wrapper input::placeholder {
              color: var(--gray-9) !important;
              opacity: 0.8;
            }

            .vs-input-outline {
              background-color: ${typography?.background ? 'var(--vs-in-bg)' : 'transparent'} !important;
              box-shadow: inset 0 0 0 1.5px ${hasError ? 'var(--red-9)' : 'var(--vs-in-stroke)'} !important;
              border-radius: 6px !important;
            }
            .vs-input-outline:focus-within {
              box-shadow: inset 0 0 0 2px ${hasError ? 'var(--red-9)' : 'var(--accent-9)'} !important;
            }

            .vs-input-material {
              background-color: var(--vs-in-bg) !important;
              box-shadow: 0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04) !important;
              border-radius: 4px !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'transparent'} !important;
            }
            .vs-input-material:focus-within {
              box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'var(--accent-9)'} !important;
            }

            .vs-input-neumorphic {
              background-color: var(--neu-bg) !important;
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light) !important;
              border: none !important;
              border-radius: 12px !important;
            }
            .vs-input-neumorphic:focus-within {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
            }
            .vs-input-neumorphic.vs-has-error {
              box-shadow: inset 2px 2px 5px rgba(255,0,0,0.2), inset -2px -2px 5px var(--neu-shadow-light) !important;
            }
          `}
        </style>

        {(inputLabel || isHinted) && (
          <Flex align="center" gap="2" style={{ paddingLeft: '2px' }}>
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
        )}
        
        <TextField.Root 
          name={alias}
          value={fieldValue !== undefined && fieldValue !== null ? fieldValue : ''}
          onChange={handleChange}
          onBlur={handleBlur}
          size={size}
          variant="surface"
          type={inputtype} 
          id={inputId} 
          aria-labelledby={inputLabel ? labelId : undefined}
          aria-describedby={hasError ? errorId : undefined}
          readOnly={readOnly} 
          autoComplete="off"
          placeholder={placeholder} 
          className={`vs-input-wrapper ${
            inputvariant.includes('material') ? 'vs-input-material' : 
            inputvariant.includes('neumorphic') ? 'vs-input-neumorphic' : 
            'vs-input-outline'
          } ${hasError ? 'vs-has-error' : ''}`}
          style={neuVars}
          {...props}
        >
          {icon && (
            <TextField.Slot style={{ color: typography?.textColor || 'var(--gray-10)' }}>
                {icon}
            </TextField.Slot>
          )}
        </TextField.Root>
        
        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};