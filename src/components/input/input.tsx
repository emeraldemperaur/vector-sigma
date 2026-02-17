import React, { ReactNode } from "react";
import { useField } from "formik";
import { Column } from "layouts/column/column"; 
import { TextField, Text, Tooltip, Flex } from '@radix-ui/themes';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import '../../styles/main.scss';

export type InputType = 'date' | 'datetime-local' | 'email' | 'hidden' | 'month' | 'number' 
    | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url' | 'week' ;

export type InputDesign = "input" | "input-material" | "input-outline" | "input-neumorphic"

export type xInputFieldProps = React.ComponentProps<typeof TextField.Root> & {
    alias: string, 
    inputtype?: InputType, 
    inputLabel?: string, 
    width: number, 
    newRow?: boolean, 
    placeholder?: string, 
    readOnly?: boolean, 
    isHinted?: boolean, 
    hintText?: string, 
    hintUrl?: string, 
    icon?: React.ReactNode, 
    defaultvalue?: string, 
    value?: string, 
    errorText?: ReactNode | string | null, 
    className?: string, 
    style?: React.CSSProperties;
    inputvariant?: InputDesign, 
    delimiter?: string, 
    format?: number[]
};

export const Input = ({
    alias,
    inputtype = "text",
    width, 
    inputLabel, 
    readOnly = false,
    placeholder = '', 
    newRow, 
    isHinted, 
    hintText, 
    hintUrl, 
    errorText,
    className, 
    size = "2",
    style,
    inputvariant = 'input-outline',
    icon,
    ...props 
}: xInputFieldProps) => {
    
    const [inputField, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    const variantClass = inputvariant !== 'input-outline' ? `input-${inputvariant}` : '';
    const errorId = `${alias}-error`;

    return (
        <Column span={width} newLine={newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                <TextField.Root 
                    {...inputField} 
                    size={size}
                    variant="surface"
                    color={hasError ? "red" : undefined}
                    type={inputtype} 
                    id={`${alias}FormInput`} 
                    aria-describedby={`${alias}InputLabel`}
                    readOnly={readOnly} 
                    placeholder={placeholder} 
                    className={`${variantClass} ${className || ''}`}
                    style={style}
                    {...props}
                >
                    {icon && (
                        <TextField.Slot>
                            {icon}
                        </TextField.Slot>
                    )}
                </TextField.Root>
                <div>
                    {inputLabel && (
                        <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={`${alias}FormInput`}>
                            {inputLabel}
                        </Text>
                    )}
                    {isHinted && (
                        <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                            <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>
                                <QuestionMarkCircledIcon height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 
                    {hasError && (
                        <Text id={errorId} size="1" color="red" className='core-input-label-error' style={{ display: 'block', marginTop: 2 }}>
                            {errorText || meta.error || `Required field`}
                        </Text>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};