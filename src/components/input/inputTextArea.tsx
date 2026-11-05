import React, { useEffect, useRef, useState } from 'react';
import { TextArea as RadixTextArea, Text, Flex, Box } from '@radix-ui/themes';
import { useField } from 'formik';
import { Column } from '../../layouts/column/column';
import { adjustColor, getNearestParentBackground } from '../../utils/vinci';
import '../../styles/main.scss';

export type TextAreaDesign = 
  | 'textarea' 
  | 'textarea-outline' 
  | 'textarea-material' 
  | 'textarea-neumorphic';

/**
 * TextAreaProps Interface
 * @description Configuration properties for the VectorSigma TextArea component.
 * Provides a scalable multi-line text input with Formik binding and enterprise aesthetic variants.
 */
export interface TextAreaProps {
  /**
   * The unique data key referencing this field in the Formik state dictionary.
   * @example "systemPrompt"
   */
  alias: string;

  /**
   * Aesthetic design variant for the textarea.
   * - `textarea-outline`: Minimalist input with a hairline border (Default).
   * - `textarea-material`: Elevated surface with subtle shadows and focus ripples.
   * - `textarea-neumorphic`: Soft-UI inset extrusion matching parent background.
   * @default "textarea-outline"
   */
  inputtype?: TextAreaDesign;

  /**
   * Display label rendered above the textarea.
   * @example "Enter your detailed inquiry"
   */
  inputLabel?: string;

  /**
   * Helper text rendered inside the empty textarea.
   * @example "Type at least 500 words..."
   */
  placeholder?: string;

  /**
   * Overrides Formik validation errors with a bespoke hardcoded error string.
   */
  errorText?: string;

  /**
   * Disables user interaction and mutes the component's visual state.
   * @default false
   */
  readOnly?: boolean;

  /**
   * The default string value initialized into the form state.
   */
  defaultValue?: string;

  /**
   * Viewport column width span (1 - 12 based on the parent grid).
   * Automatically stacks to full-width on mobile screens.
   * @default 12
   */
  width?: number;

  /**
   * Forces the component to break into a new row within the form layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Base number of visible text lines.
   * @default 4
   */
  rows?: number;

  /**
   * Allows the user to manually resize the textarea vertically.
   * @default "vertical"
   */
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string;

  /**
   * Inline React CSS properties applied to the outermost wrapper.
   */
  style?: React.CSSProperties;
}

export const TextAreaInput = ({
  alias,
  inputtype = 'textarea-outline',
  inputLabel,
  placeholder,
  errorText,
  readOnly = false,
  defaultValue,
  width = 12,
  newRow,
  rows = 4,
  resize = 'vertical',
  className,
  style,
}: TextAreaProps) => {
  const [field, meta] = useField({ name: alias, defaultValue });
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  const isError = Boolean(meta.touched && (meta.error || errorText));
  const displayError = errorText || meta.error;

  const resolvedDesign = inputtype.replace('textarea-', '') as 'outline' | 'material' | 'neumorphic';
  const fallbackDesign = inputtype === 'textarea' 
    ? 'outline' 
    : (inputtype.replace('textarea-', '') as 'outline' | 'material' | 'neumorphic');

  useEffect(() => {
    if (fallbackDesign === 'neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = parentBg && parentBg !== 'transparent' ? parentBg : '#ecf0f3';
      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -15),
        '--neu-shadow-light': adjustColor(computedBg, 15),
      } as React.CSSProperties);
    }
  }, [fallbackDesign]);

  return (
    <Column span={width} newLine={newRow}>
      <Box 
        ref={containerRef} 
        className={`vs-textarea-wrapper ${className || ''}`} 
        style={{ width: '100%', fontFamily: "'Libre Franklin', sans-serif", ...neuVars, ...style }}
      >
        <style>
          {`
            .vs-textarea-base {
              width: 100%;
              transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .vs-textarea-base textarea {
              resize: ${resize};
              font-family: inherit;
            }
            
            /* Outline Variant */
            .vs-textarea-outline {
              --text-area-border-width: 1.5px;
            }

            /* Material Variant */
            .vs-textarea-material {
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
              background-color: var(--color-surface);
            }
            .vs-textarea-material:focus-within {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 2px var(--accent-a4);
              transform: translateY(-1px);
            }

            /* Neumorphic Variant */
            .vs-textarea-neumorphic {
              border: none !important;
              background-color: var(--neu-bg) !important;
              border-radius: 12px;
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light);
            }
            .vs-textarea-neumorphic:focus-within {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light), 0 0 0 2px var(--accent-a4);
            }
            .vs-textarea-neumorphic textarea {
              background-color: transparent !important;
              box-shadow: none !important;
            }

            /* Error States */
            .vs-textarea-error.vs-textarea-outline {
              --text-area-border-color: var(--tomato-8);
              --text-area-focus-border-color: var(--tomato-9);
            }
            .vs-textarea-error.vs-textarea-material {
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 0 0 1.5px var(--tomato-8);
            }
            .vs-textarea-error.vs-textarea-neumorphic {
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light), 0 0 0 1.5px var(--tomato-8);
            }

            /* ReadOnly/Disabled States */
            .vs-textarea-base[data-readonly="true"] {
              opacity: 0.65;
              cursor: not-allowed;
            }
            .vs-textarea-base[data-readonly="true"] textarea {
              cursor: not-allowed;
            }
          `}
        </style>

        <Flex direction="column" gap="2" width="100%">
          {inputLabel && (
            <Text 
              as="label" 
              htmlFor={`${alias}FormInput`} 
              size="2" 
              weight="medium" 
              style={{ color: isError ? 'var(--tomato-11)' : 'var(--gray-11)', paddingLeft: '2px' }}
            >
              {inputLabel}
            </Text>
          )}

          <RadixTextArea
            {...field}
            id={`${alias}FormInput`}
            size="2"
            variant={fallbackDesign === 'outline' ? 'surface' : 'soft'}
            placeholder={placeholder}
            rows={rows}
            readOnly={readOnly}
            className={`vs-textarea-base vs-textarea-${fallbackDesign} ${isError ? 'vs-textarea-error' : ''}`}
            data-readonly={readOnly}
            style={{ 
              width: '100%',
              backgroundColor: fallbackDesign === 'material' ? 'var(--color-surface)' : undefined
            }}
          />

          {isError && displayError && (
            <Text 
              size="1" 
              style={{ 
                color: 'var(--tomato-11)', 
                marginTop: '2px',
                paddingLeft: '2px',
                animation: 'vsFadeIn 0.2s ease-in-out' 
              }}
            >
              {displayError}
            </Text>
          )}
        </Flex>
      </Box>
    </Column>
  );
};