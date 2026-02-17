import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { useField, useFormikContext } from 'formik';
import { Popover, Flex, Text, TextField, Tooltip } from '@radix-ui/themes';
import { format } from 'date-fns';
import { DayPicker, DateRange } from 'react-day-picker';
import { ensureDate } from 'utils/chronos';
import { adjustColor, getNearestParentBackground } from 'utils/vinci';
import { Icon } from 'components/icons/icons';
import { Column } from 'layouts/column/column';
import '../../styles/main.scss';

export type DateRangePickerDesign = 'daterangepicker'| 'daterangepicker-material' | 'daterangepicker-outline' | 'daterangepicker-neumorphic';

export interface DateRangePickerProps {
  inputtype?: DateRangePickerDesign;
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

export const DateRangePicker = ({
  inputtype = 'daterangepicker-outline',
  alias,
  readOnly, newRow, isHinted, hintText, hintUrl, errorText,
  width,
  inputLabel,
  placeholder = 'Pick a date range',
  minDate,
  maxDate,
  className,
  style,
  ...props
}: DateRangePickerProps) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  
  const selectedRange: DateRange | undefined = React.useMemo(() => {
    const rawVal = field.value || {};
    return { from: ensureDate(rawVal.from), to: ensureDate(rawVal.to) };
  }, [field.value]);
  
  const parsedMin = ensureDate(minDate);
  const parsedMax = ensureDate(maxDate);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (inputtype === 'daterangepicker-neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      setNeuVars({ '--neu-bg': parentBg, '--neu-shadow-dark': adjustColor(parentBg, -20), '--neu-shadow-light': adjustColor(parentBg, 20), '--neu-accent': 'var(--accent-9)' } as React.CSSProperties);
    }
  }, [inputtype]);

  const displayText = selectedRange?.from 
    ? (selectedRange.to ? `${format(selectedRange.from, 'LLL dd')} - ${format(selectedRange.to, 'LLL dd, yyyy')}` : format(selectedRange.from, 'LLL dd, yyyy'))
    : placeholder;

  const activeInputStyle = React.useMemo(() => {
    const base = { cursor: readOnly ? 'default' : 'pointer', height: '32px' };
    if (inputtype === 'daterangepicker-neumorphic') return { ...base, backgroundColor: 'var(--neu-bg)', border: 'none', boxShadow: 'inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)', borderRadius: '8px', ...neuVars };
    if (inputtype === 'daterangepicker-outline') return { ...base, backgroundColor: 'transparent', boxShadow: 'none', border: hasError ? '1px solid var(--red-9)' : '1px solid var(--gray-7)', borderRadius: 'var(--radius-2)' };
    return { ...base, backgroundColor: 'var(--color-surface)', boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid var(--gray-5)', borderRadius: 'var(--radius-2)' };
  }, [inputtype, hasError, neuVars, readOnly]);

  return (
    <Column span={width} newLine={newRow}>
    <Flex direction="column" gap="2" width="100%" ref={containerRef} style={style} className={className}>
      <input type="hidden" name={alias} value={JSON.stringify({ from: selectedRange.from?.toISOString(), to: selectedRange.to?.toISOString() })} />
      
      <style dangerouslySetInnerHTML={{__html: `
        .rdp { --rdp-cell-size: 36px; --rdp-accent-color: var(--accent-9); --rdp-background-color: var(--accent-3); margin: 0; }
        .rdp-vhidden { display: none; }
        .rdp-month { background: transparent; }
        .rdp-caption { display: flex; align-items: center; justify-content: space-between; padding: 0 8px 12px 8px; }
        .rdp-caption_label { font-size: 0.95rem; font-weight: 700; color: var(--gray-12); }
        .rdp-nav { display: flex; gap: 4px; }
        .rdp-nav_button { width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent; cursor: pointer; color: var(--gray-11); display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
        .rdp-nav_button:hover { background-color: var(--gray-4); color: var(--gray-12); }
        .rdp-head_row, .rdp-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0; row-gap: 2px; }
        .rdp-head_cell { height: 32px; font-size: 0.7rem; font-weight: 600; color: var(--gray-9); text-transform: uppercase; display: flex; align-items: center; justify-content: center; }
        .rdp-cell { text-align: center; padding: 0; }
        .rdp-day { width: 36px; height: 36px; border-radius: 50%; border: none; background: transparent; color: var(--gray-12); font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; margin: 0 auto; transition: all 0.2s ease; }
        .rdp-day:hover:not(.rdp-day_selected):not([disabled]) { background-color: var(--gray-4); font-weight: 600; }
        
        /* Strip Styling */
        .rdp-day_range_middle { background-color: var(--rdp-background-color) !important; color: var(--accent-11) !important; border-radius: 0 !important; width: 100%; margin: 0; }
        .rdp-day_range_start { background-color: var(--rdp-accent-color) !important; color: white !important; border-radius: 50% !important; }
        .rdp-day_range_start:not(.rdp-day_range_end) { border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important; width: 100%; margin: 0; }
        .rdp-day_range_end { background-color: var(--rdp-accent-color) !important; color: white !important; border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important; border-top-right-radius: 50% !important; border-bottom-right-radius: 50% !important; width: 100%; margin: 0; }
        .rdp-day_range_start.rdp-day_range_end { border-radius: 50% !important; width: 36px; margin: 0 auto; }
        
        /* Neumorphic Overrides */
        ${inputtype === 'daterangepicker-neumorphic' ? `
           .neu-cal .rdp-day_range_start:not(.rdp-day_range_end) { border-radius: 8px 0 0 8px !important; }
           .neu-cal .rdp-day_range_end:not(.rdp-day_range_start) { border-radius: 0 8px 8px 0 !important; }
           .neu-cal .rdp-day_range_middle { background: transparent !important; box-shadow: inset 1px 1px 2px var(--neu-shadow-dark), inset -1px -1px 2px var(--neu-shadow-light); }
           .neu-cal .rdp-day_range_start, .neu-cal .rdp-day_range_end { box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light); color: var(--neu-accent) !important; background: var(--neu-bg) !important; }
        ` : ''}
      `}} />

      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger>
          <TextField.Root variant="surface" style={activeInputStyle} onClick={() => !readOnly && setIsOpen(true)}>
            <TextField.Slot><Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} /></TextField.Slot>
            <input readOnly disabled={readOnly} value={displayText} placeholder={placeholder}
              style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%', cursor: readOnly ? 'default' : 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'var(--font-size-2)', fontWeight: 500 }}
            />
          </TextField.Root>
        </Popover.Trigger>

        <Popover.Content sideOffset={5} style={{ padding: '16px', borderRadius: '16px', backgroundColor: inputtype === 'daterangepicker-neumorphic' ? 'var(--neu-bg)' : 'var(--color-panel-solid)', boxShadow: '0 10px 38px -10px rgba(22, 23, 24, 0.35)', border: inputtype === 'daterangepicker-neumorphic' ? 'none' : '1px solid var(--gray-6)' }}>
          <div className={inputtype === 'daterangepicker-neumorphic' ? 'neu-cal' : ''} style={neuVars}>
            <DayPicker mode="range" selected={selectedRange} onSelect={(range) => { setFieldValue(alias, range); if (range?.from && range?.to) { setFieldTouched(alias, true); } }}
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