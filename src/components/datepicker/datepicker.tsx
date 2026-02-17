import React, { useEffect, useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { TextField, Flex, Text, Tooltip } from '@radix-ui/themes';
import { useField, useFormikContext } from 'formik';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import '../../styles/main.scss';

export type DatePickerDesign = 'datepicker' | 'datepicker-outline' | 'datepicker-material' | 'datepicker-neumorphic';

interface DatePickerProps {
    alias: string;
    inputLabel?: string;
    inputtype?: DatePickerDesign;
    width?: number;
    newRow?: boolean;
    placeholder?: string;
    isHinted?: boolean;
    hintText?: string;
    hintUrl?: string;
    errorText?: string;
    readOnly?: boolean;
    className?: string;
}

export const DatePicker = ({
    alias,
    inputLabel,
    inputtype = 'datepicker-outline',
    width = 12,
    newRow,
    placeholder = "Select date",
    isHinted, hintText, hintUrl, errorText,
    readOnly,
    className
}: DatePickerProps) => {
    const { setFieldValue, setFieldTouched } = useFormikContext();
    const [field, meta] = useField(alias);
    const inputId = `${alias}FormInput` || crypto.randomUUID();
    const hasError = Boolean(meta.touched && meta.error);
    const containerRef = useRef<HTMLDivElement>(null);
    const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
    
    useEffect(() => {
        if (inputtype === 'datepicker-neumorphic' && containerRef.current) {
            const parentBg = getNearestParentBackground(containerRef.current.parentElement);
            setNeuVars({
                '--neu-bg': parentBg,
                '--neu-shadow-dark': adjustColor(parentBg, -20),
                '--neu-shadow-light': adjustColor(parentBg, 20),
                '--neu-text': 'var(--gray-12)',
                '--accent': 'var(--accent-9)',
            } as React.CSSProperties);
        }
    }, [inputtype]);

    // --- STYLES ---
    const getInputStyles = () => {
        const base = { cursor: 'pointer', transition: 'all 0.2s' };
        if (inputtype === 'datepicker-neumorphic') return {
            ...base,
            backgroundColor: 'var(--neu-bg)', border: 'none',
            boxShadow: hasError ? 'inset 2px 2px 5px var(--red-9), inset -2px -2px 5px var(--neu-shadow-light)' 
                                : 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
            borderRadius: '12px', height: '40px', ...neuVars
        };
        if (inputtype === 'datepicker-material') return {
            ...base, backgroundColor: 'var(--gray-2)', border: 'none', 
            borderBottom: hasError ? '2px solid var(--red-9)' : '2px solid var(--gray-8)',
            borderRadius: '4px 4px 0 0'
        };
        return {
            ...base, backgroundColor: 'transparent',
            boxShadow: hasError ? '0 0 0 1px var(--red-9)' : '0 0 0 1px var(--gray-7)',
            borderRadius: '6px'
        };
    };

    return (
        <Column span={width} newLine={newRow}>
            <Flex direction="column" gap="2" ref={containerRef} className={className} style={{ width: '100%' }}>
                
                <style>{`
                    .react-datepicker-popper { z-index: 9999 !important; }
                    .react-datepicker {
                        font-family: var(--default-font-family, sans-serif);
                        border: none !important;
                        border-radius: 12px !important;
                        box-shadow: 0 10px 40px -10px rgba(0,0,0,0.2);
                        background-color: var(--color-panel-solid) !important;
                        padding: 12px;
                    }
                    .react-datepicker__header {
                        background-color: transparent !important;
                        border-bottom: none !important;
                    }
                    .react-datepicker__day-name { color: var(--gray-9); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
                    .react-datepicker__day {
                        width: 32px; height: 32px; line-height: 32px;
                        border-radius: 50% !important;
                        margin: 2px !important;
                        color: var(--gray-12);
                    }
                    .react-datepicker__day:hover { background-color: var(--gray-4) !important; }
                    .react-datepicker__day--selected {
                        background-color: var(--accent-9) !important;
                        color: white !important;
                        font-weight: bold;
                    }
                    .react-datepicker__day--keyboard-selected { background-color: var(--accent-3) !important; color: var(--accent-11) !important; }
                    .react-datepicker__day--today { color: var(--accent-11); font-weight: 900; }
                    
                    ${inputtype === 'datepicker-neumorphic' ? `
                        .react-datepicker {
                            background-color: var(--neu-bg) !important;
                            box-shadow: 6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light);
                        }
                        .react-datepicker__day:hover { box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light); background: transparent !important; }
                        .react-datepicker__day--selected { box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light); color: var(--accent) !important; background: var(--neu-bg) !important; }
                    ` : ''}
                `}</style>

                <ReactDatePicker
                    id={`${alias}DatePicker`}
                    selected={(field.value && new Date(field.value)) || null}
                    onChange={(val: Date | null) => {
                        setFieldValue(alias, val);
                        setFieldTouched(alias, true);
                    }}
                    disabled={readOnly}
                    placeholderText={placeholder}
                    dateFormat="MMM d, yyyy"
                    customInput={
                        <TextField.Root 
                            id={inputId}
                            variant="surface"
                            style={getInputStyles()}
                        >
                            <TextField.Slot>
                                <Icon name="calendar" height="16" width="16" style={{ color: 'var(--gray-10)' }} />
                            </TextField.Slot>
                        </TextField.Root>
                    }
                />

                <div>
                    {inputLabel && <Text size="2" weight="bold" as="label" htmlFor={inputId}>{inputLabel}</Text>}
                    {isHinted && (
                        <Tooltip content={hintText || "No hint"} align="start">
                            <a href={hintUrl || "#"} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 6 }}>
                                <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a>
                        </Tooltip>
                    )}
                    {hasError && <Text size="1" color="red" style={{ display: 'block' }}>{errorText || meta.error}</Text>}
                </div>
            </Flex>
        </Column>
    );
};