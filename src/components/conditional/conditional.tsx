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
  /**
   * * The design variation of the Conditional Trigger input. 
   * Default: 'conditionaltoggle-outline' 
   * Variants: 'conditionaltoggle-outline', 'conditionalcheckbox-outline', 'conditionalselect-outline',
   * 'conditionaltoggle-material', 'conditionalcheckbox-material', 'conditionalselect-material', 
   * 'conditionaltoggle-neumorphic', 'conditionalcheckbox-neumorphic', 'conditionalselect-neumorphic'.
   * * @example
   * inputtype="conditionalcheckbox-outline"
   */
  inputtype?: ToggleTriggerDesign & {} | CheckboxTriggerDesign & {} | SelectTriggerDesign  & {}; // Conditional Trigger Element input type (conditionaltoggle, conditionalcheckbox, conditionalselect)
  /**
   * * The required unique identifier for the Conditional Trigger input field in useFormikContext(). 
   * Alias referenced as `name` attribute and Formik state key.
   * * @example
   * alias="isAIEnabled"
   */
  alias: string;
   /**
   * * The required conditional toggled (child) xForm input field.
   * * @example
   * children={<Avatar name="Upload Display Profile/>}
   */
  children: React.ReactNode;
   /**
   * * Option to specify a value for Conditional Trigger element to reveal render the toggled child input field if trigger value is inputted.
   * (e.g. Boolean, String, Number)
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */ 
  triggerValue: any;
  /**
   * * The optional input label or description for the Conditional Trigger input field. 
   * * @example
   * inputLabel="Enable VΣ AI Models"
   */
  inputLabel?: string;
  /**
   * * The required viewport column width for the Conditional Trigger input field.
   * i.e. 1 - 12
   * * @example
   * width={6}
   */
  width: number;
  /**
   * * Option to render Conditional Trigger input field on new row.
   * * @example
   * newRow
   */
  newRow?: boolean,
   /**
   * * Option to force set the default value for a Conditional Trigger (Select) input field.
   * * @example
   * placeholder="Activate Plan"
   */
  placeholder?: string;
  /**
   * * Option to disable edits for Conditional Trigger input field.
   * * @example
   * readOnly
   */ 
  readOnly?: boolean;
  /**
     * * Option to enable a hint for Conditional Trigger input field.
     * * @example
     * isHinted
     */ 
  isHinted?: boolean;
  /**
   * * Option to specify hint text for Conditional Trigger input field.
   * * @example
   * hintText="This is a hint for a VΣ Conditional Trigger"
   */ 
  hintText?: string;
  /**
   * * Option to specify a hint url reference or resource for Conditional Trigger input field.
   * * @example
   * hintUrl="https://www.mekaegwim.ca"
   */ 
  hintUrl?: string;
   /**
   * * Required  inputOptions{} for the Conditional Trigger input field.
   * * @example
   * inputOptions={
            [
              {optionid: 1, optionvalue: "Kaiju", optionurl:"https://github.com/emeraldemperaur", text: "Kaiju"},
              {optionid: 2, optionvalue: "MekaGodzilla", optionurl:"https://github.com/emeraldemperaur", text: "MekaGodzilla"},
              {optionid: 3, optionvalue: "Zaibatsu", optionurl:"https://github.com/emeraldemperaur", text: "Zaibatsu"},
              ]}
  */   
  inputOptions?: InputOption[]; 
   /**
   * * Option to specify the isRequired error text for the Conditional Trigger input field.
   * * @example
   * errorText="A VΣ category selection is required"
   */
  errorText?: ReactNode | string | null;
  /**
   * * Option to specify the .scss class selector for the Conditional Trigger input field.
   * * @example
   * className="teletraan-1-checkbox"
   */
  className?: string;
  /**
   * * Option to inject custom CSS the Conditional Trigger input field.
   * * @example
   * style={{ color: "#000000" }}
   */
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
  placeholder = '', inputLabel,
  inputtype = 'conditionaltoggle-outline',
  triggerValue = true,
  inputOptions = [],
  children, newRow, isHinted, hintText, hintUrl, errorText,
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
              defaultValue={placeholder || ""}
              onValueChange={handleChange}
            >
              <Select.Trigger 
                id={inputId}
                variant={isNeumorphic ? 'soft' : 'surface'} 
                style={{ width: '100%' }}
              />
              <Select.Content>
                {inputOptions.map((inputoption) => (
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
    <Column span={width} newLine={newRow}>
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
                {inputLabel}
            </Text>
            &nbsp;
            {isHinted ?
                  <>
                  <Tooltip content={hintText || "No hint available"} align="start" sideOffset={5} className="core-input-tooltip">
                      <a href={hintUrl || ""} target="_blank" rel="noopener noreferrer">
                      <Icon name="questionmarkcircled" height="16" width="16" style={{ cursor: 'pointer', color: 'gray' }} />
                      </a> 
                  </Tooltip>
                  </> : null} 
             {hasError ?
                  <>
                  <p id={errorId} className='core-input-label-error'>
                      {typeof meta.error === 'string' ? <>{errorText || "Required field"}</> 
                      : 'Invalid file selection'}
                  </p>
                  </> : null }       
        </div>

    </Box>
    </Column>
  );
};