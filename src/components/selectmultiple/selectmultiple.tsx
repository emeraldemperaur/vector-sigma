import React, { ReactNode, useEffect, useRef, useState, useId, useMemo } from 'react';
import { Popover, Flex, Text, Checkbox, ScrollArea, Box, Tooltip, TextField } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground, InputOption } from "utils/vinci";
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import '../../styles/main.scss';

export type MultipleSelectDesign = 
  | 'multiselect' 
  | 'multiselect-material' 
  | 'multiselect-outline' 
  | 'multiselect-neumorphic';

/**
 * MultipleSelectProps Interface
 * @description Configuration properties for the VectorSigma MultipleSelect component.
 * Equipped with multi-option checkbox toggles, real-time search filtering (`enableSearch`),
 * enterprise-grade aesthetics (Outline, Cohere Material, n8n Neumorphic),
 * localized CSS variable typography overrides, and Formik array binding.
 */
export interface MultipleSelectProps {
  /**
   * The required unique identifier for the MultipleSelect field in Formik context.
   * Alias referenced as `name` attribute and Formik state key (expects an array of strings/numbers).
   * @example "assignedUserRoles"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the MultipleSelect field.
   * @example "Assigned Workspace Roles"
   */
  inputLabel?: string;

  /**
   * The design aesthetic of the MultipleSelect trigger and dropdown popover.
   * - `multiselect-outline`: Minimalist, outlined aesthetic (Default).
   * - `multiselect-material`: Elevated solid card surface with soft drop shadows.
   * - `multiselect-neumorphic`: Soft-UI with extruded inset/outset shadows.
   * @default "multiselect-outline"
   */
  inputtype?: MultipleSelectDesign;

  /**
   * Alternative prop name matching standard VectorSigma prop conventions.
   */
  inputvariant?: MultipleSelectDesign;

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
   * Placeholder text utilized when no items are currently selected.
   * @default "Select options..."
   */
  placeholder?: string;

  /**
   * Disables interaction, mutating visual state to reflect read-only/disabled mode.
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
   * @example "Users inherit permissions from all selected security groups."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/iam/roles"
   */
  hintUrl?: string;

  /**
   * Array of selectable options rendered inside the multi-select menu.
   * @example [
   *   { optionid: 1, optionvalue: "admin", text: "Administrator" },
   *   { optionid: 2, optionvalue: "editor", text: "Content Editor" }
   * ]
   */
  inputOptions: InputOption[];

  /**
   * Enables a search filter input at the top of the popover menu for large option sets.
   * @default false
   */
  enableSearch?: boolean;

  /**
   * Placeholder text for the search filter input.
   * @default "Search options..."
   */
  searchPlaceholder?: string;

  /**
   * Optional callback fired when the selected value array changes.
   * Executes alongside the standard Formik state update.
   */
  onValueChange?: (values: string[]) => void;

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "At least one role assignment is required."
   */
  errorText?: ReactNode | string | null;

