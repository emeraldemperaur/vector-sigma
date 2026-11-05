import React, { useRef, useState, useEffect, ReactNode, useMemo, useId } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Box, Flex, Text, IconButton, Tooltip } from '@radix-ui/themes';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type AvatarDesign = 'avatar' | 'avatar-outline' | 'avatar-material' | 'avatar-neumorphic';
export type AvatarShape = 'circle' | 'square' | 'rounded' | 'hexagon';

/**
 * AvatarProps Interface
 * @description Configuration properties for the VectorSigma AvatarInput component.
 */
export interface AvatarProps {
  /**
   * The aesthetic design language of the Avatar component.
   * - `avatar-outline`: Minimalist, outlined aesthetic (Default).
   * - `avatar-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `avatar-neumorphic`: Soft-UI with extruded inset/outset shadows.
   * @default "avatar-outline"
   */
  inputtype?: AvatarDesign;

  /**
   * The unique identifier bridging the input field to the Formik state.
   * Must exactly match the schema property key.
   * @example "userProfileImage"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the Avatar component.
   * @example "Upload Organization Logo"
   */
  inputLabel?: string;

  /**
   * Defines the responsive grid column span for the component (1-12 based on the parent grid).
   * @example 4
   */
  width: number; 

  /**
   * Forces the component to break into a new Flex/Grid row within the Form layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Disables interaction, preventing file selection or removal.
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
   * @example "Must be a square image under 2MB in PNG or JPEG format."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/assets"
   */
  hintUrl?: string;

  /**
   * The geometric profile of the Avatar masking layer.
   * Variants: 'circle', 'square', 'rounded' (SaaS standard 16px), 'hexagon'.
   * @default "circle"
   */
  shape?: AvatarShape;

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid high-resolution avatar is required for deployment."
   */
  errorText?: ReactNode | string | null;

  /**
   * The numeric dimension (width & height in pixels) of the Avatar dropzone.
   * @default 120
   */
  size?: number;

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string;

  /**
   * Inline React CSS properties applied to the outmost Flex wrapper.
   */
  style?: React.CSSProperties;

  /**
   * MIME type restrictions defining valid file uploads via the native file input.
   * @default "image/*"
   * @example "image/png, image/jpeg"
   */
  accept?: string;

  /**
   * Injects an explicit Formik context. Required if the component operates outside 
   * a standard `<FormikProvider>` tree, typical in advanced monorepo architectures.
   */
  formikContext?: FormikContextType<any>;
}

