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
import IMaskInput from "react-imask/input";
import { Icon } from "components/icons/icons";
import '../../styles/main.scss';

export const xCreditCardInput = (
    alias: string, 
    inputLabel: string, width: number, defaultValue: string, newRow?: boolean, 
    placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string) => {
        const { setFieldValue, setFieldTouched } = useFormikContext();
        const [field, meta] = useField(alias);
        const hasError = Boolean(meta.touched && meta.error);
        const cardInfo = cardValidator.number(field.value || '');
        const cardType = cardInfo.card?.type; // Returns 'visa', 'mastercard', 'american-express'
        const maskPattern = cardType === 'american-express' ? '0000 000000 00000' : '0000 0000 0000 0000';

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
            paddingRight: '12px', // Space for the icon
            cursor: 'text'
            }}
        >
            <IMaskInput
                id={`${alias}FormInput`}
                name={alias}
                aria-describedby={`${alias}InputLabel`}
                mask={maskPattern}
                readOnly={readOnly}
                defaultValue={defaultValue}
                value={field.value || ''}
                unmask={true} // Returns raw numbers to Formik
                onAccept={(val) => setFieldValue(alias, val)}
                onBlur={() => setFieldTouched(alias, true)}
                placeholder={placeholder || '0000 0000 0000 0000'} 
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
                inputMode="numeric" 
                autoComplete="cc-number"
            />
            <div style={{ display: 'flex', alignItems: 'center' }}> {getCardIcon()} </div>
        </Flex>
            <div>
                <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputLabel}</Text>
                    {hasError ?
                    <>
                    <p className='core-input-label-error'> {meta.error}</p>
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