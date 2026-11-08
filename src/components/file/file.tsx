import React, { ReactNode, useEffect, useRef, useState, useId } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, IconButton, Box, AspectRatio, Badge, Tooltip } from '@radix-ui/themes';
import { ACCEPTED_FORMATS, adjustColor, formatBytes, getNearestParentBackground } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type FileInputDesign = 'fileinput' | 'fileinput-material' | 'fileinput-outline' | 'fileinput-neumorphic';

/**
 * FileInputProps Interface
 * @description Configuration properties for the VectorSigma File component.
 * Equipped with enterprise-grade aesthetics, HTML5 Drag & Drop, dynamic previews,
 * typography overrides, and strict Formik integration.
 */
export interface FileInputProps {
  /**
   * The aesthetic design language of the File dropzone.
   * - `fileinput-outline`: Minimalist, outline aesthetic (Default).
   * - `fileinput-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `fileinput-neumorphic`: Soft-UI with extruded inset/outset shadows.
   * @default "fileinput-outline"
   */
  inputtype?: FileInputDesign;

  /**
   * The unique identifier bridging the input field to the Formik state.
   * Must exactly match the schema property key.
   * @example "pmpCertificationFile"
   */
  alias: string; 

  /**
   * The primary semantic label rendered above the File dropzone.
   * @example "Upload PMP® Certification"
   */
  inputLabel?: string; 

  /**
   * Defines the responsive grid column span for the component (1-12 based on the parent grid).
   * @example 5
   */
  width: number;

  /**
   * Forces the component to break into a new Flex/Grid row within the Form layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Disables interaction, mutating the visual state to reflect read-only/disabled mode.
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
   * @example "Must be a clear PDF or JPG under 5MB."
   */
  hintText?: string; 

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/certifications"
   */
  hintUrl?: string;

  /**
   * If true, attempting to render a visual image thumbnail when a valid image file is selected.
   * @default false
   */
  preview?: boolean;

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the dropzone */
    background?: string;
    /** Overrides the border/stroke color of the dropzone (dashed in outline mode) */
    stroke?: string;
    /** Overrides the text color of the labels and file data */
    textColor?: string;
    /** Overrides the primary color used for icons, hover states, and badges */
    accent?: string;
  };

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "Proof of PMP® certification is required"
   */
  errorText?: ReactNode | string | null;

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string; 

  /**
   * Inline React CSS properties applied to the outmost Flex wrapper.
   */
  style?: React.CSSProperties;

  /**
   * Injects an explicit Formik context. Required if the component operates outside 
   * a standard `<FormikProvider>` tree.
   */
  formikContext?: FormikContextType<any>;
}

const getFileIcon = (type: string, name: string) => {
  if (type.includes('image')) return <Icon name='image' width="24" height="24" />;
  if (type.includes('pdf')) return <Icon name='reader' width="24" height="24" />;
  if (type.includes('csv') || type.includes('spreadsheet') || name.endsWith('.xlsx')) return <Icon name='table' width="24" height="24" />;
  if (type.includes('json') || type.includes('zip')) return <Icon name='code' width="24" height="24" />;
  if (name.endsWith('.zip')) return <Icon name='archive' width="24" height="24" />;
  return <Icon name='filetext' width="24" height="24" />;
};

