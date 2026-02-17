import React, { ReactNode, useEffect } from "react";
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
    inputtype?: SupportedCurrency | "currency", 
    inputLabel?: string, 
    width: number, 
    newRow?: boolean, 
    defaultvalue?: string, 
    placeholder?: string, 
    readOnly?: boolean, 
    isHinted?: boolean, 
    hintText?: string, 
    errorText?: ReactNode | string | null, 
    hintUrl?: string, 
    inputvariant?: InputDesign & {}, 
    className?: string
};

export const CurrencyInput = ({
    alias, 
    inputtype = "currency",
    inputLabel, 
    width,
    defaultvalue = "USD", 
    placeholder, newRow, isHinted, hintText, hintUrl, errorText,
    readOnly = false, 
    inputvariant = 'input-outline',
    className, 
    ...props
}: CurrencyInputProps) => {

    const { setFieldValue, setFieldTouched } = useFormikContext(); 
    const [amountField, amountMeta] = useField(alias);
    const currencyAlias = `${alias}Currency`; 
    const [currencyField, , currencyHelpers] = useField(currencyAlias);

    useEffect(() => {
        if (inputtype !== "currency" && CURRENCIES[inputtype as SupportedCurrency]) {
             currencyHelpers.setValue(inputtype);
        } 
        else if (!currencyField.value) {
             currencyHelpers.setValue(defaultvalue);
        }
    }, [inputtype, defaultvalue]);

    const hasError = Boolean(amountMeta.touched && amountMeta.error);
    const currentCode = (currencyField.value as SupportedCurrency) || "USD";
    const activeCurrency = CURRENCIES[currentCode] || CURRENCIES.USD;

    const variantClass = inputvariant !== 'input-outline' ? `input-${inputvariant}` : '';
    const isOutline = inputvariant === 'input-outline';
    const errorId = `${alias}-error`;

    return (
        <Column span={width} newLine={newRow}>
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
                        onValueChange={(val) => setFieldValue(currencyAlias, val)}  
                        disabled={readOnly || inputtype !== "currency"} 
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
                        {...({
                            mask: Number,
                            scale: activeCurrency.scale,
                            signed: String(false),
                            thousandsSeparator: ",",
                            padFractionalZeros: true,
                            normalizeZeros: true,
                            radix: ".",
                            mapToRadix: ['.'],
                        } as any)}
                        value={amountField.value !== undefined && amountField.value !== null ? String(amountField.value) : ''}
                        unmask={true}
                        onAccept={(val: string) => setFieldValue(alias, val)}
                        onBlur={() => setFieldTouched(alias, true)} 
                        readOnly={readOnly}
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
                    {isHinted && (
                        <Tooltip content={hintText || "No hint available"}>
                            <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 
                    {hasError && (
                        <Text id={errorId} size="1" color="red" className='core-input-label-error'>
                            {errorText || amountMeta.error || `Required field`}
                        </Text>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};