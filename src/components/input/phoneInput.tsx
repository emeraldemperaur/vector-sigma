import React, { useState } from "react";
import { useField, useFormikContext } from 'formik';
import { Column } from "layouts/column/column";
import { TextField, Text, Tooltip, Select, Flex } from '@radix-ui/themes';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import type { Country } from 'react-phone-number-input';
import PhoneInputInput, { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en.json';
import { Icon } from "components/icons/icons";
import { FlagIcon } from "components/icons/flagicon";
import { xInputFieldProps } from "./input";
import '../../styles/main.scss';


export const PhoneInput = ({
    alias,
    inputLabel,
    width,
    placeholder = "Phone Number",
    readOnly,
    inputVariant = 'input-outline',
    size = "2", 
    className,
    ...props 
}: xInputFieldProps) => {
    
    const { setFieldValue, setFieldTouched } = useFormikContext();
    const [field, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    
    const [country, setCountry] = useState<Country>('US');

    const variantClass = inputVariant !== 'input-outline' ? `input-${inputVariant}` : '';

    return (
        <Column span={width} newLine={props.newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                <TextField.Root 
                    size={size} 
                    variant="surface" 
                    id={`${alias}FormInput`} 
                    aria-describedby={`${alias}InputLabel`}
                    color={hasError ? "red" : undefined}
                    className={`${variantClass} ${className || ''}`}
                    {...props}
                    name={alias}
                >
                    <TextField.Slot style={{ padding: 0 }}>
                        <Select.Root 
                            value={country} 
                            onValueChange={(value) => setCountry(value as Country)}
                        >
                            <Select.Trigger 
                                variant="ghost" 
                                style={{ 
                                    height: '100%', 
                                    padding: '0 8px 0 12px', 
                                    gap: '6px',
                                    borderTopRightRadius: 0, 
                                    borderBottomRightRadius: 0
                                }} 
                            >
                                <Flex align="center" gap="2">
                                    <FlagIcon country={country} />
                                    <Text weight="bold">+{getCountryCallingCode(country)}</Text>
                                    <Icon name="caret-down" style={{ width: "12px", opacity: 0.5 }}/>
                                </Flex>
                            </Select.Trigger>
                            <Select.Content position="popper" style={{ minWidth: '240px', maxHeight: '300px' }}>
                                {getCountries().map((c) => (
                                    <Select.Item key={c} value={c}>
                                        <Flex align="center" gap="2">
                                            <FlagIcon country={c} />
                                            <Text>{en[c]}</Text>
                                            <Text color="gray" size="1">
                                                (+{getCountryCallingCode(c)})
                                            </Text>
                                        </Flex>
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--gray-a4)', alignSelf: 'center' }} />
                    </TextField.Slot>

               
                    <PhoneInputInput
                        country={country}
                        value={field.value} 
                        onChange={(val) => setFieldValue(alias, val)}
                        onBlur={() => setFieldTouched(alias, true)}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        style={{
                            flex: 1, 
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            height: '100%',
                            paddingLeft: '12px',
                            color: 'var(--gray-12)',
                            fontFamily: 'var(--default-font-family)',
                            fontSize: 'var(--font-size-2)'
                        }}
                    />
                </TextField.Root>

                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
                        {inputLabel}
                    </Text>

                    {hasError && (
                        <Text size="1" color="red" className='core-input-label-error'>
                            {props.errorText || `Required field`}
                        </Text>
                    )} 

                    {props.isHinted && (
                        <Tooltip content={props.hintText || "No hint available"}>
                            <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                                <QuestionMarkCircledIcon height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};