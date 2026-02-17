import React, { ReactNode, useState, useMemo } from "react";
import { TextField, IconButton, Tooltip, Flex, Text } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { Icon } from "components/icons/icons";
import { useField, useFormikContext } from "formik"; 
import { Column } from "layouts/column/column";
import '../../styles/main.scss';

const safeParseUuidFormat = (typeString: string): number[] | null => {
    try {
        if (!typeString?.startsWith('uuid')) return null;
        const parts = typeString.split('-').slice(1).map(Number);
        return parts.length > 0 && !parts.some(isNaN) ? parts : null;
    } catch {
        return null;
    }
};

type startsWithUuid = `uuid${string}`;

interface UUIDInputProps {
    alias: string;
    type?: startsWithUuid | string; 
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
    inputVariant?: 'uuid' | 'uuid-outline' | 'uuid' | 'uuid-neumorphic';
    readOnly?: boolean;
    size?: "1" | "2" | "3";
}

export const UUIDInput = ({
    alias, 
    type = "uuid", 
    inputLabel, 
    width, 
    delimiter = "-",
    format = [8, 4, 4, 4, 12],
    placeholder = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', 
    newRow, 
    isHinted, 
    hintText, 
    hintUrl, 
    errorText,
    readOnly = false, 
    inputVariant = 'uuid-outline',
    size = "2", 
    className, 
    ...props
}: UUIDInputProps) => {

    const { setFieldValue, setFieldTouched } = useFormikContext();
    const [field, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    const [copied, setCopied] = useState(false);
    const errorId = `${alias}-error`;

    const activeFormat = useMemo(() => {
        const parsed = safeParseUuidFormat(type);
        return parsed || format;
    }, [type, format]);

    const maxHexChars = activeFormat.reduce((a, b) => a + b, 0);
    const maxTotalLength = maxHexChars + (activeFormat.length - 1); 

    const formatUUID = (value: string) => {
        if (!value) return "";
        
        const clean = value.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, maxHexChars);
        
        const parts = [];
        let currentIdx = 0;

        for (const len of activeFormat) {
            if (currentIdx >= clean.length) break;

            const chunk = clean.slice(currentIdx, currentIdx + len);
            parts.push(chunk);
            
            currentIdx += len;
        }

        return parts.join(delimiter);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const formatted = formatUUID(val);
        setFieldValue(alias, formatted);
    };

    const handleCopy = () => {
        if (field.value) {
            navigator.clipboard.writeText(field.value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const variantClass = inputVariant !== 'uuid-outline' ? `input-${inputVariant}` : '';

    return (
        <Column span={width} newLine={newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                
                <TextField.Root
                    size={size} 
                    name={`${alias}UUIDFormInput`}
                    variant="surface" 
                    color={hasError ? 'red' : undefined}
                    className={`${variantClass} ${className || ''}`}
                    {...props}
                >
                    <input
                        id={`${alias}FormInput`}
                        name={alias}
                        aria-describedby={`${alias}InputLabel`}
                        value={field.value || ''}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched(alias, true)}
                        maxLength={maxTotalLength}
                        readOnly={readOnly}
                        placeholder={placeholder}
                        autoComplete="off"
                        spellCheck={false}
                        
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            height: '100%',
                            paddingLeft: 'var(--space-2)',
                            color: 'var(--gray-12)',
                            fontFamily: 'var(--code-font-family, monospace)', 
                            fontSize: 'var(--font-size-2)',
                            textTransform: 'uppercase', 
                            width: '100%'
                        }}
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
                                style={{ margin: 0 }}
                            >
                                {copied ? <CheckIcon /> : <CopyIcon />}
                            </IconButton>
                        </Tooltip>
                    </TextField.Slot>
                </TextField.Root>

                <div>
                    {inputLabel && (
                        <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={`${alias}FormInput`}>
                            {inputLabel}
                        </Text>
                    )}
                    
                    {isHinted && (
                        <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                            <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray', marginLeft: 4 }} />
                            </a> 
                        </Tooltip>
                    )} 

                    {hasError && (
                        <Text id={errorId} size="1" color="red" style={{ display: 'block', marginTop: 2 }}>
                            {errorText || meta.error || "Required field"}
                        </Text>
                    )} 
                </div>

            </Flex>
        </Column>
    );
};