import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { useField, useFormikContext } from 'formik';
import { Box, Flex, Text, IconButton, Avatar, Tooltip } from '@radix-ui/themes';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';

export type AvatarDesign = 'avatar' | 'avatar-outline' | 'avatar-material' | 'avatar-neumorphic';
export type AvatarShape = 'circle' | 'square' | 'rounded';

export interface AvatarProps {
  /**
   * * The design variation of the Avatar input. 
   * Default: 'avatar-outline' 
   * Variants: 'avatar', 'avatar-outline', 'avatar-material', 'avatar-neumorphic'.
   * * @example
   * inputtype="avatar-neumorphic"
   */
  inputtype?: AvatarDesign & {};
  /**
   * * The required unique identifier for the input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="torukMakto"
   */
  alias: string;
  /**
   * * The optional input label or description for the Avatar input field. 
   * * @example
   * inputLabel="Upload VΣ Profile"
   */
  inputLabel?: string;
 /**
   * * The required viewport column width for the Avatar input field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */
  width: number; 
  /**
   * * Option to render Avatar input field on new row.
   * * @example
   * newRow
   */
  newRow?: boolean;
   /**
   * * Option to disable edits for Avatar input field.
   * * @example
   * readOnly
   */
  readOnly?: boolean; 
  /**
     * * Option to enable a hint for Avatar input field.
     * * @example
     * isHinted
     */
  isHinted?: boolean;
  /**
   * * Option to specify hint text for Avatar input field.
   * * @example
   * hintText="This is a hint for a VΣ AvatarInput"
   */
  hintText?: string;
  /**
   * * Option to specify a hint url reference or resource for Avatar input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */
  hintUrl?: string;
   /**
   * * Option to specify the layout shape of the Avatar input field.
   * Variants: 'circle', 'square', 'rounded'
   * * @example
   * shape="rounded"
   */
  shape?: AvatarShape;
   /**
   * * Option to specify the isRequired error text for the Avatar input field.
   * * @example
   * errorText="A profile is required for VΣ Plus user subscription"
   */
  errorText?: ReactNode | string | null;
    /**
   * * Option to specify the size for the Avatar input field.
   * Default: 120 (i.e. 120px x 120px)
   * * @example
   * size={200}
   */
  size?: number;
   /**
   * * Option to specify the SCSS class selector for the Avatar input field.
   * * @example
   * className="teletraan-1-profile"
   */
  className?: string;
  /**
   * * Option to inject custom CSS the Avatar input field.
   * * @example
   * style={{ color: "#000000" }}
   */
  style?: React.CSSProperties;
    /**
   * * Option to specify the accepted file formats for the Avatar input field.
   * Default: image/*
   * * @example
   * accept="image/*"
   */
  accept?: string;
}

const getStyles = (inputtype: AvatarDesign, shape: AvatarShape, hasError: boolean) => {
  const base = {
    position: 'relative' as const,
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  let borderRadius = '0';
  if (shape === 'circle') borderRadius = '50%';
  if (shape === 'rounded') borderRadius = '20%';
  
  let designStyles: React.CSSProperties = {};

  if (inputtype === 'avatar-neumorphic') {
    designStyles = {
      backgroundColor: '#e0e5ec',
      border: hasError ? '2px solid var(--red-9)' : 'none',
      boxShadow: hasError 
        ? 'inset 3px 3px 6px #a3b1c6, inset -3px -3px 6px #ffffff' 
        : '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)',
    };
  } else if (inputtype === 'avatar-material') {
    designStyles = {
      backgroundColor: 'var(--gray-3)',
      border: hasError ? '2px solid var(--red-9)' : '3px solid white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    };
  } else {
    designStyles = {
      backgroundColor: 'var(--gray-2)',
      border: hasError ? '2px solid var(--red-9)' : '2px dashed var(--gray-8)',
    };
  }

  return { ...base, borderRadius, ...designStyles };
};

export const AvatarInput = ({
  inputtype = 'avatar-outline',
  alias, readOnly, width, inputLabel,
  shape = 'circle',
  size = 120, newRow, isHinted, hintText, hintUrl, errorText,
  style, className,
  accept = 'image/*', ...props
}: AvatarProps) => {
  const [field, meta, helpers] = useField(alias);
  const { setTouched } = useFormikContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputId = `${alias}FormInput` || crypto.randomUUID();
  const errorId = `${alias}-error`;

  const hasError = meta.touched && meta.error;

  useEffect(() => {
    let objectUrl: string | null = null;
    if (field.value instanceof File) {
        objectUrl = URL.createObjectURL(field.value);
        setPreviewUrl(objectUrl);
    } else if (typeof field.value === 'string' && field.value) {
        setPreviewUrl(field.value);
    } else {
        setPreviewUrl(null);
    }

    return () => {
        if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        }
    };
}, [field.value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (file) {
      helpers.setValue(file);
    }
    setTouched({ [alias]: true });
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    helpers.setValue(null);
  };

  const containerStyles = getStyles(inputtype, shape, !!hasError);

  const iconColor = inputtype === 'avatar-neumorphic' ? '#555' : 'var(--gray-10)';

  return (
    <Column span={width} newLine={newRow}>
    <Flex direction="column" align="center" gap="3" style={style}>
      <Box
        onClick={() => inputRef.current?.click()}
        style={{
          width: size,
          height: size,
          ...containerStyles,
        }}
      >
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt="Avatar"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block'
              }}
            />
            <Box style={{ position: 'absolute', top: 4, right: 4 }}>
              <IconButton
                size="1"
                variant="solid"
                color="red"
                radius="full"
                onClick={handleRemove}
                style={{ opacity: 0.9, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
              >
                <Icon name='close' />
              </IconButton>
            </Box>

            <Box
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '4px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Icon name='camera' color="white" width="16" height="16" />
            </Box>
          </>
        ) : (
          <Flex direction="column" align="center" justify="center" height="100%" width="100%">
            <Icon name='user' width={size * 0.4} height={size * 0.4} color={iconColor} style={{ opacity: 0.5 }} />
            <Text size="1" color="gray" style={{ marginTop: 4, opacity: 0.8 }}>
              Upload
            </Text>
          </Flex>
        )}
      </Box>

      <input
        ref={inputRef}
        id={inputId || alias}
        name={alias}
        readOnly={readOnly}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
        <div>
                {inputLabel && (
                      <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" color='gray' highContrast={inputtype !== 'avatar-neumorphic'} htmlFor={inputId}>
                        {inputLabel}
                      </Text>)}
                &nbsp;
                {isHinted ?
                  <>
                  <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                      <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                      <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                      </a> 
                  </Tooltip>
                  </> : null} 
                 {hasError ?
                  <>
                  <p id={errorId} className='core-input-label-error'>
                      {errorText || `Required field`}
                  </p>
                  </> : null } 
        </div>
    </Flex>
    </Column>
  );
};