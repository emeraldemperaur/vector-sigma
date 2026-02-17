import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Popover, Flex, Text, TextField, Tooltip } from '@radix-ui/themes';
import { format, isValid, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { ensureDate } from 'utils/chronos'; 
import { Icon } from 'components/icons/icons';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type DatePickerDesign = 'datepicker' | 'datepicker-material' | 'datepicker-outline' | 'datepicker-neumorphic';

export interface DatePickerProps {
  inputtype?: DatePickerDesign;
  alias: string;
  inputLabel?: string;
  icon?: React.ReactNode;
  width: number;
  defaultValue?: string;
  value?: string;
  newRow?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  isHinted?: boolean;
  hintText?: string;
  hintUrl?: string;
  minDate?: Date | string;
  maxDate?: Date | string;
  errorText?: ReactNode | string | null;
  className?: string;
  style?: React.CSSProperties;
}

export const DatePicker = ({
  inputtype = 'datepicker-outline',
  alias,
  readOnly, newRow, isHinted, hintText, hintUrl, errorText,
  width,
  inputLabel,
  placeholder = 'Pick a date',
  minDate,
  maxDate,
  className,
  style,
  ...props
}: DatePickerProps) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  const selectedDate = React.useMemo(() => {
    if (!field.value) return undefined;
    if (field.value instanceof Date) return field.value;
    const parsed = parseISO(field.value);
    return isValid(parsed) ? parsed : undefined;
  }, [field.value]);

  const parsedMin = ensureDate(minDate);
  const parsedMax = ensureDate(maxDate);
  const inputId = `${alias}FormInput`;
  const errorId = `${alias}-error`;
   
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  // Neumorphic Dynamic Colors
  useEffect(() => {
    if (inputtype === 'datepicker-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      setNeuVars({
        '--neu-bg': parentBg,
        '--neu-shadow-dark': adjustColor(parentBg, -20),
        '--neu-shadow-light': adjustColor(parentBg, 20),
        '--neu-accent': 'var(--accent-9)',
        '--neu-text': 'var(--gray-12)',
      } as React.CSSProperties);
    }
  }, [inputtype]);

  // --- INPUT STYLES ---
  const activeInputStyle = React.useMemo(() => {
    if (inputtype === 'datepicker-neumorphic') {
      return { 
        backgroundColor: 'var(--neu-bg)', 
        border: 'none', 
        color: hasError ? 'var(--red-9)' : 'var(--neu-text)',
        boxShadow: 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
        borderRadius: '8px',
        ...neuVars 
      };
    }
    if (inputtype === 'datepicker-outline') {
      return { 
        backgroundColor: 'transparent', 
        boxShadow: 'none', 
        border: hasError ? '1px solid var(--red-9)' : '1px solid var(--gray-7)',
        borderRadius: 'var(--radius-2)'
      };
    }
    // Material / Default
    return { 
      backgroundColor: 'var(--color-surface)', 
      boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 1px 2px rgba(0,0,0,0.05)', 
      border: '1px solid var(--gray-5)',
      borderRadius: 'var(--radius-2)'
    };
  }, [inputtype, hasError, neuVars]);

  const calendarContainerStyle = React.useMemo(() => {
    const base = { padding: '20px', borderRadius: '16px', zIndex: 50 };

    if (inputtype === 'datepicker-neumorphic') {
        return {
            ...base,
            backgroundColor: 'var(--neu-bg)',
            boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
            border: 'none',
            ...neuVars
        };
    }
    return {
        ...base,
        backgroundColor: 'var(--color-panel-solid)',
        border: '1px solid var(--gray-4)',
        boxShadow: '0 12px 24px -10px rgba(0,0,0,0.15), 0 8px 12px -6px rgba(0,0,0,0.1)',
    };
  }, [inputtype, neuVars]);

  return (
    <Column span={width} newLine={newRow}>
      <Flex 
        direction="column" 
        gap="2" 
        width="100%" 
        ref={containerRef} 
        style={style} 
        className={className}
      >
        <input type="hidden" aria-describedby={`${alias}InputLabel`} name={alias} value={selectedDate ? selectedDate.toISOString() : ''} />
        
        <style dangerouslySetInnerHTML={{__html: `
          .rdp { 
             --rdp-cell-size: 40px; /* Bigger touch targets */
             --rdp-accent-color: var(--accent-9);
             --rdp-background-color: var(--accent-3);
             margin: 0;
          }
          /* Hide internal input field of DayPicker if present */
          .rdp-vhidden { display: none; }

          /* Layout Construction - Critical for "Google Style" Grid */
          .rdp-month { display: table; margin: 0 auto; border-collapse: collapse; }
          .rdp-caption { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 0 8px; }
          
          /* Header Typography */
          .rdp-caption_label { 
             font-size: 1rem; 
             font-weight: 600; 
             color: var(--gray-12); 
             text-transform: capitalize; 
          }
          
          /* Navigation Arrows */
          .rdp-nav { display: flex; gap: 4px; }
          .rdp-nav_button {
             width: 32px; height: 32px;
             display: flex; align-items: center; justify-content: center;
             border-radius: 50%;
             border: none;
             background: transparent;
             cursor: pointer;
             color: var(--gray-11);
             transition: all 0.2s ease;
          }
          .rdp-nav_button:hover { background-color: var(--gray-4); color: var(--gray-12); }

          /* Table Structure */
          .rdp-table { max-width: 100%; border-collapse: collapse; }
          .rdp-tbody { border: 0; }
          
          /* Weekday Headers (S M T W...) */
          .rdp-head_cell { 
             width: var(--rdp-cell-size); height: 32px;
             font-size: 0.75rem; font-weight: 600; 
             color: var(--gray-9); text-transform: uppercase; 
             text-align: center; vertical-align: middle;
          }

          /* Days */
          .rdp-cell { text-align: center; padding: 0; }
          .rdp-day { 
             width: var(--rdp-cell-size); height: var(--rdp-cell-size);
             border-radius: 50%;
             border: none;
             background: transparent;
             color: var(--gray-12);
             font-size: 0.9rem;
             cursor: pointer;
             display: flex; align-items: center; justify-content: center;
             margin: 1px;
             transition: background-color 0.2s ease;
          }

          /* Hover State */
          .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) { 
             background-color: var(--gray-4); 
             font-weight: 500;
          }

          /* Selected State - Solid Circle */
          .rdp-day_selected { 
             background-color: var(--rdp-accent-color) !important; 
             color: white !important; 
             font-weight: 600;
          }

          /* Today State */
          .rdp-day_today { 
             color: var(--rdp-accent-color); 
             font-weight: 700;
          }
          /* If today is selected, keep text white */
          .rdp-day_selected.rdp-day_today { color: white; }

          /* Disabled State */
          .rdp-day_disabled { opacity: 0.25; cursor: not-allowed; }

          /* Neumorphic Overrides */
          ${inputtype === 'datepicker-neumorphic' ? `
            .rdp-day:hover:not(.rdp-day_selected) {
                box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
                background-color: transparent;
            }
            .rdp-day_selected {
                box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light);
                color: var(--neu-accent) !important;
                background-color: var(--neu-bg) !important;
            }
          ` : ''}
        `}} />

        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
          <Popover.Trigger>
            <TextField.Root 
               variant="surface" 
               style={{ 
                 cursor: 'pointer',
                 height: inputtype === 'datepicker-neumorphic' ? '40px' : '32px', 
                 ...activeInputStyle 
               }}
               onClick={() => !readOnly && setIsOpen(true)}
            >
              <TextField.Slot>
                <Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} />
              </TextField.Slot>
              <input 
                readOnly
                disabled={readOnly}
                value={selectedDate ? format(selectedDate, 'PPP') : ''}
                placeholder={placeholder}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  cursor: readOnly ? 'default' : 'pointer',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  fontSize: 'var(--font-size-2)',
                  fontWeight: 500,
                  pointerEvents: 'none' 
                }}
                id={inputId} 
                aria-describedby={hasError ? errorId : `${alias}InputLabel`}
              />
            </TextField.Root>
          </Popover.Trigger>
          <Popover.Content 
            style={calendarContainerStyle}
            align="start"
            sideOffset={8}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setFieldValue(alias, date ? date.toISOString() : ''); 
                setIsOpen(false); 
                setFieldTouched(alias, true);
              }}
              disabled={[
                  ...(readOnly ? [{ from: new Date(1900, 0, 1), to: new Date(2100, 0, 1) }] : []),
                  { before: parsedMin || new Date(1900, 0, 1) }, 
                  { after: parsedMax || new Date(2100, 0, 1) }
              ]}
              components={{
                Chevron: (props) => {
                    const style = { display: 'block', cursor: 'pointer', color: 'var(--gray-11)' };
                    if (props.orientation === 'left') {
                        return <Icon name='chevronleft' height="16" width="16" style={style} />;
                    }
                    return <Icon name='chevronright' height="16" width="16" style={style} />;
                }
              }}
            />
          </Popover.Content>
        </Popover.Root>
        <div>
           {inputLabel && (
             <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>
               {inputLabel}
             </Text>
           )}
           &nbsp;
           {isHinted && (
               <Tooltip content={hintText || "No hint available"}>
                   <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                       <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                   </a> 
               </Tooltip>
           )} 
           
           {hasError && (
               <Text id={errorId} size="1" color="red" className='core-input-label-error'>
                   {errorText || (meta.error || "Required field")}
               </Text>
           )} 
        </div>
      </Flex>
    </Column>
  );
};