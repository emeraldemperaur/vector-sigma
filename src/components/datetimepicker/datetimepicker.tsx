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
  inputtype?: DateTimePickerDesign & {};
  alias: string;
  inputlabel?: string;
  icon?: React.ReactNode;
  width: number;
  defaultvalue?: string;
  value?: string;
  newrow?: boolean;
  placeholder?: string;
  readonly?: boolean;
  ishinted?: boolean;
  hinttext?: string;
  hinturl?: string;
  minvalue?: Date | string;
  maxvalue?: Date | string;
  errortext?: ReactNode | string | null;
  classname?: string;
  style?: React.CSSProperties;
}

export const DateTimePicker = ({
  inputtype = 'datetimepicker-outline',
  alias,
  readonly,
  width,
  inputlabel,
  placeholder = 'Pick date & time',
  value,
  minvalue,
  maxvalue,
  classname,
  style,
  ...props
}: DateTimePickerProps) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  
  const selectedDate = ensureDate(field.value);
  const parsedMin = ensureDate(minvalue);
  const parsedMax = ensureDate(maxvalue);
  const inputId = `${alias}FormInput`;
  const errorId = `${alias}-error`;
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

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

  // --- STYLES ---
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

  const calendarContainerStyle = React.useMemo(() => {
    const base = { padding: 0, borderRadius: '12px', overflow: 'hidden' }; // Padding 0 to let Time section flush to bottom

    if (inputtype === 'datetimepicker-neumorphic') {
        return {
            ...base,
            backgroundColor: 'var(--neu-bg)',
            boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
            border: 'none',
            ...neuVars
        };
    }
    if (inputtype === 'datetimepicker-outline') {
        return {
            ...base,
            backgroundColor: 'var(--color-panel-solid)',
            border: '1px solid var(--gray-6)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        };
    }
    // Material
    return {
        ...base,
        backgroundColor: 'var(--color-panel-solid)',
        border: 'none',
        boxShadow: '0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)',
    };
  }, [inputtype, neuVars]);

  return (
    <Column span={width} newLine={props.newrow}>
    <Flex direction="column" gap="2" width="100%" ref={containerRef} style={style} className={classname}>
      
      <input type="hidden" name={alias} value={selectedDate ? selectedDate.toISOString() : ''} />

      <style dangerouslySetInnerHTML={{__html: `
        /* Reset & Layout */
        .rdp { 
            --rdp-cell-size: 36px;
            --rdp-caption-font-size: 16px;
            margin: 0; 
            padding: 16px; /* Padding moved to RDP so Time section is flush */
            font-family: var(--default-font-family, sans-serif);
        }
        .rdp-months { justify-content: center; }
        .rdp-month { background: transparent; }
        
        /* Header */
        .rdp-caption { 
            display: flex; align-items: center; justify-content: space-between; 
            margin-bottom: 12px; padding: 0 4px;
        }
        .rdp-caption_label { 
            font-weight: 600; color: var(--gray-12); font-size: var(--font-size-3); 
            text-transform: capitalize;
        }
        .rdp-nav { display: flex; gap: 8px; }
        .rdp-nav_button {
            color: var(--gray-11); border-radius: 6px; padding: 4px;
            transition: background 0.2s; background: transparent; border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
        .rdp-nav_button:hover { background-color: var(--gray-4); color: var(--gray-12); }

        /* Weekdays */
        .rdp-head_cell { 
            font-size: 0.75rem; font-weight: 600; color: var(--gray-9); 
            text-transform: uppercase; padding-bottom: 8px; width: var(--rdp-cell-size);
            text-align: center;
        }
        
        /* Cells */
        .rdp-cell { text-align: center; }
        .rdp-day { 
            width: var(--rdp-cell-size); height: var(--rdp-cell-size); 
            border-radius: 50%; border: 2px solid transparent; 
            background: transparent; cursor: pointer; color: var(--gray-12); 
            font-size: var(--font-size-2); display: flex; align-items: center; justify-content: center;
            transition: all 0.15s ease; margin: 1px;
        }
        
        .rdp-day:hover:not(.rdp-day_selected):not([disabled]) { background-color: var(--gray-4); }
        .rdp-day_selected { background-color: var(--accent-9) !important; color: white !important; font-weight: 600; }
        .rdp-day_today { color: var(--accent-11); font-weight: 700; position: relative; }
        .rdp-day_today:not(.rdp-day_selected)::after {
             content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background-color: var(--accent-9);
        }
        .rdp-day_disabled { opacity: 0.3; cursor: not-allowed; }
        
        /* Time Input Styling */
        .time-input {
            text-align: center; font-variant-numeric: tabular-nums;
            width: 44px; padding: 4px; border-radius: 6px;
            border: 1px solid var(--gray-6); background: var(--color-surface);
            color: var(--gray-12); font-weight: 500;
        }
        .time-input:focus { outline: 2px solid var(--accent-9); border-color: transparent; }
        
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
             onClick={() => !readonly && setIsOpen(true)}
          >
            <TextField.Slot>
                <Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} />
            </TextField.Slot>
            <input 
              id={inputId}
              aria-describedby={hasError ? errorId : undefined}
              readOnly 
              disabled={readonly}
              value={selectedDate && isValid(selectedDate) ? format(selectedDate, 'PPP p') : ''}
              placeholder={placeholder}
              style={{ 
                  backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%', 
                  cursor: readonly ? 'default' : 'pointer', color: 'inherit', fontFamily: 'inherit', 
                  fontSize: 'var(--font-size-2)', fontWeight: 500
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
                ...(readonly ? [{ from: new Date(1900, 0, 1), to: new Date(2100, 0, 1) }] : []),
                { before: parsedMin || new Date(1900, 0, 1) }, 
                { after: parsedMax || new Date(2100, 0, 1) }
              ]}
              modifiers={{ today: new Date() }}
              modifiersClassNames={{ today: 'rdp-day_today' }}
              components={{
                Chevron: (props) => {
                    const style = { display: 'block', cursor: 'pointer', color: 'var(--gray-11)' };
                    if (props.orientation === 'left') return <Icon name='chevronleft' height="16" width="16" style={style} />;
                    return <Icon name='chevronright' height="16" width="16" style={style} />;
                }
              }}
            />

            <Separator size="4" />

            <Flex 
                p="3" 
                gap="3" 
                align="center" 
                justify="center"
                style={{ 
                    backgroundColor: inputtype === 'datetimepicker-neumorphic' ? 'rgba(0,0,0,0.02)' : 'var(--gray-2)',
                    borderTop: inputtype === 'datetimepicker-neumorphic' ? 'none' : '1px solid var(--gray-4)'
                }}
            >
                <Icon name="clock" width="16" height="16" style={{ opacity: 0.7 }} />
                
                <Flex align="center" gap="1">
                    <input 
                        type="number" 
                        className="time-input"
                        min="0" max="23"
                        disabled={readonly}
                        value={selectedDate ? format(selectedDate, 'HH') : '12'}
                        onChange={(e) => handleTimeChange('hours', e.target.value)}
                    />
                    <Text weight="bold" style={{ paddingBottom: 2 }}>:</Text>
                    <input 
                        type="number" 
                        className="time-input"
                        min="0" max="59"
                        disabled={readonly}
                        value={selectedDate ? format(selectedDate, 'mm') : '00'}
                        onChange={(e) => handleTimeChange('minutes', e.target.value)}
                    />
                </Flex>

                <Button size="1" variant="soft" onClick={() => setIsOpen(false)} style={{ marginLeft: 'auto' }}>
                    Done
                </Button>
            </Flex>
          </div>
        </Popover.Content>
      </Popover.Root>
      
      <div>
           <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputlabel}</Text>
           &nbsp;
           {props.ishinted ?
               <>
                   <Tooltip content={props.hinttext || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                       <a href={props.hinturl || ""} target="_blank" rel="noopener noreferrer">
                           <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                       </a> 
                   </Tooltip>
               </> : null} 
           {hasError ?
               <>
                   <p id={errorId} className='core-input-label-error'>
                       {props.errortext || (meta.error || "Required field")}
                   </p>
               </> : null } 
      </div>

    </Flex>
    </Column>
  );
};