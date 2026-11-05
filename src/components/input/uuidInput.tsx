import React, { ReactNode, useState, useMemo, useEffect, useRef, useId } from "react";
import { TextField, IconButton, Tooltip, Flex, Text } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { Icon } from "components/icons/icons";
import { FormikContextType, useFormikContext, getIn } from "formik"; 
import { Column } from "layouts/column/column";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import '../../styles/main.scss';

export type UUIDInputDesign = 'uuid' | 'uuid-outline' | 'uuid-material' | 'uuid-neumorphic';

export type StartsWithUuid = `uuid${string}`;

/**
 * UUIDInputProps Interface
 * @description Configuration properties for the VectorSigma UUIDInput component.
 * Equipped with automatic hex formatting, configurable delimiters, clipboard copy,
 * enterprise-grade aesthetics (Outline, Material, Neumorphic), and strict Formik integration.
 */
export interface UUIDInputProps {
  /**
   * The required unique identifier bridging the input field to the Formik state.
   * Must exactly match the schema property key.
   * @example "licenseKey"
   */
  alias: string;

  /**
   * The format identifier string (e.g. `uuid-8-4-4-4-12` or `uuid-4-4-4-4`).
   * Defines segment lengths if explicit `format` array is not supplied.
   * @default "uuid-4-4-4-4"
   */
  type?: StartsWithUuid | string;

  /**
   * The primary semantic label rendered above the UUIDInput field.
   * @example "API Client Identifier"
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
   * Delimiter character inserted between hex chunks.
   * @default "-"
   */
  delimiter?: string;

  /**
   * Array of segment lengths defining the chunk partitioning.
   * Standard RFC 4122 UUID is [8, 4, 4, 4, 12].
   * @default [4, 4, 4, 4]
   */
  format?: number[];

  /**
   * Toggles the visibility of the contextual hint icon and tooltip next to the label.
   * @default false
   */  
  isHinted?: boolean;

  /**
   * The text payload displayed inside the Tooltip when `isHinted` is true.
   * @example "UUID is used to verify HMAC request signatures."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/auth/tokens"
   */
  hintUrl?: string;

  /**
   * Placeholder text utilized when the input field is empty.
   * @example "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
   */
  placeholder?: string;

  /**
   * Optional custom icon rendered on the left slot.
   * Defaults to a security hash icon if not specified.
   */
  icon?: React.ReactNode;

  /**
   * Toggles an action button in the trailing slot to generate a random UUID chunk matching the format.
   * @default false
   */
  enableGenerate?: boolean;

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the input strut */
    background?: string;
    /** Overrides the border/stroke color of the input strut */
    stroke?: string;
    /** Overrides the text color of the typed UUID value */
    textColor?: string;
    /** Overrides the accent color for active copy feedback */
    accent?: string;
  };

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid 128-bit UUID is required."
   */
  errorText?: ReactNode | string | null;

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string;

  /**
   * The aesthetic design language of the UUIDInput field.
   * - `uuid-outline`: Minimalist, Cohere-inspired outlined aesthetic (Default).
   * - `uuid-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `uuid-neumorphic`: n8n-inspired soft-UI with extruded inset shadows.
   * @default "uuid-outline"
   */
  inputVariant?: UUIDInputDesign;
  
  /**
   * Alias for `inputVariant` matching standard VectorSigma prop conventions.
   */
  inputvariant?: UUIDInputDesign;

  /**
   * Disables interaction, mutating the visual state to reflect read-only/disabled mode.
   * @default false
   */
  readOnly?: boolean;

  /**
   * The physical height sizing scale for the Radix TextField.
   * @default "2"
   */
  size?: "1" | "2" | "3";

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

const safeParseUuidFormat = (typeString: string): number[] | null => {
  try {
    if (!typeString?.startsWith('uuid-')) return null;
    const parts = typeString.split('-').slice(1).map(Number);
    return parts.length > 0 && !parts.some(isNaN) && parts.every(n => n > 0) ? parts : null;
  } catch {
    return null;
  }
};

