import React, { ReactNode, useState, useMemo, useEffect, useRef, useId } from "react";
import { Column } from "layouts/column/column"; 
import { Text, Tooltip, Flex, Box } from '@radix-ui/themes';
import { FaCcVisa } from '@react-icons/all-files/fa/FaCcVisa';
import { FaCcMastercard } from '@react-icons/all-files/fa/FaCcMastercard';
import { FaCcAmex } from '@react-icons/all-files/fa/FaCcAmex';
import { FaCcDiscover } from '@react-icons/all-files/fa/FaCcDiscover';
import { FaCcDinersClub } from '@react-icons/all-files/fa/FaCcDinersClub';
import { FaCcJcb } from '@react-icons/all-files/fa/FaCcJcb';
import { FaCreditCard } from '@react-icons/all-files/fa/FaCreditCard';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import cardValidator from "card-validator";
import { IMaskInput } from 'react-imask';
import { Icon } from "components/icons/icons";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import { xInputFieldProps } from "./input";
import '../../styles/main.scss';

export type CreditCardDesign = "input" | "input-material" | "input-outline" | "input-neumorphic";

/**
 * CreditCardInputProps Interface
 * @description Configuration properties for the VectorSigma CreditCardInput component.
 * Equipped with automatic card scheme detection, dynamic I-Mask formatting (Amex/Visa/MC),
 * brand icon rendering, enterprise aesthetics (Outline, Material, Neumorphic), and Formik integration.
 */
export interface CreditCardInputProps extends Omit<xInputFieldProps, 'type' | 'inputtype'> {
  /**
   * The unique identifier bridging the input field to the Formik state.
   * Stores the unmasked, raw numerical string (e.g., "4111111111111111").
   * @example "customerCreditCardNumber"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the credit card input.
   * @example "Card Number"
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
   * Placeholder string displayed when no digits are entered.
   * Automatically adapts based on detected card scheme.
   * @default "0000 0000 0000 0000"
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
   * @example "We support Visa, Mastercard, American Express, and Discover."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/payments/security"
   */
  hintUrl?: string;

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid credit card number is required."
   */
  errorText?: ReactNode | string | null;

  /**
   * The design aesthetic of the CreditCardInput container.
   * - `input-outline`: Minimalist, outlined aesthetic (Default).
   * - `input-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `input-neumorphic`: Soft-UI with extruded inset shadows.
   * @default "input-outline"
   */
  inputvariant?: CreditCardDesign;

  /**
   * Alternative prop name matching standard VectorSigma prop conventions.
   */
  inputVariant?: CreditCardDesign;

