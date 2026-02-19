import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { useField, useFormikContext } from 'formik';
import { Box, Flex, Text, Card, IconButton, Grid, Tooltip } from '@radix-ui/themes';
import { Icon } from 'components/icons/icons';
import { ACCEPTED_EXTENSIONS } from 'utils/vinci';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type FileMultipleInputDesign = 'filemultiple' | 'filemultiple-material' | 'filemultiple-outline' | 'filemultiple-neumorphic';

export interface FileMultipleInputProps {
  /**
   * * The required unique identifier for the FileMultiple input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="awsCertificationFiles"
   */
  alias: string;
  /**
   * * The design variation of the FileMultiple input. 
   * Default: 'fileinput-outline' 
   * Variants: 'fileinput', 'fileinput-outline', 'fileinput-material', 'fileinput-neumorphic'.
   * * @example
   * inputtype="fileinput-neumorphic"
   */
  inputtype?: FileMultipleInputDesign;
  /**
   * * The optional input label or description for the FileMultiple input field. 
   * * @example
   * inputLabel="Upload AWS Certication(s)"
   */
  inputLabel?: string;
  /**
   * * The required viewport column width for the FileMultiple input field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */
  width: number;
  /**
   * * Option to render FileMultiple input field on new row.
   * * @example
   * newRow
   */
  newRow?: boolean;
  /**
   * * Option to force set the placeholder text for a FileMultiple input field.
   * * @example
   * placeholder="Select an auto model"
   */
  placeholder?: string;
  /**
   * * Option to disable edits for FileMultiple input field.
   * * @example
   * readOnly
   */
  readOnly?: boolean;
  /**
     * * Option to enable a hint for FileMultiple input field.
     * * @example
     * isHinted
     */ 
  isHinted?: boolean;
  /**
   * * Option to specify hint text for FileMultiple input field.
   * * @example
   * hintText="This is a hint for a VΣ FileMultiple"
   */
  hintText?: string;
  /**
   * * Option to specify a hint url reference or resource for FileMultiple input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */
  hintUrl?: string;
  /**
   * * Option to enable image file previews for FileMultiple input field.
   * * @example
   * preview
   */
  preview?: boolean;
  /**
   * * Option to specify the isRequired error text for the FileMultiple input field.
   * * @example
   * errorText="Proof of AWS certificartion is required"
   */
  errorText?: ReactNode | string | null;
  /**
   * * Option to specify the .scss class selector for the FileMultiple input field.
   * * @example
   * className="teletraan-1-file"
   */
  className?: string;
  /**
   * * Option to inject custom CSS the FileMultiple input field.
   * * @example
   * style={{ color: "#000000" }}
   */
  style?: React.CSSProperties;
}

const getFileIcon = (fileOrUrl: File | string) => {
  if (typeof fileOrUrl === 'string') {
    const ext = fileOrUrl.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <Icon name='image' />;
    if (ext === 'pdf') return <Icon name='filetext' color="red" />;
    return <Icon name='file' />;
  }
  if (fileOrUrl.type?.startsWith('image/')) return <Icon name='image' />;
  if (fileOrUrl.type?.includes('pdf')) return <Icon name='filetext' color="red" />;
  if (fileOrUrl.type?.includes('sheet') || fileOrUrl.type?.includes('csv')) return <Icon name='filetext' color="green" />;
  return <Icon name='filetext' />;
};

const styles: Record<FileMultipleInputDesign, React.CSSProperties> = {
  'filemultiple': {
    border: '2px dashed var(--gray-a8)',
    borderRadius: 'var(--radius-3)',
    background: 'transparent',
  },
  'filemultiple-outline': {
    border: '2px dashed var(--gray-a8)',
    borderRadius: 'var(--radius-3)',
    background: 'transparent',
  },
  'filemultiple-material': {
    border: 'none',
    borderBottom: '2px solid var(--accent-9)',
    background: 'var(--gray-a3)',
    borderRadius: '4px 4px 0 0',
  },
  'filemultiple-neumorphic': {
    border: 'none',
    borderRadius: '16px',
    background: '#e0e0e0',
    boxShadow: '6px 6px 12px #b8b9be, -6px -6px 12px #ffffff',
  }
};

