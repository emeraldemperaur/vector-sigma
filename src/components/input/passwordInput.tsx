import React, { useState, useEffect, useRef, useId } from "react";
import { useFormikContext, getIn } from "formik";
import { Column } from "layouts/column/column";
import { TextField, Text, Tooltip, IconButton, Flex } from '@radix-ui/themes'; 
import { Icon } from "components/icons/icons";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import { xInputFieldProps } from "./input";
import '../../styles/main.scss';

/**
 * PasswordInput
 * @description A password input extension of the VectorSigma Input component.
 * Equipped with secure eye-toggle functionality, enterprise-grade aesthetics, 
 * typography overrides, and strict Formik integration.
 */
export const PasswordInput = ({
  alias,
  inputLabel,
  width, 
  readOnly = false,
  placeholder = '', 
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  typography,
  inputvariant = 'input-outline', 
  size = "2", 
  className, 
  style,
  formikContext,
  ...props 
}: xInputFieldProps) => {
    
  const [showPassword, setShowPassword] = useState(false);
  const toggleVisibility = () => setShowPassword(!showPassword);
  
  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`[VectorSigma]: PasswordInput '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
      return null;
  }

  const { values, touched, errors, handleChange, handleBlur } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const hasError = Boolean(fieldTouched && fieldError);
  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
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

  return (
    <Column span={width} newLine={newRow}>
      <Flex direction="column" gap="2" style={{ width: '100%', fontFamily: "'Libre Franklin', sans-serif", ...typographyVars, ...style }} ref={containerRef} className={className}>
        
        <style>
          {`
            .vs-pw-wrapper {
              width: 100%;
              transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .vs-pw-wrapper input {
              color: var(--vs-in-text) !important;
            }
            .vs-pw-wrapper input::placeholder {
              color: var(--gray-9) !important;
              opacity: 0.8;
            }

            .vs-pw-outline {
              background-color: ${typography?.background ? 'var(--vs-in-bg)' : 'transparent'} !important;
              box-shadow: inset 0 0 0 1.5px ${hasError ? 'var(--red-9)' : 'var(--vs-in-stroke)'} !important;
              border-radius: 6px !important;
            }
            .vs-pw-outline:focus-within {
              box-shadow: inset 0 0 0 2px ${hasError ? 'var(--red-9)' : 'var(--accent-9)'} !important;
            }

            .vs-pw-material {
              background-color: var(--vs-in-bg) !important;
              box-shadow: 0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04) !important;
              border-radius: 4px !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'transparent'} !important;
            }
            .vs-pw-material:focus-within {
              box-shadow: 0 4px 8px rgba(0,0,0,0.12) !important;
              border-bottom: 2px solid ${hasError ? 'var(--red-9)' : 'var(--accent-9)'} !important;
            }

            .vs-pw-neumorphic {
              background-color: var(--neu-bg) !important;
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light) !important;
              border: none !important;
              border-radius: 12px !important;
            }
            .vs-pw-neumorphic:focus-within {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
            }
            .vs-pw-neumorphic.vs-has-error {
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
          name={alias}
          value={fieldValue !== undefined && fieldValue !== null ? fieldValue : ''}
          onChange={handleChange}
          onBlur={handleBlur}
          size={size} 
          type={showPassword ? "text" : "password"} 
          id={inputId} 
          readOnly={readOnly} 
          aria-labelledby={inputLabel ? labelId : undefined}
          aria-describedby={hasError ? errorId : undefined}
          placeholder={placeholder} 
          variant="surface"
          autoComplete="off"
          className={`vs-pw-wrapper ${
            inputvariant.includes('material') ? 'vs-pw-material' : 
            inputvariant.includes('neumorphic') ? 'vs-pw-neumorphic' : 
            'vs-pw-outline'
          } ${hasError ? 'vs-has-error' : ''}`}
          style={neuVars}
          {...props} 
        >
          <TextField.Slot style={{ color: typography?.textColor || 'var(--gray-10)' }}>
               <Icon name="lockclosed" height="16" width="16" />
          </TextField.Slot>

          <TextField.Slot>
              <Tooltip content={showPassword ? "Hide password" : "Show password"}>
                  <IconButton 
                      size="1" 
                      variant="ghost" 
                      color="gray" 
                      onClick={toggleVisibility} 
                      type="button"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{ margin: 0, color: typography?.textColor || 'var(--gray-10)', opacity: 0.8, cursor: readOnly ? 'not-allowed' : 'pointer' }}
                  >
                      {showPassword ? (
                          <Icon name="eyeopen" height="16" width="16" />
                      ) : (
                          <Icon name="eyeclosed" height="16" width="16" />
                      )}
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