import React from "react";
import { Column } from "layouts/column/column"; 
import { Text, Tooltip, Flex } from '@radix-ui/themes';
import { FaCcVisa } from '@react-icons/all-files/fa/FaCcVisa';
import { FaCcMastercard } from '@react-icons/all-files/fa/FaCcMastercard';
import { FaCcAmex } from '@react-icons/all-files/fa/FaCcAmex';
import { FaCcDiscover } from '@react-icons/all-files/fa/FaCcDiscover';
import { FaCcDinersClub } from '@react-icons/all-files/fa/FaCcDinersClub';
import { FaCcJcb } from '@react-icons/all-files/fa/FaCcJcb';
import { FaCreditCard } from '@react-icons/all-files/fa/FaCreditCard';
import { useField, useFormikContext } from 'formik';
import cardValidator from "card-validator";
import { IMaskInput } from 'react-imask';
import { Icon } from "components/icons/icons";
import { xInputFieldProps } from "./input";
import '../../styles/main.scss';


export const CreditCardInput = ({
    alias,
    inputlabel=undefined,
    width,
    placeholder,
    readonly=false,
    inputVariant = 'input-outline',
    className,...props
}: xInputFieldProps) => {

    const { setFieldValue, setFieldTouched } = useFormikContext();
    const [field, meta] = useField(alias);
    const hasError = Boolean(meta.touched && meta.error);
    const cardInfo = cardValidator.number(field.value);
    const cardType = cardInfo.card?.type; 
    const maskPattern = cardType === 'american-express' ? '0000 000000 00000' : '0000 0000 0000 0000';
    const errorId = `${alias}-error`;

    const getCardIcon = () => {
        switch (cardType) {
            case 'visa': return <FaCcVisa color="#1A1F71" size="22" />;
            case 'mastercard': return <FaCcMastercard color="#EB001B" size="22" />;
            case 'american-express': return <FaCcAmex color="#006FCF" size="22" />;
            case 'discover': return <FaCcDiscover color="#FF6000" size="22" />;
            case 'diners-club': return <FaCcDinersClub color="#0079BE" size="22" />;
            case 'jcb': return <FaCcJcb color="#000" size="22" />;
            default: return <FaCreditCard color="var(--gray-8)" size="20" />;
        }
    };

    const variantClass = inputVariant !== 'input-outline' ? `input-${inputVariant}` : '';
    const isOutline = inputVariant === 'input-outline';

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
                        paddingRight: '12px',
                        cursor: 'text'
                    }}
                >
                    <IMaskInput
                        id={`${alias}FormInput`}
                        name={alias}
                        aria-describedby={`${alias}InputLabel`}
                        mask={maskPattern}
                        readOnly={readonly}
                        value={field.value}
                        unmask={true} 
                        onAccept={(val: string) => setFieldValue(alias, val)}
                        onBlur={() => setFieldTouched(alias, true)}
                        placeholder={placeholder || '0000 0000 0000 0000'} 
                        inputMode="numeric" 
                        autoComplete="cc-number"
                        style={{
                            flex: 1,
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            height: '100%',
                            padding: '0 12px',
                            color: 'var(--gray-12)',
                            fontFamily: 'var(--code-font-family)',
                            fontSize: 'var(--font-size-2)',
                            width: '100%',
                        }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center' }}> 
                        {getCardIcon()} 
                    </div>
                </Flex>

                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
                        {inputlabel}
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