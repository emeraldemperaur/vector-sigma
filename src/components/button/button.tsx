import React, { useEffect, useRef, useState } from 'react';
import { Button, Tooltip, Flex } from '@radix-ui/themes';
import type { ButtonProps } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from '../../utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type ButtonDesign = 'button' | 'button-material' | 'button-outline' | 'button-neumorphic';

/**
 * DesignButtonProps Interface
 * @description Configuration properties for the VectorSigma Button component.
 * Equipped with enterprise-grade aesthetics, intelligent context-aware neumorphism, 
 * typography overrides, loading states, and advanced DX interaction handlers.
 */
export interface DesignButtonProps extends Omit<ButtonProps, 'onClick'> {
  /**
   * The design aesthetic of the Button component.
   * - `button-outline`: Minimalist, outlined aesthetic (Default).
   * - `button-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `button-neumorphic`: Soft-UI with extruded inset/outset shadows.
   * @default "button-outline"
   */
  inputtype?: ButtonDesign;

  /**
   * The unique identifier bridging the button to the form state or DOM ID.
   * @example "submit-form-action"
   */
  alias: string;

  /**
   * Optional ReactNode to render an icon alongside the button text.
   * Automatically vertically aligned.
   * @example <Icon name="stack" />
   */
  icon?: React.ReactNode;

  /**
   * Defines the responsive grid column span for the component (1-12).
   * @example 4
   */
  width: number;

  /**
   * Forces the component to break into a new Flex/Grid row within the layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Disables interaction, mutating the visual state to reflect read-only/disabled mode.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Triggers the loading state. Swaps content for a spinner while maintaining dimensions 
   * and automatically disables button interactions.
   * @default false
   */
  isLoading?: boolean;

  /**
   * Toggles the visibility of the contextual hint icon and tooltip below the button.
   * @default false
   */
  isHinted?: boolean;

  /**
   * The text payload displayed inside the Tooltip when `isHinted` is true.
   * @example "Clicking this will permanently delete the resource."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/actions"
   */
  hintUrl?: string;
  
  /**
   * Optional typographic color overrides. Allows explicit targeting of the button's
   * internal CSS color assignments regardless of the `inputtype` theme.
   */
  typography?: {
    /** Overrides the button's background fill color */
    background?: string;
    /** Overrides the button's border/stroke color */
    stroke?: string;
    /** Overrides the button's text/icon color */
    textColor?: string;
  };

  /**
   * Primary click event handler. Automatically prevented if `readOnly` or `isLoading` is true,
   * or if a `onLongClick` threshold was reached.
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Triggered when a user's pointer enters the button boundary.
   */
  onHover?: (event: React.PointerEvent<HTMLButtonElement>) => void;

  /**
   * Triggered when a user clicks and holds the button for longer than 600ms.
   * Useful for secondary actions or revealing context menus.
   */
  onLongClick?: (event: React.PointerEvent<HTMLButtonElement>) => void;
}

