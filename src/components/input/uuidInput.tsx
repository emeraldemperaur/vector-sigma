import React, { useState } from "react";
import { TextField, IconButton, Tooltip, Flex, Text } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { IMaskInput } from 'react-imask';
import { Icon } from "components/icons/icons";
import { useField } from "formik/dist/Field";
import { useFormikContext } from "formik/dist/FormikContext";
import { Column } from "index";
import { parseUuidFormat } from "utils/uuidparser";
import '../../styles/main.scss';
type startsWithUuid = `uuid${string}`;

export const UUIDInput = (
    alias: string, type: startsWithUuid,
    inputLabel: string, width: number, defaultValue: string,  delimiter?: string, 
    format: number[] = [4, 4, 4, 4], newRow?: boolean, 
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string) => {
        if (!type.startsWith("uuid")) { 
            format = format; // Default UUID format
        }
        if (type.toLocaleLowerCase().startsWith("uuid")) {
            format = parseUuidFormat(type) || format;
        }
        const { setFieldValue, setFieldTouched } = useFormikContext();
        const [field, meta] = useField(alias);
        const [uuidFormat] = useState<number[]>(format);
        const maskPattern = uuidFormat.map(len => '*'.repeat(len)).join(delimiter || "-");  
        const [copied, setCopied] = useState(false);
        const hasError = Boolean(meta.touched && meta.error);

        const handleCopy = () => {
            navigator.clipboard.writeText(field.value || '');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };
        
    return(
    <>
    <Column span={width} newLine={newRow}>
       <Flex direction="column" gap="2" style={{ width: '100%' }}>
        <TextField.Root 
            size="2" 
            variant="surface" 
            color={hasError ? 'red' : undefined}>
                <IMaskInput
                    id={`${alias}FormInput`}
                    name={alias}
                    aria-describedby={`${alias}InputLabel`}
                    readOnly={readOnly}
                    mask={maskPattern}
                    defaultValue={defaultValue}
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
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputLabel}</Text>

            {hasError ?
            <>
            <p className='core-input-label-error'>
                {meta.error}
            </p>
            </> : null } 

            {isHinted ?
            <>
            <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                </a> 
            </Tooltip>
            </> : null} 
        </div>
        </Flex>
    </Column>
    </>
    )
};