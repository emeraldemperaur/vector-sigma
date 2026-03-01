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

export interface CountryDropdownProps {
  /**
   * * The required unique identifier for the CountrySelect input field.
   * * @example alias="citizenshipCountries"
   */
  alias: string; 
  /**
   * * The design variation of the CountrySelect input. 
   * Default: 'countryselect-outline' 
   * Variants: 'countryselect', 'countryselect-outline', 'countryselect-material', 'countryselect-neumorphic'.
   */
  inputtype?: CountrySelectDesign & {};
  /**
   * * The optional input label or description.
   */
  inputLabel?: string; 
  /**
   * * The required viewport column width for the CountrySelect input field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */
  width: number;
  /**
   * * Option to render CountrySelect input field on new row.
   * * @example
   * newRow
   */
  newRow?: boolean;
  /**
   * * Option to force set the default value for a CountrySelect input field.
   * * @example
   * placeholder="Select a country"
   */
  placeholder?: string;
  /**
   * * Option to disable edits for CountrySelect input field.
   * * @example
   * readOnly
   */
  readOnly?: boolean;
  /**
     * * Option to enable a hint for CountrySelect input field.
     * * @example
     * isHinted
     */ 
  isHinted?: boolean; 
  /**
   * * Option to specify hint text for CountrySelect input field.
   * * @example
   * hintText="This is a hint for a VΣ CountrySelect"
   */ 
  hintText?: string;
  /**
   * * Option to specify a hint url reference or resource for CountrySelect input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */  
  hintUrl?: string;
  /**
   * * Option to specify the isRequired error text for the CountrySelect input field.
   * * @example
   * errorText="Country selection is required"
   */
  errorText?: ReactNode | string | null;
  /**
   * * Option to specify the .scss class selector for the CountrySelect input field.
   * * @example
   * className="teletraan-1-countryselect"
   */
  className?: string;
  /**
   * * Option to inject custom CSS for the CountrySelect input field.
   * * @example
   * style={{ color: "#000000" }}
   */ 
  style?: React.CSSProperties;
  /**
   * Optional explicit Formik context. Useful when bypassing duplicate 
   * context issues in monorepos or bundled npm packages.
   */
  formikContext?: FormikContextType<any>;
  
  /**
   * * Option to render the country flag icon next to the country name.
   * Default: true
   */
  displayFlag?: boolean;
  /**
   * * Option to allow multiple country selections and return an array of country codes.
   * Default: false
   */
  multiselect?: boolean;
  /**
   * * Option to enable search bar inside the CountrySelect to filter countries.
   * Default: false
   */
  enableSearch?: boolean;
}

