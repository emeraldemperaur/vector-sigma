import React, { useState } from "react";
import { useField, useFormikContext } from 'formik';
import { Column } from "layouts/column/column";
import { TextField, Text, Tooltip, Select, Flex } from '@radix-ui/themes';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import type { Country, Value } from 'react-phone-number-input'; 
import Input, { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en.json';
import { FlagIcon } from "components/icons/flagicon";
import { Icon } from "components/icons/icons";
import { xInputFieldProps } from "./input";
import '../../styles/main.scss';

export const PhoneInput = ({
    alias,
    inputLabel,
    width,
    placeholder = "Phone Number", newRow, isHinted, hintText, hintUrl, errorText,
    readOnly,
    inputvariant = 'input-outline',
    size = "2",
    className,
    ...props
}: xInputFieldProps) => {
    
    const { setFieldValue, setFieldTouched } = useFormikContext();
    const [field, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    const [country, setCountry] = useState<Country>('US');
    const variantClass = inputvariant !== 'input-outline' ? `input-${inputvariant}` : '';
    const errorId = `${alias}-error`;

    return (
        <Column span={width} newLine={newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                <TextField.Root 
                    id={`${alias}FormInput`} 
                    size={size} 
                    variant="surface" 
                    color={hasError ? "red" : undefined}
                    className={`${variantClass} ${className || ''}`}
                    {...props}
                >
                    <TextField.Slot style={{ padding: 0 }}>
                        <Select.Root 
                            value={country} 
                            onValueChange={(value) => setCountry(value as Country)}
                        >
                            <Select.Trigger 
                                id={`${alias}PhoneSelect`}
                                variant="ghost" 
                                style={{ 
                                    height: '100%', 
                                    padding: '0 8px 0 12px', 
                                    gap: '6px',
                                    borderTopRightRadius: 0, 
                                    borderBottomRightRadius: 0,
                                    backgroundColor: 'var(--gray-3)', 
                                    borderRight: '1px solid var(--gray-alpha-5)'
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
                    </TextField.Slot>

                    <Input
                        country={country}
                        international
                        withCountryCallingCode={false} 
                        value={field.value || ''}
                        onChange={(val?: Value) => setFieldValue(alias, val || '')} 
                        onBlur={() => setFieldTouched(alias, true)}
                        readOnly={readOnly}
                        placeholder={placeholder}
                        id={`${alias}FormInput`}
                        aria-describedby={`${alias}InputLabel`}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            height: '100%',
                            paddingLeft: '12px',
                            color: 'var(--gray-12)',
                            fontFamily: 'var(--default-font-family)',
                            fontSize: 'var(--font-size-2)',
                            width: '100%'
                        }}
                    />
                </TextField.Root>

                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={`${alias}FormInput`}>
                        {inputLabel}
                    </Text>
                    
                    {isHinted && (
                        <Tooltip content={hintText || "No hint available"}>
                            <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                                <QuestionMarkCircledIcon height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 
                    {hasError && (
                        <Text id={errorId} size="1" color="red" className='core-input-label-error'>
                            {errorText || meta.error || `Required field`}
                        </Text>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};