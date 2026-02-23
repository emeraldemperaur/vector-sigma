import React, { useEffect, useRef, useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { TextField, Flex, Text, Tooltip } from '@radix-ui/themes';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import '../../styles/main.scss';

export type DateRangePickerDesign = 'daterangepicker' | 'daterangepicker-outline' | 'daterangepicker-material' | 'daterangepicker-neumorphic';

interface DateRangePickerProps {
    /**
   * * The required unique identifier for the DateRangePicker input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="hotelReservationDays"
   */
    alias: string;
    /**
   * * The optional input label or description for the DateRangePicker input field. 
   * * @example
   * inputLabel="VΣ Hotel Reservation Dates"
   */
    inputLabel?: string;
    /**
   * * The design variation of the DateRangePicker input. 
   * Default: 'daterangepicker-outline' 
   * Variants: 'daterangepicker', 'daterangepicker-outline', 'daterangepicker-material', 'daterangepicker-neumorphic',
   * * @example
   * inputtype="daterangepicker-neumorphic"
   */
    inputtype?: DateRangePickerDesign;
    /**
   * * The required viewport column width for the DateRangePicker input field.
   * i.e. 1 - 12
   * * @example
   * width={6}
   */
    width?: number;
    /**
   * * Option to render DateRangePicker input field on new row.
   * * @example
   * newRow
   */
    newRow?: boolean;
    /**
   * * Option to set the default placeholder text for the DateRangePicker input field.
   * * @example
   * placeholder="Select VΣ reservation dates"
   */
    placeholder?: string;
    /**
     * * Option to enable a hint for DateRangePicker input field.
     * * @example
     * isHinted
     */ 
    isHinted?: boolean;
    /**
   * * Option to specify hint text for DateRangePicker input field.
   * * @example
   * hintText="This is a hint for a VΣ DateRangePicker"
   */ 
    hintText?: string;
    /**
   * * Option to specify a hint url reference or resource for DateRangePicker input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */ 
    hintUrl?: string;
    /**
   * * Option to specify the isRequired error text for the DateRangePicker input field.
   * * @example
   * errorText="VΣ resrvation dates required"
   */
    errorText?: string;
    /**
   * * Option to disable edits for DateRangePicker input field.
   * * @example
   * readOnly
   */ 
    readOnly?: boolean;
    /**
   * * Option to specify the .scss class selector for the DateRangePicker input field.
   * * @example
   * className="teletraan-1-daterangepicker"
   */
    className?: string;
    /**
     * * Optional explicit Formik context. Useful when bypassing duplicate 
     * context issues in monorepos or bundled npm packages.
     */
    formikContext?: FormikContextType<any>;
}

export const DateRangePicker = ({
    alias,
    inputLabel,
    inputtype = 'daterangepicker-outline',
    width = 12,
    newRow,
    placeholder = "Select date range",
    isHinted, hintText, hintUrl, errorText,
    readOnly,
    className,
    formikContext
}: DateRangePickerProps) => {

    const defaultFormikContext = useFormikContext<any>();
    const activeContext = formikContext || defaultFormikContext;

    if (!activeContext) {
        console.error(`DateRangePicker '${alias}' must be used within a Formik provider or receive a formikContext prop.`);
        return null;
    }

    const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

    const fieldValue = getIn(values, alias);
    const fieldTouched = getIn(touched, alias);
    const fieldError = getIn(errors, alias);

    const hasError = Boolean(fieldTouched && fieldError);
    const inputId = `${alias}FormInput` || crypto.randomUUID();
    
    const getDates = (): [Date | null, Date | null] => {
        const val = fieldValue;
        if (!val) return [null, null];
        if (typeof val === 'object' && 'from' in val) {
            return [
                val.from ? new Date(val.from) : null, 
                val.to ? new Date(val.to) : null
            ];
        }
        if (Array.isArray(val)) {
            return [
                val[0] ? new Date(val[0]) : null, 
                val[1] ? new Date(val[1]) : null
            ];
        }

        return [null, null];
    };

    const [startDate, endDate] = getDates();
    const containerRef = useRef<HTMLDivElement>(null);
    const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
    
    useEffect(() => {
        if (inputtype === 'daterangepicker-neumorphic' && containerRef.current) {
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
        if (inputtype === 'daterangepicker-neumorphic') return {
            ...base,
            backgroundColor: 'var(--neu-bg)', border: 'none',
            boxShadow: hasError ? 'inset 2px 2px 5px var(--red-9), inset -2px -2px 5px var(--neu-shadow-light)' 
                                : 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
            borderRadius: '12px', height: '40px', ...neuVars
        };
        if (inputtype === 'daterangepicker-material') return {
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
                        border-radius: 50%;
                        margin: 2px !important;
                        color: var(--gray-12);
                    }
                    .react-datepicker__day:hover { background-color: var(--gray-4) !important; }
                    
                    /* Range Specific Styles */
                    .react-datepicker__day--in-range {
                        background-color: var(--accent-4) !important;
                        color: var(--accent-11) !important;
                        border-radius: 0 !important;
                    }
                    .react-datepicker__day--range-start {
                        background-color: var(--accent-9) !important;
                        color: white !important;
                        border-radius: 50% 0 0 50% !important;
                    }
                    .react-datepicker__day--range-end {
                        background-color: var(--accent-9) !important;
                        color: white !important;
                        border-radius: 0 50% 50% 0 !important;
                    }
                    /* If start and end are same day */
                    .react-datepicker__day--range-start.react-datepicker__day--range-end {
                        border-radius: 50% !important;
                    }

                    .react-datepicker__day--keyboard-selected { background-color: transparent !important; color: inherit !important; outline: 2px solid var(--accent-9); }
                    .react-datepicker__day--today { color: var(--accent-11); font-weight: 900; }
                    
                    /* Neumorphic Popup Overrides */
                    ${inputtype === 'daterangepicker-neumorphic' ? `
                        .react-datepicker {
                            background-color: var(--neu-bg) !important;
                            box-shadow: 6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light);
                        }
                        .react-datepicker__day--in-range { box-shadow: inset 1px 1px 2px var(--neu-shadow-dark), inset -1px -1px 2px var(--neu-shadow-light); }
                        .react-datepicker__day--range-start, .react-datepicker__day--range-end {
                            box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light); 
                            color: var(--accent) !important; background: var(--neu-bg) !important;
                        }
                    ` : ''}
                `}</style>

                <ReactDatePicker
                    id={`${alias}DatePicker`}
                    selectsRange={true}
                    startDate={startDate}
                    endDate={endDate}
                    onChange={(dates: [Date | null, Date | null]) => {
                        const [start, end] = dates;
                        setFieldValue(alias, { from: start, to: end });
                        if (start && end) {
                            setFieldTouched(alias, true, false);
                        }
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
                    
                    {hasError && (
                        <Text size="1" color="red" style={{ display: 'block' }}>
                            {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
                        </Text>
                    )}
                </div>
            </Flex>
        </Column>
    );
};