export const ButtonInput = ({ 
  inputtype = 'button-outline', 
  type = 'button',
  alias, 
  readOnly, 
  isLoading = false,
  style, 
  width, 
  children,
  newRow, 
  isHinted, 
  hintText, 
  hintUrl,
  typography,
  onClick,
  onHover,
  onLongClick,
  ...props 
}: DesignButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const [neumorphicVars, setNeumorphicVars] = useState<React.CSSProperties>({});
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  
  const isInteractive = !readOnly && !isLoading;

  useEffect(() => {
    if (inputtype === 'button-neumorphic' && buttonRef.current) {
      const parentBg = getNearestParentBackground(buttonRef.current.parentElement);
      const computedBg = typography?.background || parentBg;
      setBgColor(computedBg);
      
      const shadowDark = adjustColor(computedBg, -30); 
      const shadowLight = adjustColor(computedBg, 30);

      setNeumorphicVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': shadowDark,
        '--neu-shadow-light': shadowLight,
      } as React.CSSProperties);
    }
  }, [inputtype, typography?.background]);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    isLongPress.current = false;
    if (onLongClick && isInteractive) {
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        onLongClick(e);
      }, 600);
    }
  };

  const handlePointerUp = () => {
    if (longPressTimer.current !== null) clearTimeout(longPressTimer.current);
  };

  const handlePointerEnter = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isInteractive && onHover) onHover(e);
  };

  const handlePointerLeave = () => {
    if (longPressTimer.current !== null) clearTimeout(longPressTimer.current);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isInteractive) {
      e.preventDefault();
      return;
    }
    if (isLongPress.current) {
      e.preventDefault();
      return;
    }
    if (onClick) onClick(e);
  };

  const baseLayout: React.CSSProperties = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    cursor: isLoading ? 'wait' : (readOnly ? 'not-allowed' : 'pointer'),
    opacity: readOnly ? 0.6 : (isLoading ? 0.8 : 1),
  };
  
  const materialStyle: React.CSSProperties = {
    ...baseLayout,
    letterSpacing: '0.04em',
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
    borderRadius: '6px',
    backgroundColor: typography?.background,
    borderColor: typography?.stroke,
    color: typography?.textColor,
  };

  const outlineStyle: React.CSSProperties = {
    ...baseLayout,
    borderWidth: '1.5px', 
    fontWeight: 500,
    background: typography?.background || 'transparent',
    borderColor: typography?.stroke,
    color: typography?.textColor,
    borderRadius: '6px',
  };

  const neumorphicStyle: React.CSSProperties = {
    ...baseLayout,
    backgroundColor: bgColor, 
    color: typography?.textColor || 'var(--gray-12)', 
    border: typography?.stroke ? `1px solid ${typography.stroke}` : 'none',
    borderRadius: '12px',
    fontWeight: 500,
    boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
  };

  const getVariantProps = () => {
    switch (inputtype) {
      case 'button-material':
        return { 
          variant: 'solid' as const, 
          className: 'vs-btn-material',
          style: { ...materialStyle, ...style } 
        };
      case 'button-neumorphic':
        return { 
          variant: 'ghost' as const,
          className: 'vs-btn-neumorphic',
          style: { ...neumorphicStyle, ...neumorphicVars, ...style } 
        };
      case 'button-outline':
      case 'button':
      default:
        return { 
          variant: 'outline' as const, 
          className: 'vs-btn-outline',
          style: { ...outlineStyle, ...style } 
        };
    }
  };

  return (
    <Column span={width} newLine={newRow}>
      <style>
        {`
          .vs-btn-outline:not(:disabled):hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            background-color: ${typography?.background ? adjustColor(typography.background, -10) : 'var(--gray-3)'};
          }
          .vs-btn-outline:not(:disabled):active {
            transform: translateY(0px);
          }

          .vs-btn-material:not(:disabled):hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08);
          }
          .vs-btn-material:not(:disabled):active {
            transform: translateY(0px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }

          .vs-btn-neumorphic:not(:disabled):hover {
            transform: translateY(-2px);
          }
          .vs-btn-neumorphic:not(:disabled):active {
            box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
            transform: scale(0.98);
          }

          @keyframes vs-spin {
            100% { transform: rotate(360deg); }
          }
          .vs-loader-spinner {
            animation: vs-spin 1s linear infinite;
            position: absolute;
            left: 50%;
            top: 50%;
            margin-left: -9px;
            margin-top: -9px;
          }
        `}
      </style>

      <Flex 
        direction="column" 
        gap="2" 
        style={{ width: '100%', fontFamily: "'Libre Franklin', sans-serif", ...style }}
      >
        <Button 
          name={alias}
          disabled={!isInteractive}
          id={`${alias}FormInput`}
          aria-describedby={isHinted ? `${alias}InputHint` : undefined}
          ref={buttonRef} 
          type={type}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
          onPointerEnter={handlePointerEnter}
          {...props} 
          {...getVariantProps()}
        >
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.2s ease'
          }}>
            {props.icon && (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                {props.icon}
              </span>
            )}
            {children}
          </span>
          
          {isLoading && (
            <svg 
              className="vs-loader-spinner" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
        </Button>

        {isHinted && (
          <div style={{ alignSelf: 'flex-start', paddingLeft: '4px' }}>
            <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
              <a 
                id={`${alias}InputHint`}
                href={hintUrl || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Icon name='questionmarkcircled' height="15" width="15" style={{ cursor: 'pointer', color: 'var(--gray-9)', transition: 'color 0.2s' }} />
              </a> 
            </Tooltip>
          </div>
        )} 
      </Flex>
    </Column>
  );
};