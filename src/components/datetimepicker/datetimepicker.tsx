import React, { useEffect, useRef, useState, forwardRef, useId } from 'react';
import ReactDatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { TextField, Flex, Text, Tooltip } from '@radix-ui/themes';
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import '../../styles/main.scss';

export type DateTimePickerDesign = 'datetimepicker' | 'datetimepicker-outline' | 'datetimepicker-material' | 'datetimepicker-neumorphic';

/**
 * DateTimePickerProps Interface
 * @description Configuration properties for the VectorSigma DateTimePicker component.
 * Equipped with enterprise-grade aesthetics, integrated time-slot selection, 
 * typography overrides, and strict Formik integration.
 */
export interface DateTimePickerProps {
  /**
   * The aesthetic design language of the DateTimePicker component.
   * - `datetimepicker-outline`: Minimalist, outlined aesthetic (Default).
   * - `datetimepicker-material`: Elevated, sharp bottom-borders with a solid surface.
   * - `datetimepicker-neumorphic`: Soft-UI with extruded inset/outset shadows.
   * @default "datetimepicker-outline"
   */
  inputtype?: DateTimePickerDesign;

  /**
   * The unique identifier bridging the input field to the Formik state.
   * Must exactly match the schema property key.
   * @example "esppEnrollmentWindowStart"
   */
  alias: string;

  /**
   * The primary semantic label rendered above the DateTimePicker field.
   * @example "ESPP Enrollment Window (Start)"
   */
  inputLabel?: string;

  /**
   * Defines the responsive grid column span for the component (1-12 based on the parent grid).
   * @example 6
   */
  width?: number;

  /**
   * Forces the component to break into a new Flex/Grid row within the Form layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Placeholder text utilized when the date/time state is empty or null.
   * @example "Select enrollment start date & time"
   */
  placeholder?: string;

  /**
   * Disables interaction, mutating the visual state to reflect read-only/disabled mode.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Toggles the visibility of the contextual hint icon and tooltip next to the label.
   * @default false
   */
  isHinted?: boolean;

  /**
   * The text payload displayed inside the Tooltip when `isHinted` is true.
   * @example "Enrollment must begin during standard trading hours."
   */
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/trading-windows"
   */
  hintUrl?: string;

  /**
   * Optional typographic color overrides. Allows explicit targeting of the component's
   * internal CSS color assignments regardless of the global Radix theme.
   */
  typography?: {
    /** Overrides the background color of the input field and calendar/time canvas */
    background?: string;
    /** Overrides the border/stroke color of the input field and calendar/time canvas */
    stroke?: string;
    /** Overrides the text color of the input, calendar header, days, and time slots */
    textColor?: string;
    /** Overrides the primary color used for the selected date/time and hover states */
    accent?: string;
  };

  /**
   * Explicit error string to override standard Formik validation messages.
   * @example "A valid start time is required."
   */
  errorText?: string;

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string;

  /**
   * Inline React CSS properties applied to the outmost Flex wrapper.
   */
  style?: React.CSSProperties;

  /**
   * Injects an explicit Formik context. Required if the component operates outside 
   * a standard `<FormikProvider>` tree.
   */
  formikContext?: FormikContextType<any>;
}

const DateTimeInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { radixId, radixStyle, readOnly, typography, ...restProps } = props;
  
  return (
    <TextField.Root 
      {...restProps} 
      id={radixId}
      style={radixStyle}
      variant="surface"
      ref={ref}
      disabled={readOnly}
      placeholder={props.placeholder || props.placeholderText || "Select date & time"}
      autoComplete="off"
    >
      <TextField.Slot>
        <Icon 
          name="clock" 
          height="16" 
          width="16" 
          style={{ color: typography?.textColor || 'var(--gray-10)', transition: 'color 0.2s' }} 
        />
      </TextField.Slot>
    </TextField.Root>
  );
});
DateTimeInput.displayName = "DateTimeInput";


