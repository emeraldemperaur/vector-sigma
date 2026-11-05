import React, { ReactNode, useEffect, useRef, useState, useMemo } from 'react';
import { Popover, Flex, Text, Checkbox, ScrollArea, Box, Tooltip, TextField } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import { Icon } from 'components/icons/icons';
import { FlagIcon } from "components/icons/flagicon";
import { Column } from 'layouts/column/column';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { getCountries } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en.json';
import type { Country } from 'react-phone-number-input';
import '../../styles/main.scss';

export type CountrySelectDesign = 'countryselect' | 'countryselect-material' | 'countryselect-outline' | 'countryselect-neumorphic';

/**
 * CountryDropdownProps Interface
 * @description Configuration properties for the VectorSigma CountrySelect component.
 * Equipped with search filtering, multi-select support, dynamic flag rendering,
 * typography overrides, and enterprise-grade popover animations.
 */
export interface CountryDropdownProps {
  /**
   * The aesthetic design language of the CountrySelect trigger.
   * - `countryselect-outline`: Minimalist, Cohere-inspired outlined aesthetic (Default).
   * - `countryselect-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `countryselect-neumorphic`: n8n-inspired soft-UI with extruded inset/outset shadows.
   * @default "countryselect-outline"
   */
  inputtype?: CountrySelectDesign;

  /**
   * The unique identifier bridging the input field to the Formik state.
   * Must exactly match the schema property key.
   * @example "citizenshipCountries"
   */
  alias: string; 

  /**
   * The primary semantic label rendered above the CountrySelect field.
   * @example "Target Deployment Regions"
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
   * @example "Select a country..."
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
   * @example "Selecting multiple regions may incur additional latency."
   */ 
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/regions"
   */  
  hintUrl?: string;

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
   * Explicit error string to override standard Formik validation messages.
   * @example "At least one operational country is required."
   */
  errorText?: ReactNode | string | null;

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
  
  /**
   * Toggles the rendering of the SVG country flag icon next to the country name.
   * @default true
   */
  displayFlag?: boolean;

  /**
   * Toggles array support, allowing multiple country selections.
   * Automatically changes the Formik state payload from a String to a String Array.
   * @default false
   */
  multiselect?: boolean;

  /**
   * Injects a search bar into the dropdown header to quickly filter the country list.
   * @default false
   */
  enableSearch?: boolean;
}

