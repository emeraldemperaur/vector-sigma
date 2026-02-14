import React, { useRef, useState, useEffect, ReactNode } from 'react';
import { useField, useFormikContext } from 'formik';
import { Box, Flex, Text, Card, IconButton, Grid, Tooltip } from '@radix-ui/themes';
import { Icon } from 'components/icons/icons';
import { ACCEPTED_EXTENSIONS } from 'utils/vinci';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type FileMultipleInputDesign = 'filemultiple' | 'filemultiple-material' | 'filemultiple-outline' | 'filemultiple-neumorphic';

export interface FileMultipleInputProps {
  inputtype?: FileMultipleInputDesign  & {},
  alias: string, inputLabel?: string, icon?: React.ReactNode,
  width: number, defaultValue?: any, value?: any, newRow?: boolean, isEdit?: boolean,
  placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
  preview?: boolean,  errorText?: ReactNode | string | null,
  className?: string,
  style?: React.CSSProperties
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

// --- Styles ---
const styles: Record<FileMultipleInputDesign, React.CSSProperties> = {
  'filemultiple': {
    border: '2px dashed var(--gray-a8)',
    borderRadius: 'var(--radius-3)',
    background: 'transparent',
  },
  // Outline 
  'filemultiple-outline': {
    border: '2px dashed var(--gray-a8)',
    borderRadius: 'var(--radius-3)',
    background: 'transparent',
  },
  // Material
  'filemultiple-material': {
    border: 'none',
    borderBottom: '2px solid var(--accent-9)',
    background: 'var(--gray-a3)',
    borderRadius: '4px 4px 0 0',
  },
  // Neumorphic
  'filemultiple-neumorphic': {
    border: 'none',
    borderRadius: '16px',
    background: '#e0e0e0',
    boxShadow: '6px 6px 12px #b8b9be, -6px -6px 12px #ffffff',
  }
};

export const FileMultiple = ({ 
  inputtype = 'filemultiple-outline',
  alias, readOnly, width,
  placeholder = '', value,
  preview = true, 
  className,
  style, ...props
}: FileMultipleInputProps) => {
  const [field, meta] = useField(alias);
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrls, setObjectUrls] = useState<Record<string, string>>({});
  const inputId = `${alias}FormInput` || crypto.randomUUID();
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
      // Append new files to extants
      setFieldValue(alias, [...currentFiles, ...newFiles]);
      setFieldTouched(alias, true);
    }
    // Reset input value to allow file reselection
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
  const hasError = meta.touched && meta.error;

  return (
    <Column span={width} newLine={props.newRow}>
    <Box className={className} style={style}>
      <Box
        onClick={() => inputRef.current?.click()}
        p="4"
        style={{
          ...styles[inputtype],
          cursor: 'pointer',
          transition: 'all 0.2s',
          borderColor: hasError ? 'var(--red-9)' : (styles[inputtype].borderBottom ? 'var(--accent-9)' : 'var(--gray-a8)'),
          position: 'relative'
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
                : "Choose files..."}
            </Text>
            <Text size="1" color="gray" style={{ opacity: 0.8 }}>
              PDF, Images, Office Docs, JSON, ZIP
            </Text>
          </Flex>
        </Flex>

        <input
          id={inputId || alias}
          ref={inputRef}
          readOnly={readOnly}
          name={alias}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          aria-describedby={hasError ? errorId : undefined}
        />
      </Box>

      {preview && currentFiles.length > 0 && (
        <Grid columns="repeat(auto-fill, minmax(220px, 1fr))" gap="3" mt="3">
          {currentFiles.map((file, index) => {
            // Detect preview URL:
            // If string (URL from DB), use urlpath
            // If File (blob), use objectUrl
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
                </Flex>
              </Card>
            );
          })}
        </Grid>
      )}

      <div>
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{props.inputLabel}</Text>
      
            {hasError ?
                  <>
                  <p id={errorId} className='core-input-label-error'>
                      {typeof meta.error === 'string' ? 
                      <>{props.errorText || "Required field"}</> 
                      : 'Invalid file selection'}
                  </p>
                  </> : null } 
            {props.isHinted ?
                  <>
                  <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                      <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                      <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                      </a> 
                  </Tooltip>
                  </> : null} 
        </div>
    </Box>
    </Column>
  );
};