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
  inputtype?: DatePickerDesign & {};
  alias: string;
  inputlabel?: string;
  icon?: React.ReactNode;
  width: number;
  defaultValue?: string;
  value?: string;
  newRow?: boolean;
  placeholder?: string;
  readonly?: boolean;
  isHinted?: boolean;
  hintText?: string;
  hintUrl?: string;
  minvalue?: Date | string;
  maxvalue?: Date | string;
  errorText?: ReactNode | string | null;
  className?: string;
  style?: React.CSSProperties;
}

export const DatePicker = ({
  inputtype = 'datepicker-outline',
  alias,
  readonly,
  width,
  inputlabel,
  placeholder = 'Pick a date',
  minvalue,
  maxvalue,
  className,
  style,
  ...props
}: DatePickerProps) => {

  const { setFieldValue, setFieldTouched } = useFormikContext();
  const [field, meta] = useField(alias);
  const hasError = Boolean(meta.touched && meta.error);
  const selectedDate = field.value 
    ? (typeof field.value === 'string' ? parseISO(field.value) : field.value) 
    : undefined;

  const parsedMin = ensureDate(minvalue);
  const parsedMax = ensureDate(maxvalue);
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
        '--neu-text': 'var(--gray-12)',
      } as React.CSSProperties);
    }
  }, [inputtype]);

  // --- INPUT STYLES ---
  const activeInputStyle = React.useMemo(() => {
    if (inputtype === 'datepicker-neumorphic') {
      return { 
        backgroundColor: 'var(--neu-bg)', 
        border: 'none', 
        color: hasError ? 'var(--red-9)' : 'var(--neu-text)',
        boxShadow: 'inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light)',
        borderRadius: '8px',
        ...neuVars 
      };
    }
    if (inputtype === 'datepicker-outline') {
      return { 
        backgroundColor: 'transparent', 
        boxShadow: 'none', 
        border: hasError ? '1px solid var(--red-9)' : '1px solid var(--gray-7)',
        borderRadius: 'var(--radius-2)'
      };
    }
    // Material / Default
    return { 
      backgroundColor: 'var(--color-surface)', 
      boxShadow: hasError ? 'inset 0 0 0 1px var(--red-9)' : '0 1px 2px rgba(0,0,0,0.05)', 
      border: '1px solid var(--gray-5)',
      borderRadius: 'var(--radius-2)'
    };
  }, [inputtype, hasError, neuVars]);

  // --- CALENDAR POPUP STYLES ---
  const calendarContainerStyle = React.useMemo(() => {
    const base = { padding: '16px', borderRadius: '12px' };

    if (inputtype === 'datepicker-neumorphic') {
        return {
            ...base,
            backgroundColor: 'var(--neu-bg)',
            boxShadow: '6px 6px 12px var(--neu-shadow-dark), -6px -6px 12px var(--neu-shadow-light)',
            border: 'none',
            ...neuVars
        };
    }
    if (inputtype === 'datepicker-outline') {
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
    <Column span={width} newLine={props.newRow}>
      <Flex 
        direction="column" 
        gap="2" 
        width="100%" 
        ref={containerRef} 
        style={style} 
        className={className}
      >
        <input type="hidden" aria-describedby={`${alias}InputLabel`} name={alias} value={selectedDate ? selectedDate.toISOString() : ''} />
        
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
          
          /* Header (Month Name + Nav) */
          .rdp-caption { 
             display: flex; 
             align-items: center; 
             justify-content: space-between; 
             margin-bottom: 12px; 
             padding: 0 4px;
          }
          .rdp-caption_label { 
             font-weight: 600; 
             color: var(--gray-12); 
             font-size: var(--font-size-3); 
             text-transform: capitalize;
          }
          .rdp-nav { display: flex; gap: 8px; }
          .rdp-nav_button {
             color: var(--gray-11);
             border-radius: 6px;
             padding: 4px;
             transition: background 0.2s;
             background: transparent;
             border: none;
             cursor: pointer;
             display: flex;
             align-items: center;
             justify-content: center;
          }
          .rdp-nav_button:hover { background-color: var(--gray-4); color: var(--gray-12); }

          /* Weekdays Row */
          .rdp-head_cell { 
             font-size: 0.75rem; 
             font-weight: 600; 
             color: var(--gray-9); 
             text-transform: uppercase; 
             padding-bottom: 8px; 
             width: var(--rdp-cell-size);
             text-align: center;
          }
          
          /* Day Cells */
          .rdp-cell { text-align: center; }
          .rdp-day { 
             width: var(--rdp-cell-size); 
             height: var(--rdp-cell-size); 
             border-radius: 50%;
             border: 2px solid transparent; 
             background: transparent; 
             cursor: pointer; 
             color: var(--gray-12); 
             font-size: var(--font-size-2);
             display: flex; 
             align-items: center; 
             justify-content: center;
             transition: all 0.15s ease;
             margin: 1px;
          }

          /* States */
          .rdp-day:hover:not(.rdp-day_selected):not([disabled]) { 
             background-color: var(--gray-4); 
          }
          
          .rdp-day_selected { 
             background-color: var(--accent-9) !important; 
             color: white !important; 
             font-weight: 600;
          }

          .rdp-day_today { 
             color: var(--accent-11); 
             font-weight: 700;
             position: relative;
          }

          .rdp-day_disabled { opacity: 0.3; cursor: not-allowed; }

          /* NEUMORPHIC OVERRIDES */
          ${inputtype === 'datepicker-neumorphic' ? `
            .rdp-day:hover:not(.rdp-day_selected) {
                box-shadow: 3px 3px 6px var(--neu-shadow-dark), -3px -3px 6px var(--neu-shadow-light);
                background-color: transparent;
            }
            .rdp-day_selected {
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
                 height: inputtype === 'datepicker-neumorphic' ? '40px' : '32px', 
                 ...activeInputStyle 
               }}
               onClick={() => !readonly && setIsOpen(true)}
            >
              <TextField.Slot>
                <Icon name='calendar' height="16" width="16" style={{ color: 'var(--gray-10)' }} />
              </TextField.Slot>
              
              <input 
                readOnly
                disabled={readonly}
                value={selectedDate && isValid(selectedDate) ? format(selectedDate, 'PPP') : ''}
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
                id={inputId} 
                aria-describedby={hasError ? errorId : `${alias}InputLabel`}
              />
            </TextField.Root>
          </Popover.Trigger>

          <Popover.Content 
            style={calendarContainerStyle}
            align="start"
            sideOffset={5}
          >
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setFieldValue(alias, date); 
                setIsOpen(false); 
                setFieldTouched(alias, true);
              }}
              disabled={[
                  ...(readonly ? [{ from: new Date(1900, 0, 1), to: new Date(2100, 0, 1) }] : []),
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
           <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias}>{inputlabel}</Text>
           &nbsp;
           {props.isHinted ?
               <>
                   <Tooltip content={props.hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                       <a href={props.hintUrl || ""} target="_blank" rel="noopener noreferrer">
                           <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                       </a> 
                   </Tooltip>
               </> : null} 
           
           {hasError ?
               <>
                   <p id={errorId} className='core-input-label-error'>
                       {props.errorText || (meta.error || "Required field")}
                   </p>
               </> : null } 
        </div>
      </Flex>
    </Column>
  );
};