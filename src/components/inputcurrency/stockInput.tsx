import React, { ReactNode, useEffect, useRef, useState, useId } from "react";
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, Badge, Tooltip, Box } from '@radix-ui/themes';
import { IMaskInput } from 'react-imask';
import { Icon } from "components/icons/icons";
import { FaChartLine } from '@react-icons/all-files/fa/FaChartLine'; 
import { Column } from "layouts/column/column";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import '../../styles/main.scss';

// Type assertion wrapper to resolve react-imask polymorphic discriminated union issues
const MaskedNumberInput = IMaskInput as React.ComponentType<any>;

export type StockInputDesign = "input" | "input-material" | "input-outline" | "input-neumorphic";

/**
 * StockInputProps Interface
 * @description Configuration properties for the VectorSigma StockInput component.
 * Equipped with real-time numeric masking for equities/derivatives, ticker symbol badges,
 * enterprise-grade aesthetics (Outline, Material, Neumorphic), and strict Formik integration.
 */
export interface StockInputProps {
  /**
   * The required unique identifier for the StockInput field in Formik context.
   * Alias referenced as `name` attribute and Formik state key.
   * @example "restrictedStocksTSLA"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the StockInput field.
   * @example "Execution Share Price"
   */
  inputLabel?: string;

  /**
   * Defines the responsive grid column span for the component (1-12 based on parent grid).
   * @example 6
   */
  width: number;

  /**
   * Stock ticker symbol displayed in the badge pill.
   * Falls back to a line chart icon if omitted.
   * @example "TSLA"
   */
  defaultvalue?: string;

  /**
   * Alias for `defaultvalue` providing standard semantic ticker property naming.
   * @example "NVDA"
   */
  ticker?: string;

  /**
   * Forces the component to break into a new Flex/Grid row within the Form layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Placeholder numerical string displayed when the input field is empty.
   * @default "0.00"
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
   * @example "Market limit price pegged at 4:00 PM EST market close."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/trading/equities"
   */
  hintUrl?: string;

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid positive share valuation is required."
   */
  errorText?: ReactNode | string | null;

  /**
   * The design aesthetic of the StockInput container.
   * - `input-outline`: Minimalist, outlined aesthetic (Default).
   * - `input-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `input-neumorphic`: Soft-UI with extruded inset shadows.
   * @default "input-outline"
   */
  inputvariant?: StockInputDesign;

  /**
   * Alternative prop name matching standard VectorSigma prop conventions.
   */
  inputVariant?: StockInputDesign;

