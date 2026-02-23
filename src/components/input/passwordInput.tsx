import React, { useState } from "react";
import { useFormikContext, getIn } from "formik";
import { Column } from "layouts/column/column";
import { TextField, Text, Tooltip, IconButton, Flex } from '@radix-ui/themes'; 
import { Icon } from "components/icons/icons";
import { xInputFieldProps } from "./input";
import '../../styles/main.scss';

export const PasswordInput = ({
    alias,
    inputLabel,
    width, readOnly = false,
    placeholder = '', newRow, isHinted, hintText, hintUrl, errorText,
    inputvariant = 'input-outline', size = "2", 
    className, 
    formikContext,
    ...props 
}: xInputFieldProps) => {
    
    const [showPassword, setShowPassword] = useState(false);
    const toggleVisibility = () => setShowPassword(!showPassword);
    
    const defaultFormikContext = useFormikContext<any>();
    const activeContext = formikContext || defaultFormikContext;

    if (!activeContext) {
        console.error(`PasswordInput '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
        return null;
    }

    const { values, touched, errors, handleChange, handleBlur } = activeContext;

    const fieldValue = getIn(values, alias);
    const fieldTouched = getIn(touched, alias);
    const fieldError = getIn(errors, alias);

    const inputField = {
        name: alias,
        value: fieldValue !== undefined && fieldValue !== null ? fieldValue : '',
        onChange: handleChange,
        onBlur: handleBlur,
    };

    const hasError = Boolean(fieldTouched && fieldError);
    const variantClass = inputvariant !== 'input-outline' ? `input-${inputvariant}` : '';
    const errorId = `${alias}-error`;

    return (
        <Column span={width} newLine={newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                
                <TextField.Root
                    size={size} 
                    type={showPassword ? "text" : "password"} 
                    id={`${alias}FormInput`} 
                    readOnly={readOnly} 
                    aria-describedby={`${alias}InputLabel`}
                    placeholder={placeholder} 
                    color={hasError ? "red" : undefined}
                    className={`${variantClass} ${className || ''}`}
                    {...inputField} 
                    {...props} 
                >
                    <TextField.Slot>
                         <Icon name="lockclosed" height="16" width="16" style={{ color: 'var(--gray-10)' }} />
                    </TextField.Slot>

                    <TextField.Slot>
                        <Tooltip content={showPassword ? "Hide password" : "Show password"}>
                            <IconButton 
                                size="1" 
                                variant="ghost" 
                                color="gray" 
                                onClick={toggleVisibility} 
                                type="button"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                style={{ margin: 0 }}
                            >
                                {showPassword ? (
                                    <Icon name="eyeopen" height="16" width="16" />
                                ) : (
                                    <Icon name="eyeclosed" height="16" width="16" />
                                )}
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
                            <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>
                                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 

                    {hasError && (
                        <Text id={errorId} size="1" color="red" className='core-input-label-error' style={{ display: 'block', marginTop: 2 }}>
                            {errorText || (typeof fieldError === 'string' ? fieldError : `Required field`)}
                        </Text>
                    )} 
                </div>

            </Flex>
        </Column>
    );
};