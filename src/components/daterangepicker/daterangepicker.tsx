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
    return {
      from: ensureDate(rawVal.from),
      to: ensureDate(rawVal.to),
    };
  }, [field.value]);
  
  const parsedMin = ensureDate(minDate);
  const parsedMax = ensureDate(maxDate);
  const inputId = `${alias}FormInput`;
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
  if (selectedRange?.from) {
    if (selectedRange.to) {
      displayText = `${format(selectedRange.from, 'LLL dd, yyyy')} - ${format(selectedRange.to, 'LLL dd, yyyy')}`;
    } else {
      displayText = format(selectedRange.from, 'LLL dd, yyyy');
    }
  }

  // --- STYLES ---
  const activeInputStyle = React.useMemo(() => {
    if (inputtype === 'daterangepicker-neumorphic') {
      return { 
        backgroundColor: 'var(--neu-bg)', 
        border: 'none', 
        color: hasError ? 'var(--red-9)' : 'var(--neu-text)',
        boxShadow: 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
        borderRadius: '8px',
        ...neuVars 
      };
    }
    if (inputtype === 'daterangepicker-outline') {
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
    const base = { padding: '20px', borderRadius: '16px', zIndex: 50 };

    if (inputtype === 'daterangepicker-neumorphic') {
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
        .rdp { 
            --rdp-cell-size: 40px; 
            --rdp-accent-color: var(--accent-9);
            --rdp-background-color: var(--accent-3);
            margin: 0;
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

        /* Table */
        .rdp-head_cell { 
            width: var(--rdp-cell-size); height: 32px;
            font-size: 0.75rem; font-weight: 600; color: var(--gray-9); 
            text-transform: uppercase; text-align: center; vertical-align: middle;
        }
        
        .rdp-cell { text-align: center; padding: 1px 0; }
        
        /* Base Day Style */
        .rdp-day { 
            width: var(--rdp-cell-size); height: var(--rdp-cell-size); 
            border-radius: 50%; border: none; background: transparent; 
            color: var(--gray-12); font-size: 0.9rem; cursor: pointer; 
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto;
            transition: background-color 0.2s ease;
        }
        
        .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_disabled) { 
            background-color: var(--gray-4); font-weight: 500;
        }

        
        .rdp-day_range_middle {
            background-color: var(--rdp-background-color) !important;
            color: var(--accent-11) !important;
            border-radius: 0 !important;
            width: 100%; /* Fill the cell to connect strip */
            margin: 0;
        }
        
        .rdp-day_range_start {
            background-color: var(--rdp-accent-color) !important;
            color: white !important;
            border-radius: 50% !important;
        }
        .rdp-day_range_start:not(.rdp-day_range_end) {
             border-top-right-radius: 0 !important;
             border-bottom-right-radius: 0 !important;
             width: 100%;
             margin: 0;
        }

        .rdp-day_range_end {
            background-color: var(--rdp-accent-color) !important;
            color: white !important;
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
            border-top-right-radius: 50% !important;
            border-bottom-right-radius: 50% !important;
            width: 100%;
            margin: 0;
        }

        .rdp-day_range_start.rdp-day_range_end {
            border-radius: 50% !important;
            width: var(--rdp-cell-size);
            margin: 0 auto;
        }

        .rdp-day_today { color: var(--accent-11); font-weight: 700; }
        .rdp-day_disabled { opacity: 0.25; cursor: not-allowed; }

        /* Neumorphic Overrides */
        ${inputtype === 'daterangepicker-neumorphic' ? `
            .rdp-day:hover:not(.rdp-day_selected) {
                box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
                background-color: transparent;
            }
            .rdp-day_range_start, .rdp-day_range_end {
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
                 height: inputtype === 'daterangepicker-neumorphic' ? '40px' : '32px', 
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
              value={displayText} 
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
            />
          </TextField.Root>
        </Popover.Trigger>

        <Popover.Content 
             style={calendarContainerStyle} 
             align="start" 
             sideOffset={8}
        >
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