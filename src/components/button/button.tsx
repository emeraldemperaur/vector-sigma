import React, { useEffect, useRef, useState } from 'react';
import { Button, Text, Tooltip } from '@radix-ui/themes';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { adjustColor, getNearestParentBackground } from '../../utils/vinci';
import type { ButtonProps } from '@radix-ui/themes';
export type ButtonDesign = 'button' | 'button-material' | 'button-outline' | 'button-neumorphic';
import { MouseEventHandler } from 'react';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';

interface DesignButtonProps extends ButtonProps {
  inputtype?: ButtonDesign,
  alias: string, inputLabel?: string, icon?: React.ReactNode,
  width: number, defaultValue?: string, value: string, newRow?: boolean, 
  placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const xButton = ({ 
  inputtype = 'button',
  alias, readOnly, style, width, children, ...props 
}: DesignButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [neumorphicVars, setNeumorphicVars] = useState<React.CSSProperties>({});
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [handler] = useState<MouseEventHandler<HTMLButtonElement> | undefined>(props.onClick);
  
  useEffect(() => {
    if (inputtype === 'button-neumorphic' && buttonRef.current) {
      const parentBg = getNearestParentBackground(buttonRef.current.parentElement);
      setBgColor(parentBg);
      const shadowDark = adjustColor(parentBg, -30); 
      const shadowLight = adjustColor(parentBg, 30);

      setNeumorphicVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': shadowDark,
        '--neu-shadow-light': shadowLight,
      } as React.CSSProperties);
    }
  }, [inputtype]);

  const baseLayout: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px', // Space between icon and text
  };
  
  const materialStyle: React.CSSProperties = {
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
    boxShadow: '0 3px 5px rgba(0,0,0,0.2)',
    borderRadius: '4px',
    transition: 'transform 0.1s ease',
  };

  const outlineStyle: React.CSSProperties = {
    borderWidth: '2px', 
    fontWeight: 600,
    background: 'transparent',
  };

  const neumorphicStyle: React.CSSProperties = {
    // CSS variables injection
    backgroundColor: bgColor, 
    color: 'var(--gray-12)', // Default text color
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
    // The Standard State
    boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
    transition: 'all 0.2s ease-in-out',
  };

  const getVariantProps = () => {
    switch (inputtype) {
      case 'button':
        return { 
          variant: 'solid' as const, 
          style: { ...materialStyle, ...style } 
        };
      case 'button-material':
        return { 
          variant: 'solid' as const, 
          style: { ...materialStyle, ...style } 
        };
      case 'button-outline':
        return { 
          variant: 'outline' as const, 
          style: { ...outlineStyle, ...style } 
        };
      case 'button-neumorphic':
        return { 
          variant: 'ghost' as const,
          className: 'neumorphic-btn',
          // Merge custom vars with styles
          style: { ...neumorphicStyle, ...neumorphicVars, ...style } 
        };
      default:
        return { style: { ...baseLayout, ...style } };
    }
  };

  return (
    <>
    <Column span={width} newLine={props.newRow}>
      {inputtype === 'button-neumorphic' && (
        <style dangerouslySetInnerHTML={{__html: `
          .neumorphic-btn:active {
            box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
            transform: scale(0.98);
          }
          .neumorphic-btn:hover {
            transform: translateY(-2px);
          }
        `}} />
      )}

      <Button 
        name={alias}
        disabled={readOnly}
        id={`${alias}FormInput`}
        aria-describedby={`${alias}InputLabel`}
        ref={buttonRef} 
        onClick={handler}
        {...props} 
        {...getVariantProps()}
      >
        {props.icon && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {props.icon}
          </span>
        )}
        {children}
      </Button>
      <div>
            {props.isHinted ?
            <>
            <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                <Icon name='questionmarkcircled' height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                </a> 
            </Tooltip>
            </> : null} 

        </div>
    </Column>
    </>
  );
};


