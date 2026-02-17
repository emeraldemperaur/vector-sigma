import React, { ReactNode, useState, useMemo } from "react";
import { TextField, IconButton, Tooltip, Flex, Text } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { Icon } from "components/icons/icons";
import { useField, useFormikContext } from "formik"; 
import { Column } from "layouts/column/column";
import { InputDesign } from "./input"; 
import { IMaskInput } from 'react-imask'; 
import '../../styles/main.scss';

const safeParseUuidFormat = (typeString: string): number[] | null => {
    try {
        if (!typeString.startsWith('uuid')) return null;
        const parts = typeString.split('-').slice(1).map(Number);
        return parts.length > 0 && !parts.some(isNaN) ? parts : null;
    } catch {
        return null;
    }
};

type startsWithUuid = `uuid${string}`;

type UUIDInputProps = {
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
    inputVariant?: InputDesign;
    readOnly?: boolean;
    size?: "1" | "2" | "3";
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

    const maskPattern = useMemo(() => {
        return activeFormat.map(len => '*'.repeat(len)).join(delimiter);
    }, [activeFormat, delimiter]);

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
                    {...(props as any)} 
                >
                   
                    <IMaskInput
                        mask={maskPattern}
                        definitions={{
                            '*': /[0-9a-fA-F]/
                        }}
                        prepare={(str) => str.toUpperCase()}
                        value={field.value || ''}
                        onAccept={(val: string) => {
                             setFieldValue(alias, val);
                        }}
                        onBlur={() => setFieldTouched(alias, true)}
                        id={`${alias}FormInput`}
                        placeholder={placeholder}
                        readOnly={readOnly}
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