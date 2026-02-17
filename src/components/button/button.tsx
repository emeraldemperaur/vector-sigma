import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Button, Tooltip, Flex } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from '../../utils/vinci';
import type { ButtonProps } from '@radix-ui/themes';
export type ButtonDesign = 'button' | 'button-material' | 'button-outline' | 'button-neumorphic';
import { MouseEventHandler } from 'react';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export interface DesignButtonProps extends ButtonProps {
    /**
    * * The design variation of the Button input. 
    * Default: 'button-outline' 
    * Variants: 'button', 'button-outline', 'button-material', 'button-neumorphic'.
    * * @example
    * inputtype="button-neumorphic"
    */
  inputtype?: ButtonDesign & {};
  /**
    * * The required unique identifier for the input field in useFormikContext(). 
    * Alias referenced as `name` attribute and Formik state key.
    * * @example
    * alias="dontPushMe"
    */
  alias: string;
  /**
    * * Option to render Button input with icon passed as a ReactNode {}.
    * * @example
    * icon={<Icon name="stack"/>}
    */
  icon?: React.ReactNode;
   /**
    * * The required viewport column width for the Button input field.
    * i.e. 1 - 12
    * * @example
    * width={5}
    */
  width: number;
    /**
    * * Option to render Button input field on new row.
    * * @example
    * newRow
    */
  newRow?: boolean;
   /**
    * * Option to disable edits for Button input field.
    * * @example
    * readOnly
    */
  readOnly?: boolean;
  /**
    * * Option to enable a hint for Button input field.
    * * @example
    * isHinted
    */
  isHinted?: boolean;
    /**
    * * Option to specify hint text for Button input field.
    * * @example
    * hintText="This is a hint for a VΣ AvatarInput"
    */
  hintText?: string;
  /**
    * * Option to specify a hint url reference or resource for Button input field.
    * * @example
    * hintUrl="https://www.mekaegwim.ca"
    */
  hintUrl?: string;
   /**
    * * Option to inject onClick event handler function for Button input field.
    * * @example
    * onClick={() => { lesEnfantsTerribles() }}
    */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ButtonInput = ({ 
  inputtype = 'button-outline', type = 'button',
  alias, readOnly, style, width, children,
  newRow, isHinted, hintText, hintUrl,
  ...props 
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
    gap: '8px', 
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
    backgroundColor: bgColor, 
    color: 'var(--gray-12)', 
    border: 'none',
    borderRadius: '12px',
    fontWeight: 600,
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
          style: { ...neumorphicStyle, ...neumorphicVars, ...style } 
        };
      default:
        return { style: { ...baseLayout, ...style } };
    }
  };

  return (
    <Column span={width} newLine={newRow}>
      <Flex direction="column" gap="2" style={{ width: '100%' }}>
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
          type={type}
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

        {isHinted && (
          <div style={{ alignSelf: 'flex-start' }}>
            <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
              <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                <Icon name='questionmarkcircled' height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
              </a> 
            </Tooltip>
          </div>
        )} 
      </Flex>
    </Column>
  );
};