export const UUIDInput = ({
  alias, 
  type = "uuid-4-4-4-4", 
  inputLabel, 
  width, 
  delimiter = "-",
  format = [4, 4, 4, 4],
  placeholder = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', 
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  icon,
  enableGenerate = false,
  typography,
  readOnly = false, 
  inputVariant,
  inputvariant,
  size = "2", 
  className,
  style,
  formikContext,
  ...props
}: UUIDInputProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: UUIDInput '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
    return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const hasError = Boolean(fieldTouched && fieldError);
  const [copied, setCopied] = useState(false);
  
  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const labelId = `${alias}InputLabel`;
  const errorId = `${alias}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  const resolvedVariant = inputvariant || inputVariant || 'uuid-outline';

  const activeFormat = useMemo(() => {
    const parsed = safeParseUuidFormat(type);
    return parsed || format || [4, 4, 4, 4];
  }, [type, format]);

  const maxHexChars = useMemo(() => activeFormat.reduce((a, b) => a + b, 0), [activeFormat]);
  const maxTotalLength = useMemo(() => maxHexChars + (activeFormat.length - 1) * delimiter.length, [maxHexChars, activeFormat, delimiter]);

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

  const formatUUID = (value: string): string => {
    if (!value) return "";
    const clean = value.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, maxHexChars);
    
    const parts: string[] = [];
    let currentIdx = 0;

    for (const len of activeFormat) {
      if (currentIdx >= clean.length) break;
      const chunk = clean.slice(currentIdx, currentIdx + len);
      parts.push(chunk);
      currentIdx += len;
    }

    return parts.join(delimiter);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const formatted = formatUUID(e.target.value);
    setFieldValue(alias, formatted);
    setFieldTouched(alias, true, false);
  };

  const handleCopy = async () => {
    if (fieldValue) {
      try {
        await navigator.clipboard.writeText(String(fieldValue));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("[VectorSigma]: Failed to copy UUID to clipboard", err);
      }
    }
  };

  const handleGenerate = () => {
    if (readOnly) return;
    const hexChars = '0123456789ABCDEF';
    let randomHex = '';
    
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(maxHexChars);
      crypto.getRandomValues(bytes);
      randomHex = Array.from(bytes, b => hexChars[b % 16]).join('');
    } else {
      for (let i = 0; i < maxHexChars; i++) {
        randomHex += hexChars[Math.floor(Math.random() * 16)];
      }
    }

    const formatted = formatUUID(randomHex);
    setFieldValue(alias, formatted);
    setFieldTouched(alias, true, false);
  };

  const typographyVars = {
    '--vs-uuid-bg': typography?.background || 'var(--color-surface)',
    '--vs-uuid-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-uuid-text': typography?.textColor || 'var(--gray-12)',
    '--vs-uuid-accent': typography?.accent || 'var(--accent-9)',
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
            .vs-uuid-wrapper {
              width: 100%;
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .vs-uuid-wrapper input {
              font-family: var(--code-font-family, 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace) !important;
              text-transform: uppercase !important;
              letter-spacing: 0.06em;
              font-size: 0.85rem !important;
              color: var(--vs-uuid-text) !important;
            }
            .vs-uuid-wrapper input::placeholder {
              color: var(--gray-9) !important;
              opacity: 0.6;
              letter-spacing: 0.05em;
            }

            .vs-uuid-outline {
              background-color: ${typography?.background ? 'var(--vs-uuid-bg)' : 'transparent'} !important;
              box-shadow: inset 0 0 0 1.5px ${hasError ? 'var(--red-9)' : 'var(--vs-uuid-stroke)'} !important;
              border-radius: 6px !important;
            }
            .vs-uuid-outline:focus-within {
              box-shadow: inset 0 0 0 2px ${hasError ? 'var(--red-9)' : 'var(--vs-uuid-accent)'} !important;
            }

            .vs-uuid-material {
              background-color: var(--vs-uuid-bg) !important;
              box-shadow: 0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04) !important;
              border-radius: 4px !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'transparent'} !important;
            }
            .vs-uuid-material:focus-within {
              box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'var(--vs-uuid-accent)'} !important;
            }

            .vs-uuid-neumorphic {
              background-color: var(--neu-bg) !important;
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light) !important;
              border: none !important;
              border-radius: 12px !important;
            }
            .vs-uuid-neumorphic:focus-within {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
            }
            .vs-uuid-neumorphic.vs-has-error {
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
          id={inputId}
          name={alias}
          size={size}
          variant="surface"
          value={fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : ''}
          onChange={handleChange}
          onBlur={() => setFieldTouched(alias, true, false)}
          maxLength={maxTotalLength}
          readOnly={readOnly}
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          aria-labelledby={inputLabel ? labelId : undefined}
          aria-describedby={hasError ? errorId : undefined}
          className={`vs-uuid-wrapper ${
            resolvedVariant.includes('material') ? 'vs-uuid-material' : 
            resolvedVariant.includes('neumorphic') ? 'vs-uuid-neumorphic' : 
            'vs-uuid-outline'
          } ${hasError ? 'vs-has-error' : ''}`}
          style={neuVars}
          {...props}
        >
          <TextField.Slot style={{ color: typography?.textColor || 'var(--gray-10)' }}>
            {icon ? icon : <Icon name="fingerprint" height="15" width="15" style={{ opacity: 0.7 }} />}
          </TextField.Slot>

          <TextField.Slot style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {enableGenerate && !readOnly && (
              <Tooltip content="Generate random identifier">
                <IconButton 
                  size="1" 
                  variant="ghost" 
                  color="gray" 
                  onClick={handleGenerate} 
                  type="button"
                  aria-label="Generate UUID"
                  style={{ cursor: 'pointer', color: 'var(--gray-10)', opacity: 0.8 }}
                >
                  <Icon name="shuffle" height="14" width="14" />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
              <IconButton 
                size="1" 
                variant="ghost" 
                color={copied ? "green" : "gray"}
                onClick={handleCopy} 
                type="button"
                disabled={!fieldValue}
                aria-label={copied ? "Copied identifier" : "Copy identifier to clipboard"}
                style={{ 
                  cursor: fieldValue ? 'pointer' : 'not-allowed', 
                  color: copied ? 'var(--green-9)' : (typography?.textColor || 'var(--gray-10)'), 
                  opacity: fieldValue ? 1 : 0.4,
                  transition: 'color 0.2s ease, opacity 0.2s ease'
                }}
              >
                {copied ? <CheckIcon width="15" height="15" /> : <CopyIcon width="15" height="15" />}
              </IconButton>
            </Tooltip>
          </TextField.Slot>
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