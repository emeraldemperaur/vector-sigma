import React, { useState } from "react";
import { useField } from "formik";
import { Column } from "layouts/column/column";
import { TextField, Text, Tooltip, IconButton } from '@radix-ui/themes'; 
import { Icon } from "components/icons/icons";
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { xInputFieldProps } from "./input";
import '../../styles/main.scss';

export const PasswordInput = ({
    alias,
    inputlabel,
    width, readonly = false,
    placeholder = '',
    inputvariant = 'input-outline', size = "2", 
    className, ...props 
}: xInputFieldProps) => {
    
    const [showPassword, setShowPassword] = useState(false);
    const toggleVisibility = () => setShowPassword(!showPassword);
    const [field, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    const variantClass = inputvariant !== 'input-outline' ? `input-${inputvariant}` : '';''
    const errorId = `${alias}-error`;

    return (
        <Column span={width} newLine={props.newrow}>
            <TextField.Root
                size={size} 
                type={showPassword ? "text" : "password"} 
                id={`${alias}FormInput`} 
                readOnly={readonly} 
                aria-describedby={`${alias}InputLabel`}
                placeholder={placeholder} 
                color={hasError ? "red" : undefined}
                className={`${variantClass} ${className || ''}`}
                {...field} 
                {...props} 
                name={alias} 
            >
                <TextField.Slot>
                     <Icon name="lockclosed" height="16" width="16" />
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
                <br/>
                <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
                    {inputlabel}
                </Text>
                &nbsp;
                {props.ishinted && (
                    <Tooltip content={props.hinttext || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                        <a href={props.hinturl || ""} target="_blank" rel="noopener noreferrer">
                            <QuestionMarkCircledIcon height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                        </a> 
                    </Tooltip>
                )} 
                {hasError && (
                    <p id={errorId} className='core-input-label-error'>
                        {props.errortext || `Required field`}
                    </p>
                )} 
            </div>
        </Column>
    );
};