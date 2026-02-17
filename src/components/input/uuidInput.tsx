import React, { ReactNode, useState, useMemo } from "react";
import { TextField, IconButton, Tooltip, Flex, Text } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { Icon } from "components/icons/icons";
import { useField, useFormikContext } from "formik"; 
import { parseUuidFormat } from "utils/uuidparser";
import { Column } from "layouts/column/column";
import { InputDesign } from "./input";
import '../../styles/main.scss';

type startsWithUuid = `uuid${string}`;

type UUIDInputProps = Omit<React.ComponentProps<typeof TextField.Root>, 'type' | 'onChange' | 'value' | 'defaultValue'> & {
    alias: string;
    type: startsWithUuid;
    inputLabel?: string;
    width: number;
    newRow?: boolean;
    delimiter?: string;
    format?: number[];
    isHinted?: boolean;
    hintText?: string;
    hintUrl?: string;
    placeholder?: string;
    errorText?: ReactNode | string | null;
    className?: string;
    inputVariant?: InputDesign & {};
};

export const UUIDInput = ({
    alias, type, inputLabel, width, delimiter = "-",
    format = [8, 4, 4, 4, 12], 
    placeholder = '', newRow, isHinted, hintText, hintUrl, errorText,
    readOnly = false, inputVariant = 'input-outline',
    size = "2", className, ...props
}: UUIDInputProps) => {

    const { setFieldValue, setFieldTouched } = useFormikContext();
    const [field, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    const [copied, setCopied] = useState(false);
    const errorId = `${alias}-error`;

    const activeFormat = useMemo(() => {
        if (type && type.toLowerCase().startsWith("uuid") && type.length > 4) {
             const parsed = parseUuidFormat(type);
             if (parsed) return parsed;
        }
        return format;
    }, [format, type]);

    const maxRawLength = activeFormat.reduce((a, b) => a + b, 0);

    const formatUUID = (rawValue: string) => {
        const clean = rawValue.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, maxRawLength);
        let formatted = '';
        let currentIdx = 0;
        
        for (let i = 0; i < activeFormat.length; i++) {
            const chunkLen = activeFormat[i];
            if (currentIdx + chunkLen <= clean.length) {
                formatted += clean.substring(currentIdx, chunkLen);
                if (i < activeFormat.length - 1) {
                    formatted += delimiter;
                }
            } 
            else {
                formatted += clean.substring(currentIdx);
                break; 
            }
            
            currentIdx += chunkLen;
        }
        
        return formatted;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        const formatted = formatUUID(newVal);
        setFieldValue(alias, formatted);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(field.value || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const variantClass = inputVariant !== 'input-outline' ? `input-${inputVariant}` : '';

    return (
        <Column span={width} newLine={newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                <TextField.Root 
                    size={size} 
                    variant="surface" 
                    color={hasError ? 'red' : undefined}
                    className={`${variantClass} ${className || ''}`}
                    {...props}
                >
                    <input
                        id={`${alias}FormInput`}
                        name={alias}
                        aria-describedby={`${alias}InputLabel`}
                        readOnly={readOnly}
                        
                        value={field.value || ''}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched(alias, true)}
                        
                        placeholder={placeholder || 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'}
                        maxLength={maxRawLength + (activeFormat.length - 1)}
                        type="text"
                        
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            height: '100%',
                            paddingLeft: '8px',
                            color: 'var(--gray-12)',
                            fontFamily: 'var(--code-font-family)',
                            fontSize: 'var(--font-size-2)',
                            textTransform: 'uppercase',
                            width: '100%'
                        }}
                        autoComplete="off"
                        spellCheck={false}
                    />

                    <TextField.Slot>
                        <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                            <IconButton 
                                size="1" 
                                variant="ghost" 
                                color={copied ? "green" : "gray"}
                                onClick={handleCopy}
                                type="button"
                                disabled={!field.value}
                            >
                                {copied ? <CheckIcon /> : <CopyIcon />}
                            </IconButton>
                        </Tooltip>
                    </TextField.Slot>
                </TextField.Root>

                <div>
                    <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
                        {inputLabel}
                    </Text>
                    &nbsp;
                    {isHinted && (
                        <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                            <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 
                    {hasError && (
                        <p id={errorId} className='core-input-label-error'>
                            {errorText || meta.error || `Required field`}
                        </p>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};