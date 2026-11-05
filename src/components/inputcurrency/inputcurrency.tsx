import React, { ReactNode, useEffect, useRef, useState, useId, useMemo } from "react";
import { CURRENCIES, SupportedCurrency, CurrencyOption } from '../../utils/currencyconfig'; 
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, Select, Tooltip, Box } from '@radix-ui/themes';
import { IMaskInput } from 'react-imask';
import { FlagIcon } from "components/icons/flagicon";
import { Icon } from "components/icons/icons";
import { Column } from "layouts/column/column";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import '../../styles/main.scss';

const MaskedNumberInput = IMaskInput as React.ComponentType<any>;

export type CurrencyInputDesign = "input" | "input-material" | "input-outline" | "input-neumorphic";

/**
 * CurrencyInputProps Interface
 * @description Configuration properties for the VectorSigma CurrencyInput component.
 * Equipped with multi-currency ISO selection, dynamic fractional scaling, localized separators,
 * enterprise-grade aesthetics (Outline, Material, Neumorphic), and dual Formik state bindings.
 */
export interface CurrencyInputProps {
  /**
   * The required unique identifier for the numerical currency amount in Formik context.
   * Also binds `${alias}Currency` for the selected ISO 4217 currency code.
   * @example "productSKUPrice"
   */
  alias: string;

  /**
   * The currency operation mode or fixed currency code.
   * When set to `"currency"` (default), renders an interactive dropdown of all supported currencies.
   * When set to a specific currency (e.g. `"USD"`, `"EUR"`), locks the dropdown to that currency.
   * @default "currency"
   */
  inputtype?: SupportedCurrency | "currency";

  /**
   * The primary semantic label rendered above the CurrencyInput component.
   * @example "Unit Price (MSRP)"
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
   * The default ISO currency code selected if no Formik value is present.
   * @default "USD"
   */
  defaultvalue?: SupportedCurrency | string;

  /**
   * Placeholder numerical string displayed when the input field is empty.
   * @default "0.00"
   */
  placeholder?: string;

  /**
   * Disables interaction across both the currency selector and the numerical input.
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
   * @example "Prices are converted using real-time mid-market FX rates."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/billing/currencies"
   */
  hintUrl?: string;

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid purchase price is required."
   */
  errorText?: ReactNode | string | null;

  /**
   * The aesthetic design language of the CurrencyInput container.
   * - `input-outline`: Minimalist, outlined aesthetic (Default).
   * - `input-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `input-neumorphic`: Soft-UI with extruded inset shadows.
   * @default "input-outline"
   */
  inputvariant?: CurrencyInputDesign;

