import React, { ReactNode, useEffect, useRef, useState, useId } from "react";
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Button, Text, Tooltip, Flex } from '@radix-ui/themes'; 
import type { ButtonProps } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import { Column } from "layouts/column/column";
import { Icon } from "components/icons/icons";
import '../../styles/main.scss';

export type ToggleDesign = 
  | 'toggle' 
  | 'toggle-material' 
  | 'toggle-outline' 
  | 'toggle-neumorphic';

/**
 * ToggleProps Interface
 * @description Configuration properties for the VectorSigma Toggle component.
 * Features an extruded tactile Neumorphic pill switch (default), alongside 
 * Material and minimalist Outline button/switch modes.
 * Fully integrated with Formik boolean schemas (`Yup.boolean()`) and Libre Franklin typography.
 */
export interface ToggleProps extends Omit<ButtonProps, 'onChange'> {
  /**
   * The required unique identifier for the Toggle field in Formik context.
   * Alias referenced as `name` attribute and Formik boolean state key.
   * @example "enableAiInsights"
   */
  alias: string;

  /**
   * The design aesthetic of the Toggle input field.
   * - `toggle-neumorphic`: Tactile extruded soft-UI switch pill (Default).
   * - `toggle-outline`: Minimalist bordered toggle with accent fill on active.
   * - `toggle-material`: Elevated solid surface with drop-shadow state.
   * @default "toggle-neumorphic"
   */
  inputtype?: ToggleDesign;

  /**
   * Alternative prop name matching standard VectorSigma prop conventions.
   */
  inputvariant?: ToggleDesign;

  /**
   * The primary semantic label rendered above the Toggle field.
   * @example "Enable Real-time Copilot"
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
   * Disables interaction, mutating visual state to reflect read-only mode.
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
   * @example "Enables LLM telemetry streaming across all workflow nodes."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/settings/copilot"
   */
  hintUrl?: string;

  /**
   * Name of the icon rendered alongside the toggle control.
   * Dynamically shifts color when toggled on/off.
   * @default "layers"
   * @example "sun"
   * @example "zap"
   */
  icon?: string;

  /**
   * Optional custom JSX icon to render alongside the toggle switch.
   * Overrides string `icon` when provided.
   */
  customIcon?: React.ReactNode;

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "You must accept the telemetry terms to proceed."
   */
  errorText?: ReactNode | string | null;

