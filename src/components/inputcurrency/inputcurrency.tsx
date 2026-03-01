import React, { ReactNode, useEffect } from "react";
import { CURRENCIES, SupportedCurrency, CurrencyOption } from '../../utils/currencyconfig'; 
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, Select, Tooltip } from '@radix-ui/themes';
import { IMaskInput } from 'react-imask';
import { FlagIcon } from "components/icons/flagicon";
import { Icon } from "components/icons/icons";
import { Column } from "layouts/column/column";
import { InputDesign } from "components/input/input";
import '../../styles/main.scss';

type CurrencyInputProps = {
    /**
   * * The required unique identifier for the CurrencyInput field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="productSKUPrice"
   */
    alias: string;
    /**
   * * The optional input value type for the CurrencyInput field. 
   * Default: 'currency' -> "USD"
   * Options: "USD" | "CAD" | "MXN" | "GTQ" | "CRC" | "DOP" | "JMD" | "PAB" | "BRL" 
   * | "ARS" | "COP" | "CLP" | "PEN" | "UYU" | "PYG" | "BOB" | "VES" | "EUR" | "GBP" 
   * | "CHF" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "RON" | "ISK" | "UAH" 
   * | "JPY" | "CNY" | "HKD" | "TWD" | "INR" | "KRW" | "SGD" | "MYR" | "THB" | "VND" 
   * | "PHP" | "IDR" | "PKR" | "AED" | "SAR" | "ILS" | "TRY" | "QAR" | "ZAR" | "NGN" 
   * | "EGP" | "KES" | "GHS" | "MAD" | "TZS" | "UGX" | "XOF" | "AUD" | "NZD" | "FJD"
   * * @example
   * inputtype="currency"
   */ 
    inputtype?: SupportedCurrency | "currency";
    /**
   * * The optional input label or description for the CurrencyInput field. 
   * * @example
   * inputLabel="VΣ Product Price"
   */ 
    inputLabel?: string;
    /**
   * * The required viewport column width for the CurrencyInput field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */
    width: number;
    /**
   * * Option to render CurrencyInput field on new row.
   * * @example
   * newRow
   */
    newRow?: boolean; 
     /**
   * * The optional default currency for the CurrencyInput field. 
   * Default: 'USD'
   * Options: "USD" | "CAD" | "MXN" | "GTQ" | "CRC" | "DOP" | "JMD" | "PAB" | "BRL" 
   * | "ARS" | "COP" | "CLP" | "PEN" | "UYU" | "PYG" | "BOB" | "VES" | "EUR" | "GBP" 
   * | "CHF" | "SEK" | "NOK" | "DKK" | "PLN" | "CZK" | "HUF" | "RON" | "ISK" | "UAH" 
   * | "JPY" | "CNY" | "HKD" | "TWD" | "INR" | "KRW" | "SGD" | "MYR" | "THB" | "VND" 
   * | "PHP" | "IDR" | "PKR" | "AED" | "SAR" | "ILS" | "TRY" | "QAR" | "ZAR" | "NGN" 
   * | "EGP" | "KES" | "GHS" | "MAD" | "TZS" | "UGX" | "XOF" | "AUD" | "NZD" | "FJD"
   * * @example
   * defaultvalue="USD"
   */ 
    defaultvalue?: string;
    /**
   * * Option to set the default placeholder text for the CurrencyInput input field.
   * * @example
   * placeholder="0.00"
   */
    placeholder?: string; 
    /**
   * * Option to disable edits for CurrencyInput input field.
   * * @example
   * readOnly
   */ 
    readOnly?: boolean;
    /**
     * * Option to enable a hint for CurrencyInput input field.
     * * @example
     * isHinted
     */  
    isHinted?: boolean;
    /**
   * * Option to specify hint text for CurrencyInput input field.
   * * @example
   * hintText="This is a hint for a VΣ CurrencyInput"
   */ 
    hintText?: string;
    /**
   * * Option to specify the isRequired error text for the CurrencyInput input field.
   * * @example
   * errorText="VΣ product price is required"
   */ 
    errorText?: ReactNode | string | null;
    /**
   * * Option to specify a hint url reference or resource for CurrencyInput input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */ 
    hintUrl?: string; 
    /**
   * * The design variation of the CurrencyInput input. 
   * Default: 'input-outline' 
   * Variants: 'input', 'input-outline', 'input-material', 'input-neumorphic',
   * * @example
   * inputtype="input-neumorphic"
   */
    inputvariant?: InputDesign & {};
    /**
   * * Option to specify the .scss class selector for the CurrencyInput input field.
   * * @example
   * className="teletraan-1-currencyinput"
   */
    className?: string;
    /**
     * * Optional explicit Formik context. Useful when bypassing duplicate 
     * context issues in monorepos or bundled npm packages.
     */
    formikContext?: FormikContextType<any>;
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
    formikContext,
    ...props
}: CurrencyInputProps) => {

    const defaultFormikContext = useFormikContext<any>();
    const activeContext = formikContext || defaultFormikContext;

    if (!activeContext) {
        console.error(`CurrencyInput '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
        return null;
    }

    const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

    const currencyAlias = `${alias}Currency`; 
    const amountFieldValue = getIn(values, alias);
    const amountFieldTouched = getIn(touched, alias);
    const amountFieldError = getIn(errors, alias);
    const currencyFieldValue = getIn(values, currencyAlias);

    useEffect(() => {
        if (inputtype !== "currency" && CURRENCIES[inputtype as SupportedCurrency]) {
             setFieldValue(currencyAlias, inputtype);
        } 
        else if (!currencyFieldValue) {
             setFieldValue(currencyAlias, defaultvalue);
        }
    }, [inputtype, defaultvalue, currencyFieldValue, currencyAlias, setFieldValue]);

    const hasError = Boolean(amountFieldTouched && amountFieldError);
    const currentCode = (currencyFieldValue as SupportedCurrency) || "USD";
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
                        name={currencyAlias}
                        onValueChange={(val) => setFieldValue(currencyAlias, val)}  
                        disabled={readOnly || inputtype !== "currency"} 
                    >
                        <Select.Trigger 
                            id={`${alias}CurrencySelect`}
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
                        value={amountFieldValue !== undefined && amountFieldValue !== null ? String(amountFieldValue) : ''}
                        unmask={true}
                        onAccept={(val: string) => setFieldValue(alias, val)}
                        onBlur={() => setFieldTouched(alias, true, false)} 
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

                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {inputLabel && (
                        <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={`${alias}FormInput`}>
                            {inputLabel}
                        </Text>
                    )}
                    
                    {isHinted && (
                        <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                            <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                        </Tooltip>
                    )} 
                    {hasError && (
                        <Text id={errorId} size="1" color="red" className='core-input-label-error'>
                            {errorText || (typeof amountFieldError === 'string' ? amountFieldError : `Required field`)}
                        </Text>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};