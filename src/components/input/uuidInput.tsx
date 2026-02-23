import React, { ReactNode, useState, useMemo } from "react";
import { TextField, IconButton, Tooltip, Flex, Text } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { Icon } from "components/icons/icons";
import { FormikContextType, useFormikContext, getIn } from "formik"; 
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
    /**
   * * The required unique identifier for the Input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="userUUIDNumber"
   */
    alias: string;
    type?: startsWithUuid | string;
    /**
   * * The optional input label or description for the UUIDInput field. 
   * * @example
   * inputLabel="PMP® Certication Number"
   */ 
    inputLabel?: string;
    /**
   * * The required viewport column width for the UUIDInput field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */
    width: number;
    /**
   * * Option to render UUIDInput field on new row.
   * * @example
   * newRow
   */
    newRow?: boolean;
    delimiter?: string;
    format?: number[];
    /**
     * * Option to enable a hint for UUIDInput field.
     * * @example
     * isHinted
     */  
    isHinted?: boolean;
    /**
   * * Option to specify hint text for UUIDInput field.
   * * @example
   * hintText="This is a hint for a VΣ UUIDInput field"
   */
    hintText?: string;
    /**
   * * Option to specify a hint url reference or resource for Input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */
    hintUrl?: string;
    /**
   * * Option to force set the default value for UUIDInput field.
   * * @example
   * placeholder="Enter VΣ UUID"
   */
    placeholder?: string;
    /**
   * * Option to specify the isRequired error text for the UUIDInput field.
   * * @example
   * errorText="UUID is required"
   */
    errorText?: ReactNode | string | null;
    /**
   * * Option to specify the .scss class selector for the UUIDInput field.
   * * @example
   * className="teletraan-1-uuid"
   */
    className?: string;
    inputVariant?: 'uuid' | 'uuid-outline' | 'uuid' | 'uuid-neumorphic';
    /**
   * * Option to disable edits for UUIDInput field.
   * * @example
   * readOnly
   */
    readOnly?: boolean;
    /**
   * * Option to set text size for UUIDInput field.
   * * @example
   * readOnly
   */
    size?: "1" | "2" | "3";
    /**
     * * Optional explicit Formik context. Useful when bypassing duplicate 
     * context issues in monorepos or bundled npm packages.
     */
    formikContext?: FormikContextType<any>;
}

export const UUIDInput = ({
    alias, 
    type = "uuid-4-4-4-4", 
    inputLabel, 
    width, 
    delimiter = "-",
    format = [4, 4, 4, 4],
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
    formikContext,
    ...props
}: UUIDInputProps) => {

    const defaultFormikContext = useFormikContext<any>();
    const activeContext = formikContext || defaultFormikContext;

    if (!activeContext) {
        console.error(`UUIDInput '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
        return null;
    }

    const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

    const fieldValue = getIn(values, alias);
    const fieldTouched = getIn(touched, alias);
    const fieldError = getIn(errors, alias);

    const hasError = Boolean(fieldTouched && fieldError);
    const [copied, setCopied] = useState(false);
    const [uuidNumber, setUUIDNumber] = useState("");
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
        setUUIDNumber(formatted);
        setFieldValue(alias, formatted);
    };

    const handleCopy = () => {
        if (fieldValue) {
            navigator.clipboard.writeText(fieldValue);
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
                        value={fieldValue || ''}
                        onChange={handleChange}
                        onBlur={() => setFieldTouched(alias, true, false)}
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
                                disabled={!fieldValue}
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
                            {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
                        </Text>
                    )} 
                </div>

            </Flex>
        </Column>
    );
};