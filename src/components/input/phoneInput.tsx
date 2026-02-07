import React, { useState } from "react";
import { Column } from "layouts/column/column";
import { TextField, Text, Tooltip, Select, Flex } from '@radix-ui/themes';
import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import type { Country } from 'react-phone-number-input';
import Input, { getCountries, getCountryCallingCode } from 'react-phone-number-input/input';
import en from 'react-phone-number-input/locale/en.json';
import { Icon } from "components/icons/icons";
import { FlagIcon } from "components/icons/flagicon";
import { useFormikContext } from "formik/dist/FormikContext";
import { useField } from "formik/dist/Field";
import '../../styles/main.scss';

export const PhoneInput = (
    alias: string, 
    inputLabel: string, width: number, newRow?: boolean, defaultValue?: string, value?: string,
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string) => {
        const { setFieldValue, setFieldTouched } = useFormikContext();
        const [field, meta] = useField(alias);
        const [country, setCountry] = useState<Country>('US');
        const hasError = Boolean(meta.touched && meta.error);


    return(
    <>
    <Column span={width} newLine={newRow}>
        <Flex direction="column" gap="2" style={{ width: '100%' }}>
            <TextField.Root size="2" variant="surface" id={`${alias}FormInput`} name={alias} aria-describedby={`${alias}InputLabel`}
            readOnly={readOnly} color={hasError ? "red" : undefined}>
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
                                <Icon name="caret-down" style={{width:"12", opacity: 0.5 }}/>
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
                            </Select.Item>))}
                        </Select.Content>
                    </Select.Root>
                    <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--gray-a4)', alignSelf: 'center' }} />
                </TextField.Slot>
                <Input
                    country={country}
                    value={field.value || value || defaultValue} 
                    onChange={(value) => setFieldValue(alias, value)}
                    onBlur={() => { setFieldTouched(alias, true) }}
                    placeholder={placeholder || "Phone Number"}
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
                    }}/>
            </TextField.Root>
            <div>
                <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputLabel}</Text>
                {hasError ? 
                <>
                    <p className='core-input-label-error'>{meta.error}</p>
                </> 
                : null }

                {isHinted ?
                <>
                <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                    <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                    <QuestionMarkCircledIcon height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                    </a> 
                </Tooltip>
                </> : null} 

            </div>
        </Flex>
    </Column>
    
    </>
    )
};