import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Popover, Flex, Text, TextField, Separator, Button, Tooltip } from '@radix-ui/themes';
import { format, setHours, setMinutes, isValid } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { ensureDate } from 'utils/chronos';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type DateTimePickerDesign = 'datetimepicker' | 'datetimepicker-material' | 'datetimepicker-outline' | 'datetimepicker-neumorphic';

export interface DateTimePickerProps {
  inputtype?: DateTimePickerDesign;
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

export const DateTimePicker = ({
  inputtype = 'datetimepicker-outline',
  alias,
  readOnly, newRow, isHinted, hintText, hintUrl, errorText,
  width,
  inputLabel,
  placeholder = 'Pick date & time',
  value,
  minDate,
  maxDate,
  className,
  style,
  ...props
}: DateTimePickerProps) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  
  const selectedDate = ensureDate(field.value);
  const parsedMin = ensureDate(minDate);
  const parsedMax = ensureDate(maxDate);
  const inputId = `${alias}FormInput`;
  const errorId = `${alias}-error`;
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  // Neumorphic Logic
  useEffect(() => {
    if (inputtype === 'datetimepicker-neumorphic' && containerRef.current) {
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

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;
    const current = selectedDate || new Date();
    const hours = current.getHours();
    const minutes = current.getMinutes();
    // Preserve existing time when changing date
    const newDateTime = setMinutes(setHours(date, hours), minutes);
    setFieldValue(alias, newDateTime);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
    const numVal = parseInt(val, 10);
    if (isNaN(numVal)) return;

    const baseDate = selectedDate || new Date(); 
    let newDate = baseDate;

    if (type === 'hours') {
        const h = Math.min(23, Math.max(0, numVal));
        newDate = setHours(baseDate, h);
    } else {
        const m = Math.min(59, Math.max(0, numVal));
        newDate = setMinutes(baseDate, m);
    }
    setFieldValue(alias, newDate);
  };

  // --- INPUT STYLES ---
  const activeInputStyle = React.useMemo(() => {
    if (inputtype === 'datetimepicker-neumorphic') {
      return { 
        backgroundColor: 'var(--neu-bg)', 
        border: 'none', 
        color: hasError ? 'var(--red-9)' : 'var(--neu-text)',
        boxShadow: 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
        borderRadius: '8px',
        ...neuVars 
      };
    }
    if (inputtype === 'datetimepicker-outline') {
      return { 
        backgroundColor: 'transparent', 
        boxShadow: 'none', 
        border: hasError ? '1px solid var(--red-9)' : '1px solid var(--gray-7)',
        borderRadius: 'var(--radius-2)'
      };
    }
    // Material
    return { 
      backgroundColor: 'var(--color-surface)', 
      boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 1px 2px rgba(0,0,0,0.05)', 
      border: '1px solid var(--gray-5)',
      borderRadius: 'var(--radius-2)'
    };
  }, [inputtype, hasError, neuVars]);

  // --- POPUP CONTAINER STYLES ---
  const calendarContainerStyle = React.useMemo(() => {
    // Padding 0 allows the Time Picker footer to sit flush at the bottom
    const base = { padding: 0, borderRadius: '16px', overflow: 'hidden', zIndex: 50 };

    if (inputtype === 'datetimepicker-neumorphic') {
        return {
            ...base,
            backgroundColor: 'var(--neu-bg)',
            boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
            border: 'none',
            ...neuVars
        };
    }
    // Google Material Shadow
    return {
        ...base,
        backgroundColor: 'var(--color-panel-solid)',
        border: '1px solid var(--gray-4)',
        boxShadow: '0 12px 24px -10px rgba(0,0,0,0.15), 0 8px 12px -6px rgba(0,0,0,0.1)',
    };
  }, [inputtype, neuVars]);

  return (
    <Column span={width} newLine={newRow}>
    <Flex direction="column" gap="2" width="100%" ref={containerRef} style={style} className={className}>
      
      <input type="hidden" name={alias} value={selectedDate ? selectedDate.toISOString() : ''} {...props}/>

      {/* === GOOGLE STYLE + TIME PICKER CSS === */}
      <style dangerouslySetInnerHTML={{__html: `
        .rdp { 
            --rdp-cell-size: 40px;
            --rdp-accent-color: var(--accent-9);
            --rdp-background-color: var(--accent-3);
            margin: 0; 
            padding: 16px; /* Padding inside RDP */
            font-family: var(--default-font-family, sans-serif);
        }
        .rdp-vhidden { display: none; }
        .rdp-month { display: table; margin: 0 auto; border-collapse: collapse; }
        .rdp-caption { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 0 8px; }
        
        .rdp-caption_label { 
            font-size: 1rem; font-weight: 600; color: var(--gray-12); text-transform: capitalize;
        }
        
        /* Navigation */
        .rdp-nav { display: flex; gap: 4px; }
        .rdp-nav_button {
            width: 32px; height: 32px;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%; border: none; background: transparent; cursor: pointer;
            color: var(--gray-11); transition: all 0.2s ease;
        }
        .rdp-nav_button:hover { background-color: var(--gray-4); color: var(--gray-12); }

        /* Weekdays */
        .rdp-head_cell { 
            width: var(--rdp-cell-size); height: 32px;
            font-size: 0.75rem; font-weight: 600; color: var(--gray-9); 
            text-transform: uppercase; text-align: center; vertical-align: middle;
        }
        
        /* Days */
        .rdp-cell { text-align: center; padding: 0; }
        .rdp-day { 
            width: var(--rdp-cell-size); height: var(--rdp-cell-size); 
            border-radius: 50%; border: none; background: transparent; 
            color: var(--gray-12); font-size: 0.9rem; cursor: pointer; 
            display: flex; align-items: center; justify-content: center;
            transition: all 0.15s ease; margin: 1px;
        }
        
        .rdp-day:hover:not(.rdp-day_selected):not([disabled]) { 
            background-color: var(--gray-4); font-weight: 500;
        }
        
        /* Selected State */
        .rdp-day_selected { 
            background-color: var(--rdp-accent-color) !important; 
            color: white !important; font-weight: 600; 
        }
        
        /* Today State */
        .rdp-day_today { color: var(--rdp-accent-color); font-weight: 700; }
        .rdp-day_disabled { opacity: 0.25; cursor: not-allowed; }
        
        /* --- TIME INPUT STYLING --- */
        .time-input {
            text-align: center; font-variant-numeric: tabular-nums;
            width: 44px; padding: 6px; border-radius: 6px;
            border: 1px solid var(--gray-6); background: var(--color-surface);
            color: var(--gray-12); font-weight: 600; font-size: 0.9rem;
        }
        .time-input:focus { 
            outline: 2px solid var(--accent-9); border-color: transparent; 
        }
        
        /* Neumorphic Overrides */
        ${inputtype === 'datetimepicker-neumorphic' ? `
          .neu-calendar .rdp-day:hover:not(.rdp-day_selected) {
             box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
             background-color: transparent;
          }
          .neu-calendar .rdp-day_selected {
             box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light);
             color: var(--neu-accent) !important; background-color: var(--neu-bg) !important;
          }
          .neu-calendar .time-input {
             background: var(--neu-bg); border: none;
             box-shadow: inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light);
          }
        ` : ''}
      `}} />

      <Popover.Root open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setFieldTouched(alias, true);
      }}>
        <Popover.Trigger>
          <TextField.Root 
             variant="surface" 
             style={{ 
                cursor: 'pointer', 
                height: inputtype === 'datetimepicker-neumorphic' ? '40px' : '32px', 
                ...activeInputStyle 
             }}
             onClick={() => !readOnly && setIsOpen(true)}
          >
            <TextField.Slot>
                <Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} />
            </TextField.Slot>
            <input 
              id={inputId}
              aria-describedby={hasError ? errorId : undefined}
              readOnly 
              disabled={readOnly}
              // Format: Jan 01, 2023 12:00 PM
              value={selectedDate && isValid(selectedDate) ? format(selectedDate, 'PPP p') : ''}
              placeholder={placeholder}
              style={{ 
                  backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%', 
                  cursor: readOnly ? 'default' : 'pointer', color: 'inherit', fontFamily: 'inherit', 
                  fontSize: 'var(--font-size-2)', fontWeight: 500, pointerEvents: 'none'
              }} 
            />
          </TextField.Root>
        </Popover.Trigger>

        <Popover.Content style={calendarContainerStyle} align="start" sideOffset={5}>
          <div className={inputtype === 'datetimepicker-neumorphic' ? 'neu-calendar' : ''} style={neuVars}>
            
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
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

            <Flex 
                p="3" 
                gap="3" 
                align="center" 
                justify="between"
                style={{ 
                    backgroundColor: inputtype === 'datetimepicker-neumorphic' ? 'rgba(0,0,0,0.02)' : 'var(--gray-2)',
                    borderTop: inputtype === 'datetimepicker-neumorphic' ? 'none' : '1px solid var(--gray-4)'
                }}
            >
                <Flex align="center" gap="2">
                    <Icon name="clock" width="16" height="16" style={{ opacity: 0.6 }} />
                    <Flex align="center" gap="1">
                        <input 
                            type="number" 
                            className="time-input"
                            min="0" max="23"
                            disabled={readOnly}
                            value={selectedDate ? format(selectedDate, 'HH') : '12'}
                            onChange={(e) => handleTimeChange('hours', e.target.value)}
                        />
                        <Text weight="bold" size="3" style={{ paddingBottom: 2, color: 'var(--gray-10)' }}>:</Text>
                        <input 
                            type="number" 
                            className="time-input"
                            min="0" max="59"
                            disabled={readOnly}
                            value={selectedDate ? format(selectedDate, 'mm') : '00'}
                            onChange={(e) => handleTimeChange('minutes', e.target.value)}
                        />
                    </Flex>
                </Flex>

                <Button size="1" variant="soft" onClick={() => setIsOpen(false)}>
                    Done
                </Button>
            </Flex>
          </div>
        </Popover.Content>
      </Popover.Root>
      
      <div>
           {inputLabel && (
             <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputLabel}</Text>
           )}
           &nbsp;
           {isHinted && (
               <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
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