export const CountrySelect = ({
  inputtype = 'countryselect-outline',
  alias, readOnly, width, inputLabel,
  placeholder = 'Select Country...', newRow, isHinted, hintText, hintUrl, errorText,
  displayFlag = true,
  multiselect = false,
  enableSearch = false,
  style, className, formikContext,
  ...props
}: CountryDropdownProps) => {
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`CountryDropdown '${alias}' must be used within a Formik provider.`);
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
      setNeuVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': adjustColor(parentBg, -30),
        '--neu-shadow-light': adjustColor(parentBg, 30),
        '--neu-text': 'var(--gray-12)',
        '--neu-error': 'var(--red-9)',
      } as React.CSSProperties);
    }
  }, [inputtype]);

  useEffect(() => {
      if (!isOpen) setSearchQuery("");
  }, [isOpen]);

  // --- STYLES ---
  const baseTrigger: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: readOnly ? 'default' : 'pointer',
    textAlign: 'left',
    padding: '0 12px',
    fontSize: 'var(--font-size-2)',
    fontFamily: 'var(--default-font-family)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    boxSizing: 'border-box',
    opacity: readOnly ? 0.7 : 1,
  };

  const materialTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--color-surface)',
    border: hasError ? '1px solid var(--red-9)' : 'none',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    borderRadius: '4px',
    height: '32px',
    fontWeight: 500,
  };

  const outlineTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'transparent',
    border: hasError ? '2px solid var(--red-9)' : '2px solid var(--gray-7)',
    borderRadius: '4px',
    height: '32px',
    fontWeight: 600,
  };

  const neumorphicTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--neu-error)' : 'var(--neu-text)',
    border: 'none',
    borderRadius: '12px',
    height: '40px',
    fontWeight: 600,
    boxShadow: isOpen 
      ? 'inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light)'
      : '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
    transition: 'all 0.2s ease',
  };

  const activeTrigger = 
    inputtype === 'countryselect-material' ? materialTrigger :
    inputtype === 'countryselect-outline' ? outlineTrigger :
    { ...neumorphicTrigger, ...neuVars };

  return (
    <Column span={width} newLine={newRow}>
    <Flex direction="column" gap="2" style={{ width: '100%' }}>
      
      <Popover.Root open={isOpen} onOpenChange={(open) => {
          if (readOnly) return;
          setIsOpen(open);
          if(!open) setFieldTouched(alias, true, false);
      }}>
        <Popover.Trigger>
          <button
            id={`${alias}FormInput`}
            type="button" 
            ref={triggerRef}
            className={className}
            style={{ ...activeTrigger, ...style }}
            aria-describedby={`${alias}InputLabel`}
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
                    color: selectedValues.length === 0 ? 'var(--gray-8)' : 'inherit' 
                }}>
                    {displayLabel}
                </span>
            </Flex>
            <Icon name='chevrondown' style={{ flexShrink: 0, opacity: 0.5, marginLeft: 8 }} />
          </button>
        </Popover.Trigger>

        <Popover.Content 
          align="start" 
          sideOffset={5}
          style={{ 
            width: triggerRef.current?.offsetWidth || 240,
            padding: 0,
            overflow: 'hidden',
            backgroundColor: inputtype === 'countryselect-neumorphic' ? 'var(--neu-bg)' : 'var(--color-panel-solid)',
            ...neuVars 
          }}
        >
          {enableSearch && (
              <Box p="2" style={{ borderBottom: inputtype === 'countryselect-neumorphic' ? 'none' : '1px solid var(--gray-6)' }}>
                  <TextField.Root 
                      placeholder="Search countries..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      variant={inputtype === 'countryselect-neumorphic' ? 'soft' : 'surface'}
                  >
                      <TextField.Slot>
                          <Icon name="magnifyingglass" height="14" width="14" style={{ opacity: 0.5 }} />
                      </TextField.Slot>
                  </TextField.Root>
              </Box>
          )}

          <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 250 }}>
            <Box p="2">
              <Flex direction="column" gap="1">
                {filteredCountries.length === 0 ? (
                    <Text size="2" color="gray" align="center" style={{ padding: '16px 0' }}>No countries found.</Text>
                ) : (
                    filteredCountries.map((country) => {
                        const isSelected = selectedValues.includes(country.value);
                        return (
                            <Flex 
                                key={country.value} 
                                align="center" 
                                gap="3"
                                onClick={() => handleSelection(country.value)}
                                style={{ 
                                    padding: '8px', 
                                    cursor: 'pointer', 
                                    borderRadius: '4px',
                                    backgroundColor: isSelected ? 'var(--accent-a3)' : 'transparent',
                                    transition: 'background-color 0.1s'
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
                                <Text size="2" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

      <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
           {inputLabel && (
               <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={`${alias}FormInput`}>
                   {inputLabel}
               </Text>
           )}
           
           {isHinted && (
               <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                   <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                       <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                   </a> 
               </Tooltip>
           )} 
           {hasError && (
               <Text id={errorId} size="1" color="red" className='core-input-label-error'>
                   {errorText || (typeof fieldError === 'string' ? fieldError : `Required field`)}
               </Text>
           )} 
      </div>
    </Flex>
    </Column>
  );
};