import React, { useState, forwardRef, useEffect, useRef, useId, ReactNode } from "react";
import { useFormikContext, getIn, FormikContextType } from 'formik';
import { Column } from "layouts/column/column";
import { TextField, Text, Tooltip, Select, Flex } from '@radix-ui/themes';
import PhoneInputMain from 'react-phone-number-input'; 
import type { Country, Value } from 'react-phone-number-input'; 
import { getCountries, getCountryCallingCode } from 'react-phone-number-input/input'; 
import en from 'react-phone-number-input/locale/en.json';
import { FlagIcon } from "components/icons/flagicon";
import { Icon } from "components/icons/icons";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import { InputDesign } from './input';
import '../../styles/main.scss';


/**
 * PhoneInputProps Interface
 * @description Configuration properties for the VectorSigma PhoneInput component.
 * Equipped with enterprise-grade aesthetics, intelligent context-aware neumorphism, 
 * typography overrides, international formatting, and strict Formik integration.
 */
export type PhoneInputProps = {
  /**
   * The aesthetic design language of the Phone Input field.
   * - `input-outline`: Minimalist, outlined aesthetic (Default).
   * - `input-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `input-neumorphic`: Soft-UI with extruded inset shadows.
   * @default "input-outline"
   */
  inputvariant?: InputDesign;

  /**
   * The unique identifier bridging the input field to the Formik state.
   * Must exactly match the schema property key.
   * @example "contactPhoneNumber"
   */
  alias: string; 

  /**
   * The primary semantic label rendered above the Input field.
   * @example "On-Call Phone Number"
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
   * Placeholder text utilized when the state is empty.
   * @example "Enter Data Engineer's Phone"
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
   * @example "Used for PagerDuty escalations."
   */
  hintText?: string; 

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/escalations"
   */
  hintUrl?: string; 

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
   * @example "A valid international phone number is required."
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

const BespokeRadixPhoneInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { radixProps, countrySelectUI, placeholder, typography, ...inputProps } = props;

  return (
      <TextField.Root 
          {...inputProps} 
          ref={ref} 
          value={inputProps.value || ''}  
          id={radixProps.id} 
          size={radixProps.size} 
          variant="surface" 
          color={radixProps.color}
          className={radixProps.className}
          autoComplete="off"
          style={{ width: '100%', fontFamily: 'inherit' }}
          placeholder={radixProps.placeholder || placeholder || "Phone Number"}
      >
          <TextField.Slot style={{ padding: 0, paddingRight: '12px' }}>
              {countrySelectUI}
          </TextField.Slot>
      </TextField.Root>
  );
});
BespokeRadixPhoneInput.displayName = "BespokeRadixPhoneInput";

