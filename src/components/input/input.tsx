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
    /**
   * * The required unique identifier for the Input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="userInput"
   */
    alias: string; 
    /**
   * * The optional input value type for the Input field. 
   * Default: 'text'
   * Options: "number" | "hidden" | "date" | "datetime-local" | 
   * "email" | "month" | "password" | "search" | 
   * "tel" | "text" | "time" | "url" | "week"
   * * @example
   * inputtype="email"
   */
    inputtype?: InputType; 
    /**
   * * The optional input label or description for the Input field. 
   * * @example
   * inputLabel="Upload PMP® Certication"
   */
    inputLabel?: string; 
    /**
   * * The required viewport column width for the Input field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */
    width: number; 
    /**
   * * Option to render Input field on new row.
   * * @example
   * newRow
   */
    newRow?: boolean; 
    /**
   * * Option to force set the default value for Input field.
   * * @example
   * placeholder="Enter a value"
   */
    placeholder?: string; 
     /**
   * * Option to disable edits for Input field.
   * * @example
   * readOnly
   */
    readOnly?: boolean;
    /**
     * * Option to enable a hint for Input field.
     * * @example
     * isHinted
     */  
    isHinted?: boolean; 
    /**
   * * Option to specify hint text for Input field.
   * * @example
   * hintText="This is a hint for a VΣ Input field"
   */
    hintText?: string; 
    /**
   * * Option to specify a hint url reference or resource for Input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */
    hintUrl?: string; 
    /**
    * * Option to render Input field with icon passed as a ReactNode {}.
    * * @example
    * icon={<Icon name="stack"/>}
    */
    icon?: React.ReactNode; 
    /**
   * * Option to specify the isRequired error text for the Input field.
   * * @example
   * errorText="Username is required"
   */
    errorText?: ReactNode | string | null; 
    /**
   * * Option to specify the .scss class selector for the Input field.
   * * @example
   * className="teletraan-1-input"
   */
    className?: string; 
    /**
   * * Option to inject custom CSS the Input field.
   * * @example
   * style={{ color: "#000000" }}
   */
    style?: React.CSSProperties;
    /**
   * * The design variation of the Input field. 
   * Default: 'input-outline' 
   * Variants: 'input', 'input-outline', 'input-material', 'input-neumorphic'.
   * * @example
   * inputvariant="input-neumorphic"
   */
    inputvariant?: InputDesign;
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