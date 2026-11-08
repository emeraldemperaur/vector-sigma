import React, { ReactNode, useEffect, useRef, useState, useId } from 'react';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Box, Flex, Text, Card, IconButton, Grid, Tooltip, AspectRatio, Badge } from '@radix-ui/themes';
import { Icon } from 'components/icons/icons';
import { ACCEPTED_EXTENSIONS, adjustColor, formatBytes, getNearestParentBackground } from 'utils/vinci';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type FileMultipleInputDesign = 'filemultiple' | 'filemultiple-material' | 'filemultiple-outline' | 'filemultiple-neumorphic';

/**
 * FileMultipleInputProps Interface
 * @description Configuration properties for the VectorSigma Multi-File component.
 * Equipped with enterprise-grade aesthetics, HTML5 Drag & Drop, dynamic previews,
 * typography overrides, array state management, and strict Formik integration.
 */
export interface FileMultipleInputProps {
  /**
   * The aesthetic design language of the File dropzone and selected file cards.
   * - `filemultiple-outline`: Minimalist, outlined aesthetic (Default).
   * - `filemultiple-material`: Elevated, sharp drop-shadows with a solid surface.
   * - `filemultiple-neumorphic`: Soft-UI with extruded inset/outset shadows.
   * @default "filemultiple-outline"
   */
  inputtype?: FileMultipleInputDesign;

  /**
   * The unique identifier bridging the input field to the Formik state.
   * Must exactly match the schema property key.
   * @example "awsCertificationFiles"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the File dropzone.
   * @example "Upload AWS Certifications"
   */
  inputLabel?: string;

  /**
   * Defines the responsive grid column span for the component (1-12 based on the parent grid).
   * @example 12
   */
  width: number;

  /**
   * Forces the component to break into a new Flex/Grid row within the Form layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Placeholder text utilized when the state is empty (0 files selected).
   * @example "Choose or drag files here..."
   */
  placeholder?: string;

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
   * @example "You may upload up to 5 files at once."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/certifications"
   */
  hintUrl?: string;

  /**
   * If true, generates and renders image thumbnails for valid image files in the selected grid.
   * @default true
   */
  preview?: boolean;

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the dropzone and file cards */
    background?: string;
    /** Overrides the border/stroke color of the dropzone */
    stroke?: string;
    /** Overrides the text color of the labels and file data */
    textColor?: string;
    /** Overrides the primary color used for icons, hover states, and badges */
    accent?: string;
  };

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "At least one certification document is required."
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

const getFileIcon = (fileOrUrl: File | string) => {
  if (typeof fileOrUrl === 'string') {
    const ext = fileOrUrl.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <Icon name='image' width="20" height="20" />;
    if (ext === 'pdf') return <Icon name='reader' width="20" height="20" />;
    return <Icon name='filetext' width="20" height="20" />;
  }
  if (fileOrUrl.type?.startsWith('image/')) return <Icon name='image' width="20" height="20" />;
  if (fileOrUrl.type?.includes('pdf')) return <Icon name='reader' width="20" height="20" />;
  if (fileOrUrl.type?.includes('sheet') || fileOrUrl.type?.includes('csv') || fileOrUrl.name.endsWith('.xlsx')) return <Icon name='table' width="20" height="20" />;
  if (fileOrUrl.type?.includes('zip') || fileOrUrl.name.endsWith('.zip')) return <Icon name='archive' width="20" height="20" />;
  return <Icon name='filetext' width="20" height="20" />;
};