export const PhoneInput = ({
  alias,
  inputLabel,
  width,
  placeholder = "Phone Number", 
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  typography,
  readOnly,
  inputvariant = 'input-outline',
  size = "2",
  className,
  style,
  formikContext,
  ...props
}: PhoneInputProps) => {
    
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`[VectorSigma]: PhoneInput '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const hasError = Boolean(fieldTouched && fieldError);
  const [country, setCountry] = useState<Country>('CA');
  
  const fallbackId = useId();
  const inputId = `${alias}PhoneInput-${fallbackId}`;
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

  const countrySelectUI = (
      <Select.Root 
          value={country || 'CA'} 
          disabled={readOnly}
          onValueChange={(value) => {
              setCountry(value as Country);
              setFieldValue(alias, ''); 
              setFieldTouched(alias, false, false);
          }}
          name={`${alias}Country`}
      >
          <Select.Trigger 
              id={`${alias}PhoneSelect`}
              variant="ghost" 
              style={{ 
                  height: '100%', 
                  padding: '0 8px 0 12px', 
                  gap: '6px',
                  borderTopRightRadius: 0, 
                  borderBottomRightRadius: 0,
                  backgroundColor: inputvariant === 'input-neumorphic' ? 'transparent' : (typography?.background ? adjustColor(typography.background, -5) : 'var(--gray-3)'), 
                  borderRight: `1px solid ${typography?.stroke || 'var(--gray-6)'}`,
                  color: 'var(--vs-in-text)'
              }} 
          >
              <Flex align="center" gap="2">
                  <FlagIcon country={country || 'CA'} />
                  <Text weight="medium">+{getCountryCallingCode(country || 'CA')}</Text>
                  <Icon name="caretdown" style={{ width: "12px", opacity: 0.5 }}/>
              </Flex>
          </Select.Trigger>
          
          <Select.Content 
            position="popper" 
            style={{ 
                minWidth: '260px', 
                maxHeight: '300px', 
                fontFamily: "'Libre Franklin', sans-serif",
                backgroundColor: inputvariant === 'input-neumorphic' ? 'var(--neu-bg)' : 'var(--vs-in-bg)',
                ...neuVars
            }}
            className={inputvariant === 'input-neumorphic' ? 'vs-select-neumorphic' : ''}
          >
              <style>
                  {`
                      .vs-select-neumorphic {
                          box-shadow: 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light) !important;
                          border: none !important;
                          border-radius: 12px !important;
                      }
                      .vs-phone-option {
                          transition: background-color 0.15s ease;
                          border-radius: 4px;
                          padding: 6px 8px;
                      }
                      .vs-phone-option:hover {
                          background-color: var(--accent-a3) !important;
                          cursor: pointer;
                      }
                  `}
              </style>
              {getCountries().map((c) => (
                  <Select.Item key={c} value={c} className="vs-phone-option" style={{ color: 'var(--vs-in-text)' }}>
                      <Flex align="center" gap="3">
                          <FlagIcon country={c} />
                          <Text style={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{en[c]}</Text>
                          <Text style={{ opacity: 0.6 }} size="1">
                              +{getCountryCallingCode(c)}
                          </Text>
                      </Flex>
                  </Select.Item>
              ))}
          </Select.Content>
      </Select.Root>
  );

  return (
      <Column span={width} newLine={newRow}>
          <Flex direction="column" gap="2" style={{ width: '100%', fontFamily: "'Libre Franklin', sans-serif", ...typographyVars, ...style }} ref={containerRef} className={className}>
              
              <style>
                {`
                  .vs-phone-wrapper {
                    width: 100%;
                    transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
                  }
                  .vs-phone-wrapper input {
                    color: var(--vs-in-text) !important;
                  }
                  .vs-phone-wrapper input::placeholder {
                    color: var(--gray-9) !important;
                    opacity: 0.8;
                  }

                  .vs-phone-outline {
                    background-color: ${typography?.background ? 'var(--vs-in-bg)' : 'transparent'} !important;
                    box-shadow: inset 0 0 0 1.5px ${hasError ? 'var(--red-9)' : 'var(--vs-in-stroke)'} !important;
                    border-radius: 6px !important;
                  }
                  .vs-phone-outline:focus-within {
                    box-shadow: inset 0 0 0 2px ${hasError ? 'var(--red-9)' : 'var(--accent-9)'} !important;
                  }

                  .vs-phone-material {
                    background-color: var(--vs-in-bg) !important;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04) !important;
                    border-radius: 4px !important;
                    border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'transparent'} !important;
                  }
                  .vs-phone-material:focus-within {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
                    border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'var(--accent-9)'} !important;
                  }

                  .vs-phone-neumorphic {
                    background-color: var(--neu-bg) !important;
                    box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light) !important;
                    border: none !important;
                    border-radius: 12px !important;
                  }
                  .vs-phone-neumorphic:focus-within {
                    box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
                  }
                  .vs-phone-neumorphic.vs-has-error {
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

              <PhoneInputMain
                  style={{ width: '100%' }} 
                  country={country}
                  name={alias}
                  value={fieldValue || ''}
                  onChange={(val?: Value) => setFieldValue(alias, val || '')} 
                  onBlur={() => setFieldTouched(alias, true, false)}
                  readOnly={readOnly}
                  placeholder={placeholder}
                  countrySelectComponent={() => null} 
                  inputComponent={BespokeRadixPhoneInput} 
                  radixProps={{
                      id: inputId,
                      size: size,
                      color: hasError ? "red" : undefined,
                      className: `vs-phone-wrapper ${
                        inputvariant.includes('material') ? 'vs-phone-material' : 
                        inputvariant.includes('neumorphic') ? 'vs-phone-neumorphic' : 
                        'vs-phone-outline'
                      } ${hasError ? 'vs-has-error' : ''}`,
                      ariaDescribedBy: hasError ? errorId : undefined,
                      placeholder: placeholder
                  }}
                  typography={typography}
                  countrySelectUI={countrySelectUI}
              />

              {hasError && (
                <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
                  {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
                </Text>
              )}
          </Flex>
      </Column>
  );
};