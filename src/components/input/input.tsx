import React, { ReactNode } from "react";
import { Column } from "layouts/column/column";
import { TextField, Text, Tooltip } from '@radix-ui/themes';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import '../../styles/main.scss';

export const Input = (
    alias: string, 
    inputtype: 'date' | 'datetime-local' | 'email' | 'hidden' | 'month' | 'number' 
    | 'password' | 'search' | 'tel' | 'text' | 'time' | 'url' | 'week', 
    onChange: React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>, touched: object, errorText: ReactNode | string | null, 
    inputLabel: string, width: number, defaultValue: string, value: string, newRow?: boolean, 
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string) => {
    return(
    <>
    <Column span={width} newLine={newRow}>
        <TextField.Root size="2" type={inputtype} id={`${alias}FormInput`} name={alias} aria-describedby={`${alias}InputLabel`}
        readOnly={readOnly} placeholder={placeholder || ""} defaultValue={defaultValue} value={value} 
        onChange={onChange}>
            <TextField.Slot>
               
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