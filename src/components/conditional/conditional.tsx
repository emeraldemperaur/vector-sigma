import React, { ReactNode, useId } from "react";
import { FormikContextType, useFormikContext, getIn } from 'formik';
import { Box, Flex, Text, Switch, Checkbox, Select, Tooltip } from '@radix-ui/themes';
import { InputOption } from "utils/vinci";
import { Column } from "layouts/column/column";
import { Row } from "layouts/row/row"; 
import { Icon } from "components/icons/icons";
import '../../styles/main.scss';

export type ToggleTriggerDesign = 'conditionaltoggle' | 'conditionaltoggle-outline' | 'conditionaltoggle-material' | 'conditionaltoggle-neumorphic';
export type CheckboxTriggerDesign = 'conditionalcheckbox' | 'conditionalcheckbox-outline' | 'conditionalcheckbox-material' | 'conditionalcheckbox-neumorphic';
export type SelectTriggerDesign = 'conditionalselect' | 'conditionalselect-outline' | 'conditionalselect-material' | 'conditionalselect-neumorphic';

export type TriggerType = ToggleTriggerDesign | CheckboxTriggerDesign | SelectTriggerDesign;

/**
 * ConditionalProps Interface
 * @description Configuration properties for the VectorSigma Conditional Wrapper.
 * Orchestrates visibility of child inputs based on a driving trigger value. 
 * Includes automated Formik state-wiping and unified enterprise animations.
 */
export interface ConditionalProps {
  /**
   * The design aesthetic and input mechanism of the Conditional Trigger.
   * Defines both *how* it looks (Outline, Material, Neumorphic) and *what* it is (Toggle, Checkbox, Select).
   * @default 'conditionaltoggle-outline'
   */
  inputtype?: TriggerType;

  /**
   * The unique identifier bridging the trigger to the Formik state.
   * @example "enableAdvancedSettings"
   */
  alias: string;

  /**
   * The child React nodes (usually other form inputs) that will be revealed 
   * when the trigger's state matches the `triggerValue`.
   */
  children: React.ReactNode;

  /**
   * The required threshold value that the trigger must meet to reveal the children.
   * @example true
   */ 
  triggerValue: any;

  /**
   * Array of Formik field aliases (keys) rendered within this conditional block.
   * When the trigger closes, these fields are automatically wiped to prevent stale data leaks.
   * @example ["targetRegion", "autoScalingThreshold"]
   */
  fieldsToClearOnClose?: string[];

  /**
   * The primary semantic label rendered alongside the trigger control.
   * @example "Enable AI Generation"
   */
  inputLabel?: string;

  /**
   * Defines the responsive grid column span for the component wrapper (1-12).
   * @example 12
   */
  width: number;

  /**
   * Forces the component to break into a new Flex/Grid row within the layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Placeholder text utilized only if the `inputtype` mechanism is a Select dropdown.
   * @example "Select Provider..."
   */
  placeholder?: string;

  /**
   * Disables interaction, mutating the visual state to reflect read-only/disabled mode.
   * @default false
   */ 
  readOnly?: boolean;

  /**
   * Toggles the visibility of the contextual hint icon and tooltip next to the label.
   * @default false
   */ 
  isHinted?: boolean;

  /**
   * The text payload displayed inside the Tooltip when `isHinted` is true.
   * @example "Advanced settings may increase compute costs."
   */ 
  hintText?: string;

  /**
   * An optional URL bound to the hint icon, directing the user to external documentation.
   * @example "https://docs.vectorsigma.io/settings"
   */ 
  hintUrl?: string;

  /**
   * The array of discrete options rendered if the `inputtype` mechanism is a Select dropdown.
   */   
  inputOptions?: InputOption[]; 

  /**
   * Explicit error string to override standard Formik validation messages on the trigger.
   */
  errorText?: ReactNode | string | null;

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string;