export const File = ({
  inputtype = 'fileinput-outline',
  alias, 
  readOnly, 
  width, 
  inputLabel,
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  typography,
  preview = false,
  className,
  style, 
  formikContext,
}: FileInputProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`[VectorSigma]: File '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);
  
  const selectedFile: File | null = fieldValue;
  const hasError = Boolean(fieldTouched && fieldError);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  
  const [isDragging, setIsDragging] = useState(false);
  
  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const errorId = `${alias}-error`;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    const file = event.currentTarget.files?.[0];
    if (file) {
      setFieldValue(alias, file);
      setFieldTouched(alias, true, false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (readOnly) return;
    setFieldValue(alias, null);
    if (inputRef.current) inputRef.current.value = ''; 
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly) setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!readOnly) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (readOnly) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFieldValue(alias, file);
      setFieldTouched(alias, true, false);
    }
  };

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith('image/')) {
      setPreviewUrl(null);
      return; 
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (inputtype === 'fileinput-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = typography?.background || parentBg;

      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -20),
        '--neu-shadow-light': adjustColor(computedBg, 20),
      } as React.CSSProperties);
    }
  }, [inputtype, typography?.background]);

  const typographyVars = {
    '--vs-fi-bg': typography?.background || 'var(--color-surface)',
    '--vs-fi-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-fi-text': typography?.textColor || 'var(--gray-12)',
    '--vs-fi-accent': typography?.accent || 'var(--accent-9)',
  } as React.CSSProperties;

  const baseTriggerStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    cursor: readOnly ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    opacity: readOnly ? 0.7 : 1,
    color: 'var(--vs-fi-text)',
  };

  const materialTrigger: React.CSSProperties = {
    ...baseTriggerStyle,
    backgroundColor: 'var(--vs-fi-bg)',
    boxShadow: hasError ? 'inset 0 0 0 1.5px var(--red-9)' : `0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 0 0 1px ${typography?.stroke ? 'var(--vs-fi-stroke)' : 'transparent'}`,
    borderRadius: '6px',
  };

  const outlineTrigger: React.CSSProperties = {
    ...baseTriggerStyle,
    backgroundColor: typography?.background || 'transparent',
    border: hasError ? '2px dashed var(--red-9)' : '2px dashed var(--vs-fi-stroke)',
    borderRadius: '8px',
  };

  const neumorphicTrigger: React.CSSProperties = {
    ...baseTriggerStyle,
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--red-9)' : 'var(--vs-fi-text)',
    boxShadow: (!selectedFile && !isDragging)
       ? 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)'
       : '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
    border: 'none',
    borderRadius: '12px',
  };

  const activeStyle = 
    inputtype.includes('neumorphic') ? { ...neumorphicTrigger, ...neuVars } :
    inputtype.includes('material') ? materialTrigger : outlineTrigger;

  return (
    <Column span={width} newLine={newRow}>
      <Flex direction="column" gap="2" width="100%" ref={containerRef} style={{ fontFamily: "'Libre Franklin', sans-serif", ...typographyVars, ...style }} className={className}>
        
        <style>
          {`
            .vs-file-dropzone { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
            
            .vs-file-dropzone-outline:not(.vs-readonly):hover {
              border-color: var(--vs-fi-accent) !important;
              background-color: ${typography?.background ? adjustColor(typography.background, -5) : 'var(--gray-2)'};
            }
            .vs-file-dropzone-material:not(.vs-readonly):hover {
              box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            }
            .vs-file-dropzone-neumorphic:not(.vs-readonly):hover {
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light) !important;
            }

            .vs-file-dropzone-outline.is-dragging {
              border-color: var(--vs-fi-accent) !important;
              background-color: var(--accent-a3) !important;
              transform: scale(1.01);
            }
            .vs-file-dropzone-material.is-dragging {
              box-shadow: 0 0 0 2px var(--vs-fi-accent), 0 8px 16px rgba(0,0,0,0.1) !important;
              transform: scale(1.01);
            }
            .vs-file-dropzone-neumorphic.is-dragging {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
              color: var(--vs-fi-accent) !important;
            }
          `}
        </style>

        {(inputLabel || isHinted) && (
          <Flex align="center" gap="2" style={{ paddingLeft: '2px' }}>
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

        <input
          ref={inputRef}
          id={inputId}
          name={alias}
          disabled={readOnly}
          type="file"
          accept={ACCEPTED_FORMATS}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-describedby={hasError ? errorId : undefined}
        />

        <div 
          className={`vs-file-dropzone ${readOnly ? 'vs-readonly' : ''} ${isDragging ? 'is-dragging' : ''} ${
            inputtype.includes('material') ? 'vs-file-dropzone-material' : 
            inputtype.includes('neumorphic') ? 'vs-file-dropzone-neumorphic' : 
            'vs-file-dropzone-outline'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={activeStyle}
        >
          
          {!selectedFile ? (
            <Flex align="center" gap="3" style={{ width: '100%' }}>
              <Box style={{ padding: 8, borderRadius: '50%', backgroundColor: isDragging ? 'var(--accent-a4)' : 'var(--gray-3)', color: isDragging ? 'var(--vs-fi-accent)' : 'var(--gray-10)', flexShrink: 0, transition: 'all 0.2s ease' }}>
                <Icon name='upload' width="18" height="18" />
              </Box>
              
              <Flex direction="column" style={{ minWidth: 0, flex: 1 }}>
                  <Text size="2" weight="medium" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isDragging ? 'var(--vs-fi-accent)' : 'inherit', transition: 'color 0.2s ease' }}>
                    {isDragging ? 'Drop file to upload...' : 'Upload File'}
                  </Text>
                  <Text size="1" style={{ color: 'var(--gray-9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Supports PDF, Images, Excel, JSON...</Text>
              </Flex>
            </Flex>
          ) : (
            <Flex align="center" gap="4" style={{ width: '100%' }}>
              
              {preview && previewUrl ? (
                  <AspectRatio ratio={1} style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gray-5)' }}>
                      <img src={previewUrl} alt="File Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </AspectRatio>
              ) : (
                  <Box style={{ 
                      width: 48, height: 48, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: typography?.accent ? adjustColor(typography.accent, 85) : 'var(--accent-a3)', 
                      color: 'var(--vs-fi-accent)',
                      borderRadius: 6, flexShrink: 0
                  }}>
                      {getFileIcon(selectedFile.type, selectedFile.name)}
                  </Box>
              )}

              <Flex direction="column" style={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}>
                  <Text size="2" weight="bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedFile.name}
                  </Text>
                  <Flex gap="2" align="center" style={{ marginTop: '2px' }}>
                      <Text size="1" style={{ color: 'var(--gray-10)' }}>{formatBytes(selectedFile.size)}</Text>
                      <Badge size="1" variant="soft" style={{ backgroundColor: typography?.accent ? adjustColor(typography.accent, 85) : 'var(--accent-a3)', color: 'var(--vs-fi-accent)' }}>
                        {selectedFile.name.split('.').pop()?.toUpperCase()}
                      </Badge>
                  </Flex>
              </Flex>

              {!readOnly && (
                <IconButton 
                    size="1" 
                    variant="ghost" 
                    color="gray" 
                    onClick={handleClear}
                    style={{ borderRadius: '50%', padding: 4, flexShrink: 0 }}
                    title="Remove file"
                >
                    <Icon name='close' width="16" height="16" />
                </IconButton>
              )}
            </Flex>
          )}
        </div>

        {hasError && (
            <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
                {errorText || (typeof fieldError === 'string' ? fieldError : `Required field`)}
            </Text>
        )} 
      </Flex>
    </Column>
  );
};