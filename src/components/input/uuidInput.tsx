import React, { ReactNode, useState } from "react";
import { TextField, IconButton, Tooltip, Flex, Text } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { IMaskInput } from 'react-imask';
import { Icon } from "components/icons/icons";
import { useField, useFormikContext } from "formik"; 
import { parseUuidFormat } from "utils/uuidparser";
import { Column } from "layouts/column/column";
import { InputDesign } from "./input";
import '../../styles/main.scss';

type startsWithUuid = `uuid${string}`;

type UUIDInputProps = Omit<React.ComponentProps<typeof TextField.Root>, 'type' | 'onChange' | 'value' | 'defaultValue'> & {
    alias: string, type: startsWithUuid,
    inputLabel: string, width: number, newRow?: boolean,
    delimiter?: string, format?: number[],
    isHinted?: boolean, hintText?: string,
    hintUrl?: string, placeholder?: string, errorText?: ReactNode | string | null, className?: string
    inputVariant?: InputDesign & {}
};

export const UUIDInput = ({
    alias, type, inputLabel, width, delimiter = "-",
    format = [4, 4, 4, 4], placeholder = '',
    readOnly = false, inputVariant = 'input-outline',
    size = "2", className, ...props
}: UUIDInputProps) => {

    let activeFormat = format;
    if (type && type.toLowerCase().startsWith("uuid") && type.length > 4) {
        activeFormat = parseUuidFormat(type) || format;
    }
    const maskPattern = activeFormat.map(len => '*'.repeat(len)).join(delimiter);
    const { setFieldValue, setFieldTouched } = useFormikContext();
    const [field, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(field.value || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const variantClass = inputVariant !== 'input-outline' ? `input-${inputVariant}` : '';

    return (
        <Column span={width} newLine={props.newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                <TextField.Root 
                    size={size} 
                    variant="surface" 
                    color={hasError ? 'red' : undefined}
                    className={`${variantClass} ${className || ''}`}
                    {...props}
                >
                    <IMaskInput
                        id={`${alias}FormInput`}
                        name={alias}
                        aria-describedby={`${alias}InputLabel`}
                        readOnly={readOnly}
                        mask={maskPattern}
                        value={field.value || ''}
                        unmask={true} 
                        onAccept={(val: string) => setFieldValue(alias, val)}
                        onBlur={() => setFieldTouched(alias, true)}
                        placeholder={placeholder}
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

                    {hasError && (
                        <p className='core-input-label-error'>
                            {props.errorText || `Required field`}
                        </p>
                    )} 

                    {props.isHinted && (
                        <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                            <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};