  /**
   * Inline React CSS properties applied to the outmost structural wrapper.
   */
  style?: React.CSSProperties;

  /**
   * Injects an explicit Formik context. Required if the component operates outside 
   * a standard `<FormikProvider>` tree.
   */
  formikContext?: FormikContextType<any>;
}

export const ConditionalTrigger = ({
  alias, 
  readOnly, 
  width,
  placeholder = '', 
  inputLabel,
  inputtype = 'conditionaltoggle-outline',
  triggerValue = true,
  fieldsToClearOnClose = [],
  inputOptions = [],
  children, 
  newRow, 
  isHinted, 
  hintText, 
  hintUrl, 
  errorText,
  style,
  className, 
  formikContext
}: ConditionalProps) => {

  const defaultFormikContext = useFormikContext<any>();
  const activeContext = formikContext || defaultFormikContext;

  if (!activeContext) {
      console.error(`[VectorSigma]: ConditionalTrigger '${alias}' must be used within a Formik provider or receive an explicit formikContext prop.`);
      return null;
  }

  const { values, touched, errors, setFieldValue, setFieldTouched } = activeContext;

  const fieldValue = getIn(values, alias);
  const fieldTouched = getIn(touched, alias);
  const fieldError = getIn(errors, alias);

  const fallbackId = useId();
  const inputId = `${alias}ConditionalTrigger-${fallbackId}`;
  const errorId = `${alias}-error`;

  const isOpen = fieldValue === triggerValue;
  const isNeumorphic = inputtype.includes('neumorphic');
  const isMaterial = inputtype.includes('material');
  const hasError = Boolean(fieldTouched && fieldError);

  const handleChange = (val: any) => {
    if (readOnly) return;
    
    setFieldValue(alias, val);
    setFieldTouched(alias, true, false);

    const willBeOpen = val === triggerValue;
    if (!willBeOpen && fieldsToClearOnClose.length > 0) {
      fieldsToClearOnClose.forEach(childAlias => {
        setFieldValue(childAlias, undefined, true); 
        setFieldTouched(childAlias, false, false); 
      });
    }
  };

  const getDesignStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
      padding: '16px 20px',
      borderRadius: 'var(--radius-4)',
      width: '100%',
      fontFamily: "'Libre Franklin', sans-serif",
    };

    if (isNeumorphic) {
      return {
        ...base,
        backgroundColor: '#e0e5ec',
        border: 'none',
        boxShadow: isOpen 
          ? 'inset 4px 4px 8px #bec3c9, inset -4px -4px 8px #ffffff' 
          : '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)', 
      };
    }
    
    if (isMaterial) {
      return {
        ...base,
        backgroundColor: 'var(--gray-2)',
        border: '1px solid var(--gray-4)',
        borderLeft: isOpen ? '4px solid var(--accent-9)' : '4px solid var(--gray-6)', 
        boxShadow: isOpen 
          ? '0 8px 24px -4px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.04)' 
          : '0 2px 8px -2px rgba(0,0,0,0.05)',
      };
    }

    return {
      ...base,
      backgroundColor: isOpen ? 'var(--gray-2)' : 'transparent',
      border: '1px solid',
      borderColor: isOpen ? 'var(--accent-9)' : 'var(--gray-6)',
    };
  };

  const renderTriggerControl = () => {
    if (inputtype.includes('conditionalcheckbox')) {
        return (
          <Checkbox 
            name={alias}
            disabled={readOnly}
            checked={fieldValue === true} 
            onCheckedChange={(checked) => handleChange(!!checked)} 
            id={inputId}
            size="2"
            variant={isNeumorphic ? 'soft' : 'surface'}
          />
        );
    } 
    else if (inputtype.includes('conditionalselect')) {
        return (
          <Select.Root
            name={alias}
            disabled={readOnly}
            value={fieldValue ? String(fieldValue) : ""}
            onValueChange={handleChange}
          >
            <Select.Trigger 
              id={inputId}
              variant={isNeumorphic ? 'soft' : 'surface'} 
              style={{ minWidth: '180px' }}
              placeholder={placeholder || "Select to reveal..."}
            />
            <Select.Content position="popper" className="vs-animated-select-content">
              {inputOptions.map((inputoption, idx) => (
                <Select.Item key={`${alias}-opt-${inputoption.optionid || idx}`} value={String(inputoption.optionvalue)}>
                  {inputoption.text}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        );
    } 
    else {
        return (
          <Switch 
            className="vs-spring-toggle"
            id={inputId}
            name={alias}
            disabled={readOnly}
            checked={fieldValue === true} 
            onCheckedChange={(checked) => handleChange(!!checked)} 
            variant={isNeumorphic ? 'soft' : 'surface'}
            size="2"
            style={{ cursor: readOnly ? 'not-allowed' : 'pointer' }}
          />
        );
    }
  };

  return (
    <Column span={width} newLine={newRow}>
      <style>
        {`
          .vs-spring-toggle .rt-SwitchThumb {
            transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          }
          .vs-spring-toggle .rt-SwitchRoot {
            transition: background-color 0.3s ease !important;
          }
          .vs-spring-toggle:focus-within {
            outline: 2px solid var(--accent-a8);
            outline-offset: 2px;
          }

          @keyframes vs-select-enter {
            from { opacity: 0; transform: scale(0.96) translateY(-4px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          @keyframes vs-select-exit {
            from { opacity: 1; transform: scale(1) translateY(0); }
            to { opacity: 0; transform: scale(0.96) translateY(-4px); }
          }

          .vs-animated-select-content[data-state="open"] {
            animation: vs-select-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            transform-origin: top center;
          }
          .vs-animated-select-content[data-state="closed"] {
            animation: vs-select-exit 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            transform-origin: top center;
          }
        `}
      </style>
      <Box 
        className={className}
        style={{
          ...getDesignStyles(),
          ...style
        }}
      >
        <Flex 
          justify="between" 
          align={inputtype.includes('select') ? 'start' : 'center'} 
          style={{ width: '100%', paddingBottom: isOpen ? '16px' : '0', transition: 'padding 0.3s ease' }}
        >
          <Flex align="center" gap="3">
            {renderTriggerControl()}
            <Flex align="center" gap="2">
              <Text 
                id={`${alias}InputLabel`} 
                as="label" 
                size="3" 
                weight="medium" 
                htmlFor={inputId} 
                style={{ cursor: readOnly ? 'not-allowed' : 'pointer', color: 'var(--gray-12)' }}
              >
                  {inputLabel}
              </Text>
              {isHinted && (
                <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5}>
                  <a href={hintUrl || "#"} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                    <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'var(--gray-9)', transition: 'color 0.2s' }} />
                  </a> 
                </Tooltip>
              )} 
            </Flex>
          </Flex>
        </Flex>

        {hasError && (
          <Text id={errorId} size="1" style={{ color: 'var(--red-9)', fontWeight: 500, display: 'block', marginTop: isOpen ? '-8px' : '8px', marginBottom: isOpen ? '12px' : '0' }}>
            {errorText || (typeof fieldError === 'string' ? fieldError : "Invalid trigger state")}
          </Text>
        )}

        <div 
          style={{
            display: 'grid',
            gridTemplateRows: isOpen ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease',
            opacity: isOpen ? 1 : 0,
            width: '100%',
          }}
        >
          <div style={{ overflow: 'hidden', minHeight: 0 }}>
             <Box 
               style={{ 
                 paddingTop: '20px',
                 paddingBottom: '8px',
                 borderTop: isOpen && !isNeumorphic ? '1px dashed var(--gray-6)' : 'none',
                 marginTop: '4px'
               }}
             >
               <Row>
                 {children}
               </Row>
             </Box>
          </div>
        </div>

      </Box>
    </Column>
  );
};