export const CountrySelect = ({
  inputtype = 'countryselect-outline',
  alias, 
  readOnly, 
  width, 
  inputLabel,
  placeholder = 'Select Country...', 
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  typography,
  displayFlag = true,
  multiselect = false,
  enableSearch = false,
  style, 
  className, 
  formikContext,
  ...props
}: CountryDropdownProps) => {
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`[VectorSigma]: CountryDropdown '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);
  
  const selectedValues: string[] = useMemo(() => {
      if (multiselect) return Array.isArray(fieldValue) ? fieldValue : [];
      return fieldValue ? [String(fieldValue)] : [];
  }, [fieldValue, multiselect]);

  const hasError = Boolean(fieldTouched && fieldError);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const inputId = `${alias}FormInput`;
  const errorId = `${alias}-error`;

  const allCountries = useMemo(() => {
      return getCountries().map(c => ({ value: c, label: en[c] }));
  }, []);

  const filteredCountries = useMemo(() => {
      if (!enableSearch || !searchQuery) return allCountries;
      const lowerSearch = searchQuery.toLowerCase();
      return allCountries.filter(c => c.label.toLowerCase().includes(lowerSearch));
  }, [allCountries, searchQuery, enableSearch]);

  const handleSelection = (countryCode: string) => {
      if (multiselect) {
          const newValues = selectedValues.includes(countryCode)
              ? selectedValues.filter((v) => v !== countryCode)
              : [...selectedValues, countryCode];
          setFieldValue(alias, newValues);
      } else {
          setFieldValue(alias, countryCode);
          setIsOpen(false);
      }
      setTimeout(() => setFieldTouched(alias, true, false), 0);
  };

  const displayLabel = useMemo(() => {
      if (selectedValues.length === 0) return placeholder;
      if (!multiselect) {
          const c = allCountries.find(x => x.value === selectedValues[0]);
          return c ? c.label : selectedValues[0];
      }
      if (selectedValues.length <= 2) {
          return selectedValues.map(v => allCountries.find(x => x.value === v)?.label || v).join(', ');
      }
      return `${selectedValues.length} countries selected`;
  }, [selectedValues, multiselect, allCountries, placeholder]);

  useEffect(() => {
    if (inputtype === 'countryselect-neumorphic' && triggerRef.current) {
      const parentBg = getNearestParentBackground(triggerRef.current.parentElement);
      const computedBg = typography?.background || parentBg;
      
      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -30),
        '--neu-shadow-light': adjustColor(computedBg, 30),
      } as React.CSSProperties);
    }
  }, [inputtype, typography?.background]);

  useEffect(() => {
      if (!isOpen) setSearchQuery("");
  }, [isOpen]);

  const typographyVars = {
    '--vs-cs-bg': typography?.background || 'var(--color-surface)',
    '--vs-cs-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-cs-text': typography?.textColor || 'var(--gray-12)',
    '--vs-cs-accent': typography?.accent || 'var(--accent-9)',
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
    color: 'var(--vs-cs-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    boxSizing: 'border-box',
    opacity: readOnly ? 0.7 : 1,
    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const materialTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--vs-cs-bg)',
    border: hasError ? '1px solid var(--red-9)' : `1px solid ${typography?.stroke ? 'var(--vs-cs-stroke)' : 'transparent'}`,
    boxShadow: '0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
    borderRadius: '4px',
    height: '36px',
    fontWeight: 500,
  };

  const outlineTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: typography?.background || 'transparent',
    border: hasError ? '1.5px solid var(--red-9)' : '1.5px solid var(--vs-cs-stroke)',
    borderRadius: '6px',
    height: '36px',
    fontWeight: 500,
  };

  const neumorphicTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--red-9)' : 'var(--vs-cs-text)',
    border: 'none',
    borderRadius: '12px',
    height: '40px',
    fontWeight: 500,
    boxShadow: isOpen 
      ? 'inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light)'
      : '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
  };

  const activeTrigger = 
    inputtype === 'countryselect-material' ? materialTrigger :
    inputtype === 'countryselect-neumorphic' ? { ...neumorphicTrigger, ...neuVars } :
    outlineTrigger;

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
            .vs-country-trigger:not(:disabled):hover {
              border-color: var(--vs-cs-accent) !important;
            }
            .vs-country-trigger-material:not(:disabled):hover {
              box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
            }
            .vs-country-trigger-neumorphic:not(:disabled):hover {
              box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light) !important;
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

            .vs-country-item .rt-CheckboxButton {
              border-color: var(--vs-cs-stroke) !important;
            }
            .vs-country-item[data-selected="true"] .rt-CheckboxButton {
              background-color: var(--vs-cs-accent) !important;
              border-color: var(--vs-cs-accent) !important;
            }
          `}
        </style>

        {(inputLabel || isHinted) && (
          <Flex align="center" gap="2" style={{ paddingLeft: '2px' }}>
            {inputLabel && (
              <Text id={`${alias}InputLabel`} as="label" size="2" weight="medium" style={{ color: 'var(--gray-11)' }} htmlFor={inputId}>
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
        
        <Popover.Root open={isOpen} onOpenChange={(open) => {
            if (readOnly) return;
            setIsOpen(open);
            if(!open) setFieldTouched(alias, true, false);
        }}>
          <Popover.Trigger>
            <button
              id={inputId}
              type="button" 
              ref={triggerRef}
              className={`vs-country-trigger ${
                inputtype === 'countryselect-material' ? 'vs-country-trigger-material' : 
                inputtype === 'countryselect-neumorphic' ? 'vs-country-trigger-neumorphic' : ''
              }`}
              style={activeTrigger}
              aria-describedby={inputLabel ? `${alias}InputLabel` : undefined}
              disabled={readOnly}
            >
              <Flex align="center" gap="2" style={{ minWidth: 0, flex: 1 }}>                
                  {!multiselect && displayFlag && selectedValues.length === 1 && (
                      <FlagIcon country={selectedValues[0] as Country} />
                  )}
                  <span style={{ 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis', 
                      whiteSpace: 'nowrap',
                      color: selectedValues.length === 0 ? 'var(--gray-9)' : 'inherit',
                      fontWeight: selectedValues.length === 0 ? 400 : 500
                  }}>
                      {displayLabel}
                  </span>
              </Flex>
              <Icon 
                name='chevrondown' 
                style={{ 
                  flexShrink: 0, 
                  opacity: 0.5, 
                  marginLeft: 8, 
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)' 
                }} 
              />
            </button>
          </Popover.Trigger>

          <Popover.Content 
            align="start" 
            sideOffset={6}
            className="vs-animated-dropdown"
            style={{ 
              width: triggerRef.current?.offsetWidth || 240,
              padding: 0,
              overflow: 'hidden',
              backgroundColor: inputtype === 'countryselect-neumorphic' ? 'var(--neu-bg)' : 'var(--vs-cs-bg)',
              border: inputtype === 'countryselect-neumorphic' ? 'none' : '1px solid var(--vs-cs-stroke)',
              boxShadow: inputtype === 'countryselect-neumorphic' 
                ? '8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light)'
                : '0 10px 30px -10px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.1)',
              borderRadius: inputtype === 'countryselect-neumorphic' ? '12px' : '8px',
              fontFamily: 'inherit',
              ...neuVars 
            }}
          >
            {enableSearch && (
                <Box p="2" style={{ borderBottom: inputtype === 'countryselect-neumorphic' ? 'none' : '1px solid var(--vs-cs-stroke)' }}>
                    <TextField.Root 
                        placeholder="Search countries..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant={inputtype === 'countryselect-neumorphic' ? 'soft' : 'surface'}
                        style={{
                          backgroundColor: inputtype === 'countryselect-neumorphic' ? 'transparent' : 'var(--gray-2)',
                          boxShadow: inputtype === 'countryselect-neumorphic' ? 'inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)' : 'none',
                          color: 'var(--vs-cs-text)'
                        }}
                    >
                        <TextField.Slot>
                            <Icon name="magnifyingglass" height="14" width="14" style={{ opacity: 0.5, color: 'var(--vs-cs-text)' }} />
                        </TextField.Slot>
                    </TextField.Root>
                </Box>
            )}

            <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 280 }}>
              <Box p="2">
                <Flex direction="column" gap="1">
                  {filteredCountries.length === 0 ? (
                      <Text size="2" align="center" style={{ padding: '16px 0', color: 'var(--gray-9)' }}>No countries found.</Text>
                  ) : (
                      filteredCountries.map((country) => {
                          const isSelected = selectedValues.includes(country.value);
                          return (
                              <Flex 
                                  key={country.value} 
                                  align="center" 
                                  gap="3"
                                  className="vs-country-item"
                                  data-selected={isSelected}
                                  onClick={() => handleSelection(country.value)}
                                  style={{ 
                                      padding: '8px 12px', 
                                      cursor: 'pointer', 
                                      borderRadius: '6px',
                                      backgroundColor: isSelected 
                                        ? (inputtype === 'countryselect-neumorphic' ? 'transparent' : 'var(--accent-a3)') 
                                        : 'transparent',
                                      boxShadow: isSelected && inputtype === 'countryselect-neumorphic' 
                                        ? 'inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)' 
                                        : 'none',
                                      color: 'var(--vs-cs-text)',
                                      transition: 'all 0.15s ease'
                                  }}
                              >
                                  {multiselect && (
                                      <Checkbox 
                                          checked={isSelected} 
                                          style={{ pointerEvents: 'none' }} 
                                      />
                                  )}
                                  {displayFlag && (
                                      <FlagIcon country={country.value as Country} />
                                  )}
                                  <Text size="2" weight={isSelected ? "medium" : "regular"} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {country.label}
                                  </Text>
                              </Flex>
                          );
                      })
                  )}
                </Flex>
              </Box>
            </ScrollArea>
          </Popover.Content>
        </Popover.Root>

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};