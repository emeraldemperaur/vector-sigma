import React, { ReactNode } from "react";
import { useField } from "formik";
import { Column } from "layouts/column/column"; 
import { TextField, Text, Tooltip } from '@radix-ui/themes';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import '../../styles/main.scss';

export type InputType = 'date' | 'datetime-local' | 'email' | 'hidden' | 'month' | 'number' 
    | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url' | 'week' ;

export type InputDesign = "input" | "input-material" | "input-outline" | "input-neumorphic"

export type xInputFieldProps = React.ComponentProps<typeof TextField.Root> & {
    alias: string, 
    inputtype?: InputType  & {}, 
    inputlabel?: string, width: number, newRow?: boolean, placeholder?: string, 
    readonly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string, 
    icon?: React.ReactNode, defaultValue?: string, value?: string, errorText?: ReactNode | string | null, className?: string, style?: React.CSSProperties;
    inputVariant?: InputDesign  & {}, delimiter?: string, format?: number[]
};

export const Input = ({
    alias,
    inputtype = "text",
    width, inputlabel, readonly = false,
    placeholder = '',
    className, size = "2",
    style,
    inputVariant = 'input-outline',
    ...props 
}: xInputFieldProps) => {
    
    const [inputField, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    const variantClass = inputVariant !== 'input-outline' ? `input-${inputVariant}` : '';
    const errorId = `${alias}-error`;

    return (
        <Column span={width} newLine={props.newRow}>
            <TextField.Root 
                size={size}
                type={inputtype} 
                id={`${alias}FormInput`} 
                aria-describedby={`${alias}InputLabel`}
                readOnly={readonly} 
                placeholder={placeholder} 
                color={hasError ? "red" : undefined}
                className={`${variantClass} ${className || ''}`}
                {...inputField}
                {...props}
                name={alias}
            >
            </TextField.Root>
            
            <div><br/>
                <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
                    {inputlabel}
                </Text>
                &nbsp;
                {props.isHinted && (
                    <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                        <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                            <QuestionMarkCircledIcon height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                        </a> 
                    </Tooltip>
                )} 
                 {hasError && (
                    <p id={errorId} className='core-input-label-error'>
                        {props.errorText || `Required field`}
                    </p>
                )} 
            </div>
        </Column>
    );
};