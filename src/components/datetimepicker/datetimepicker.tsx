import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Popover, Flex, Text, TextField, Button, Tooltip, Separator } from '@radix-ui/themes';
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
  width: number;
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (inputtype === 'datetimepicker-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      setNeuVars({ '--neu-bg': parentBg, '--neu-shadow-dark': adjustColor(parentBg, -20), '--neu-shadow-light': adjustColor(parentBg, 20), '--neu-accent': 'var(--accent-9)' } as React.CSSProperties);
    }
  }, [inputtype]);

  const handleDaySelect = (date: Date | undefined) => {
    if (!date) return;
    const current = selectedDate || new Date();
    setFieldValue(alias, setMinutes(setHours(date, current.getHours()), current.getMinutes()));
  };

  const handleTimeChange = (type: 'hours' | 'minutes', val: string) => {
    const num = parseInt(val, 10);
    if (isNaN(num)) return;
    const base = selectedDate || new Date();
    setFieldValue(alias, type === 'hours' ? setHours(base, Math.min(23, Math.max(0, num))) : setMinutes(base, Math.min(59, Math.max(0, num))));
  };

  const activeInputStyle = React.useMemo(() => {
    const base = { cursor: readOnly ? 'default' : 'pointer', height: '32px' };
    if (inputtype === 'datetimepicker-neumorphic') return { ...base, backgroundColor: 'var(--neu-bg)', border: 'none', boxShadow: 'inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)', borderRadius: '8px', ...neuVars };
    if (inputtype === 'datetimepicker-outline') return { ...base, backgroundColor: 'transparent', boxShadow: 'none', border: hasError ? '1px solid var(--red-9)' : '1px solid var(--gray-7)', borderRadius: 'var(--radius-2)' };
    return { ...base, backgroundColor: 'var(--color-surface)', boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid var(--gray-5)', borderRadius: 'var(--radius-2)' };
  }, [inputtype, hasError, neuVars, readOnly]);

  return (
    <Column span={width} newLine={newRow}>
    <Flex direction="column" gap="2" width="100%" ref={containerRef} style={style} className={className}>
      <input type="hidden" name={alias} value={selectedDate ? selectedDate.toISOString() : ''} />

      <style dangerouslySetInnerHTML={{__html: `
        .rdp { --rdp-cell-size: 36px; --rdp-accent-color: var(--accent-9); --rdp-background-color: var(--accent-3); margin: 0; }
        .rdp-vhidden { display: none; }
        .rdp-month { background: transparent; }
        .rdp-caption { display: flex; align-items: center; justify-content: space-between; padding: 0 8px 12px 8px; }
        .rdp-caption_label { font-size: 0.95rem; font-weight: 700; color: var(--gray-12); }
        .rdp-nav { display: flex; gap: 4px; }
        .rdp-nav_button { width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; cursor: pointer; color: var(--gray-11); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
        .rdp-nav_button:hover { background-color: var(--gray-4); color: var(--gray-12); }
        .rdp-head_row, .rdp-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
        .rdp-head_cell { height: 32px; font-size: 0.7rem; font-weight: 600; color: var(--gray-9); text-transform: uppercase; display: flex; align-items: center; justify-content: center; }
        .rdp-cell { text-align: center; }
        .rdp-day { width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; color: var(--gray-12); font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; margin: 0 auto; transition: all 0.2s ease; }
        .rdp-day:hover:not(.rdp-day_selected):not([disabled]) { background-color: var(--gray-4); font-weight: 600; }
        .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: white !important; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .rdp-day_today { color: var(--rdp-accent-color); font-weight: 700; position: relative; }
        .rdp-day_today:after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
        .rdp-day_disabled { opacity: 0.3; cursor: not-allowed; }
        
        .time-input { text-align: center; width: 48px; padding: 6px; border-radius: 6px; border: 1px solid var(--gray-6); background: var(--color-surface); color: var(--gray-12); font-weight: 600; font-size: 0.9rem; }
        .time-input:focus { outline: 2px solid var(--accent-9); border-color: transparent; }

        ${inputtype === 'datetimepicker-neumorphic' ? `
          .neu-cal .rdp-day:hover:not(.rdp-day_selected) { box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light); background: transparent; }
          .neu-cal .rdp-day_selected { box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light); color: var(--neu-accent) !important; background: var(--neu-bg) !important; }
          .neu-cal .time-input { background: var(--neu-bg); border: none; box-shadow: inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light); }
        ` : ''}
      `}} />

      <Popover.Root open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setFieldTouched(alias, true); }}>
        <Popover.Trigger>
          <TextField.Root variant="surface" style={activeInputStyle} onClick={() => !readOnly && setIsOpen(true)}>
            <TextField.Slot><Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} /></TextField.Slot>
            <input readOnly disabled={readOnly} value={selectedDate && isValid(selectedDate) ? format(selectedDate, 'PPP p') : ''} placeholder={placeholder}
              style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%', cursor: readOnly ? 'default' : 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'var(--font-size-2)', fontWeight: 500 }}
              id={`${alias}FormInput`} aria-describedby={hasError ? `${alias}-error` : undefined}
            />
          </TextField.Root>
        </Popover.Trigger>

        <Popover.Content sideOffset={5} style={{ padding: 0, borderRadius: '16px', overflow: 'hidden', backgroundColor: inputtype === 'datetimepicker-neumorphic' ? 'var(--neu-bg)' : 'var(--color-panel-solid)', boxShadow: '0 10px 38px -10px rgba(22, 23, 24, 0.35)', border: inputtype === 'datetimepicker-neumorphic' ? 'none' : '1px solid var(--gray-6)' }}>
          <div className={inputtype === 'datetimepicker-neumorphic' ? 'neu-cal' : ''} style={neuVars}>
            <div style={{ padding: '16px' }}>
              <DayPicker mode="single" selected={selectedDate} onSelect={handleDaySelect} 
              modifiers={{ today: new Date() }} modifiersClassNames={{ today: 'rdp-day_today' }} 
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
            </div>
            <Separator size="4" />
            
            <Flex p="3" gap="3" align="center" justify="between" style={{ backgroundColor: inputtype === 'datetimepicker-neumorphic' ? 'rgba(0,0,0,0.02)' : 'var(--gray-2)' }}>
                <Flex align="center" gap="2">
                    <Icon name="clock" width="16" height="16" style={{ opacity: 0.6 }} />
                    <Flex align="center" gap="1">
                        <input type="number" className="time-input" min="0" max="23" disabled={readOnly} value={selectedDate ? format(selectedDate, 'HH') : '12'} onChange={(e) => handleTimeChange('hours', e.target.value)} />
                        <Text weight="bold" size="3" style={{ paddingBottom: 2, color: 'var(--gray-10)' }}>:</Text>
                        <input type="number" className="time-input" min="0" max="59" disabled={readOnly} value={selectedDate ? format(selectedDate, 'mm') : '00'} onChange={(e) => handleTimeChange('minutes', e.target.value)} />
                    </Flex>
                </Flex>
                <Button size="1" variant="soft" onClick={() => setIsOpen(false)}>Done</Button>
            </Flex>
          </div>
        </Popover.Content>
      </Popover.Root>

      <div>
           {inputLabel && <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputLabel}</Text>}
           {isHinted && <Tooltip content={hintText || ""}><a href={hintUrl || ""} target="_blank"><Icon name="questionmarkcircled" height="16" width="16" style={{ marginLeft: 4, color: 'gray' }} /></a></Tooltip>} 
           {hasError && <Text id={`${alias}-error`} size="1" color="red" style={{ display:'block' }}>{errorText || (meta.error || "Required")}</Text>} 
      </div>
    </Flex>
    </Column>
  );
};