export const FileMultiple = ({ 
  inputtype = 'filemultiple-outline',
  alias, 
  readOnly, 
  width, 
  inputLabel,
  placeholder = '', 
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  preview = true, 
  className,
  style, 
  ...props
}: FileMultipleInputProps) => {
  const [field, meta] = useField(alias);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const inputId = `${alias}FormInput`;
  const errorId = `${alias}-error`;

  const currentFiles: (File | string)[] = Array.isArray(field.value) ? field.value : [];

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


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFieldValue(alias, [...currentFiles, ...newFiles]);
      setFieldTouched(alias, true);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (indexToRemove: number) => {
    const fileToRemove = currentFiles[indexToRemove];
    const updatedFiles = currentFiles.filter((_, index) => index !== indexToRemove);
    setFieldValue(alias, updatedFiles);

    if (fileToRemove instanceof File && objectUrls[fileToRemove.name]) {
      URL.revokeObjectURL(objectUrls[fileToRemove.name]);
    }
  };

  const isNeumorphic = inputtype === 'filemultiple-neumorphic';
  const hasError = Boolean(meta.touched && meta.error);

  return (
    <Column span={width} newLine={newRow}>
      <Flex direction="column" gap="2" className={className} style={{ width: '100%', ...style }}>
        
        {/* INPUT BOX */}
        <Box
          onClick={() => !readOnly && inputRef.current?.click()}
          p="4"
          style={{
            ...styles[inputtype],
            cursor: readOnly ? 'default' : 'pointer',
            transition: 'all 0.2s',
            borderColor: hasError ? 'var(--red-9)' : (styles[inputtype].borderBottom ? 'var(--accent-9)' : 'var(--gray-a8)'),
            position: 'relative',
            opacity: readOnly ? 0.7 : 1
          }}
        >
          <Flex align="center" gap="4">
            <Box 
              style={{ 
                background: isNeumorphic ? '#e0e0e0' : 'var(--accent-3)', 
                borderRadius: '50%', 
                padding: '10px',
                boxShadow: isNeumorphic ? 'inset 3px 3px 6px #b8b9be, inset -3px -3px 6px #ffffff' : 'none'
              }}
            >
              <Icon name='upload' width="20" height="20" color={isNeumorphic ? '#555' : 'var(--accent-9)'} />
            </Box>
            
            <Flex direction="column">
              <Text weight="bold" style={{ color: isNeumorphic ? '#444' : 'inherit' }}>
                {currentFiles.length > 0 
                  ? `${currentFiles.length} file${currentFiles.length !== 1 ? 's' : ''} selected` 
                  : (placeholder || "Choose files...")}
              </Text>
              <Text size="1" color="gray" style={{ opacity: 0.8 }}>
                PDF, Images, Office Docs, JSON, ZIP
              </Text>
            </Flex>
          </Flex>

          <input
            id={inputId}
            ref={inputRef}
            name={alias}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleFileChange}
            disabled={readOnly}
            style={{ display: 'none' }}
            aria-describedby={hasError ? errorId : undefined}
          />
        </Box>

        {preview && currentFiles.length > 0 && (
          <Grid columns="repeat(auto-fill, minmax(220px, 1fr))" gap="3" mt="1">
            {currentFiles.map((file, index) => {
              let previewUrl: string | null = null;
              let fileName = 'Unknown File';
              let fileSize = '';

              if (typeof file === 'string') {
                 previewUrl = file;
                 fileName = file.split('/').pop() || file;
              } else {
                 previewUrl = objectUrls[file.name] || null;
                 fileName = file.name;
                 fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
              }

              return (
                <Card 
                  key={`${fileName}-${index}`}
                  style={isNeumorphic ? {
                    background: '#e0e0e0',
                    border: 'none',
                    boxShadow: '4px 4px 8px #b8b9be, -4px -4px 8px #ffffff'
                  } : {}}
                >
                  <Flex align="center" gap="3">
                    <Box 
                      style={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '6px', 
                        overflow: 'hidden', 
                        background: 'var(--gray-a3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {previewUrl && (fileName.match(/\.(jpeg|jpg|png|gif|webp)$/i) || (file instanceof File && file.type.startsWith('image/'))) ? (
                        <img src={previewUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        getFileIcon(file)
                      )}
                    </Box>

                    <Flex direction="column" style={{ flex: 1, overflow: 'hidden' }}>
                      <Text size="1" weight="bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: isNeumorphic ? '#444' : 'inherit' }}>
                        {fileName}
                      </Text>
                      {fileSize && <Text size="1" color="gray">{fileSize}</Text>}
                    </Flex>

                    {!readOnly && (
                        <IconButton 
                        size="1" 
                        variant="ghost" 
                        color="red"
                        type="button" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(index);
                        }}
                        >
                        <Icon name='close' />
                        </IconButton>
                    )}
                  </Flex>
                </Card>
              );
            })}
          </Grid>
        )}

        <div>
          {inputLabel && (
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={inputId}>
              {inputLabel}
            </Text>
          )}
          &nbsp;
          {isHinted && (
            <Tooltip content={hintText || "No hint available"}>
              <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray', marginLeft: 4 }} />
              </a> 
            </Tooltip>
          )} 
          {hasError && (
            <Text id={errorId} size="1" color="red" style={{ display: 'block', marginTop: 2 }}>
              {typeof meta.error === 'string' ? (errorText || meta.error) : 'Invalid file selection'}
            </Text>
          )} 
        </div>
      </Flex>
    </Column>
  );
};