  /**
   * Sizing scale for the toggle control.
   * @default "2"
   */
  size?: "1" | "2" | "3";

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the toggle pill or button surface */
    background?: string;
    /** Overrides the border/stroke color */
    stroke?: string;
    /** Overrides the text color of the label and button copy */
    textColor?: string;
    /** Overrides the accent active state indicator color */
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

export const Toggle = ({
  inputtype = 'toggle-neumorphic',
  inputvariant,
  alias,
  readOnly = false,
  width,
  inputLabel,
  style,
  children,
  newRow,
  isHinted,
  hintText,
  hintUrl,
  errorText,
  icon = 'layers',
  customIcon,
  size = "2",
  typography,
  className,
  formikContext,
  ...props
}: ToggleProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: Toggle '${alias}' must be used within a Formik context provider or receive a formikContext prop.`);
    return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;
  const fieldValue = Boolean(getIn(values, alias) || false);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);
  const hasError = Boolean(fieldTouched && fieldError);

  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const labelId = `${alias}InputLabel`;
  const errorId = `${alias}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedVariant = inputvariant || inputtype || 'toggle-neumorphic';

  const [neuVars, setNeuVars] = useState<React.CSSProperties>({
    '--neu-bg': '#ecf0f3',
    '--neu-shadow-light': '#ffffff',
    '--neu-shadow-dark': '#d1d9e6'
  } as React.CSSProperties);

  useEffect(() => {
    if (resolvedVariant === 'toggle-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = typography?.background || (parentBg && parentBg !== 'transparent' ? parentBg : '#ecf0f3');
      
      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -20),
        '--neu-shadow-light': adjustColor(computedBg, 20),
      } as React.CSSProperties);
    }
  }, [resolvedVariant, typography?.background]);

  const handleToggle = (val: boolean) => {
    if (!readOnly) {
      setFieldValue(alias, val);
      setFieldTouched(alias, true, false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle(!fieldValue);
    }
  };

  const typographyVars = {
    '--vs-tog-bg': typography?.background || 'var(--color-surface)',
    '--vs-tog-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-tog-text': typography?.textColor || 'var(--gray-12)',
    '--vs-tog-accent': typography?.accent || 'var(--accent-9)',
  } as React.CSSProperties;

  const iconColor = fieldValue && !readOnly 
    ? (typography?.accent || 'var(--accent-9)') 
    : 'var(--gray-8)';

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
           
            .neu-toggle-wrapper {
              isolation: isolate;
              position: relative;
              height: 30px;
              width: 60px;
              border-radius: 15px;
              overflow: hidden;
              cursor: pointer;
              background: var(--neu-bg);
              box-shadow:
                -8px -4px 8px 0px var(--neu-shadow-light),
                8px 4px 12px 0px var(--neu-shadow-dark),
                4px 4px 4px 0px var(--neu-shadow-dark) inset,
                -4px -4px 4px 0px var(--neu-shadow-light) inset;
              transition: opacity 0.2s ease, box-shadow 0.2s ease;
              flex-shrink: 0;
            }

            .neu-toggle-wrapper:focus-visible {
              outline: none;
              box-shadow:
                -8px -4px 8px 0px var(--neu-shadow-light),
                8px 4px 12px 0px var(--neu-shadow-dark),
                4px 4px 4px 0px var(--neu-shadow-dark) inset,
                -4px -4px 4px 0px var(--neu-shadow-light) inset,
                0 0 0 2px var(--vs-tog-accent);
            }

            .neu-toggle-wrapper.vs-has-error {
              box-shadow:
                -8px -4px 8px 0px var(--neu-shadow-light),
                8px 4px 12px 0px var(--neu-shadow-dark),
                4px 4px 4px 0px rgba(255, 0, 0, 0.3) inset,
                -4px -4px 4px 0px var(--neu-shadow-light) inset;
            }

            .neu-toggle-state {
              position: absolute;
              opacity: 0;
              width: 0;
              height: 0;
              margin: 0;
              pointer-events: none;
            }

            .neu-indicator {
              height: 100%;
              width: 200%;
              background: var(--neu-bg);
              border-radius: 15px;
              transform: translate3d(-75%, 0, 0);
              transition: transform 0.4s cubic-bezier(0.85, 0.05, 0.18, 1.35);
              box-shadow:
                -8px -4px 8px 0px var(--neu-shadow-light),
                8px 4px 12px 0px var(--neu-shadow-dark);
            }

            .neu-toggle-state:checked ~ .neu-indicator {
              transform: translate3d(25%, 0, 0);
            }

            .design-toggle.toggle-material {
              font-family: inherit;
              font-weight: 500;
              border-radius: 6px;
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
              cursor: pointer;
            }
            .design-toggle.toggle-material[data-state='off'] {
              background-color: var(--vs-tog-bg) !important;
              color: var(--vs-tog-text) !important;
              box-shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04) !important;
              border: 1px solid var(--vs-tog-stroke) !important;
            }
            .design-toggle.toggle-material[data-state='off']:hover:not(:disabled) {
              box-shadow: 0 3px 6px rgba(0,0,0,0.12) !important;
              transform: translateY(-0.5px);
            }
            .design-toggle.toggle-material[data-state='on'] {
              background-color: var(--vs-tog-accent) !important;
              color: #ffffff !important;
              box-shadow: 0 4px 12px rgba(0,0,0,0.16) !important;
              border: 1px solid transparent !important;
            }

       
            .design-toggle.toggle-outline {
              font-family: inherit;
              font-weight: 500;
              border-radius: 6px;
              transition: all 0.15s ease;
              cursor: pointer;
            }
            .design-toggle.toggle-outline[data-state='off'] {
              background-color: transparent !important;
              border: 1.5px solid ${hasError ? 'var(--red-9)' : 'var(--vs-tog-stroke)'} !important;
              color: var(--vs-tog-text) !important;
            }
            .design-toggle.toggle-outline[data-state='off']:hover:not(:disabled) {
              border-color: var(--vs-tog-accent) !important;
              color: var(--vs-tog-accent) !important;
            }
            .design-toggle.toggle-outline[data-state='on'] {
              border: 1.5px solid var(--vs-tog-accent) !important;
              color: var(--vs-tog-accent) !important;
              background-color: var(--accent-a3) !important;
            }
          `}
        </style>

        {(inputLabel || isHinted) && (
          <Flex align="center" gap="2" style={{ paddingLeft: '2px' }}>
            {inputLabel && (
              <Text 
                id={labelId} 
                as="label" 
                size="2" 
                weight="medium" 
                style={{ color: 'var(--gray-11)', cursor: readOnly ? 'default' : 'pointer' }} 
                htmlFor={inputId}
              >
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

        {resolvedVariant === 'toggle-neumorphic' ? (
          <Flex align="center" gap="3" style={{ minHeight: '32px' }}>
            <div 
              className={`neu-toggle-wrapper ${hasError ? 'vs-has-error' : ''}`}
              style={{ 
                ...neuVars, 
                opacity: readOnly ? 0.6 : 1, 
                cursor: readOnly ? 'not-allowed' : 'pointer' 
              }}
              onClick={() => handleToggle(!fieldValue)}
              onKeyDown={handleKeyDown}
              role="switch"
              tabIndex={readOnly ? -1 : 0}
              aria-checked={fieldValue}
              aria-labelledby={inputLabel ? labelId : undefined}
              aria-describedby={hasError ? errorId : undefined}
            >
              <input 
                id={inputId}
                name={alias}
                className="neu-toggle-state" 
                type="checkbox" 
                checked={fieldValue} 
                onChange={() => {}} 
                tabIndex={-1}
                aria-hidden="true"
              />
              <div className="neu-indicator" />
            </div>

            {customIcon ? (
              <span 
                onClick={() => handleToggle(!fieldValue)} 
                style={{ cursor: readOnly ? 'default' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                {customIcon}
              </span>
            ) : (
              <Icon 
                name={icon} 
                height="20" 
                width="20" 
                color={iconColor}
                style={{ 
                  transition: 'color 0.3s ease',
                  opacity: readOnly ? 0.5 : 1, 
                  cursor: readOnly ? 'default' : 'pointer'
                }}
                onClick={() => handleToggle(!fieldValue)}
              />
            )}

            {children && (
              <Text 
                size="2" 
                weight={fieldValue ? "medium" : "regular"}
                style={{ cursor: readOnly ? 'default' : 'pointer', userSelect: 'none', color: 'var(--vs-tog-text)' }}
                onClick={() => handleToggle(!fieldValue)}
              >
                {children}
              </Text>
            )}
          </Flex>
        ) : (
          <TogglePrimitive.Root
            pressed={fieldValue}
            onPressedChange={handleToggle}
            name={alias}
            disabled={readOnly}
            id={inputId}
            aria-labelledby={inputLabel ? labelId : undefined}
            aria-describedby={hasError ? errorId : undefined}
            asChild
          >
            <Button
              disabled={readOnly}
              size={size}
              {...props}
              className={`design-toggle ${resolvedVariant} ${className || ''}`}
              style={{
                fontFamily: 'inherit',
                width: 'fit-content',
                ...style,
              }}
              type="button" 
            >
              <Flex align="center" gap="2">
                {customIcon ? customIcon : icon ? <Icon name={icon} height="16" width="16" /> : null}
                {children ? children : (fieldValue ? 'Enabled' : 'Disabled')}
              </Flex>
            </Button>
          </TogglePrimitive.Root>
        )}

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "A selection is required")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};