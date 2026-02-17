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
    return ensureDate(field.value);
  }, [field.value]);

  const parsedMin = ensureDate(minDate);
  const parsedMax = ensureDate(maxDate);
  const inputId = `${alias}FormInput`;
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
      } as React.CSSProperties);
    }
  }, [inputtype]);

  // Input Styling
  const activeInputStyle = React.useMemo(() => {
    const base = { cursor: readOnly ? 'default' : 'pointer', height: '32px' };
    if (inputtype === 'datepicker-neumorphic') {
      return { ...base, backgroundColor: 'var(--neu-bg)', border: 'none', boxShadow: 'inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)', borderRadius: '8px', ...neuVars };
    }
    if (inputtype === 'datepicker-outline') {
      return { ...base, backgroundColor: 'transparent', boxShadow: 'none', border: hasError ? '1px solid var(--red-9)' : '1px solid var(--gray-7)', borderRadius: 'var(--radius-2)' };
    }
    return { ...base, backgroundColor: 'var(--color-surface)', boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid var(--gray-5)', borderRadius: 'var(--radius-2)' };
  }, [inputtype, hasError, neuVars, readOnly]);

  return (
    <Column span={width} newLine={newRow}>
      <Flex direction="column" gap="2" width="100%" ref={containerRef} style={style} className={className}>
        <input type="hidden" name={alias} value={selectedDate ? selectedDate.toISOString() : ''} />
        
        {/* === MODERN CALENDAR CSS === */}
        <style dangerouslySetInnerHTML={{__html: `
          .rdp { 
             --rdp-cell-size: 36px;
             --rdp-accent-color: var(--accent-9);
             --rdp-background-color: var(--accent-3);
             margin: 0;
          }
          .rdp-vhidden { display: none; }
          .rdp-month { background: transparent; }
          
          /* Header */
          .rdp-caption { display: flex; align-items: center; justify-content: space-between; padding: 0 8px 12px 8px; }
          .rdp-caption_label { font-size: 0.95rem; font-weight: 700; color: var(--gray-12); }
          
          /* Navigation */
          .rdp-nav { display: flex; gap: 4px; }
          .rdp-nav_button {
             width: 28px; height: 28px; border-radius: 6px; border: none; background: transparent;
             cursor: pointer; color: var(--gray-11); display: flex; align-items: center; justify-content: center;
             transition: all 0.2s ease;
          }
          .rdp-nav_button:hover { background-color: var(--gray-4); color: var(--gray-12); }

          /* Grid Layout */
          .rdp-head_row, .rdp-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
          .rdp-head_cell { 
             height: 32px; font-size: 0.7rem; font-weight: 600; color: var(--gray-9); 
             text-transform: uppercase; display: flex; align-items: center; justify-content: center;
          }
          
          /* Days */
          .rdp-cell { text-align: center; }
          .rdp-day { 
             width: var(--rdp-cell-size); height: var(--rdp-cell-size); border-radius: 50%; border: none; 
             background: transparent; color: var(--gray-12); font-size: 0.9rem; cursor: pointer; 
             display: flex; align-items: center; justify-content: center; margin: 0 auto;
             transition: all 0.2s ease;
          }
          .rdp-day:hover:not(.rdp-day_selected):not([disabled]) { background-color: var(--gray-4); font-weight: 600; }
          .rdp-day_selected { background-color: var(--rdp-accent-color) !important; color: white !important; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
          .rdp-day_today { color: var(--rdp-accent-color); font-weight: 700; position: relative; }
          .rdp-day_today:after { content: ''; position: absolute; bottom: 4px; width: 4px; height: 4px; border-radius: 50%; background: currentColor; }
          .rdp-day_disabled { opacity: 0.3; cursor: not-allowed; }

          /* Neumorphic Overrides */
          ${inputtype === 'datepicker-neumorphic' ? `
            .rdp-day:hover:not(.rdp-day_selected) { box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light); background: transparent; }
            .rdp-day_selected { box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light); color: var(--neu-accent) !important; background: var(--neu-bg) !important; }
          ` : ''}
        `}} />

        <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
          <Popover.Trigger>
            <TextField.Root variant="surface" style={activeInputStyle} onClick={() => !readOnly && setIsOpen(true)}>
              <TextField.Slot><Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} /></TextField.Slot>
              <input readOnly disabled={readOnly} value={selectedDate ? format(selectedDate, 'PPP') : ''} placeholder={placeholder}
                style={{ backgroundColor: 'transparent', border: 'none', outline: 'none', width: '100%', cursor: readOnly ? 'default' : 'pointer', color: 'inherit', fontFamily: 'inherit', fontSize: 'var(--font-size-2)', fontWeight: 500 }}
                id={inputId} aria-describedby={hasError ? errorId : undefined}
              />
            </TextField.Root>
          </Popover.Trigger>

          <Popover.Content sideOffset={5} style={{ 
              padding: '16px', borderRadius: '16px', 
              backgroundColor: inputtype === 'datepicker-neumorphic' ? 'var(--neu-bg)' : 'var(--color-panel-solid)',
              boxShadow: inputtype === 'datepicker-neumorphic' ? '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)' : '0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)',
              border: inputtype === 'datepicker-neumorphic' ? 'none' : '1px solid var(--gray-6)'
          }}>
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => { setFieldValue(alias, date ? date.toISOString() : ''); setIsOpen(false); setFieldTouched(alias, true); }}
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
           {inputLabel && <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputLabel}</Text>}
           {isHinted && <Tooltip content={hintText || ""}><a href={hintUrl || ""} target="_blank"><Icon name="questionmarkcircled" height="16" width="16" style={{ marginLeft: 4, color: 'gray' }} /></a></Tooltip>} 
           {hasError && <Text id={errorId} size="1" color="red" style={{ display:'block' }}>{errorText || (meta.error || "Required")}</Text>} 
        </div>
      </Flex>
    </Column>
  );
};