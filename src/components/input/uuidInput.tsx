import React, { ReactNode, useState, useMemo } from "react";
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
    alias: string;
    type: startsWithUuid;
    inputlabel?: string;
    width: number;
    newrow?: boolean;
    delimiter?: string;
    format?: number[];
    ishinted?: boolean;
    hinttext?: string;
    hinturl?: string;
    placeholder?: string;
    errortext?: ReactNode | string | null;
    classname?: string;
    inputvariant?: InputDesign & {};
};

export const UUIDInput = ({
    alias, type, inputlabel, width, delimiter = "-",
    format = [4, 4, 4, 4], placeholder = '',
    readOnly = false, inputvariant = 'input-outline',
    size = "2", className, ...props
}: UUIDInputProps) => {

    const { setFieldValue, setFieldTouched } = useFormikContext();
    const [field, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    const [copied, setCopied] = useState(false);
    const errorId = `${alias}-error`;

    const { maskPattern, definitions } = useMemo(() => {
        let activeFormat = format;
        
        if (type && type.toLowerCase().startsWith("uuid") && type.length > 4) {
             const parsed = parseUuidFormat(type);
             if (parsed) activeFormat = parsed;
        }
        const maskChar = '#'; 
        const pattern = activeFormat.map(len => maskChar.repeat(len)).join(delimiter);
        
        return {
            maskPattern: pattern,
            definitions: {
                '#': /[0-9a-fA-F]/ 
            }
        };
    }, [format, type, delimiter]);

    const handleCopy = () => {
        navigator.clipboard.writeText(field.value || '');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const variantClass = inputvariant !== 'input-outline' ? `input-${inputvariant}` : '';

    return (
        <Column span={width} newLine={props.newrow}>
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
                        definitions={definitions}
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
                        {inputlabel}
                    </Text>
                    &nbsp;
                    {props.ishinted && (
                        <Tooltip content={props.hinttext || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                            <a href={props.hinturl || ""} target="_blank" rel="noopener noreferrer">
                                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 
                    {hasError && (
                        <p id={errorId} className='core-input-label-error'>
                            {props.errortext || meta.error || `Required field`}
                        </p>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};