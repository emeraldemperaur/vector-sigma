import React, { ReactNode } from "react";
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Flex, Text, Badge, Tooltip } from '@radix-ui/themes';
import { IMaskInput } from 'react-imask';
import { Icon } from "components/icons/icons";
import { FaChartLine } from '@react-icons/all-files/fa/FaChartLine'; 
import { Column } from "layouts/column/column";
import { InputDesign } from "components/input/input";
import '../../styles/main.scss';

type StockInputProps = {
    /**
   * * The required unique identifier for the StockInput field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="restrictedStocksTSLA"
   */
    alias: string; 
    /**
   * * The optional input label or description for the StockInput field. 
   * * @example
   * inputLabel="VΣ Stock Price"
   */ 
    inputLabel?: string;
    /**
   * * The required viewport column width for the StockInput field.
   * i.e. 1 - 12
   * * @example
   * width={5}
   */
    width: number;
    /**
   * * The optional default stock ticker symbol for the StockInput field. 
   * Renders a chart icon if no ticker symbol text value is provided 
   * * @example
   * defaultvalue="TSLA"
   */  
    defaultvalue: string; 
    /**
   * * Option to render StockInput field on new row.
   * * @example
   * newRow
   */
    newRow?: boolean; 
    /**
   * * Option to set the default placeholder text for the StockInput input field.
   * * @example
   * placeholder="00.00"
   */
    placeholder?: string;
    /**
   * * Option to disable edits for StockInput input field.
   * * @example
   * readOnly
   */
    readOnly?: boolean;
    /**
     * * Option to enable a hint for StockInput input field.
     * * @example
     * isHinted
     */  
    isHinted?: boolean;
    /**
   * * Option to specify hint text for StockInput input field.
   * * @example
   * hintText="This is a hint for a VΣ StockInput"
   */
    hintText?: string;
    /**
   * * Option to specify a hint url reference or resource for StockInput input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */  
    hintUrl?: string, 
    /**
   * * Option to specify the isRequired error text for the StockInput input field.
   * * @example
   * errorText="VΣ product price is required"
   */
    errorText?: ReactNode | string | null;
    /**
   * * The design variation of the StockInput input. 
   * Default: 'input-outline' 
   * Variants: 'input', 'input-outline', 'input-material', 'input-neumorphic',
   * * @example
   * inputtype="input-neumorphic"
   */
    inputvariant?: InputDesign & {}; 
    /**
   * * Option to specify the .scss class selector for the StockInput input field.
   * * @example
   * className="teletraan-1-stockinput"
   */
    className?: string;
    /**
     * * Optional explicit Formik context. Useful when bypassing duplicate 
     * context issues in monorepos or bundled npm packages.
     */
    formikContext?: FormikContextType<any>;
};

export const StockInput = ({
    alias,
    inputLabel,
    width,
    defaultvalue,
    placeholder, newRow, isHinted, hintText, hintUrl, errorText,
    readOnly=false,
    inputvariant = 'input-outline',
    className,
    formikContext,
    ...props
}: StockInputProps) => {

    const defaultFormikContext = useFormikContext<any>();
    const activeContext = formikContext || defaultFormikContext;

    if (!activeContext) {
        console.error(`StockInput '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
        return null;
    }

    const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

    const fieldValue = getIn(values, alias);
    const fieldTouched = getIn(touched, alias);
    const fieldError = getIn(errors, alias);

    const hasError = Boolean(fieldTouched && fieldError);
    const variantClass = inputvariant !== 'input-outline' ? `input-${inputvariant}` : '';
    const isOutline = inputvariant === 'input-outline';
    const errorId = `${alias}-error`;

    return (
        <Column span={width} newLine={newRow}>
            <Flex direction="column" gap="2" style={{ width: '100%' }}>
                <Flex 
                    align="center"
                    justify="between" 
                    className={`rt-TextFieldRoot rt-r-size-2 rt-variant-surface ${variantClass} ${className || ''}`}
                    style={{
                        width: '100%',
                        height: 'var(--space-6)', 
                        boxShadow: (isOutline) 
                            ? (hasError ? 'inset 0 0 0 1px var(--red-9)' : 'inset 0 0 0 1px var(--gray-alpha-5)')
                            : undefined,
                        backgroundColor: isOutline ? 'var(--color-surface)' : undefined,
                        padding: '4px', 
                        cursor: 'text',
                    }}
                    onClick={() => {
                        const input = document.getElementById(`${alias}FormInput`);
                        input?.focus();
                    }}
                >
                    <Badge 
                        size="2" 
                        variant="soft" 
                        color="gray" 
                        style={{ 
                            height: '100%', 
                            padding: '0 10px',
                            borderRadius: 'var(--radius-1)', 
                            fontFamily: 'var(--code-font-family)', 
                            fontSize: 'var(--font-size-2)',
                            letterSpacing: '0.05em',
                            fontWeight: 600,
                            userSelect: 'none' 
                        }}
                    >
                        { defaultvalue || <FaChartLine /> }
                    </Badge>

                    <Flex align="center" style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                        <IMaskInput
                            id={`${alias}FormInput`} 
                            name={alias}
                            aria-describedby={`${alias}InputLabel`}
                            mask={Number}
                            scale={2}
                            readOnly={readOnly}
                            // @ts-expect-error: known library type definition gap
                            signed={String(false)}
                            thousandsSeparator=","
                            padFractionalZeros={true}
                            normalizeZeros={true}
                            radix="."
                            mapToRadix={['.']}
                            value={fieldValue !== undefined && fieldValue !== null ? String(fieldValue) : ''}
                            unmask={true}
                            onAccept={(val) => setFieldValue(alias, val)}
                            onBlur={() => setFieldTouched(alias, true, false)}
                            placeholder={placeholder || "0.00"}
                            style={{
                                border: 'none',
                                outline: 'none',
                                background: 'transparent',
                                textAlign: 'right',
                                width: '100%',
                                minWidth: '60px', 
                                color: 'var(--gray-12)',
                                fontSize: 'var(--font-size-3)', 
                                fontWeight: 500,
                                fontFamily: 'var(--default-font-family)',
                            }}
                            inputMode="decimal"
                            autoComplete="off"
                        />
                    </Flex>
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
                            {errorText || (typeof fieldError === 'string' ? fieldError : `Required field`)}
                        </Text>
                    )} 
                </div>
            </Flex>
        </Column>
    );
};