import React, { ReactNode, useEffect, useRef, useState } from "react";
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { useField, useFormikContext } from 'formik';
import { Button, Text, Tooltip } from '@radix-ui/themes'; 
import type { ButtonProps } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import { Column } from "layouts/column/column";
import { Icon } from "components/icons/icons";
import '../../styles/main.scss';

export type ToggleDesign = 'toggle' | 'toggle-material' | 'toggle-outline' | 'toggle-neumorphic';

interface ToggleProps extends ButtonProps {
  inputtype?: ToggleDesign;
  alias: string;
  inputLabel?: string;
  width: number;
  newRow?: boolean;
  readOnly?: boolean;
  isHinted?: boolean;
  hintText?: string;
  hintUrl?: string;
  errorText?: ReactNode | string | null
}

export const Toggle = ({
  inputtype = 'toggle-outline',
  alias, 
  readOnly, 
  width, 
  inputLabel,
  style,
  children,
  newRow,
  isHinted,
  hintText,
  hintUrl,
  ...props
}: ToggleProps) => {
  
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [neumorphicVars, setNeumorphicVars] = useState<React.CSSProperties>({});
  const errorId = `${alias}-error`;

  useEffect(() => {
    if (inputtype === 'toggle-neumorphic' && buttonRef.current) {
      const parentBg = getNearestParentBackground(buttonRef.current.parentElement);
      const shadowDark = adjustColor(parentBg, -30);
      const shadowLight = adjustColor(parentBg, 30);

      setNeumorphicVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': shadowDark,
        '--neu-shadow-light': shadowLight,
        '--neu-text': 'var(--gray-12)',
        '--neu-active-color': 'var(--accent-9)', 
      } as React.CSSProperties);
    }
  }, [inputtype]);

  // --- STYLES ---
  const materialStyle: React.CSSProperties = {
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  };

  const outlineStyle: React.CSSProperties = {
    fontWeight: 600,
    background: 'transparent',
    transition: 'all 0.1s ease',
  };

  const neumorphicStyle: React.CSSProperties = {
    backgroundColor: 'var(--neu-bg)',
    color: 'var(--neu-text)',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <Column span={width} newLine={newRow}>
      <TogglePrimitive.Root
        pressed={field.value}
        onPressedChange={(val) => {
            if (!readOnly) {
                setFieldValue(alias, val);
                setFieldTouched(alias, true);
            }
        }}
        name={alias}
        disabled={readOnly}
        id={`${alias}FormInput`}
        aria-describedby={`${alias}InputLabel`}
        asChild
      >
        <Button
          disabled={readOnly}
          ref={buttonRef}
          {...props}
          className={`design-toggle ${inputtype} ${props.className || ''}`}
          style={{
            ...style,
            ...(inputtype === 'toggle' ? materialStyle : {}),
            ...(inputtype === 'toggle-material' ? materialStyle : {}),
            ...(inputtype === 'toggle-outline' ? outlineStyle : {}),
            ...(inputtype === 'toggle-neumorphic' ? { ...neumorphicStyle, ...neumorphicVars } : {}),
          }}
          type="button" 
        >
          <style dangerouslySetInnerHTML={{__html: `
            /* --- MATERIAL --- */
            .design-toggle.toggle-material[data-state='on'] {
              background-color: var(--accent-9);
              color: white;
              box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            }
            .design-toggle.toggle-material[data-state='off'] {
              background-color: var(--gray-3);
              color: var(--gray-11);
            }

            /* --- OUTLINE --- */
            .design-toggle.toggle-outline[data-state='on'] {
              border: 2px solid var(--accent-9);
              color: var(--accent-9);
              background-color: var(--accent-2);
            }
            .design-toggle.toggle-outline[data-state='off'] {
              border: 1px solid var(--gray-7);
              color: var(--gray-11);
            }

            /* --- NEUMORPHIC --- */
            .design-toggle.toggle-neumorphic[data-state='off'] {
               box-shadow: 6px 6px 12px var(--neu-shadow-dark), 
                           -6px -6px 12px var(--neu-shadow-light);
            }
            .design-toggle.toggle-neumorphic[data-state='on'] {
               box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), 
                           inset -6px -6px 12px var(--neu-shadow-light);
               color: var(--neu-active-color); 
            }
            .design-toggle.toggle-neumorphic:hover {
              transform: translateY(-1px);
            }
          `}} />
          
          {children}
        </Button>
      </TogglePrimitive.Root>
      
      <div>
        {inputLabel && (
          <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
            {inputLabel}
          </Text>
        )}

        {isHinted && (
          <Tooltip content={hintText || "No hint available"}>
            <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6 }}>
              <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
            </a> 
          </Tooltip>
        )} 

        {hasError && (
            <Text id={errorId} size="1" color="red" style={{ display: 'block', marginTop: 2 }}>
                {props.errorText || `Required field`}
            </Text>
        )}
      </div>
    </Column>
  );
};