export const DateTimePicker = ({
  alias,
  inputLabel,
  inputtype = 'datetimepicker-outline',
  width = 12,
  newRow,
  placeholder = "Select date & time",
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  typography,
  readOnly,
  className,
  style,
  formikContext
}: DateTimePickerProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`[VectorSigma]: DateTimePicker '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);
  
  const fallbackId = useId();
  const inputId = `${alias}FormInput-${fallbackId}`;
  const labelId = `${alias}InputLabel`;
  const errorId = `${alias}-error`;

  const hasError = Boolean(fieldTouched && fieldError);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});
  
  useEffect(() => {
    if (inputtype === 'datetimepicker-neumorphic' && containerRef.current) {
        const parentBg = getNearestParentBackground(containerRef.current.parentElement);
        const computedBg = typography?.background || parentBg;
        
        setNeuVars({
            '--neu-bg': computedBg,
            '--neu-shadow-dark': adjustColor(computedBg, -20),
            '--neu-shadow-light': adjustColor(computedBg, 20),
        } as React.CSSProperties);
    }
  }, [inputtype, typography?.background]);

  const typographyVars = {
    '--vs-dp-bg': typography?.background || 'var(--color-panel-solid)',
    '--vs-dp-stroke': typography?.stroke || 'var(--gray-6)',
    '--vs-dp-text': typography?.textColor || 'var(--gray-12)',
    '--vs-dp-accent': typography?.accent || 'var(--accent-9)',
    '--vs-dp-accent-text': typography?.accent ? '#ffffff' : 'white', 
  } as React.CSSProperties;

  const getInputStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = { 
      cursor: readOnly ? 'not-allowed' : 'pointer', 
      transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', 
      width: '100%',
      fontFamily: "inherit",
      color: 'var(--vs-dp-text)'
    };

    if (inputtype === 'datetimepicker-neumorphic') {
      return {
          ...base,
          backgroundColor: 'var(--neu-bg)', 
          border: 'none',
          boxShadow: hasError 
            ? 'inset 2px 2px 5px rgba(255,0,0,0.2), inset -2px -2px 5px var(--neu-shadow-light)' 
            : 'inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light)',
          borderRadius: '12px', 
          height: '42px', 
          ...neuVars
      };
    }
    
    if (inputtype === 'datetimepicker-material') {
      return {
          ...base, 
          backgroundColor: typography?.background || 'var(--gray-2)', 
          border: 'none', 
          borderBottom: hasError ? '2px solid var(--red-9)' : `2px solid ${typography?.stroke || 'var(--gray-8)'}`,
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          borderRadius: '4px 4px 0 0',
          height: '42px'
      };
    }

    return {
        ...base, 
        backgroundColor: typography?.background || 'transparent',
        boxShadow: hasError ? '0 0 0 1.5px var(--red-9)' : '0 0 0 1px var(--vs-dp-stroke)',
        borderRadius: '6px',
        height: '42px'
    };
  };

  return (
    <Column span={width} newLine={newRow}>
      <Flex 
        direction="column" 
        gap="2" 
        ref={containerRef} 
        className={className} 
        style={{ width: '100%', fontFamily: "'Libre Franklin', sans-serif", ...typographyVars, ...style }}
      >
        
        <style>{`
          .react-datepicker-popper { z-index: 9999 !important; }
          .react-datepicker-wrapper { width: 100%; display: block; } 
          
          .react-datepicker {
              font-family: inherit;
              border: 1px solid var(--vs-dp-stroke) !important;
              border-radius: 12px !important;
              box-shadow: 0 12px 32px -8px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.1);
              background-color: var(--vs-dp-bg) !important;
              padding: 16px;
              display: flex !important; /* Required to align calendar and time list horizontally */
          }

          .react-datepicker__header {
              background-color: transparent !important;
              border-bottom: none !important;
              padding-top: 0;
          }
          .react-datepicker__current-month {
              font-weight: 600;
              font-size: 1.1rem;
              color: var(--vs-dp-text);
              margin-bottom: 8px;
          }
          .react-datepicker__day-name { 
              color: var(--vs-dp-text); 
              opacity: 0.6;
              font-weight: 600; 
              text-transform: uppercase; 
              font-size: 0.75rem; 
              width: 32px;
              margin: 4px;
          }

          .react-datepicker__navigation { top: 16px; }
          .react-datepicker__navigation-icon::before {
              border-color: var(--vs-dp-text);
              opacity: 0.5;
              border-width: 2px 2px 0 0;
              transition: all 0.2s ease;
          }
          .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
              opacity: 1;
          }

          .react-datepicker__day {
              width: 32px; 
              height: 32px; 
              line-height: 32px;
              border-radius: 50% !important;
              margin: 4px !important;
              color: var(--vs-dp-text);
              font-weight: 500;
              transition: all 0.2s ease;
          }
          .react-datepicker__day:hover { 
              background-color: var(--gray-4) !important; 
          }
          
          .react-datepicker__day--selected {
              background-color: var(--vs-dp-accent) !important;
              color: var(--vs-dp-accent-text) !important;
              font-weight: 600;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          }
          
          /* Keyboard Navigation Traversal */
          .react-datepicker__day--keyboard-selected { 
              background-color: var(--gray-3) !important; 
              border: 1px dashed var(--vs-dp-accent) !important;
          }
          .react-datepicker__day--today { 
              color: var(--vs-dp-accent); 
              font-weight: 700; 
          }
          
          .react-datepicker__time-container {
              border-left: 1px solid var(--vs-dp-stroke) !important;
              width: 110px !important;
              background: transparent !important;
          }
          .react-datepicker__header--time {
              background: transparent !important;
              padding-top: 2px !important;
              padding-bottom: 12px !important;
          }
          .react-datepicker-time__header {
              color: var(--vs-dp-text) !important;
              opacity: 0.6;
              font-weight: 600 !important;
              font-size: 0.75rem !important;
              text-transform: uppercase;
              letter-spacing: 0.05em;
          }
          .react-datepicker__time-list-item {
              height: 36px !important;
              display: flex !important;
              align-items: center !important;
              justify-content: center !important;
              font-size: 0.9rem !important;
              color: var(--vs-dp-text);
              border-radius: 6px !important;
              margin: 0 6px 4px 6px !important; /* Match padding of day grid */
              transition: all 0.2s ease;
          }
          .react-datepicker__time-list-item:hover {
              background-color: var(--gray-4) !important;
          }
          .react-datepicker__time-list-item--selected {
              background-color: var(--vs-dp-accent) !important;
              color: var(--vs-dp-accent-text) !important;
              font-weight: 600 !important;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          }
          
          .react-datepicker__time-list::-webkit-scrollbar { width: 4px; }
          .react-datepicker__time-list::-webkit-scrollbar-thumb { 
              background: var(--vs-dp-stroke); 
              border-radius: 4px; 
          }
          .react-datepicker__time-list::-webkit-scrollbar-track { 
              background: transparent; 
          }
          
          ${inputtype === 'datetimepicker-neumorphic' ? `
              .react-datepicker {
                  background-color: var(--neu-bg) !important;
                  border: none !important;
                  box-shadow: 8px 8px 16px var(--neu-shadow-dark), -8px -8px 16px var(--neu-shadow-light);
              }
              .react-datepicker__day:hover, .react-datepicker__time-list-item:hover { 
                  box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light); 
                  background: transparent !important; 
              }
              .react-datepicker__day--selected, .react-datepicker__time-list-item--selected { 
                  box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light); 
                  color: var(--vs-dp-accent) !important; 
                  background: var(--neu-bg) !important; 
              }
          ` : ''}
        `}</style>

        {(inputLabel || isHinted) && (
          <Flex align="center" gap="2" style={{ paddingLeft: '2px' }}>
            {inputLabel && (
              <Text id={labelId} as="label" size="2" weight="medium" style={{ color: 'var(--gray-11)' }} htmlFor={inputId}>
                {inputLabel}
              </Text>
            )}
            {isHinted && (
              <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5}>
                <a href={hintUrl || "#"} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                  <Icon name="questionmarkcircled" height="15" width="15" style={{ cursor: 'pointer', color: 'var(--gray-9)', transition: 'color 0.2s' }} />
                </a> 
              </Tooltip>
            )}
          </Flex>
        )}

        <ReactDatePicker
            id={`${alias}DatePicker`}
            selected={(fieldValue && new Date(fieldValue)) || null}
            onChange={(val: Date | null) => {
                setFieldValue(alias, val);
                setFieldTouched(alias, true, false);
            }}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="MMM d, yyyy h:mm aa"
            disabled={readOnly}
            placeholderText={placeholder} 
            aria-labelledby={inputLabel ? labelId : undefined}
            customInput={
                <DateTimeInput 
                    radixId={inputId}
                    radixStyle={getInputStyles()}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    typography={typography}
                />
            }
        />

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, paddingLeft: '2px' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "Required field")}
          </Text>
        )}
      </Flex>
    </Column>
  );
};