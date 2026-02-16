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
  inputtype?: DateRangePickerDesign & {};
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

export const DateRangePicker = ({
  inputtype = 'daterangepicker-outline',
  alias,
  readonly,
  width,
  inputlabel,
  placeholder = 'Pick a date range',
  value,
  minvalue,
  maxvalue,
  classname,
  style,
  ...props
}: DateRangePickerProps) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  
  const hasError = Boolean(meta.touched && meta.error);
  
  // Range object value format: { from: "2023-01-01", to: "2023-01-05" }
  const rawVal = field.value || {};
  const selectedRange: DateRange | undefined = {
    from: ensureDate(rawVal.from),
    to: ensureDate(rawVal.to),
  };
  
  const parsedMin = ensureDate(minvalue);
  const parsedMax = ensureDate(maxvalue);
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
  if (selectedRange.from) {
    if (selectedRange.to) {
      displayText = `${format(selectedRange.from, 'LLL dd')} - ${format(selectedRange.to, 'LLL dd')}`;
    } else {
      displayText = format(selectedRange.from, 'LLL dd');
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
    const base = { padding: '16px', borderRadius: '12px' };

    if (inputtype === 'daterangepicker-neumorphic') {
        return {
            ...base,
            backgroundColor: 'var(--neu-bg)',
            boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
            border: 'none',
            ...neuVars
        };
    }
    if (inputtype === 'daterangepicker-outline') {
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
      <input 
        type="hidden" 
        name={alias} 
        value={JSON.stringify({
          from: selectedRange.from?.toISOString(),
          to: selectedRange.to?.toISOString()
        })} 
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        /* Reset & Layout */
        .rdp { 
            --rdp-cell-size: 36px;
            --rdp-caption-font-size: 16px;
            margin: 0; 
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
        .rdp-cell { text-align: center; padding: 1px 0; }
        .rdp-day { 
            width: var(--rdp-cell-size); height: var(--rdp-cell-size); 
            border-radius: 50%; border: 2px solid transparent; 
            background: transparent; cursor: pointer; color: var(--gray-12); 
            font-size: var(--font-size-2); display: flex; align-items: center; justify-content: center;
            margin: 0 auto;
        }
        
        /* States */
        .rdp-day:hover:not(.rdp-day_selected):not([disabled]) { background-color: var(--gray-4); }

        /* --- RANGE STYLES --- */
        .rdp-day_range_middle {
            background-color: var(--accent-3) !important;
            color: var(--accent-11) !important;
            border-radius: 0 !important;
            width: 100%; /* Fill cell width for continuous strip */
        }
        .rdp-day_range_start {
            background-color: var(--accent-9) !important;
            color: white !important;
            border-top-left-radius: 50% !important;
            border-bottom-left-radius: 50% !important;
            border-top-right-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            width: 100%;
        }
        .rdp-day_range_end {
            background-color: var(--accent-9) !important;
            color: white !important;
            border-top-right-radius: 50% !important;
            border-bottom-right-radius: 50% !important;
            border-top-left-radius: 0 !important;
            border-bottom-left-radius: 0 !important;
            width: 100%;
        }
        .rdp-day_range_start.rdp-day_range_end {
            border-radius: 50% !important;
            width: var(--rdp-cell-size);
        }
        .rdp-day_today { color: var(--accent-11); font-weight: 700; }
        .rdp-day_disabled { opacity: 0.3; cursor: not-allowed; }

        /* NEUMORPHIC OVERRIDES */
        ${inputtype === 'daterangepicker-neumorphic' ? `
          .neu-calendar .rdp-day:hover:not(.rdp-day_selected) {
             box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
             background-color: transparent;
          }
          .neu-calendar .rdp-day_range_start, 
          .neu-calendar .rdp-day_range_end {
             box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light);
             color: var(--neu-accent) !important;
             background-color: var(--neu-bg) !important;
          }
          .neu-calendar .rdp-day_range_middle {
             box-shadow: inset 1px 1px 2px var(--neu-shadow-dark), inset -1px -1px 2px var(--neu-shadow-light);
             background-color: transparent !important; 
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
             onClick={() => !readonly && setIsOpen(true)}
          >
            <TextField.Slot>
                <Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} />
            </TextField.Slot>
            <input 
              id={inputId}  
              aria-describedby={hasError ? errorId : `${alias}InputLabel`}
              readOnly 
              disabled={readonly}
              value={displayText} 
              placeholder={placeholder}
              style={{ 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  outline: 'none', 
                  width: '100%', 
                  cursor: readonly ? 'default' : 'pointer', 
                  color: 'inherit', 
                  fontFamily: 'inherit', 
                  fontSize: 'var(--font-size-2)',
                  fontWeight: 500
              }} 
            />
          </TextField.Root>
        </Popover.Trigger>

        <Popover.Content 
             style={calendarContainerStyle} 
             align="start" 
             sideOffset={5}
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
                ...(readonly ? [{ from: new Date(1900, 0, 1), to: new Date(2100, 0, 1) }] : []),
                { before: parsedMin || new Date(1900, 0, 1) }, 
                { after: parsedMax || new Date(2100, 0, 1) }
              ]}
              components={{
                Chevron: (props) => {
                   const style = { display: 'block', cursor: 'pointer', color: 'var(--gray-11)' };
                   if (props.orientation === 'left') return <Icon name='chevronleft' height="16" width="16" style={style} />;
                   return <Icon name='chevronright' height="16" width="16" style={style} />;
                }
              }}
            />
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