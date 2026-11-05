import React, { ReactNode, useEffect, useRef, useState, useId, useMemo } from 'react';
import { Popover, Flex, Text, ScrollArea, Box, Tooltip, TextField } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from "utils/vinci";
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import '../../styles/main.scss';

export type OptionSelectDesign = 
  | 'dropdown' 
  | 'dropdown-material' 
  | 'dropdown-outline' 
  | 'dropdown-neumorphic'
  | 'optionselect'
  | 'optionselect-material'
  | 'optionselect-outline'
  | 'optionselect-neumorphic';

/**
 * OptionSelectProps Interface
 * @description Configuration properties for the VectorSigma OptionSelect component.
 * Equipped with real-time search filtering (`enableSearch`), enterprise-grade aesthetics 
 * (Outline, Material, n8n Neumorphic), typography overrides, and strict Formik binding.
 */
export interface OptionSelectProps {
  /**
   * The required unique identifier for the OptionSelect field in Formik context.
   * Alias referenced as `name` attribute and Formik state key.
   * @example "productCategory"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the OptionSelect field.
   * @example "Product Category"
   */
  inputLabel?: string;

  /**
   * The aesthetic design variation of the OptionSelect input field.
   * - `dropdown-outline` / `optionselect-outline`: Minimalist enterprise border (Default).
   * - `dropdown-material` / `optionselect-material`: Elevated solid card surface.
   * - `dropdown-neumorphic` / `optionselect-neumorphic`: Soft-UI with extruded shadows.
   * @default "dropdown-outline"
   */
  inputtype?: OptionSelectDesign;

  /**
   * Alternative prop name matching standard VectorSigma prop conventions.
   */
  inputvariant?: OptionSelectDesign;

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
   * Placeholder text utilized when no option is selected.
   * @default "Select an option..."
   */
  placeholder?: string;

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
   * @example "Categorization dictates inventory routing policies."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/inventory/categories"
   */
  hintUrl?: string;

  /**
   * Toggles the real-time search filter input at the top of the popover menu.
   * @default false
   */
  enableSearch?: boolean;

  /**
   * Placeholder text for the search filter input when `enableSearch` is true.
   * @default "Search options..."
   */
  searchPlaceholder?: string;

  /**
   * Optional callback fired when the selected value changes.
   * Executes alongside the standard Formik state update.
   */
  onValueChange?: (value: string) => void;

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid product category selection is required."
   */
  errorText?: ReactNode | string | null;

  /**
   * Array of selectable options rendered within the menu.
   * Supports external redirection if `optionurl` is provided.
   * @example [
   *   { optionid: 1, optionvalue: "electronics", text: "Consumer Electronics" },
   *   { optionid: 2, optionvalue: "apparel", text: "Apparel & Textiles", optionurl: "https://example.com/apparel" }
   * ]
   */
  inputOptions: InputOption[];

  /**
   * Physical size scale for the OptionSelect trigger.
   * @default "2"
   */
  size?: "1" | "2" | "3";

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the trigger and dropdown canvas */
    background?: string;
    /** Overrides the border/stroke color of the trigger and dropdown canvas */
    stroke?: string;
    /** Overrides the text color of the trigger and menu items */
    textColor?: string;
    /** Overrides the primary color used for selection highlights and hover states */
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

export type SelectProps = OptionSelectProps;

export const OptionSelect = ({
  inputtype = 'dropdown-outline',
  inputvariant,
  alias,
  readOnly = false,
  width,
  inputLabel,
  placeholder = "Select an option...",
  inputOptions = [],
  enableSearch = false,
  searchPlaceholder = "Search options...",
  style,
  newRow,
  isHinted,
  hintText,
  hintUrl,
  errorText,
  size = "2",
  typography,
  className,
  formikContext,
  onValueChange,
}: OptionSelectProps) => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: OptionSelect '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
    return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const labelId = `${alias}InputLabel`;
  const errorId = `${alias}-error`;

  const hasError = Boolean(fieldTouched && fieldError);
  const resolvedVariant = inputvariant || inputtype || 'dropdown-outline';

