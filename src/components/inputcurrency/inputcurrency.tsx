import React, { ReactNode } from "react";
import { CURRENCIES, SupportedCurrency, CurrencyOption } from '../../utils/currencyconfig'; 
import { useField, useFormikContext } from 'formik';
import { Flex, Text, Select, Tooltip } from '@radix-ui/themes';
import { IMaskInput } from 'react-imask';
import { FlagIcon } from "components/icons/flagicon";
import { Icon } from "components/icons/icons";
import { Column } from "layouts/column/column";
import '../../styles/main.scss';

export const CurrencyInput = (
    alias: string, 
    inputtype: SupportedCurrency | "currency", 
    onChange: React.ChangeEventHandler<HTMLInputElement, HTMLInputElement>, touched: object, errorText: ReactNode | string | null, 
    inputLabel: string, width: number, defaultValue: string, value: string, newRow?: boolean, 
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string) => {

        const { setFieldValue, setFieldTouched } = useFormikContext(); 
        const [amountField, amountMeta] = useField(alias);
        const [currencyField] = useField(inputtype == "currency" ? "USD" : inputtype);
        const hasError = Boolean(amountMeta.touched && amountMeta.error);
        const activeCurrency = CURRENCIES[currencyField.value as SupportedCurrency] || CURRENCIES.USD;


    return(
        <>
        <Column span={width} newLine={newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                <Flex 
                    align="center"
                    className="rt-TextFieldRoot rt-r-size-2 rt-variant-surface"
                    style={{
                    width: '100%',
                    boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : undefined,
                    backgroundColor: 'var(--color-surface)',
                    cursor: 'text'
                    }}
                >
                    
                    {/* 1. Currency Dropdown (Left) */}
                    <Select.Root 
                    value={activeCurrency.code} 
                    onValueChange={(val) => setFieldValue(inputtype == "currency" ? "USD" : inputtype, val)}  
                    >
                    <Select.Trigger 
                        variant="ghost" 
                        style={{ 
                        height: '100%', 
                        padding: '0 8px 0 12px', 
                        gap: '6px',
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        backgroundColor: 'var(--gray-3)' 
                        }}
                    >
                        <Flex align="center" gap="2">
                        <FlagIcon country={activeCurrency.country} />
                        <Text weight="bold" size="2">{activeCurrency.code}</Text>
                        <Icon name="caret-down" style={{ opacity: 0.5 }} />
                        </Flex>
                    </Select.Trigger>
                    
                    <Select.Content position="popper">
                        {Object.values(CURRENCIES).map((c: CurrencyOption) => (
                        <Select.Item key={c.code} value={c.code}>
                            <Flex align="center" gap="2">
                            <FlagIcon country={c.country} />
                            <Text>{c.code}</Text>
                            <Text color="gray" size="1">({c.symbol})</Text>
                            </Flex>
                        </Select.Item>
                        ))}
                    </Select.Content>
                    </Select.Root>

                    <Text color="gray" size="2" style={{ paddingLeft: '12px', userSelect: 'none' }}>
                    {activeCurrency.symbol}
                    </Text>

                    <IMaskInput
                        id={`${alias}FormInput`}
                        name={alias}
                        aria-describedby={`${alias}InputLabel`}
                        mask={Number}
                        scale={activeCurrency.scale}
                        defaultValue={defaultValue}
                        readOnly={readOnly}
                        // @ts-expect-error: known library type definition gap
                        signed={false}            
                        thousandsSeparator=","
                        padFractionalZeros={true} // Auto-fill .00
                        normalizeZeros={true}
                        radix="."
                        mapToRadix={['.']}
                        // Formik Binding
                        value={amountField.value || value ? String(amountField.value || value) : ''}
                        unmask={true} // Return raw number string
                        onAccept={(val) => setFieldValue(alias, val)}
                        onBlur={() => setFieldTouched(alias || value, true)} 
                        placeholder={placeholder || '0.00'}
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            height: '100%',
                            padding: '0 12px 0 4px', 
                            color: 'var(--gray-12)',
                            fontFamily: 'var(--default-font-family)',
                            fontSize: 'var(--font-size-2)',
                            textAlign: 'right',
                            width: '100%'
                        }}
                        inputMode="decimal"
                        autoComplete="off"
                    />

                </Flex>
                <div>
                    <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputLabel}</Text>

                    {hasError ?
                    <>
                    <p className='core-input-label-error'>
                        {amountMeta.error}
                    </p>
                    </> : null } 

                    {isHinted ?
                    <>
                    <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                        <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                        <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                        </a> 
                    </Tooltip>
                    </> : null} 
                </div>
            </Flex>
        </Column>
        </>
    )
};