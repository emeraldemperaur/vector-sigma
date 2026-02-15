import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Flex, Text, IconButton, Box, AspectRatio, Badge, Tooltip } from '@radix-ui/themes';
import { ACCEPTED_FORMATS, adjustColor, formatBytes, getNearestParentBackground } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type FileInputDesign = 'fileinput' | 'fileinput-material' | 'fileinput-outline' | 'fileinput-neumorphic';

export interface FileInputProps {
  inputtype?: FileInputDesign & {},
  alias: string, inputlabel?: string, icon?: React.ReactNode,
  width: number, defaultValue?: any, value?: any, newRow?: boolean, isEdit?: boolean,
  placeholder?: string, readonly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
  preview?: boolean, 
  className?: string, errorText?: ReactNode | string | null,
  style?: React.CSSProperties;
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
  alias, readonly, width, inputlabel=undefined,
  placeholder = '',
  preview = false,
  className,
  style, ...props
}: FileInputProps) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  
  const selectedFile: File | null = field.value;
  const hasError = Boolean(meta.touched && meta.error);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  const inputId = `${alias}FormInput` || crypto.randomUUID();
  const errorId = `${alias}-error`;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) {
      setFieldValue(alias, file);
      setFieldTouched(alias, true);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setFieldValue(alias, null);
    if (inputRef.current) inputRef.current.value = ''; 
  };

  // Preview URL generator
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
      setNeuVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': adjustColor(parentBg, -20),
        '--neu-shadow-light': adjustColor(parentBg, 20),
        '--neu-accent': 'var(--accent-9)',
        '--neu-text': 'var(--gray-12)',
      } as React.CSSProperties);
    }
  }, [inputtype]);

  // --- STYLES ---
  const baseTriggerStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  };

  const materialTrigger: React.CSSProperties = {
    ...baseTriggerStyle,
    backgroundColor: 'var(--color-surface)',
    boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 2px 5px rgba(0,0,0,0.1)',
  };

  const outlineTrigger: React.CSSProperties = {
    ...baseTriggerStyle,
    backgroundColor: 'transparent',
    border: hasError ? '2px dashed var(--red-9)' : '2px dashed var(--gray-8)',
  };

  const neumorphicTrigger: React.CSSProperties = {
    ...baseTriggerStyle,
    backgroundColor: 'var(--neu-bg)',
    color: hasError ? 'var(--red-9)' : 'var(--neu-text)',
    // Empty: (Dropzone effect)
    // Selected: (Card effect)
    boxShadow: !selectedFile 
       ? 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)'
       : '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
    border: 'none',
    ...neuVars,
  };

  const activeStyle = 
    inputtype === 'fileinput-neumorphic' ? neumorphicTrigger :
    inputtype === 'fileinput-outline' ? outlineTrigger : materialTrigger;

  return (
    <Column span={width} newLine={props.newRow}>
    <Flex direction="column" gap="2" width="100%" ref={containerRef} style={style} className={className}>
      <input
        ref={inputRef}
        id={inputId}
        name={alias}
        readOnly={readonly}
        type="file"
        accept={ACCEPTED_FORMATS}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        aria-describedby={hasError ? errorId : undefined}
      />

      <div 
        onClick={() => inputRef.current?.click()}
        style={activeStyle}
        onMouseEnter={(e) => {
           if (inputtype === 'fileinput-outline') e.currentTarget.style.borderColor = 'var(--accent-9)';
        }}
        onMouseLeave={(e) => {
           if (inputtype === 'fileinput-outline') e.currentTarget.style.borderColor = hasError ? 'var(--red-9)' : 'var(--gray-8)';
        }}
      >
        
        {!selectedFile ? (
          // --- EMPTY STATE ---
          <Flex align="center" gap="3" style={{ width: '100%', color: 'var(--gray-10)' }}>
            <Box style={{ padding: 8, borderRadius: '50%', backgroundColor: 'var(--gray-3)' }}>
              <Icon name='upload' width="18" height="18" />
            </Box>
            <Flex direction="column">
                <Text size="2" weight="bold" color="gray">Upload File</Text>
                <Text size="1" color="gray">Supports PDF, Images, Excel, JSON...</Text>
            </Flex>
          </Flex>
        ) : (
          // --- SELECTED STATE ---
          <Flex align="center" gap="4" style={{ width: '100%' }}>
            
            {preview && previewUrl ? (
                <AspectRatio ratio={1} style={{ width: 48, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </AspectRatio>
            ) : (
                <Box style={{ 
                    width: 48, height: 48, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'var(--accent-3)', color: 'var(--accent-9)',
                    borderRadius: 6, flexShrink: 0
                }}>
                    {getFileIcon(selectedFile.type, selectedFile.name)}
                </Box>
            )}

            <Flex direction="column" style={{ flexGrow: 1, overflow: 'hidden' }}>
                <Text size="2" weight="bold" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {selectedFile.name}
                </Text>
                <Flex gap="2" align="center">
                    <Text size="1" color="gray">{formatBytes(selectedFile.size)}</Text>
                    <Badge size="1" color="gray" variant="soft">{selectedFile.name.split('.').pop()?.toUpperCase()}</Badge>
                </Flex>
            </Flex>

            <IconButton 
                size="1" 
                variant="ghost" 
                color="red" 
                onClick={handleClear}
                style={{ borderRadius: '50%', padding: 4 }}
            >
                <Icon name='close' width="16" height="16" />
            </IconButton>
          </Flex>
        )}
      </div>

       <div>
                <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputlabel}</Text>
                &nbsp;  
                {props.isHinted ?
                  <>
                  <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                      <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                      <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                      </a> 
                  </Tooltip>
                  </> : null} 
                {hasError ?
                  <>
                  <p id={errorId} className='core-input-label-error'>
                      {props.errorText || "Required field"}
                  </p>
                  </> : null } 
        </div>
    </Flex>
    </Column>
  );
};