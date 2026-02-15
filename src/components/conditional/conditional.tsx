import React, { ReactNode } from "react";
import { useField, useFormikContext } from 'formik';
import { Box, Flex, Text, Switch, Checkbox, Select, Card, Tooltip } from '@radix-ui/themes';
import { InputOption } from "utils/vinci";
import { Column } from "layouts/column/column";
import { Icon } from "components/icons/icons";
import '../../styles/main.scss';

export type ToggleTriggerDesign = 'conditionaltoggle' | 'conditionaltoggle-outline' | 'conditionaltoggle-material' | 'conditionaltoggle-neumorphic';
export type CheckboxTriggerDesign = 'conditionalcheckbox' | 'conditionalcheckbox-outline' | 'conditionalcheckbox-material' | 'conditionalcheckbox-neumorphic';
export type SelectTriggerDesign = 'conditionalselect' | 'conditionalselect-outline' | 'conditionalselect-material' | 'conditionalselect-neumorphic';

export type TriggerType = 'conditionaltoggle' | 'conditionalcheckbox' | 'conditionalselect';

export interface ConditionalProps {
  alias: string,  // Conditional Trigger Element Field form name
  inputlabel?: string, // Conditional Trigger Element Field input label
  icon?: React.ReactNode,
  width: number, defaultValue?: any[] | any, value?: any | any[], newRow?: boolean, isEdit?: boolean,
  placeholder?: string, readOnly?: boolean, isHinted?: boolean, hintText?: string, hintUrl?: string
  inputtype?: ToggleTriggerDesign & {} | CheckboxTriggerDesign & {} | SelectTriggerDesign  & {}; // Conditional Trigger Element input type (conditionaltoggle, conditionalcheckbox, conditionalselect)
  toggledinputtype?: ToggleTriggerDesign & {} | CheckboxTriggerDesign & {} | SelectTriggerDesign  & {}; // Conditional Trigger Element input design (conditionaltoggle, conditionalcheckbox, conditionalselect)
  triggerValue?: any;        // Conditional Trigger Element Input Value that triggers Toggled Input Element reveal (e.g. Boolean, String, Number)
  inputoptions?: InputOption[], errorText?: ReactNode | string | null,
  children: React.ReactNode; // Conditional Toggled Input Element
  className?: string;
  style?: React.CSSProperties;
}

const animationStyles = {
  wrapper: {
    display: 'grid',
    transition: 'grid-template-rows 0.3s ease-out',
  },
  inner: {
    overflow: 'hidden',
  }
};

const getDesignStyles = (inputtype: ToggleTriggerDesign & {} | CheckboxTriggerDesign & {} | SelectTriggerDesign & {}, isOpen: boolean): React.CSSProperties => {
  const base = {
    transition: 'all 0.3s ease',
    padding: '16px',
    borderRadius: 'var(--radius-3)',
  };

  if (inputtype.includes('neumorphic')) {
    return {
      ...base,
      backgroundColor: '#e0e5ec',
      border: 'none',
      boxShadow: isOpen 
        ? 'inset 4px 4px 8px #bec3c9, inset -4px -4px 8px #ffffff' 
        : '9px 9px 16px rgb(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.5)', 
    };
  }
  
  if (inputtype.includes('material')) {
    return {
      ...base,
      backgroundColor: 'var(--gray-2)',
      borderLeft: '4px solid var(--accent-9)', 
      boxShadow: isOpen 
        ? '0 8px 16px -4px rgba(0,0,0,0.1)' 
        : '0 2px 4px -1px rgba(0,0,0,0.05)',
    };
  }

  return {
    ...base,
    backgroundColor: 'transparent',
    border: '1px solid var(--gray-6)',
    borderLeft: isOpen ? '4px solid var(--accent-9)' : '1px solid var(--gray-6)',
  };
};

export const ConditionalTrigger = ({
  alias, readOnly, width,
  placeholder = '', value, inputlabel = undefined,
  inputtype = 'conditionaltoggle-outline',
  triggerValue = true,
  inputoptions = [],
  toggledinputtype = "conditionaltoggle-outline",
  children,
  style,
  className, ...props
}: ConditionalProps) => {
  const [field, meta, helpers] = useField(alias);
  const { setTouched } = useFormikContext();
  const inputId = `${alias}FormInput` || crypto.randomUUID();
  const errorId = `${alias}-error`;

  // Trigger (Equality) Logic :: If current Field value === trigger value
  const isOpen = field.value === triggerValue;

  const handleChange = (val: any) => {
    helpers.setValue(val);
    setTouched({ [alias]: true });
  };

  const isNeumorphic = inputtype.includes('neumorphic');
  const hasError = meta.touched && meta.error;

  const renderTrigger = () => {
    switch (true) {
      case inputtype.includes('conditionalcheckbox'):
        return (
          <Flex align="center" gap="2" style={{ cursor: 'pointer' }}>
            <Checkbox 
              name={alias}
              disabled={readOnly}
              checked={field.value === true} 
              onCheckedChange={(checked) => handleChange(!!checked)} 
              id={inputId}
            />
          </Flex>
        );

      case inputtype.includes('conditionalselect'):
        return (
          <Flex direction="column" gap="1" style={{ width: '100%' }}>
            <Select.Root
              name={alias}
              disabled={readOnly}
              value={field.value} 
              defaultValue={placeholder || String(value) || ""}
              onValueChange={handleChange}
            >
              <Select.Trigger 
                id={inputId}
                variant={isNeumorphic ? 'soft' : 'surface'} 
                style={{ width: '100%' }}
              />
              <Select.Content>
                {inputoptions.map((inputoption) => (
                  <Select.Item key={inputoption.optionvalue || crypto.randomUUID()} value={inputoption.optionvalue}>
                    {inputoption.text}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
        );

      case inputtype.includes('conditionaltoggle'):
      default:
        return (
          <Flex justify="between" align="center" style={{ width: '100%' }}>
            <Switch 
              id={inputId}
              name={alias}
              disabled={readOnly}
              checked={field.value === true} 
              onCheckedChange={(checked) => handleChange(!!checked)} 
              variant={isNeumorphic ? 'soft' : 'surface'}
            />
          </Flex>
        );
    }
  };

  const containerStyle = getDesignStyles(inputtype, isOpen);

  return (
    <Column span={width} newLine={props.newRow}>
    <Box 
      className={className}
      style={{
        ...containerStyle,
        ...style
      }}
    >
      <Box mb={isOpen ? "4" : "0"} style={{ transition: 'margin 0.3s' }}>
        {renderTrigger()}
      </Box>

      <div 
        style={{
          ...animationStyles.wrapper,
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          opacity: isOpen ? 1 : 0.6,
        }}
      >
        <div style={animationStyles.inner}>
           <Box 
             style={{ 
               paddingTop: '8px',
               borderTop: isOpen && !isNeumorphic ? '1px dashed var(--gray-6)' : 'none'
             }}
           >
             {children}
           </Box>
        </div>
      </div>

      <div>
            <Text id={`${alias}InputLabel`} as="label" size="2" weight="bold" htmlFor={alias} style={{ cursor: 'pointer' }}>
                {inputlabel}
            </Text>
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
                      {typeof meta.error === 'string' ? <>{props.errorText || "Required field"}</> 
                      : 'Invalid file selection'}
                  </p>
                  </> : null }       
        </div>

    </Box>
    </Column>
  );
};