export const FileMultiple = ({ 
  inputtype = 'filemultiple-outline',
  alias, 
  readOnly, 
  width, 
  inputLabel,
  placeholder, 
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  typography,
  preview = true, 
  className,
  style, 
  formikContext,
}: FileMultipleInputProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`[VectorSigma]: FileMultiple '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const currentFiles: (File | string)[] = Array.isArray(fieldValue) ? fieldValue : [];
  const hasError = Boolean(fieldTouched && fieldError);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  
  const [isDragging, setIsDragging] = useState(false);

  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const errorId = `${alias}-error`;

  useEffect(() => {
    if (!preview) return;

    const newUrls: Record<string, string> = {};
    let changed = false;

    currentFiles.forEach((file) => {
      if (file instanceof File && file.type.startsWith('image/')) {
        if (!objectUrls[file.name]) {
          newUrls[file.name] = URL.createObjectURL(file);
          changed = true;
        } else {
           newUrls[file.name] = objectUrls[file.name];
        }
      }
    });

    if (changed || Object.keys(newUrls).length !== Object.keys(objectUrls).length) {
      setObjectUrls(newUrls);
    }
  }, [currentFiles, preview]);

  useEffect(() => {
    if (inputtype === 'filemultiple-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = typography?.background || parentBg;

      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -20),
        '--neu-shadow-light': adjustColor(computedBg, 20),
      } as React.CSSProperties);
    }
  }, [inputtype, typography?.background]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFieldValue(alias, [...currentFiles, ...newFiles]);
      setFieldTouched(alias, true, false);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (indexToRemove: number) => {
    if (readOnly) return;
    const fileToRemove = currentFiles[indexToRemove];
    const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
    setFieldValue(alias, updatedFiles);

    if (fileToRemove instanceof File && objectUrls[fileToRemove.name]) {
      URL.revokeObjectURL(objectUrls[fileToRemove.name]);
    }
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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFieldValue(alias, [...currentFiles, ...newFiles]);
      setFieldTouched(alias, true, false);
    }
  };

  const typographyVars = {
    '--vs-fm-bg': typography?.background || 'var(--color-surface)',
    '--vs-fm-stroke': typography?.stroke || 'var(--gray-7)',
    '--vs-fm-text': typography?.textColor || 'var(--gray-12)',
    '--vs-fm-accent': typography?.accent || 'var(--accent-9)',
  } as React.CSSProperties;

  const baseTriggerStyle: React.CSSProperties = {
    padding: '16px',
    borderRadius: '8px',
    cursor: readOnly ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxSizing: 'border-box',
    opacity: readOnly ? 0.7 : 1,
    color: 'var(--vs-fm-text)',
  };

  const materialTrigger: React.CSSProperties = {
    ...baseTriggerStyle,
    backgroundColor: 'var(--vs-fm-bg)',
    boxShadow: hasError ? 'inset 0 0 0 1.5px var(--red-9)' : `0 2px 5px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04), inset 0 0 0 1px ${typography?.stroke ? 'var(--vs-fm-stroke)' : 'transparent'}`,
    borderRadius: '6px',
  };

  const outlineTrigger: React.CSSProperties = {
    ...baseTriggerStyle,
    backgroundColor: typography?.background || 'transparent',
    border: hasError ? '2px dashed var(--red-9)' : '2px dashed var(--vs-fm-stroke)',
    borderRadius: '8px',
  };

  const neumorphicTrigger: React.CSSProperties = {
    ...baseTriggerStyle,
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--red-9)' : 'var(--vs-fm-text)',
    boxShadow: (!isDragging)
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
      <Flex direction="column" gap="3" width="100%" ref={containerRef} style={{ fontFamily: "'Libre Franklin', sans-serif", ...typographyVars, ...style }} className={className}>
        
        <style>
          {`
            .vs-filemultiple-dropzone { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
            
            .vs-filemultiple-dropzone-outline:not(.vs-readonly):hover {
              border-color: var(--vs-fm-accent) !important;
              background-color: ${typography?.background ? adjustColor(typography.background, -5) : 'var(--gray-2)'};
            }
            .vs-filemultiple-dropzone-material:not(.vs-readonly):hover {
              box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
            }
            .vs-filemultiple-dropzone-neumorphic:not(.vs-readonly):hover {
              box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light) !important;
            }

            .vs-filemultiple-dropzone-outline.is-dragging {
              border-color: var(--vs-fm-accent) !important;
              background-color: var(--accent-a3) !important;
              transform: scale(1.01);
            }
            .vs-filemultiple-dropzone-material.is-dragging {
              box-shadow: 0 0 0 2px var(--vs-fm-accent), 0 8px 16px rgba(0,0,0,0.1) !important;
              transform: scale(1.01);
            }
            .vs-filemultiple-dropzone-neumorphic.is-dragging {
              box-shadow: inset 6px 6px 12px var(--neu-shadow-dark), inset -6px -6px 12px var(--neu-shadow-light) !important;
              color: var(--vs-fm-accent) !important;
            }

            .vs-filemultiple-card {
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .vs-filemultiple-card:hover {
              transform: translateY(-2px);
            }
            .vs-filemultiple-card-outline {
              border: 1px solid var(--vs-fm-stroke);
              background: var(--vs-fm-bg);
            }
            .vs-filemultiple-card-material {
              border: none;
              background: var(--vs-fm-bg);
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
            .vs-filemultiple-card-neumorphic {
              border: none;
              box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
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
          id={inputId}
          ref={inputRef}
          name={alias}
          disabled={readOnly}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-describedby={hasError ? errorId : undefined}
        />

        <div 
          className={`vs-filemultiple-dropzone ${readOnly ? 'vs-readonly' : ''} ${isDragging ? 'is-dragging' : ''} ${
            inputtype.includes('material') ? 'vs-filemultiple-dropzone-material' : 
            inputtype.includes('neumorphic') ? 'vs-filemultiple-dropzone-neumorphic' : 
            'vs-filemultiple-dropzone-outline'
          }`}
          onClick={() => !readOnly && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={activeStyle}
        >
          <Box style={{ 
              padding: 10, 
              borderRadius: '50%', 
              backgroundColor: isDragging ? 'var(--accent-a4)' : 'var(--gray-3)', 
              color: isDragging ? 'var(--vs-fm-accent)' : 'var(--gray-10)', 
              flexShrink: 0, 
              transition: 'all 0.2s ease',
              boxShadow: inputtype.includes('neumorphic') ? 'inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light)' : 'none'
          }}>
            <Icon name='upload' width="20" height="20" />
          </Box>
          
          <Flex direction="column" style={{ minWidth: 0, flex: 1 }}>
            <Text size="2" weight="bold" style={{ color: isDragging ? 'var(--vs-fm-accent)' : 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.2s ease' }}>
              {currentFiles.length > 0 
                ? `${currentFiles.length} file${currentFiles.length !== 1 ? 's' : ''} staged for upload` 
                : (placeholder || (isDragging ? 'Drop files here...' : 'Choose or drag files here...'))}
            </Text>
            <Text size="1" style={{ color: 'var(--gray-9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Supports PDF, Images, Office Docs, JSON, ZIP
            </Text>
          </Flex>
        </div>

        {hasError && (
            <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px', marginTop: '-4px' }}>
                {errorText || (typeof fieldError === 'string' ? fieldError : `Required field`)}
            </Text>
        )} 

        {currentFiles.length > 0 && (
          <Grid columns="repeat(auto-fill, minmax(240px, 1fr))" gap="3" mt="1">
            {currentFiles.map((file, index) => {
              let localPreviewUrl: string | null = null;
              let fileName = 'Unknown File';
              let fileSize = '';
              let fileExtension = '';

              if (typeof file === 'string') {
                 localPreviewUrl = file;
                 fileName = file.split('/').pop() || file;
                 fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
              } else {
                 localPreviewUrl = objectUrls[file.name] || null;
                 fileName = file.name;
                 fileSize = formatBytes(file.size);
                 fileExtension = file.name.split('.').pop()?.toUpperCase() || 'FILE';
              }

              const cardClass = inputtype.includes('neumorphic') ? 'vs-filemultiple-card-neumorphic' : 
                                inputtype.includes('material') ? 'vs-filemultiple-card-material' : 
                                'vs-filemultiple-card-outline';

              return (
                <Card 
                  key={`${fileName}-${index}`}
                  className={`vs-filemultiple-card ${cardClass}`}
                  style={inputtype.includes('neumorphic') ? { backgroundColor: 'var(--neu-bg)', ...neuVars } : {}}
                >
                  <Flex align="center" gap="3">
                    
                    {preview && localPreviewUrl && (fileName.match(/\.(jpeg|jpg|png|gif|webp)$/i) || (file instanceof File && file.type.startsWith('image/'))) ? (
                      <AspectRatio ratio={1} style={{ width: 44, height: 44, borderRadius: 6, overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gray-5)' }}>
                          <img src={localPreviewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </AspectRatio>
                    ) : (
                      <Box style={{ 
                        width: 44, height: 44, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: typography?.accent ? adjustColor(typography.accent, 85) : 'var(--accent-a3)', 
                        color: 'var(--vs-fm-accent)',
                        borderRadius: 6, flexShrink: 0
                      }}>
                        {getFileIcon(file)}
                      </Box>
                    )}

                    <Flex direction="column" style={{ flex: 1, overflow: 'hidden' }}>
                      <Text size="2" weight="bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--vs-fm-text)' }}>
                        {fileName}
                      </Text>
                      <Flex gap="2" align="center" style={{ marginTop: '2px' }}>
                        {fileSize && <Text size="1" style={{ color: 'var(--gray-10)' }}>{fileSize}</Text>}
                        <Badge size="1" variant="soft" style={{ backgroundColor: typography?.accent ? adjustColor(typography.accent, 85) : 'var(--accent-a3)', color: 'var(--vs-fm-accent)' }}>
                          {fileExtension}
                        </Badge>
                      </Flex>
                    </Flex>

                    {!readOnly && (
                        <IconButton 
                          size="1" 
                          variant="ghost" 
                          color="gray"
                          type="button" 
                          onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(index);
                          }}
                          style={{ borderRadius: '50%', padding: 4, flexShrink: 0 }}
                          title="Remove file"
                        >
                          <Icon name='close' width="16" height="16" />
                        </IconButton>
                    )}
                  </Flex>
                </Card>
              );
            })}
          </Grid>
        )}
      </Flex>
    </Column>
  );
};