  /**
   * Sizing scale controlling component height and internal padding.
   * @default "2"
   */
  size?: "1" | "2" | "3";

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the input container */
    background?: string;
    /** Overrides the border/stroke color of the container */
    stroke?: string;
    /** Overrides the text color of the typed monetary digits */
    textColor?: string;
    /** Overrides the accent focus ring and badge color */
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

export const StockInput = ({
  alias,
  inputLabel,
  width,
  defaultvalue,
  ticker,
  placeholder = "0.00",
  newRow,
  isHinted,
  hintText,
  hintUrl,
  errorText,
  readOnly = false,
  inputvariant,
  inputVariant,
  size = "2",
  typography,
  className,
  style,
  formikContext,
}: StockInputProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: StockInput '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  const resolvedVariant = inputvariant || inputVariant || 'input-outline';
  const displayTicker = (ticker || defaultvalue || "").trim().toUpperCase();

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
    '--vs-stk-bg': typography?.background || 'var(--color-surface)',
    '--vs-stk-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-stk-text': typography?.textColor || 'var(--gray-12)',
    '--vs-stk-accent': typography?.accent || 'var(--accent-9)',
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
            .vs-stock-container {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
              box-sizing: border-box;
              overflow: hidden;
            }

            .vs-stock-container.size-1 { height: 32px; padding: 0 8px; }
            .vs-stock-container.size-2 { height: 40px; padding: 0 10px; }
            .vs-stock-container.size-3 { height: 48px; padding: 0 14px; }

            .vs-stock-badge {
              font-family: var(--code-font-family, 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace) !important;
              font-weight: 700 !important;
              letter-spacing: 0.06em;
              display: inline-flex;
              align-items: center;
              gap: 4px;
              user-select: none;
              flex-shrink: 0;
            }

            .vs-stock-input {
              flex: 1;
              min-width: 0;
              height: 100%;
              border: none;
              outline: none;
              background-color: transparent;
              color: var(--vs-stk-text) !important;
              font-family: inherit;
              font-variant-numeric: tabular-nums;
              font-size: ${size === '1' ? '0.85rem' : size === '3' ? '1.05rem' : '0.95rem'} !important;
              font-weight: 500;
              padding: 0 4px 0 12px;
              text-align: right;
              width: 100%;
            }

            .vs-stock-input::placeholder {
              color: var(--gray-9) !important;
              opacity: 0.6;
            }

            .vs-stock-outline {
              background-color: ${typography?.background ? 'var(--vs-stk-bg)' : 'transparent'} !important;
              box-shadow: inset 0 0 0 1.5px ${hasError ? 'var(--red-9)' : 'var(--vs-stk-stroke)'} !important;
              border-radius: 6px !important;
            }
            .vs-stock-outline:focus-within {
              box-shadow: inset 0 0 0 2px ${hasError ? 'var(--red-9)' : 'var(--vs-stk-accent)'} !important;
            }

            .vs-stock-material {
              background-color: var(--vs-stk-bg) !important;
              box-shadow: 0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04) !important;
              border-radius: 4px !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'transparent'} !important;
            }
            .vs-stock-material:hover:not(:focus-within) {
              box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
            }
            .vs-stock-material:focus-within {
              box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'var(--vs-stk-accent)'} !important;
            }

            .vs-stock-neumorphic {
              background-color: var(--neu-bg) !important;
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light) !important;
              border: none !important;
              border-radius: 12px !important;
            }
            .vs-stock-neumorphic:focus-within {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
            }
            .vs-stock-neumorphic.vs-has-error {
              box-shadow: inset 2px 2px 5px rgba(255,0,0,0.2), inset -2px -2px 5px var(--neu-shadow-light) !important;
            }

            .vs-stock-readonly {
              opacity: 0.65;
              cursor: not-allowed !important;
            }
            .vs-stock-readonly input {
              cursor: not-allowed !important;
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

        <div
          onClick={() => !readOnly && inputRef.current?.focus()}
          className={`vs-stock-container size-${size} ${
            resolvedVariant.includes('material') ? 'vs-stock-material' : 
            resolvedVariant.includes('neumorphic') ? 'vs-stock-neumorphic' : 
            'vs-stock-outline'
          } ${hasError ? 'vs-has-error' : ''} ${readOnly ? 'vs-stock-readonly' : ''}`}
          style={neuVars}
        >
          <Badge
            size={size === "3" ? "3" : "2"}
            variant={resolvedVariant.includes('neumorphic') ? "surface" : "soft"}
            color="gray"
            className="vs-stock-badge"
            style={{
              backgroundColor: resolvedVariant.includes('neumorphic') 
                ? 'transparent' 
                : typography?.accent 
                  ? adjustColor(typography.accent, 85) 
                  : undefined,
              color: typography?.accent ? typography.accent : undefined,
              boxShadow: resolvedVariant.includes('neumorphic')
                ? '2px 2px 4px var(--neu-shadow-dark), -2px -2px 4px var(--neu-shadow-light)'
                : undefined,
            }}
          >
            {displayTicker ? displayTicker : <FaChartLine size={size === "3" ? 16 : 14} />}
          </Badge>

          <MaskedNumberInput
            inputRef={(el: HTMLInputElement) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            id={inputId}
            name={alias}
            className="vs-stock-input"
            mask={Number}
            scale={2}
            signed={false}
            thousandsSeparator=","
            padFractionalZeros={true}
            normalizeZeros={true}
            radix="."
            mapToRadix={['.']}
            value={fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : ''}
            unmask={true}
            onAccept={(val: string) => {
              setFieldValue(alias, val);
            }}
            onBlur={() => setFieldTouched(alias, true, false)}
            readOnly={readOnly}
            placeholder={placeholder}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            aria-labelledby={inputLabel ? labelId : undefined}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};