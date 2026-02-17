import React, { ReactNode, useState, useMemo } from "react";
import { TextField, IconButton, Tooltip, Flex, Text } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { Icon } from "components/icons/icons";
import { useField, useFormikContext } from "formik"; 
import { Column } from "layouts/column/column";
import { InputDesign } from "./input"; 
import '../../styles/main.scss';

const safeParseUuidFormat = (typeString: string): number[] | null => {
    try {
        if (!typeString.startsWith('uuid')) return null;
        // "uuid-8-4-4-4-12" -> [8,4,4,4,12]
        const parts = typeString.split('-').slice(1).map(Number);
        return parts.length > 0 && !parts.some(isNaN) ? parts : null;
    } catch {
        return null;
    }
};

type startsWithUuid = `uuid${string}`;

type UUIDInputProps = Omit<React.ComponentProps<typeof TextField.Root>, 'type' | 'onChange' | 'value' | 'defaultValue'> & {
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
    inputVariant?: InputDesign & {};
};

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
    inputVariant = 'input-outline',
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

    const formatValue = (rawValue: string) => {
        if (!rawValue) return "";

        const clean = rawValue.replace(/[^0-9a-fA-F]/g, "").toUpperCase().slice(0, maxHexChars);

        const parts: string[] = [];
        let currentIndex = 0;

        for (let i = 0; i < activeFormat.length; i++) {
            const chunkLength = activeFormat[i];
            const remaining = clean.length - currentIndex;

            if (remaining > 0) {
                const chunk = clean.substr(currentIndex, chunkLength);
                parts.push(chunk);
                currentIndex += chunkLength;
            } else {
                break;
            }
        }

        return parts.join(delimiter);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const formatted = formatValue(val);
        setFieldValue(alias, formatted);
    };

    const handleCopy = () => {
        if (field.value) {
            navigator.clipboard.writeText(field.value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
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
                        
                        maxLength={maxTotalLength}
                        placeholder={placeholder}
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
                    {inputLabel && (
                        <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
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
                            {errorText || meta.error || `Required field`}
                        </Text>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};