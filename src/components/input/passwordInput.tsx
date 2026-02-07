import React, { ReactNode, useState } from "react";
import { Column } from "layouts/column/column";
import { TextField, Text, Tooltip, IconButton } from '@radix-ui/themes';
import { EyeNoneIcon, EyeOpenIcon, QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import '../../styles/main.scss';
import { Icon } from "components/icons/icons";

export const PasswordInput = (
    alias: string, 
    onChange: React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>, touched: object, errorText: ReactNode | string | null, 
    inputLabel: string, width: number, defaultValue: string, value: string, newRow?: boolean, 
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string) => {
        const [showPassword, setShowPassword] = useState(false);
        const toggleVisibility = () => setShowPassword(!showPassword);

    return(
    <>
    <Column span={width} newLine={newRow}>
        <TextField.Root size="2" type={showPassword ? "text" : "password"} id={`${alias}FormInput`} name={alias} aria-describedby={`${alias}InputLabel`}
        readOnly={readOnly} placeholder={placeholder || "Enter password"} defaultValue={defaultValue} value={value} 
        onChange={onChange}> 
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
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputLabel}</Text>

            {errorText && touched ?
            <>
            <p className='core-input-label-error'>
                {errorText}
            </p>
            </> : null } 

            {isHinted ?
            <>
            <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                <QuestionMarkCircledIcon height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                </a> 
            </Tooltip>
            </> : null} 

        </div>
        

    </Column>
    
    </>
    )
};