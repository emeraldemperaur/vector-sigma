import React, { ReactNode, useEffect, useRef, useState } from "react";
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { Button, Text, Tooltip } from '@radix-ui/themes'; 
import type { ButtonProps } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import { Column } from "layouts/column/column";
import { Icon } from "components/icons/icons";
import '../../styles/main.scss';

export type ToggleDesign = 'toggle' | 'toggle-material' | 'toggle-outline' | 'toggle-neumorphic';

interface ToggleProps extends ButtonProps {
  inputtype?: ToggleDesign;
  pressed?: boolean; // Controlled state
  defaultPressed?: boolean; // Uncontrolled default
  onPressedChange?: (pressed: boolean) => void,
  alias: string, inputLabel?: string, icon?: React.ReactNode, width: number, 
  defaultValue?: string, value: string, newRow?: boolean, placeholder?: string, 
  readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const Toggle = ({
  inputtype = 'toggle',
  alias, readOnly, width,
  pressed,
  defaultPressed,
  onPressedChange,
  style,
  children,
  ...props
}: ToggleProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [neumorphicVars, setNeumorphicVars] = useState<React.CSSProperties>({});

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
        '--neu-active-color': 'var(--accent-9)', // ON
      } as React.CSSProperties);
    }
  }, [inputtype]);

  // --- STYLES ---

  // Material :: Ghost when OFF, Solid Color when ON
  const materialStyle: React.CSSProperties = {
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
    borderRadius: '4px',
    transition: 'all 0.2s ease',
  };

  // Outline :: Thin Grey when OFF, Thick Colored Border when ON
  const outlineStyle: React.CSSProperties = {
    fontWeight: 600,
    background: 'transparent',
    transition: 'all 0.1s ease',
  };

  // Neumorphic: 
  // OFF = Outset Shadow (Floating)
  // ON  = Inset Shadow (Pressed In) 
  const neumorphicStyle: React.CSSProperties = {
    backgroundColor: 'var(--neu-bg)',
    color: 'var(--neu-text)',
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
  };

  return (
    <Column span={width} newLine={props.newRow}>
    <TogglePrimitive.Root
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
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
        className={`design-toggle ${inputtype}`}
        style={{
          ...style,
          ...(inputtype === 'toggle' ? materialStyle : {}),
          ...(inputtype === 'toggle-material' ? materialStyle : {}),
          ...(inputtype === 'toggle-outline' ? outlineStyle : {}),
          ...(inputtype === 'toggle-neumorphic' ? { ...neumorphicStyle, ...neumorphicVars } : {}),
        }}
      >
        {/* Helper Style Block for States */}
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
          /* OFF State: Floating */
          .design-toggle.toggle-neumorphic[data-state='off'] {
             box-shadow: 6px 6px 12px var(--neu-shadow-dark), 
                         -6px -6px 12px var(--neu-shadow-light);
          }
          /* ON State: Pressed In (Inset) + Colored Text */
          .design-toggle.toggle-neumorphic[data-state='on'] {
             box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), 
                         inset -6px -6px 12px var(--neu-shadow-light);
             color: var(--neu-active-color); 
          }
          /* Hover Effect for Neumorphic */
          .design-toggle.toggle-neumorphic:hover {
            transform: translateY(-1px);
          }
        `}} />
        
        {children}
      </Button>
    </TogglePrimitive.Root>
    <div>
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{props.inputLabel}</Text>


            {props.isHinted ?
            <>
            <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                </a> 
            </Tooltip>
            </> : null} 

        </div>
    </Column>
  );
};