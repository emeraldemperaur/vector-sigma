import React, { ReactNode } from "react";
import { CURRENCIES, SupportedCurrency, CurrencyOption } from '../../utils/currencyconfig'; 
import { useField, useFormikContext } from 'formik';
import { Flex, Text, Select, Tooltip } from '@radix-ui/themes';
import { IMaskInput } from 'react-imask';
import { FlagIcon } from "components/icons/flagicon";
import { Icon } from "components/icons/icons";
import { Column } from "layouts/column/column";
import { InputDesign } from "components/input/input";
import '../../styles/main.scss';

type CurrencyInputProps = {
    alias: string, 
    inputtype?: SupportedCurrency & {} | "currency", 
    inputLabel?: string, width: number, newRow?: boolean, defaultValue?: string,
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, 
    errorText?: ReactNode | string | null, hintUrl?: string, inputVariant?: InputDesign & {}, 
    className?: string
};

export const CurrencyInput = ({
    alias, inputtype = "currency",
    inputLabel=undefined, width,
    defaultValue, placeholder,
    readOnly=false, inputVariant = 'input-outline',
    className, ...props}: CurrencyInputProps) => {

    const { setFieldValue, setFieldTouched } = useFormikContext(); 
    const [amountField, amountMeta] = useField(alias);
    const currencyFieldName = inputtype === "currency" ? "USD" : inputtype;
    const [currencyField] = useField(currencyFieldName);
    const hasError = Boolean(amountMeta.touched && amountMeta.error);
    const activeCurrency = CURRENCIES[currencyField.value as SupportedCurrency] || CURRENCIES.USD;
    const variantClass = inputVariant !== 'input-outline' ? `input-${inputVariant}` : '';
    const isOutline = inputVariant === 'input-outline';
    const errorId = `${alias}-error`;

    return (
        <Column span={width} newLine={props.newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                <Flex 
                    align="center"
                    className={`rt-TextFieldRoot rt-r-size-2 rt-variant-surface ${variantClass} ${className || ''}`}
                    style={{
                        width: '100%',
                        boxShadow: (isOutline && hasError) ? 'inset 0 0 0 1px var(--red-9)' : undefined,
                        backgroundColor: isOutline ? 'var(--color-surface)' : undefined,
                        cursor: 'text'
                    }}
                >
                    <Select.Root 
                        value={activeCurrency.code} 
                        onValueChange={(val) => setFieldValue(currencyFieldName, val)}  
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
                        padFractionalZeros={true}
                        normalizeZeros={true}
                        radix="."
                        mapToRadix={['.']}
                        // Bind to Amount Field
                        value={amountField.value !== undefined && amountField.value !== null ? String(amountField.value) : ''}
                        unmask={true}
                        onAccept={(val: string) => setFieldValue(alias, val)}
                        onBlur={() => setFieldTouched(alias, true)} 
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
                    <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
                        {inputLabel}
                    </Text>
                    &nbsp;
                    {props.isHinted && (
                        <Tooltip content={props.hintText || "No hint available"}>
                            <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 
                     {hasError && (
                        <Text id={errorId} size="1" color="red" className='core-input-label-error'>
                            {props.errorText || `Required field`}
                        </Text>
                    )} 

                </div>
            </Flex>
        </Column>
    );
};