  useEffect(() => {
    if (resolvedVariant.includes('neumorphic') && triggerRef.current) {
      const parentBg = getNearestParentBackground(triggerRef.current.parentElement);
      const computedBg = typography?.background || parentBg;

      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -30),
        '--neu-shadow-light': adjustColor(computedBg, 30),
      } as React.CSSProperties);
    }
  }, [resolvedVariant, typography?.background]);

  useEffect(() => {
    if (!isOpen) setSearchQuery("");
  }, [isOpen]);

  const handleSelect = (val: string) => {
    if (readOnly) return;
    setFieldValue(alias, val);
    setFieldTouched(alias, true, false);
    setIsOpen(false);
    if (onValueChange) onValueChange(val);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    setFieldValue(alias, "");
    setFieldTouched(alias, true, false);
    if (onValueChange) onValueChange("");
  };

  const openLink = (inputUrl: string) => {
    window.open(inputUrl, '_blank', 'noopener,noreferrer');
  };

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery.trim()) return inputOptions;
    const lowerQuery = searchQuery.toLowerCase();
    return inputOptions.filter(opt =>
      opt.text.toLowerCase().includes(lowerQuery) ||
      String(opt.optionvalue).toLowerCase().includes(lowerQuery)
    );
  }, [inputOptions, enableSearch, searchQuery]);

  const selectedOption = useMemo(() => {
    return inputOptions.find(opt => String(opt.optionvalue) === String(fieldValue));
  }, [inputOptions, fieldValue]);

  const displayLabel = selectedOption ? selectedOption.text : placeholder;

  const typographyVars = {
    '--vs-os-bg': typography?.background || 'var(--color-surface)',
    '--vs-os-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-os-text': typography?.textColor || 'var(--gray-12)',
    '--vs-os-accent': typography?.accent || 'var(--accent-9)',
  } as React.CSSProperties;

  const baseTrigger: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    cursor: readOnly ? 'not-allowed' : 'pointer',
    textAlign: 'left',
    padding: size === '1' ? '0 10px' : size === '3' ? '0 14px' : '0 12px',
    fontSize: size === '1' ? '0.85rem' : size === '3' ? '1rem' : 'var(--font-size-2)',
    fontFamily: 'inherit',
    color: 'var(--vs-os-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    boxSizing: 'border-box',
    opacity: readOnly ? 0.65 : 1,
    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const materialTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--vs-os-bg)',
    border: hasError ? '1px solid var(--red-9)' : `1px solid ${typography?.stroke ? 'var(--vs-os-stroke)' : 'transparent'}`,
    boxShadow: '0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
    borderRadius: '4px',
    height: size === '1' ? '32px' : size === '3' ? '44px' : '36px',
    fontWeight: 500,
  };

  const outlineTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: typography?.background || 'transparent',
    border: hasError ? '1.5px solid var(--red-9)' : '1.5px solid var(--vs-os-stroke)',
    borderRadius: '6px',
    height: size === '1' ? '32px' : size === '3' ? '44px' : '36px',
    fontWeight: 500,
  };

  const neumorphicTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--red-9)' : 'var(--vs-os-text)',
    border: 'none',
    borderRadius: '12px',
    height: size === '1' ? '36px' : size === '3' ? '48px' : '40px',
    fontWeight: 500,
    boxShadow: isOpen 
      ? 'inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light)'
      : '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
  };

  const activeTrigger = 
    resolvedVariant.includes('material') ? materialTrigger :
    resolvedVariant.includes('neumorphic') ? { ...neumorphicTrigger, ...neuVars } :
    outlineTrigger;

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
            .vs-optionselect-trigger:not(:disabled):hover {
              border-color: var(--vs-os-accent) !important;
            }
            .vs-optionselect-trigger-material:not(:disabled):hover {
              box-shadow: 0 4px 10px rgba(0,0,0,0.12) !important;
            }
            .vs-optionselect-trigger-neumorphic:not(:disabled):hover {
              box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light) !important;
            }

            @keyframes vs-os-dropdown-enter {
              from { opacity: 0; transform: scale(0.96) translateY(-4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes vs-os-dropdown-exit {
              from { opacity: 1; transform: scale(1) translateY(0); }
              to { opacity: 0; transform: scale(0.96) translateY(-4px); }
            }

            .vs-os-animated-dropdown[data-state="open"] {
              animation: vs-os-dropdown-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              transform-origin: top center;
            }
            .vs-os-animated-dropdown[data-state="closed"] {
              animation: vs-os-dropdown-exit 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              transform-origin: top center;
            }

            .vs-os-item {
              color: var(--vs-os-text) !important;
              border-radius: 6px !important;
              padding: 8px 12px !important;
              cursor: pointer;
              transition: all 0.15s ease;
              user-select: none;
            }
            .vs-os-item:hover, .vs-os-item.vs-selected {
              background-color: var(--accent-a3) !important;
            }

            .vs-os-item-neumorphic {
              color: var(--vs-os-text) !important;
              border-radius: 6px !important;
              padding: 8px 12px !important;
              cursor: pointer;
              transition: all 0.15s ease;
              user-select: none;
            }
            .vs-os-item-neumorphic:hover {
              background-color: transparent !important;
              box-shadow: 2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light) !important;
            }
            .vs-os-item-neumorphic.vs-selected {
              background-color: transparent !important;
              box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light) !important;
              color: var(--vs-os-accent) !important;
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

        <Popover.Root open={isOpen} onOpenChange={(open) => {
          if (readOnly) return;
          setIsOpen(open);
          if (!open) {
            setFieldTouched(alias, true, false);
          }
        }}>
          <Popover.Trigger>
            <button
              id={inputId}
              type="button"
              ref={triggerRef}
              className={`vs-optionselect-trigger ${
                resolvedVariant.includes('material') ? 'vs-optionselect-trigger-material' : 
                resolvedVariant.includes('neumorphic') ? 'vs-optionselect-trigger-neumorphic' : ''
              }`}
              style={activeTrigger}
              aria-labelledby={inputLabel ? labelId : undefined}
              aria-describedby={hasError ? errorId : undefined}
              disabled={readOnly}
            >
              <span style={{ 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                color: selectedOption ? 'inherit' : 'var(--gray-9)',
                fontWeight: selectedOption ? 500 : 400
              }}>
                {displayLabel}
              </span>

              <Flex align="center" gap="2" style={{ flexShrink: 0, marginLeft: 8 }}>
                {selectedOption && !readOnly && (
                  <span
                    onClick={handleClear}
                    title="Clear selection"
                    style={{ display: 'flex', alignItems: 'center', opacity: 0.6, cursor: 'pointer' }}
                  >
                    <Icon name="close" height="14" width="14" />
                  </span>
                )}
                <Icon 
                  name='chevrondown' 
                  style={{ 
                    opacity: 0.5,
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                  }} 
                />
              </Flex>
            </button>
          </Popover.Trigger>

          <Popover.Content
            align="start"
            sideOffset={6}
            className="vs-os-animated-dropdown"
            style={{
              width: triggerRef.current?.offsetWidth || 240,
              minWidth: '220px',
              padding: 0,
              overflow: 'hidden',
              backgroundColor: resolvedVariant.includes('neumorphic') ? 'var(--neu-bg)' : 'var(--vs-os-bg)',
              border: resolvedVariant.includes('neumorphic') ? 'none' : '1px solid var(--vs-os-stroke)',
              borderRadius: resolvedVariant.includes('neumorphic') ? '12px' : '8px',
              boxShadow: resolvedVariant.includes('neumorphic') 
                ? '8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light)'
                : '0 10px 30px -10px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.1)',
              fontFamily: 'inherit',
              ...neuVars
            }}
          >
            {enableSearch && (
              <Box p="2" style={{ borderBottom: `1px solid var(--vs-os-stroke)` }}>
                <TextField.Root
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  variant={resolvedVariant.includes('neumorphic') ? 'soft' : 'surface'}
                  size="1"
                  autoFocus
                  style={{
                    backgroundColor: resolvedVariant.includes('neumorphic') ? 'transparent' : 'var(--gray-2)',
                    boxShadow: resolvedVariant.includes('neumorphic') ? 'inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)' : 'none',
                    color: 'var(--vs-os-text)'
                  }}
                >
                  <TextField.Slot>
                    <Icon name="magnifyingglass" height="13" width="13" style={{ opacity: 0.5 }} />
                  </TextField.Slot>
                </TextField.Root>
              </Box>
            )}

            <ScrollArea type="auto" scrollbars="vertical" style={{ maxHeight: 240 }}>
              <Box p="2">
                <Flex direction="column" gap="1">
                  {filteredOptions.length === 0 ? (
                    <Text size="2" align="center" style={{ padding: '16px 0', color: 'var(--gray-9)' }}>
                      No options found.
                    </Text>
                  ) : (
                    filteredOptions.map((option, idx) => {
                      const optionVal = String(option.optionvalue);
                      const isSelected = String(fieldValue) === optionVal;
                      const optionKey = `${alias}-opt-${option.optionid || idx}`;
                      const isNeumorphic = resolvedVariant.includes('neumorphic');

                      return (
                        <Flex
                          key={optionKey}
                          align="center"
                          justify="between"
                          className={`${isNeumorphic ? 'vs-os-item-neumorphic' : 'vs-os-item'} ${isSelected ? 'vs-selected' : ''}`}
                          onClick={() => {
                            if (option.optionurl) {
                              openLink(option.optionurl);
                            }
                            handleSelect(optionVal);
                          }}
                        >
                          <Text size="2" weight={isSelected ? "medium" : "regular"} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {option.text}
                          </Text>
                          {isSelected && (
                            <Icon name="check" height="14" width="14" style={{ color: 'var(--vs-os-accent)', flexShrink: 0 }} />
                          )}
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