  /**
   * Sizing scale controlling trigger height and internal padding.
   * @default "2"
   */
  size?: "1" | "2" | "3";

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the trigger and popover canvas */
    background?: string;
    /** Overrides the border/stroke color of the trigger and popover canvas */
    stroke?: string;
    /** Overrides the text color of the trigger and menu items */
    textColor?: string;
    /** Overrides the active checkbox fill and highlight color */
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

export const MultipleSelect = ({
  alias,
  inputLabel,
  inputtype = 'multiselect-outline',
  inputvariant,
  width,
  newRow,
  placeholder = 'Select options...',
  readOnly = false,
  isHinted,
  hintText,
  hintUrl,
  inputOptions = [],
  enableSearch = false,
  searchPlaceholder = 'Search options...',
  errorText,
  size = "2",
  typography,
  className,
  style,
  formikContext,
  onValueChange,
}: MultipleSelectProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: MultipleSelect '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
    return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const selectedValues: string[] = useMemo(() => {
    if (Array.isArray(fieldValue)) {
      return fieldValue.map(String);
    }
    return fieldValue !== undefined && fieldValue !== null ? [String(fieldValue)] : [];
  }, [fieldValue]);

  const hasError = Boolean(fieldTouched && fieldError);

  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const labelId = `${alias}InputLabel`;
  const errorId = `${alias}-error`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const resolvedVariant = inputvariant || inputtype || 'multiselect-outline';

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

  const handleToggle = (value: string) => {
    if (readOnly) return;
    const stringVal = String(value);
    const newValues = selectedValues.includes(stringVal)
      ? selectedValues.filter((v) => v !== stringVal)
      : [...selectedValues, stringVal];

    setFieldValue(alias, newValues);
    setFieldTouched(alias, true, false);

    if (onValueChange) {
      onValueChange(newValues);
    }
  };

  const handleSelectAll = () => {
    if (readOnly) return;
    const allValues = filteredOptions.map(opt => String(opt.optionvalue));
    const merged = Array.from(new Set([...selectedValues, ...allValues]));
    setFieldValue(alias, merged);
    setFieldTouched(alias, true, false);
    if (onValueChange) onValueChange(merged);
  };

  const handleClearAll = () => {
    if (readOnly) return;
    setFieldValue(alias, []);
    setFieldTouched(alias, true, false);
    if (onValueChange) onValueChange([]);
  };

  const filteredOptions = useMemo(() => {
    if (!enableSearch || !searchQuery.trim()) return inputOptions;
    const lowerQuery = searchQuery.toLowerCase();
    return inputOptions.filter(opt => 
      opt.text.toLowerCase().includes(lowerQuery) || 
      String(opt.optionvalue).toLowerCase().includes(lowerQuery)
    );
  }, [inputOptions, enableSearch, searchQuery]);

  const displayLabel = useMemo(() => {
    if (selectedValues.length === 0) return placeholder;

    const matchedOptions = inputOptions.filter(opt => 
      selectedValues.includes(String(opt.optionvalue))
    );

    if (matchedOptions.length <= 2) {
      return matchedOptions.map(opt => opt.text).join(', ');
    }

    return `${matchedOptions.length} items selected`;
  }, [selectedValues, inputOptions, placeholder]);

  const typographyVars = {
    '--vs-ms-bg': typography?.background || 'var(--color-surface)',
    '--vs-ms-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-ms-text': typography?.textColor || 'var(--gray-12)',
    '--vs-ms-accent': typography?.accent || 'var(--accent-9)',
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
    color: 'var(--vs-ms-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    boxSizing: 'border-box',
    opacity: readOnly ? 0.65 : 1,
    transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
  };

  const materialTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--vs-ms-bg)',
    border: hasError ? '1px solid var(--red-9)' : `1px solid ${typography?.stroke ? 'var(--vs-ms-stroke)' : 'transparent'}`,
    boxShadow: '0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
    borderRadius: '4px',
    height: size === '1' ? '32px' : size === '3' ? '44px' : '36px',
    fontWeight: 500,
  };

  const outlineTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: typography?.background || 'transparent',
    border: hasError ? '1.5px solid var(--red-9)' : '1.5px solid var(--vs-ms-stroke)',
    borderRadius: '6px',
    height: size === '1' ? '32px' : size === '3' ? '44px' : '36px',
    fontWeight: 500,
  };

  const neumorphicTrigger: React.CSSProperties = {
    ...baseTrigger,
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--red-9)' : 'var(--vs-ms-text)',
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
            .vs-multiselect-trigger:not(:disabled):hover {
              border-color: var(--vs-ms-accent) !important;
            }
            .vs-multiselect-trigger-material:not(:disabled):hover {
              box-shadow: 0 4px 10px rgba(0,0,0,0.12) !important;
            }
            .vs-multiselect-trigger-neumorphic:not(:disabled):hover {
              box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light) !important;
            }

            @keyframes vs-ms-dropdown-enter {
              from { opacity: 0; transform: scale(0.96) translateY(-4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes vs-ms-dropdown-exit {
              from { opacity: 1; transform: scale(1) translateY(0); }
              to { opacity: 0; transform: scale(0.96) translateY(-4px); }
            }

            .vs-ms-animated-popover[data-state="open"] {
              animation: vs-ms-dropdown-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              transform-origin: top center;
            }
            .vs-ms-animated-popover[data-state="closed"] {
              animation: vs-ms-dropdown-exit 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              transform-origin: top center;
            }

            .vs-ms-item {
              padding: 8px 12px;
              border-radius: 6px;
              cursor: ${readOnly ? 'default' : 'pointer'};
              transition: background-color 0.15s ease;
              color: var(--vs-ms-text);
              user-select: none;
            }
            .vs-ms-item:hover, .vs-ms-item.vs-selected {
              background-color: var(--accent-a3) !important;
            }

            .vs-ms-item .rt-CheckboxButton {
              border-color: var(--vs-ms-stroke) !important;
            }
            .vs-ms-item[data-selected="true"] .rt-CheckboxButton {
              background-color: var(--vs-ms-accent) !important;
              border-color: var(--vs-ms-accent) !important;
            }

            .vs-ms-action-btn {
              font-size: 0.75rem;
              font-weight: 600;
              color: var(--vs-ms-accent);
              cursor: pointer;
              background: none;
              border: none;
              padding: 2px 6px;
              border-radius: 4px;
              transition: background-color 0.15s ease;
            }
            .vs-ms-action-btn:hover {
              background-color: var(--accent-a3);
            }
          `}
        </style>

        {/* Header Label Row */}
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
              className={`vs-multiselect-trigger ${
                resolvedVariant.includes('material') ? 'vs-multiselect-trigger-material' : 
                resolvedVariant.includes('neumorphic') ? 'vs-multiselect-trigger-neumorphic' : ''
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
                color: selectedValues.length === 0 ? 'var(--gray-9)' : 'inherit',
                fontWeight: selectedValues.length === 0 ? 400 : 500
              }}>
                {displayLabel}
              </span>
              <Icon 
                name='chevrondown' 
                style={{ 
                  flexShrink: 0, 
                  opacity: 0.5, 
                  marginLeft: 8,
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)'
                }} 
              />
            </button>
          </Popover.Trigger>

          <Popover.Content
            align="start"
            sideOffset={6}
            className="vs-ms-animated-popover"
            style={{
              width: triggerRef.current?.offsetWidth || 240,
              minWidth: '220px',
              padding: 0,
              overflow: 'hidden',
              backgroundColor: resolvedVariant.includes('neumorphic') ? 'var(--neu-bg)' : 'var(--vs-ms-bg)',
              border: resolvedVariant.includes('neumorphic') ? 'none' : '1px solid var(--vs-ms-stroke)',
              borderRadius: resolvedVariant.includes('neumorphic') ? '12px' : '8px',
              boxShadow: resolvedVariant.includes('neumorphic') 
                ? '8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light)'
                : '0 10px 30px -10px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.1)',
              fontFamily: 'inherit',
              ...typographyVars,
              ...neuVars
            }}
          >
            {enableSearch && (
              <Box p="2" style={{ borderBottom: `1px solid var(--vs-ms-stroke)` }}>
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
                    color: 'var(--vs-ms-text)'
                  }}
                >
                  <TextField.Slot>
                    <Icon name="magnifyingglass" height="13" width="13" style={{ opacity: 0.5 }} />
                  </TextField.Slot>
                </TextField.Root>
              </Box>
            )}

            {inputOptions.length > 3 && !readOnly && (
              <Flex justify="between" align="center" px="3" py="1" style={{ borderBottom: `1px solid var(--vs-ms-stroke)`, opacity: 0.85 }}>
                <button type="button" className="vs-ms-action-btn" onClick={handleSelectAll}>
                  Select All
                </button>
                <button type="button" className="vs-ms-action-btn" onClick={handleClearAll}>
                  Clear All
                </button>
              </Flex>
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
                      const isSelected = selectedValues.includes(optionVal);
                      const optionKey = `${alias}-opt-${option.optionid || idx}`;

                      return (
                        <Flex
                          key={optionKey}
                          align="center"
                          gap="3"
                          className={`vs-ms-item ${isSelected ? 'vs-selected' : ''}`}
                          data-selected={isSelected}
                          onClick={() => handleToggle(optionVal)}
                        >
                          <Checkbox
                            checked={isSelected}
                            disabled={readOnly}
                            style={{ pointerEvents: 'none' }}
                          />
                          <Text size="2" weight={isSelected ? "medium" : "regular"} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {option.text}
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