import React, { useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Popover, Flex, Text, TextField, Separator, Button, Tooltip } from '@radix-ui/themes';
import { format, setHours, setMinutes } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { ensureDate } from 'utils/chronos';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type DateTimePickerDesign = 'datetimepicker' | 'datetimepicker-material' | 'datetimepicker-outline' | 'datetimepicker-neumorphic';

interface DateTimePickerProps {
  inputtype?: DateTimePickerDesign,
  alias: string, inputLabel?: string, icon?: React.ReactNode,
  width: number, defaultValue?: string, value: string, newRow?: boolean, 
  placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
  minvalue?: Date | string;
  maxvalue?: Date | string;
  className?: string;
  style?: React.CSSProperties;
}

export const DateTimePicker = ({
  inputtype = 'datetimepicker',
  alias, readOnly, width,
  placeholder = '',
  value,
  minvalue,
  maxvalue,
  className,
  style, ...props
}: DateTimePickerProps) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  const selectedDate = ensureDate(field.value);
  const parsedMin = ensureDate(minvalue);
  const parsedMax = ensureDate(maxvalue);
  const inputId = `${alias}FormInput` || crypto.randomUUID();
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
        // 0-23 limiters
        const h = Math.min(23, Math.max(0, numVal));
        newDate = setHours(baseDate, h);
    } else {
        // 0-59 limiters
        const m = Math.min(59, Math.max(0, numVal));
        newDate = setMinutes(baseDate, m);
    }
    setFieldValue(alias, newDate);
  };

  // Styles
  const activeInputStyle = inputtype === 'datetimepicker-neumorphic' 
    ? { 
        backgroundColor: 'var(--neu-bg)', 
        border: 'none', 
        color: hasError ? 'var(--red-9)' : 'var(--neu-text)',
        boxShadow: 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
        borderRadius: '8px',
        ...neuVars 
      }
    : inputtype === 'datetimepicker-outline' 
      ? { backgroundColor: 'transparent', boxShadow: 'none', border: hasError ? '2px solid var(--red-9)' : '2px solid var(--gray-7)' }
      : { backgroundColor: 'var(--color-surface)', boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 2px 5px rgba(0,0,0,0.1)', border: 'none' };

  return (
    <Column span={width} newLine={props.newRow}>
    <Flex direction="column" gap="2" width="100%" ref={containerRef} style={style} className={className}>
      
      <input type="hidden" name={alias} value={selectedDate ? selectedDate.toISOString() : ''} />

      <style dangerouslySetInnerHTML={{__html: `
        .rdp { --rdp-cell-size: 32px; margin: 0; }
        .rdp-months { justify-content: center; }
        .rdp-month { background: ${inputtype === 'datetimepicker-neumorphic' ? 'var(--neu-bg)' : 'var(--color-panel-solid)'}; padding: 10px; border-radius: 8px; }
        .rdp-caption { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .rdp-caption_label { font-weight: bold; color: var(--gray-12); font-size: var(--font-size-3); }
        .rdp-nav { display: flex; gap: 5px; }
        .rdp-day { width: var(--rdp-cell-size); height: var(--rdp-cell-size); border-radius: 50%; border: none; background: transparent; cursor: pointer; color: var(--gray-12); display: flex; align-items: center; justify-content: center; }
        .rdp-day:hover:not(.rdp-day_selected) { background-color: var(--gray-4); }
        .rdp-day_selected { background-color: var(--accent-9); color: white; font-weight: bold; }
        
        .neu-calendar .rdp-month { box-shadow: 6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light); }
        .neu-calendar .rdp-day:hover:not(.rdp-day_selected) { background-color: transparent; box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light); }
        .neu-calendar .rdp-day_selected { background-color: var(--neu-bg); color: var(--neu-accent); box-shadow: inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light); }
        
        /* Time Input Styling */
        .time-input {
            text-align: center;
            font-variant-numeric: tabular-nums;
            width: 40px;
            padding: 4px;
            border-radius: 4px;
            border: 1px solid var(--gray-6);
            background: var(--color-surface);
        }
        .neu-calendar .time-input {
            background: var(--neu-bg);
            border: none;
            box-shadow: inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light);
        }
      `}} />

      <Popover.Root open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setFieldTouched(alias, true);
      }}>
        <Popover.Trigger>
          <TextField.Root 
             variant="surface" 
             style={{ cursor: 'pointer', height: inputtype === 'datetimepicker-neumorphic' ? '40px' : '32px', ...activeInputStyle }}
             onClick={() => setIsOpen(true)}
          >
            <TextField.Slot><Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} /></TextField.Slot>
            <input 
              id={inputId}
              aria-describedby={hasError ? errorId : undefined}
              readOnly 
              value={selectedDate ? format(selectedDate, 'PPP p') : ''}
              placeholder={placeholder}
              style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%', cursor: 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'var(--font-size-2)' }} 
            />
          </TextField.Root>
        </Popover.Trigger>

        <Popover.Content style={{ padding: 0, backgroundColor: 'transparent', boxShadow: 'none' }} align="start">
          <div className={inputtype === 'datetimepicker-neumorphic' ? 'neu-calendar' : ''} style={neuVars}>
            
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={handleDaySelect}
              disabled={[{ before: parsedMin || new Date(1900, 0, 1) }, { after: parsedMax || new Date(2100, 0, 1) }]}
              components={{
                Chevron: (props) => props.orientation === 'left' ? <Icon name='chevronleft' /> : <Icon name='chevronright' />
              }}
            />

            <Separator size="4" />

            <Flex 
                p="3" 
                gap="3" 
                align="center" 
                justify="center"
                style={{ 
                    backgroundColor: inputtype === 'datetimepicker-neumorphic' ? 'var(--neu-bg)' : 'var(--color-panel-solid)',
                    borderBottomLeftRadius: '8px',
                    borderBottomRightRadius: '8px',
                    boxShadow: inputtype === 'datetimepicker-neumorphic' ? '6px 6px 12px var(--neu-shadow-dark), -6px 6px 12px var(--neu-shadow-light)' : undefined
                }}
            >
                <Icon name="clock" width="16" height="16" style={{ opacity: 0.7 }} />
                <Text size="2" weight="bold">Time:</Text>
                
                <input 
                    type="number" 
                    className="time-input"
                    min="0" max="23"
                    value={selectedDate ? format(selectedDate, 'HH') : '12'}
                    onChange={(e) => handleTimeChange('hours', e.target.value)}
                />
                <Text>:</Text>
                <input 
                    type="number" 
                    className="time-input"
                    min="0" max="59"
                    value={selectedDate ? format(selectedDate, 'mm') : '00'}
                    onChange={(e) => handleTimeChange('minutes', e.target.value)}
                />

                <Button size="1" variant="soft" onClick={() => setIsOpen(false)}>
                    Done
                </Button>
            </Flex>
          </div>
        </Popover.Content>
      </Popover.Root>
       <div>
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{props.inputLabel}</Text>
            
                {hasError ?
                    <>
                       <p id={errorId} className='core-input-label-error'>
                            {meta.error}
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