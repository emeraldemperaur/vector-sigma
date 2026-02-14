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
  inputtype?: DateRangePickerDesign  & {},
  alias: string, inputLabel?: string, icon?: React.ReactNode,
  width: number, defaultValue?: string, value?: string, newRow?: boolean, 
  placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
  minvalue?: Date | string,
  maxvalue?: Date | string, errorText?: ReactNode | string | null,
  className?: string;
  style?: React.CSSProperties;
}

export const DateRangePicker = ({
  inputtype = 'daterangepicker-outline',
  alias, readOnly, width,
  placeholder = '',
  value,
  minvalue,
  maxvalue,
  className,
  style, ...props
}: DateRangePickerProps) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  
  const hasError = Boolean(meta.touched && meta.error);
  
  // Range object value format: { from: "2023-01-01", to: "2023-01-05" } :: Strings or Date Objects
  const rawVal = field.value || {};
  const selectedRange: DateRange | undefined = {
    from: ensureDate(rawVal.from),
    to: ensureDate(rawVal.to),
  };
  
  const parsedMin = ensureDate(minvalue);
  const parsedMax = ensureDate(maxvalue);
  const inputId = `${alias}FormInput` || crypto.randomUUID();
  const errorId = `${alias}-error`;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (inputtype === 'daterangepicker-neumorphic' && containerRef.current) {
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

  let displayText = placeholder;
  if (selectedRange.from) {
    if (selectedRange.to) {
      displayText = `${format(selectedRange.from, 'LLL dd')} - ${format(selectedRange.to, 'LLL dd')}`;
    } else {
      displayText = format(selectedRange.from, 'LLL dd');
    }
  }

  // Styles
  const activeInputStyle = inputtype === 'daterangepicker-neumorphic' 
    ? { 
        backgroundColor: 'var(--neu-bg)', 
        border: 'none', 
        color: hasError ? 'var(--red-9)' : 'var(--neu-text)',
        boxShadow: 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
        borderRadius: '8px',
        ...neuVars 
      }
    : inputtype === 'daterangepicker-outline' 
      ? { backgroundColor: 'transparent', boxShadow: 'none', border: hasError ? '2px solid var(--red-9)' : '2px solid var(--gray-7)' }
      : { backgroundColor: 'var(--color-surface)', boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 2px 5px rgba(0,0,0,0.1)', border: 'none' };

  return (
    <Column span={width} newLine={props.newRow}>
    <Flex direction="column" gap="2" width="100%" ref={containerRef} style={style} className={className}>
      <input 
        type="hidden" 
        name={alias} 
        value={JSON.stringify({
          from: selectedRange.from?.toISOString(),
          to: selectedRange.to?.toISOString()
        })} 
      />
      <style dangerouslySetInnerHTML={{__html: `
        .rdp { --rdp-cell-size: 32px; margin: 0; }
        .rdp-months { justify-content: center; }
        .rdp-month { background: ${inputtype === 'daterangepicker-neumorphic' ? 'var(--neu-bg)' : 'var(--color-panel-solid)'}; padding: 10px; border-radius: 8px; }
        .rdp-caption { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .rdp-caption_label { font-weight: bold; color: var(--gray-12); font-size: var(--font-size-3); }
        .rdp-nav { display: flex; gap: 5px; }
        .rdp-head_cell { font-size: 0.8rem; font-weight: 500; color: var(--gray-10); padding-bottom: 5px; }
        .rdp-day { width: var(--rdp-cell-size); height: var(--rdp-cell-size); border-radius: 50%; border: none; background: transparent; cursor: pointer; color: var(--gray-12); display: flex; align-items: center; justify-content: center; }
        .rdp-day:hover:not(.rdp-day_selected) { background-color: var(--gray-4); }
        
        .rdp-day_selected:not(.rdp-day_range_start):not(.rdp-day_range_end) { background-color: var(--accent-4); color: var(--accent-11); border-radius: 0; }
        .rdp-day_range_start { border-radius: 50% 0 0 50%; background-color: var(--accent-9); color: white; }
        .rdp-day_range_end { border-radius: 0 50% 50% 0; background-color: var(--accent-9); color: white; }

        /* Neumorphic */
        .neu-calendar .rdp-month { box-shadow: 6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light); }
        .neu-calendar .rdp-day_range_start, .neu-calendar .rdp-day_range_end { box-shadow: inset 2px 2px 4px rgba(0,0,0,0.2); }
      `}} />

      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger>
          <TextField.Root 
             variant="surface" 
             style={{ cursor: 'pointer', height: inputtype === 'daterangepicker-neumorphic' ? '40px' : '32px', ...activeInputStyle }}
             onClick={() => setIsOpen(true)}
          >
            <TextField.Slot><Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} /></TextField.Slot>
            <input 
              id={inputId}  
              aria-describedby={hasError ? errorId : `${alias}InputLabel`}
              readOnly 
              value={displayText} 
              style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%', cursor: 'pointer', color: 'inherit', fontSize: 'var(--font-size-2)' }} 
            />
          </TextField.Root>
        </Popover.Trigger>

        <Popover.Content style={{ padding: 0, backgroundColor: 'transparent', boxShadow: 'none' }} align="start">
          <div className={inputtype === 'daterangepicker-neumorphic' ? 'neu-calendar' : ''} style={neuVars}>
            <DayPicker
              mode="range"
              selected={selectedRange}
              onSelect={(range) => {
                setFieldValue(alias, range); 
                if (range?.from && range?.to) {
                   setFieldTouched(alias, true);
                   setIsOpen(false);
                }
              }}
              disabled={[
                { before: parsedMin || new Date(1900, 0, 1) }, 
                { after: parsedMax || new Date(2100, 0, 1) }
              ]}
              components={{
                Chevron: (props) => {
                   if (props.orientation === 'left') return <Icon name='chevronleft' />;
                   return <Icon name='chevronright' />;
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