  /**
   * Sizing scale for the input component (controls container height and inner padding).
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
    /** Overrides the text color of the typed card digits */
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

export const CreditCardInput = ({
  alias,
  inputLabel,
  width,
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
  ...props
}: CreditCardInputProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: CreditCardInput '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
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

  const cardInfo = useMemo(() => {
    return cardValidator.number(fieldValue || "");
  }, [fieldValue]);

  const cardType = cardInfo.card?.type;

  const maskPattern = useMemo(() => {
    if (cardType === 'american-express') return '0000 000000 00000';
    if (cardType === 'diners-club') return '0000 000000 0000';
    return '0000 0000 0000 0000';
  }, [cardType]);

  const defaultPlaceholder = useMemo(() => {
    if (cardType === 'american-express') return '0000 000000 00000';
    if (cardType === 'diners-club') return '0000 000000 0000';
    return '0000 0000 0000 0000';
  }, [cardType]);

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

  const getCardIcon = () => {
    switch (cardType) {
      case 'visa':
        return <FaCcVisa color="#1A1F71" size="24" title="Visa" />;
      case 'mastercard':
        return <FaCcMastercard color="#EB001B" size="24" title="Mastercard" />;
      case 'american-express':
        return <FaCcAmex color="#006FCF" size="24" title="American Express" />;
      case 'discover':
        return <FaCcDiscover color="#FF6000" size="24" title="Discover" />;
      case 'diners-club':
        return <FaCcDinersClub color="#0079BE" size="24" title="Diners Club" />;
      case 'jcb':
        return <FaCcJcb color="#0B4EA2" size="24" title="JCB" />;
      default:
        return <FaCreditCard color="var(--gray-8)" size="22" title="Credit Card" />;
    }
  };

  const typographyVars = {
    '--vs-cc-bg': typography?.background || 'var(--color-surface)',
    '--vs-cc-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-cc-text': typography?.textColor || 'var(--gray-12)',
    '--vs-cc-accent': typography?.accent || 'var(--accent-9)',
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
            .vs-card-container {
              position: relative;
              display: flex;
              align-items: center;
              width: 100%;
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
              box-sizing: border-box;
            }

            .vs-card-container.size-1 { height: 32px; padding: 0 10px; }
            .vs-card-container.size-2 { height: 40px; padding: 0 12px; }
            .vs-card-container.size-3 { height: 48px; padding: 0 16px; }

            .vs-card-input {
              flex: 1;
              min-width: 0;
              height: 100%;
              border: none;
              outline: none;
              background-color: transparent;
              color: var(--vs-cc-text) !important;
              font-family: var(--code-font-family, 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace) !important;
              font-size: ${size === '1' ? '0.85rem' : size === '3' ? '1.05rem' : '0.95rem'} !important;
              letter-spacing: 0.08em;
              padding: 0;
            }

            .vs-card-input::placeholder {
              color: var(--gray-9) !important;
              opacity: 0.6;
              letter-spacing: 0.06em;
            }

            .vs-card-icon-slot {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-left: 10px;
              flex-shrink: 0;
              transition: transform 0.2s ease, opacity 0.2s ease;
            }

            .vs-card-outline {
              background-color: ${typography?.background ? 'var(--vs-cc-bg)' : 'transparent'} !important;
              box-shadow: inset 0 0 0 1.5px ${hasError ? 'var(--red-9)' : 'var(--vs-cc-stroke)'} !important;
              border-radius: 6px !important;
            }
            .vs-card-outline:focus-within {
              box-shadow: inset 0 0 0 2px ${hasError ? 'var(--red-9)' : 'var(--vs-cc-accent)'} !important;
            }

            .vs-card-material {
              background-color: var(--vs-cc-bg) !important;
              box-shadow: 0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04) !important;
              border-radius: 4px !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'transparent'} !important;
            }
            .vs-card-material:hover:not(:focus-within) {
              box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
            }
            .vs-card-material:focus-within {
              box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'var(--vs-cc-accent)'} !important;
            }

            .vs-card-neumorphic {
              background-color: var(--neu-bg) !important;
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light) !important;
              border: none !important;
              border-radius: 12px !important;
            }
            .vs-card-neumorphic:focus-within {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
            }
            .vs-card-neumorphic.vs-has-error {
              box-shadow: inset 2px 2px 5px rgba(255,0,0,0.2), inset -2px -2px 5px var(--neu-shadow-light) !important;
            }

            .vs-card-readonly {
              opacity: 0.65;
              cursor: not-allowed !important;
            }
            .vs-card-readonly input {
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
          className={`vs-card-container size-${size} ${
            resolvedVariant.includes('material') ? 'vs-card-material' : 
            resolvedVariant.includes('neumorphic') ? 'vs-card-neumorphic' : 
            'vs-card-outline'
          } ${hasError ? 'vs-has-error' : ''} ${readOnly ? 'vs-card-readonly' : ''}`}
          style={neuVars}
        >
          <IMaskInput
            inputRef={(el: HTMLInputElement) => {
              (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
            }}
            id={inputId}
            name={alias}
            className="vs-card-input"
            mask={maskPattern}
            unmask={true}
            value={fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : ''}
            onAccept={(unmaskedVal: string) => {
              setFieldValue(alias, unmaskedVal);
            }}
            onBlur={() => setFieldTouched(alias, true, false)}
            readOnly={readOnly}
            placeholder={placeholder || defaultPlaceholder}
            inputMode="numeric"
            autoComplete="cc-number"
            spellCheck={false}
            aria-labelledby={inputLabel ? labelId : undefined}
            aria-describedby={hasError ? errorId : undefined}
            {...(props as any)}
          />

          <Box className="vs-card-icon-slot">
            {getCardIcon()}
          </Box>
        </div>

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "A valid card number is required")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};