  /**
   * Alternative prop name matching standard VectorSigma prop conventions.
   */
  inputVariant?: CurrencyInputDesign;

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
    /** Overrides the background color of the input strut and dropdown */
    background?: string;
    /** Overrides the border/stroke color of the container and separators */
    stroke?: string;
    /** Overrides the text color of the entered monetary amount */
    textColor?: string;
    /** Overrides the accent focus ring color */
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

export const CurrencyInput = ({
  alias,
  inputtype = "currency",
  inputLabel,
  width,
  defaultvalue = "USD",
  placeholder,
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
}: CurrencyInputProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: CurrencyInput '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
    return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const currencyAlias = `${alias}Currency`;
  const amountFieldValue = getIn(values, alias);
  const amountFieldTouched = getIn(touched, alias);
  const amountFieldError = getIn(errors, alias);
  const currencyFieldValue = getIn(values, currencyAlias);

  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const labelId = `${alias}InputLabel`;
  const errorId = `${alias}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  const resolvedVariant = inputvariant || inputVariant || 'input-outline';

  useEffect(() => {
    if (inputtype !== "currency" && CURRENCIES[inputtype as SupportedCurrency]) {
      setFieldValue(currencyAlias, inputtype);
    } else if (!currencyFieldValue) {
      setFieldValue(currencyAlias, defaultvalue);
    }
  }, [inputtype, defaultvalue, currencyFieldValue, currencyAlias, setFieldValue]);

  const hasError = Boolean(amountFieldTouched && amountFieldError);
  const currentCode = (currencyFieldValue as SupportedCurrency) || (defaultvalue as SupportedCurrency) || "USD";
  const activeCurrency: CurrencyOption = useMemo(() => {
    return CURRENCIES[currentCode] || CURRENCIES.USD;
  }, [currentCode]);

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
    '--vs-cur-bg': typography?.background || 'var(--color-surface)',
    '--vs-cur-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-cur-text': typography?.textColor || 'var(--gray-12)',
    '--vs-cur-accent': typography?.accent || 'var(--accent-9)',
  } as React.CSSProperties;

  const isCurrencyLocked = readOnly || inputtype !== "currency";

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
            .vs-currency-container {
              position: relative;
              display: flex;
              align-items: center;
              width: 100%;
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
              box-sizing: border-box;
              overflow: hidden;
            }

            .vs-currency-container.size-1 { height: 32px; }
            .vs-currency-container.size-2 { height: 40px; }
            .vs-currency-container.size-3 { height: 48px; }

            .vs-currency-trigger {
              height: 100% !important;
              padding: 0 10px 0 12px !important;
              display: inline-flex !important;
              align-items: center !important;
              gap: 6px !important;
              border-radius: 0 !important;
              border: none !important;
              border-right: 1px solid var(--vs-cur-stroke) !important;
              background-color: transparent !important;
              color: var(--vs-cur-text) !important;
              cursor: ${isCurrencyLocked ? 'not-allowed' : 'pointer'} !important;
              flex-shrink: 0 !important;
              transition: background-color 0.15s ease;
            }

            .vs-currency-trigger:not(:disabled):hover {
              background-color: var(--gray-3) !important;
            }

            .vs-currency-symbol {
              padding: 0 4px 0 12px;
              color: var(--gray-9);
              font-weight: 500;
              user-select: none;
              flex-shrink: 0;
            }

            .vs-currency-input {
              flex: 1;
              min-width: 0;
              height: 100%;
              border: none;
              outline: none;
              background-color: transparent;
              color: var(--vs-cur-text) !important;
              font-family: inherit;
              font-variant-numeric: tabular-nums;
              font-size: ${size === '1' ? '0.85rem' : size === '3' ? '1.05rem' : '0.95rem'} !important;
              font-weight: 500;
              padding: 0 14px 0 4px;
              text-align: right;
              width: 100%;
            }

            .vs-currency-input::placeholder {
              color: var(--gray-9) !important;
              opacity: 0.6;
            }

            .vs-currency-outline {
              background-color: ${typography?.background ? 'var(--vs-cur-bg)' : 'transparent'} !important;
              box-shadow: inset 0 0 0 1.5px ${hasError ? 'var(--red-9)' : 'var(--vs-cur-stroke)'} !important;
              border-radius: 6px !important;
            }
            .vs-currency-outline:focus-within {
              box-shadow: inset 0 0 0 2px ${hasError ? 'var(--red-9)' : 'var(--vs-cur-accent)'} !important;
            }

            .vs-currency-material {
              background-color: var(--vs-cur-bg) !important;
              box-shadow: 0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04) !important;
              border-radius: 4px !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'transparent'} !important;
            }
            .vs-currency-material:hover:not(:focus-within) {
              box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
            }
            .vs-currency-material:focus-within {
              box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'var(--vs-cur-accent)'} !important;
            }

            .vs-currency-neumorphic {
              background-color: var(--neu-bg) !important;
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light) !important;
              border: none !important;
              border-radius: 12px !important;
            }
            .vs-currency-neumorphic:focus-within {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
            }
            .vs-currency-neumorphic.vs-has-error {
              box-shadow: inset 2px 2px 5px rgba(255,0,0,0.2), inset -2px -2px 5px var(--neu-shadow-light) !important;
            }

            .vs-currency-readonly {
              opacity: 0.65;
              cursor: not-allowed !important;
            }
            .vs-currency-readonly input {
              cursor: not-allowed !important;
            }

            @keyframes vs-cur-dropdown-enter {
              from { opacity: 0; transform: scale(0.96) translateY(-4px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes vs-cur-dropdown-exit {
              from { opacity: 1; transform: scale(1) translateY(0); }
              to { opacity: 0; transform: scale(0.96) translateY(-4px); }
            }

            .vs-currency-select-content[data-state="open"] {
              animation: vs-cur-dropdown-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              transform-origin: top left;
            }
            .vs-currency-select-content[data-state="closed"] {
              animation: vs-cur-dropdown-exit 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
              transform-origin: top left;
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
          className={`vs-currency-container size-${size} ${
            resolvedVariant.includes('material') ? 'vs-currency-material' : 
            resolvedVariant.includes('neumorphic') ? 'vs-currency-neumorphic' : 
            'vs-currency-outline'
          } ${hasError ? 'vs-has-error' : ''} ${readOnly ? 'vs-currency-readonly' : ''}`}
          style={neuVars}
        >
          <Select.Root
            value={activeCurrency.code}
            name={currencyAlias}
            onValueChange={(val) => {
              setFieldValue(currencyAlias, val);
              setFieldTouched(currencyAlias, true, false);
            }}
            disabled={isCurrencyLocked}
          >
            <Select.Trigger
              id={`${alias}CurrencySelect`}
              variant="ghost"
              className="vs-currency-trigger"
              aria-label="Select Currency"
            >
              <Flex align="center" gap="2">
                <FlagIcon country={activeCurrency.country} />
                <Text weight="medium" size="2">{activeCurrency.code}</Text>
                {!isCurrencyLocked && (
                  <Icon name="caretdown" style={{ width: "12px", opacity: 0.5 }} />
                )}
              </Flex>
            </Select.Trigger>

            <Select.Content
              position="popper"
              sideOffset={5}
              className="vs-currency-select-content"
              style={{
                minWidth: '220px',
                maxHeight: '300px',
                fontFamily: "'Libre Franklin', sans-serif",
                backgroundColor: resolvedVariant.includes('neumorphic') ? 'var(--neu-bg)' : 'var(--vs-cur-bg)',
                border: resolvedVariant.includes('neumorphic') ? 'none' : '1px solid var(--vs-cur-stroke)',
                borderRadius: resolvedVariant.includes('neumorphic') ? '12px' : '8px',
                boxShadow: resolvedVariant.includes('neumorphic') 
                  ? '8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light)'
                  : '0 10px 30px -10px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.1)',
                ...neuVars
              }}
            >
              {Object.values(CURRENCIES).map((c: CurrencyOption) => (
                <Select.Item 
                  key={c.code} 
                  value={c.code}
                  style={{ cursor: 'pointer', borderRadius: '4px', padding: '6px 10px' }}
                >
                  <Flex align="center" gap="2" justify="between" style={{ width: '100%' }}>
                    <Flex align="center" gap="2">
                      <FlagIcon country={c.country} />
                      <Text weight="medium">{c.code}</Text>
                    </Flex>
                    <Text color="gray" size="1">({c.symbol})</Text>
                  </Flex>
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Text size="2" className="vs-currency-symbol">
            {activeCurrency.symbol}
          </Text>

          <MaskedNumberInput
            inputRef={(el: HTMLInputElement) => {
              (inputRef as React.RefObject<HTMLInputElement | null>).current = el;
            }}
            id={inputId}
            name={alias}
            className="vs-currency-input"
            mask={Number}
            scale={activeCurrency.scale ?? 2}
            signed={false}
            thousandsSeparator=","
            padFractionalZeros={true}
            normalizeZeros={true}
            radix="."
            mapToRadix={['.']}
            value={amountFieldValue !== undefined && amountFieldValue !== null ? String(amountFieldValue) : ''}
            unmask={true}
            onAccept={(val: string) => {
              setFieldValue(alias, val);
            }}
            onBlur={() => setFieldTouched(alias, true, false)}
            readOnly={readOnly}
            placeholder={placeholder || (activeCurrency.scale === 0 ? '0' : '0.00')}
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            aria-labelledby={inputLabel ? labelId : undefined}
            aria-describedby={hasError ? errorId : undefined}
          />
        </div>

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof amountFieldError === 'string' ? amountFieldError : "Required field")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};