export const AvatarInput = ({
  inputtype = 'avatar-outline',
  alias, 
  readOnly = false, 
  width, 
  inputLabel,
  shape = 'circle',
  size = 120, 
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  style, 
  className,
  accept = 'image/*',
  formikContext,
}: AvatarProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
    console.error(`[VectorSigma]: AvatarInput '${alias}' must be rendered within a Formik context or receive an explicit formikContext prop.`);
    return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);
  const hasError = Boolean(fieldTouched && fieldError);

  const inputRef = useRef<HTMLInputElement>(null);
  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const errorId = `${alias}-error`;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (fieldValue instanceof File) {
      objectUrl = URL.createObjectURL(fieldValue);
      setPreviewUrl(objectUrl);
    } else if (typeof fieldValue === 'string' && fieldValue.trim() !== '') {
      setPreviewUrl(fieldValue);
    } else {
      setPreviewUrl(null);
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fieldValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = e.currentTarget.files?.[0];
    if (file) {
      setFieldValue(alias, file);
    }
    setFieldTouched(alias, true, false);
    if (inputRef.current) inputRef.current.value = ''; 
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    setFieldValue(alias, null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const computedShapeClass = useMemo(() => {
    switch (shape) {
      case 'square': return 'vs-shape-square';
      case 'rounded': return 'vs-shape-rounded';
      case 'hexagon': return 'vs-shape-hexagon';
      case 'circle':
      default: return 'vs-shape-circle';
    }
  }, [shape]);

  const computedDesignClass = useMemo(() => {
    switch (inputtype) {
      case 'avatar-material': return 'vs-design-material';
      case 'avatar-neumorphic': return 'vs-design-neumorphic';
      case 'avatar-outline':
      default: return 'vs-design-outline';
    }
  }, [inputtype]);

  const iconColor = inputtype === 'avatar-neumorphic' ? '#8a94a6' : 'var(--gray-10)';

  return (
    <Column span={width} newLine={newRow}>
      <style>
        {`
          .vs-avatar-wrapper {
            position: relative;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
            user-select: none;
          }
          .vs-avatar-wrapper:not(.vs-readonly):hover {
            transform: translateY(-2px);
          }
          
          .vs-avatar-dropzone {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            cursor: pointer;
            overflow: hidden;
            transition: all 0.3s ease;
            box-sizing: border-box;
            background-color: var(--gray-2);
          }
          .vs-readonly .vs-avatar-dropzone {
            cursor: default;
            opacity: 0.8;
          }

          .vs-shape-circle { border-radius: 50%; }
          .vs-shape-square { border-radius: 4px; }
          .vs-shape-rounded { border-radius: 16px; }
          .vs-shape-hexagon {
            border-radius: 0;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          }

          .vs-design-outline {
            border: 1px dashed var(--gray-8);
            background: var(--gray-2);
          }
          .vs-avatar-wrapper:not(.vs-readonly):hover .vs-design-outline {
            border-color: var(--accent-9);
            background: var(--gray-3);
          }
          .vs-design-outline.vs-has-error { border: 1px solid var(--red-9); }

          .vs-design-material {
            border: 2px solid white;
            background: var(--color-panel-solid, #ffffff);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04);
          }
          .vs-avatar-wrapper:not(.vs-readonly):hover .vs-design-material {
            box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06);
          }
          .vs-design-material.vs-has-error { border: 2px solid var(--red-9); }

          .vs-design-neumorphic {
            border: none;
            background: #e0e5ec;
            box-shadow: 8px 8px 16px rgba(163,177,198,0.6), -8px -8px 16px rgba(255,255,255,0.7);
          }
          .vs-avatar-wrapper:not(.vs-readonly):hover .vs-design-neumorphic {
            box-shadow: inset 4px 4px 8px rgba(163,177,198,0.5), inset -4px -4px 8px rgba(255,255,255,0.8);
          }
          .vs-design-neumorphic.vs-has-error { border: 1px solid var(--red-9); }

          .vs-avatar-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(2px);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
          .vs-avatar-wrapper:not(.vs-readonly):hover .vs-avatar-overlay {
            opacity: 1;
          }

          .vs-remove-btn {
            position: absolute;
            top: -4px;
            right: -4px;
            z-index: 10;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            transition: transform 0.2s ease;
          }
          .vs-remove-btn:hover {
            transform: scale(1.1);
          }
        `}
      </style>

      <Flex 
        direction="column" 
        align="start" 
        gap="2" 
        style={{ fontFamily: "'Libre Franklin', sans-serif", width: '100%', ...style }} 
        className={className}
      >
        
        {(inputLabel || isHinted) && (
          <Flex align="center" gap="2" style={{ paddingLeft: '4px' }}>
            {inputLabel && (
              <Text id={`${alias}InputLabel`} as="label" size="2" weight="medium" style={{ color: 'var(--gray-11)' }} htmlFor={inputId}>
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

        <Box 
          className={`vs-avatar-wrapper ${readOnly ? 'vs-readonly' : ''}`}
          style={{ width: size, height: size }}
        >
          <Box
            className={`vs-avatar-dropzone ${computedShapeClass} ${computedDesignClass} ${hasError ? 'vs-has-error' : ''}`}
            onClick={() => inputRef.current?.click()}
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt={inputLabel || "Avatar Profile"}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
                {!readOnly && (
                  <Box className="vs-avatar-overlay">
                    <Icon name='camera' color="white" width="24" height="24" />
                  </Box>
                )}
              </>
            ) : (
              <Flex direction="column" align="center" justify="center" gap="1">
                <Icon name='user' width={size * 0.35} height={size * 0.35} color={iconColor} style={{ opacity: 0.6 }} />
                <Text size="1" weight="medium" style={{ color: iconColor, opacity: 0.8, letterSpacing: '0.02em' }}>
                  Upload
                </Text>
              </Flex>
            )}
          </Box>

          {previewUrl && !readOnly && (
            <IconButton
              className="vs-remove-btn"
              size="1"
              variant="solid"
              color="gray"
              highContrast
              radius="full"
              onClick={handleRemove}
              title="Remove image"
            >
              <Icon name='close' width="14" height="14" />
            </IconButton>
          )}
        </Box>

        <input
          ref={inputRef}
          id={inputId}
          name={alias}
          disabled={readOnly}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '4px', marginTop: '2px' }}>
            {errorText || fieldError?.toString() || `Required field`}
          </Text>
        )}

      </Flex>
    </Column>
  );
};