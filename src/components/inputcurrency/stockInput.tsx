import React, { ReactNode } from "react";
import { useField, useFormikContext } from 'formik';
import { Flex, Text, Badge, Tooltip } from '@radix-ui/themes';
import { IMaskInput } from 'react-imask';
import { Icon } from "components/icons/icons";
import { FaChartLine } from '@react-icons/all-files/fa/FaChartLine'; 
import { Column } from "../../layouts/column/column";
import '../../styles/main.scss';

export const StockInput = (
    alias: string, 
    inputLabel: string, width: number, defaultValue: string, value: string, newRow?: boolean, 
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string) => {
        const { setFieldValue, setFieldTouched } = useFormikContext();
        const [priceField, meta] = useField(alias);
        const hasError = Boolean(meta.touched && meta.error);
        
    return(
    <>
    <Column span={width} newLine={newRow}>
        <Flex direction="column" gap="2" style={{ width: '100%' }}>
        <Flex 
            align="center"
            justify="between" 
            className="rt-TextFieldRoot rt-r-size-2 rt-variant-surface"
            style={{
            width: '100%',
            height: 'var(--space-6)', 
            boxShadow: hasError 
                ? 'inset 0 0 0 1px var(--red-9)' 
                : 'inset 0 0 0 1px var(--gray-alpha-5)',
            backgroundColor: 'var(--color-surface)',
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
                }}>{ defaultValue || <FaChartLine /> }</Badge>

            <Flex align="center" style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}>

            <IMaskInput
                id={`${alias}FormInput`} 
                name={alias}
                aria-describedby={`${alias}InputLabel`}
                mask={Number}
                scale={2}
                readOnly={readOnly}
                defaultValue={value}
                // @ts-expect-error: known library type definition gap
                signed={false}
                thousandsSeparator=","
                padFractionalZeros={true}
                normalizeZeros={true}
                radix="."
                mapToRadix={['.']}
                value={priceField.value || value ? String(priceField.value || value) : ''}
                unmask={true}
                onAccept={(val) => setFieldValue(alias, val)}
                onBlur={() => setFieldTouched(alias, true)}
                placeholder={placeholder ||"0.00"}
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
        <div>
                <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputLabel}</Text>
                {hasError ?
                <>
                    <p className='core-input-label-error'>
                        {meta.error}
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