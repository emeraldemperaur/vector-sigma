import React, { ReactNode, useEffect, useRef, useState } from "react";
import * as TogglePrimitive from '@radix-ui/react-toggle';
import { useField, useFormikContext } from 'formik';
import { Button, Text, Tooltip } from '@radix-ui/themes'; 
import type { ButtonProps } from '@radix-ui/themes';
import { adjustColor, getNearestParentBackground } from "utils/vinci"; // Assuming these exist per your previous code
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
  icon?: string;
  errorText?: ReactNode | string | null;
}

export const Toggle = ({
  inputtype = 'toggle-neumorphic',
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
  icon = 'stack',
  ...props
}: ToggleProps) => {
  
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({
      '--neu-bg': '#ecf0f3',
      '--neu-shadow-light': '#ffffff',
      '--neu-shadow-dark': '#d1d9e6'
  } as React.CSSProperties);

  useEffect(() => {
    if (inputtype === 'toggle-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      if (parentBg && parentBg !== 'transparent') {
          setNeuVars({
            '--neu-bg': parentBg,
            '--neu-shadow-dark': adjustColor(parentBg, -20), 
            '--neu-shadow-light': adjustColor(parentBg, 20), 
          } as React.CSSProperties);
      }
    }
  }, [inputtype]);

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

  const handleToggle = (val: boolean) => {
    if (!readOnly) {
        setFieldValue(alias, val);
        setFieldTouched(alias, true);
    }
  };

  return (
    <Column span={width} newLine={newRow}>
      <div ref={containerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        
        {inputtype === 'toggle-neumorphic' ? (
            <div 
                className="neu-toggle-wrapper"
                style={{ ...neuVars, opacity: readOnly ? 0.6 : 1, pointerEvents: readOnly ? 'none' : 'auto' }}
                onClick={() => handleToggle(!field.value)}
            >
                <style dangerouslySetInnerHTML={{__html: `
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
                    }
                    
                    /* The Input is hidden visually but keeps state for CSS selector */
                    .neu-toggle-state {
                        display: none;
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

                    /* Sibling selector triggers animation when checked */
                    .neu-toggle-state:checked ~ .neu-indicator {
                        transform: translate3d(25%, 0, 0);
                    }
                `}} />

                <input 
                    className="neu-toggle-state" 
                    type="checkbox" 
                    checked={!!field.value} 
                    readOnly 
                />
                <div className="neu-indicator"></div>
                <Icon name={icon}/>
            </div>
        ) : (
            <TogglePrimitive.Root
                pressed={field.value}
                onPressedChange={handleToggle}
                name={alias}
                disabled={readOnly}
                id={`${alias}FormInput`}
                aria-describedby={`${alias}InputLabel`}
                asChild
            >
                <Button
                    disabled={readOnly}
                    {...props}
                    className={`design-toggle ${inputtype} ${props.className || ''}`}
                    style={{
                        ...style,
                        ...(inputtype === 'toggle' ? materialStyle : {}),
                        ...(inputtype === 'toggle-material' ? materialStyle : {}),
                        ...(inputtype === 'toggle-outline' ? outlineStyle : {}),
                    }}
                    type="button" 
                >
                    <style dangerouslySetInnerHTML={{__html: `
                        /* Material States */
                        .design-toggle.toggle-material[data-state='on'] {
                            background-color: var(--accent-9);
                            color: white;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                        }
                        .design-toggle.toggle-material[data-state='off'] {
                            background-color: var(--gray-3);
                            color: var(--gray-11);
                        }
                        /* Outline States */
                        .design-toggle.toggle-outline[data-state='on'] {
                            border: 2px solid var(--accent-9);
                            color: var(--accent-9);
                            background-color: var(--accent-2);
                        }
                        .design-toggle.toggle-outline[data-state='off'] {
                            border: 1px solid var(--gray-7);
                            color: var(--gray-11);
                        }
                    `}} />
                    {children}
                </Button>
            </TogglePrimitive.Root>
        )}

        <div>
            {inputLabel && (
                <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
                    {inputLabel}
                </Text>
            )}
            &nbsp;
            {isHinted && (
                <Tooltip content={hintText || "No hint available"}>
                    <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6 }}>
                        <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                    </a> 
                </Tooltip>
            )} 

            {hasError && (
                <Text size="1" color="red" style={{ display: 'block', marginTop: 2 }}>
                    {props.errorText || `Required field`}
                </Text>
            )}
        </div>
      </div>
    </Column>
  );
};