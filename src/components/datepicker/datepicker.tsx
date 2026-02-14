import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Popover, Flex, Text, TextField, IconButton, Tooltip } from '@radix-ui/themes';
import { format, isValid, parseISO } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { ensureDate } from 'utils/chronos';
import { Icon } from 'components/icons/icons';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type DatePickerDesign = 'datepicker' | 'datepicker-material' | 'datepicker-outline' | 'datepicker-neumorphic';

export interface DatePickerProps {
  inputtype?: DatePickerDesign & {},
  alias: string, inputLabel?: string, icon?: React.ReactNode,
  width: number, defaultValue?: string, value?: string, newRow?: boolean, 
  placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string,
  minvalue?: Date | string,
  maxvalue?: Date | string, errorText?: ReactNode | string | null,
  className?: string;
  style?: React.CSSProperties;
}

export const DatePicker = ({
  inputtype = 'datepicker-outline',
  alias, readOnly, width,
  placeholder = 'Pick a date',
  value,
  minvalue,
  maxvalue,
  className,
  style,  ...props
}: DatePickerProps) => {

  
  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  const selectedDate = field.value ? (typeof field.value === 'string' ? parseISO(field.value) : field.value) : undefined;
  const parsedMin = ensureDate(minvalue);
  const parsedMax = ensureDate(maxvalue);
  const inputId = `${alias}FormInput` || crypto.randomUUID();
  const errorId = `${alias}-error`;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

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

  // --- STYLES ---
  const activeInputStyle = inputtype === 'datepicker-neumorphic' 
    ? { 
        backgroundColor: 'var(--neu-bg)', 
        border: 'none', 
        color: hasError ? 'var(--red-9)' : 'var(--neu-text)',
        boxShadow: 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
        borderRadius: '8px',
        ...neuVars 
      }
    : inputtype === 'datepicker-outline' 
      ? { backgroundColor: 'transparent', boxShadow: 'none', border: hasError ? '2px solid var(--red-9)' : '2px solid var(--gray-7)' }
      : { backgroundColor: 'var(--color-surface)', boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 2px 5px rgba(0,0,0,0.1)', border: 'none' };
  

  return (
    <Column span={width} newLine={props.newRow}>
    <Flex 
      direction="column" 
      gap="2" 
      width="100%" 
      ref={containerRef} 
      style={style} 
      className={className}
    >
      <input type="hidden" aria-describedby={`${alias}InputLabel`} 
      name={alias} value={selectedDate ? selectedDate.toISOString() : ''} />
      <style dangerouslySetInnerHTML={{__html: `
        /* Base Calendar */
        .rdp { --rdp-cell-size: 32px; margin: 0; }
        .rdp-months { display: flex; justify-content: center; }
        .rdp-month { background: ${inputtype === 'datepicker-neumorphic' ? 'var(--neu-bg)' : 'var(--color-panel-solid)'}; padding: 10px; border-radius: 8px; }
        .rdp-caption { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .rdp-caption_label { font-weight: bold; color: var(--gray-12); font-size: var(--font-size-3); }
        .rdp-nav { display: flex; gap: 5px; }
        .rdp-head_cell { font-size: 0.8rem; font-weight: 500; color: var(--gray-10); padding-bottom: 5px; }
        
        /* Day */
        .rdp-day { 
          width: var(--rdp-cell-size); height: var(--rdp-cell-size); 
          border-radius: 50%; border: none; background: transparent; 
          cursor: pointer; color: var(--gray-12); 
          display: flex; align-items: center; justify-content: center;
        }
        .rdp-day:hover:not(.rdp-day_selected) { background-color: var(--gray-4); }

        /* Selected State */
        .rdp-day_selected { 
          background-color: var(--accent-9); color: white; 
          font-weight: bold;
        }

        /* NEUMORPHIC OVERRIDES */
        .neu-calendar .rdp-month {
           /* The floating plate */
           box-shadow: 6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light);
        }
        .neu-calendar .rdp-day:hover:not(.rdp-day_selected) {
           background-color: transparent;
           /* Hover = pop out slightly */
           box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
        }
        .neu-calendar .rdp-day_selected {
           background-color: var(--neu-bg);
           color: var(--neu-accent);
           /* Pressed in state for selected */
           box-shadow: inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light);
        }
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
             onClick={() => setIsOpen(true)}
          >
            <TextField.Slot>
              <Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} />
            </TextField.Slot>
            
            <input 
              readOnly
              value={selectedDate && isValid(selectedDate) ? format(selectedDate, 'PPP') : ''}
              placeholder={placeholder}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                width: '100%',
                cursor: 'pointer',
                color: 'inherit',
                fontFamily: 'inherit',
                fontSize: 'var(--font-size-2)'
              }}
              id={inputId} aria-describedby={hasError ? errorId : `${alias}InputLabel`}

            />
          </TextField.Root>
        </Popover.Trigger>

        <Popover.Content 
          style={{ padding: 0, backgroundColor: 'transparent', boxShadow: 'none' }}
          align="start"
        >
          <div className={inputtype === 'datepicker-neumorphic' ? 'neu-calendar' : ''} style={neuVars}>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setFieldValue(alias, date); 
                setIsOpen(false); 
                setFieldTouched(alias, true);
              }}
              disabled={[{ before: parsedMin || new Date(1900, 0, 1) }, { after: parsedMax || new Date(2100, 0, 1) }]}
              
              components={{
                Chevron: (props) => {
                    if (props.orientation === 'left') {
                    return <Icon name='chevronleft' height="16" width="16" />;
                    }
                    return <Icon name='chevronright' height="16" width="16" />;
                }
              }}
            />
          </div>
        </Popover.Content>
      </Popover.Root>

     <div>
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{props.inputLabel}</Text>
            
                {hasError ?
                    <>
                       <p className='core-input-label-error'>
                            {props.errorText || "Required field"}
                        </p>
                    </> : null } 
            
                {props.isHinted ?
                        <>
                    <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                            <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                            <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                            </a> 
                    </Tooltip>
                        </> : null} 
      </div>
    </Flex>
    </Column>
  );
};