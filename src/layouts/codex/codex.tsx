import React, { ReactNode, useEffect, useRef, useState, createContext, useContext } from 'react';
import { Flex, Text, Box, Badge } from '@radix-ui/themes';
import { FormikContext, FormikContextType, getIn } from 'formik';
import { Column } from "layouts/column/column"; 
import { Icon } from "components/icons/icons";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import '../../styles/main.scss';

export type CodexDesign = 
  | 'material' 
  | 'outline' 
  | 'neumorphic'
  | 'codex-material'
  | 'codex-outline'
  | 'codex-neumorphic';

export interface StepMeta {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}

export interface CodexContextProps {
  /** The currently active step ID */
  activeStepId: string;
  /** Direct step setter (bypasses strictValidation) */
  setActiveStepId: (id: string) => void;
  /** Validates the current step before navigating to the target step */
  validateAndNavigate: (targetStepId: string) => Promise<boolean>;
  /** The design aesthetic applied across the stepper */
  design: CodexDesign;
  /** Brand color token */
  brandColor?: string;
  /** Whether strict step-level validation is active */
  strictValidation?: boolean;
  /** Ordered list of step metadata */
  steps: StepMeta[];
  /** Index of active step */
  activeIndex: number;
  /** Total number of steps */
  totalSteps: number;
  /** Whether current step is the final step */
  isLastStep: boolean;
  /** Whether current step is the initial step */
  isFirstStep: boolean;
}

const CodexContext = createContext<CodexContextProps>({ 
  activeStepId: '', 
  setActiveStepId: () => {}, 
  validateAndNavigate: async () => true,
  design: 'outline',
  steps: [],
  activeIndex: 0,
  totalSteps: 0,
  isLastStep: false,
  isFirstStep: true,
});

export const useStepper = () => useContext(CodexContext);

/**
 * CodexProps Interface
 * @description Configuration properties for the VectorSigma Codex multi-step form wizard.
 * Coordinates section-by-section workflow progression, responsive progress indicators,
 * enterprise aesthetics (Outline, Material, n8n Neumorphic), and Formik step validation.
 */
export interface CodexProps {
  /**
   * The aesthetic design variation of the Codex component.
   * - `outline` / `codex-outline`: Minimalist hairline rules with accent indicator (Default).
   * - `material` / `codex-material`: Elevated circular chips with soft halos.
   * - `neumorphic` / `codex-neumorphic`: Soft-UI extruded and inset pill nodes.
   * @default "outline"
   */
  design?: CodexDesign;

  /**
   * Alternative prop name matching standard VectorSigma prop conventions.
   */
  variant?: CodexDesign;

  /**
   * The `stepId` of the step that should be active on initial mount.
   * Defaults to the first child step when undefined.
   * @example "personal-info"
   */
  defaultStepId?: string;

  /**
   * Custom brand color used for active/completed step lines, circles, and navigation elements.
   * @default "var(--accent-9)"
   * @example "#800020"
   */
  brandColor?: string;

  /**
   * Enables section-by-section validation before allowing users to advance forward.
   * Inspects inputs mounted in the active step's DOM, executes Formik validation,
   * touches only the current section fields, and focuses the first invalid element if errors exist.
   * @default false
   */
  strictValidation?: boolean;

  /**
   * Optional custom validation hook executed during step transitions.
   * Return `false` to block forward navigation.
   * @example async (currentId, nextId) => { return await verifyStepApi(currentId); }
   */
  onValidateStep?: (currentStepId: string, nextStepId: string) => boolean | Promise<boolean>;

  /**
   * Optional callback fired when the active step changes.
   */
  onStepChange?: (stepId: string, stepIndex: number) => void;

  /**
   * Viewport column width span (1 - 12 based on the parent grid).
   * Automatically stacks to full-width on mobile screens.
   * @default 12
   */
  width?: number;

  /**
   * Forces the component to break into a new row within the form layout.
   * @default false
   */
  newRow?: boolean;

  /**
   * Centralized color and typography overrides.
   */
  typography?: {
    /** Overrides container background */
    background?: string;
    /** Overrides border stroke and connecting line color */
    stroke?: string;
    /** Overrides primary headline text color */
    textColor?: string;
    /** Overrides accent and active step indicator color */
    accent?: string;
  };

  /**
   * Optional custom SCSS class selector for external targeted styling overrides.
   */
  className?: string;

  /**
   * Inline React CSS properties applied to the outermost wrapper.
   */
  style?: React.CSSProperties;

  /**
   * Optional explicit Formik context. Required only when operating outside standard React context.
   */
  formikContext?: FormikContextType<any>;

  /**
   * Collection of `<CodexItem>` child components.
   */
  children: ReactNode;
}

/**
 * CodexItemProps Interface
 * @description Configuration properties for an individual step panel inside `<Codex>`.
 */
export interface CodexItemProps {
  /**
   * Unique structural identifier for this step.
   * @example "account-details"
   */
  stepId: string;

  /**
   * Primary title or heading for this step displayed on the stepper bar.
   * @example "Account Credentials"
   */
  title: string;

  /**
   * Optional subtitle or secondary descriptor for this step.
   * @example "Configure authentication and single sign-on"
   */
  subtitleDescription?: string;

  /**
   * Optional custom icon rendered inside the step circle (defaults to numeric index).
   */
  icon?: ReactNode;

  /**
   * Step contents (form fields, layout primitives, and `<CodexControls>`).
   */
  children: ReactNode;
}

export const Codex = ({
  design = 'outline',
  variant,
  defaultStepId,
  brandColor,
  strictValidation = false,
  onValidateStep,
  onStepChange,
  width = 12,
  newRow,
  typography,
  className,
  style,
  formikContext: propFormikContext,
  children
}: CodexProps) => {

  const containerRef = useRef<HTMLDivElement>(null);
  const activeContentRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  const inheritedFormikContext = useContext(FormikContext as React.Context<FormikContextType<any> | undefined>);
  const activeFormik = propFormikContext || inheritedFormikContext;

  const resolvedDesign = (variant || design || 'outline').replace('codex-', '') as 'material' | 'outline' | 'neumorphic';

  const steps: StepMeta[] = React.Children.toArray(children)
    .filter((child): child is React.ReactElement<CodexItemProps> => React.isValidElement(child))
    .map((child) => ({
      id: child.props.stepId,
      title: child.props.title,
      description: child.props.subtitleDescription,
      icon: child.props.icon
    }));

  const [activeStepId, setActiveStepIdState] = useState<string>(() => {
    if (defaultStepId && steps.some(s => s.id === defaultStepId)) {
      return defaultStepId;
    }
    return steps.length > 0 ? steps[0].id : '';
  });

  const activeIndex = steps.findIndex(s => s.id === activeStepId);
  const totalSteps = steps.length;
  const isFirstStep = activeIndex <= 0;
  const isLastStep = activeIndex >= totalSteps - 1;

  useEffect(() => {
    if (steps.length > 0 && !activeStepId) {
      const initialId = defaultStepId && steps.some(s => s.id === defaultStepId) 
        ? defaultStepId 
        : steps[0].id;
      setActiveStepIdState(initialId);
    }
  }, [defaultStepId, steps, activeStepId]);

  useEffect(() => {
    if (resolvedDesign === 'neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = typography?.background || brandColor || (parentBg && parentBg !== 'transparent' ? parentBg : '#ecf0f3');
      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -20),
        '--neu-shadow-light': adjustColor(computedBg, 20),
      } as React.CSSProperties);
    }
  }, [resolvedDesign, typography?.background, brandColor]);

  const typographyVars = {
    '--vs-cdx-bg': typography?.background || 'var(--color-surface)',
    '--vs-cdx-stroke': typography?.stroke || 'var(--gray-6)',
    '--vs-cdx-text': typography?.textColor || 'var(--gray-12)',
    '--vs-cdx-brand': typography?.accent || brandColor || 'var(--accent-9)',
  } as React.CSSProperties;

  const setActiveStepId = (id: string) => {
    setActiveStepIdState(id);
    if (onStepChange) {
      const idx = steps.findIndex(s => s.id === id);
      onStepChange(id, idx);
    }
  };

  /**
   * Validates only the fields mounted in the current step before advancing forward.
   */
  const validateAndNavigate = async (targetStepId: string): Promise<boolean> => {
    const targetIndex = steps.findIndex(s => s.id === targetStepId);

    if (targetIndex <= activeIndex) {
      setActiveStepId(targetStepId);
      return true;
    }

    if (strictValidation) {
      if (onValidateStep) {
        const customValid = await onValidateStep(activeStepId, targetStepId);
        if (!customValid) return false;
      }

      if (activeFormik && activeContentRef.current) {
        const namedElements = activeContentRef.current.querySelectorAll<HTMLElement>('[name]');
        const currentStepFieldNames = Array.from(
          new Set(
            Array.from(namedElements)
              .map(el => el.getAttribute('name'))
              .filter(Boolean) as string[]
          )
        );

        const currentErrors = await activeFormik.validateForm();

        for (const fieldName of currentStepFieldNames) {
          await activeFormik.setFieldTouched(fieldName, true, false);
        }

        const hasStepErrors = currentStepFieldNames.some(fieldName => {
          const fieldError = getIn(currentErrors, fieldName);
          return Boolean(fieldError);
        });

        if (hasStepErrors) {
          const firstInvalidName = currentStepFieldNames.find(fieldName => Boolean(getIn(currentErrors, fieldName)));
          if (firstInvalidName) {
            const invalidEl = activeContentRef.current.querySelector<HTMLElement>(`[name="${firstInvalidName}"]`);
            if (invalidEl) {
              invalidEl.focus?.();
              invalidEl.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
            }
          }
          return false;
        }
      }
    }

    setActiveStepId(targetStepId);
    return true;
  };

  const currentStep = steps[activeIndex] || steps[0];

  return (
    <CodexContext.Provider value={{ 
      activeStepId, 
      setActiveStepId, 
      validateAndNavigate,
      design: resolvedDesign, 
      brandColor, 
      strictValidation,
      steps,
      activeIndex,
      totalSteps,
      isLastStep,
      isFirstStep
    }}>
      <Column span={width} newLine={newRow}>
        <div
          ref={containerRef}
          className={`vs-codex-root ${className || ''}`}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: "'Libre Franklin', sans-serif",
            ...typographyVars,
            ...neuVars,
            ...style,
          }}
        >
          <style>
            {`
              .vs-codex-root {
                width: 100%;
                box-sizing: border-box;
                font-family: inherit;
              }

              /* Base Step Circle Node */
              .v-step-circle {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                font-size: 0.875rem;
                transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                z-index: 2;
                position: relative;
                cursor: pointer;
                user-select: none;
                flex-shrink: 0;
              }

              .v-step-line {
                flex: 1;
                height: 2px;
                transition: background-color 0.25s ease;
                min-width: 24px;
              }

              .v-step-content-animation {
                animation: vsCodexFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              }
              @keyframes vsCodexFadeIn {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
              }

              
              .v-stepper-outline .v-step-circle.pending {
                border: 1.5px solid var(--vs-cdx-stroke);
                background: transparent;
                color: var(--gray-10);
              }
              .v-stepper-outline .v-step-circle.pending:hover {
                border-color: var(--gray-8);
                color: var(--gray-12);
              }
              .v-stepper-outline .v-step-circle.active {
                border: 2px solid var(--vs-cdx-brand);
                background: var(--accent-a2);
                color: var(--vs-cdx-brand);
                box-shadow: 0 0 0 3px var(--accent-a3);
              }
              .v-stepper-outline .v-step-circle.completed {
                border: 2px solid var(--vs-cdx-brand);
                background: var(--vs-cdx-brand);
                color: #ffffff;
              }
              .v-stepper-outline .v-step-line.pending { background-color: var(--vs-cdx-stroke); }
              .v-stepper-outline .v-step-line.completed { background-color: var(--vs-cdx-brand); }

        
              .v-stepper-material .v-step-circle.pending {
                background: var(--color-surface);
                border: 1px solid var(--vs-cdx-stroke);
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
                color: var(--gray-10);
              }
              .v-stepper-material .v-step-circle.pending:hover {
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                color: var(--gray-12);
              }
              .v-stepper-material .v-step-circle.active {
                background: var(--vs-cdx-brand);
                border: 1px solid transparent;
                box-shadow: 0 4px 12px var(--accent-a5), 0 0 0 4px var(--accent-a3);
                color: #ffffff;
                transform: scale(1.06);
              }
              .v-stepper-material .v-step-circle.completed {
                background: var(--vs-cdx-brand);
                border: 1px solid transparent;
                box-shadow: 0 2px 5px rgba(0,0,0,0.12);
                color: #ffffff;
              }
              .v-stepper-material .v-step-line.pending { background-color: var(--gray-4); }
              .v-stepper-material .v-step-line.completed { background-color: var(--vs-cdx-brand); }

              .v-stepper-neumorphic .v-step-circle {
                background: var(--neu-bg);
                border: none;
              }
              .v-stepper-neumorphic .v-step-circle.pending {
                box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
                color: var(--gray-10);
              }
              .v-stepper-neumorphic .v-step-circle.active {
                box-shadow: inset 3px 3px 6px var(--neu-shadow-dark), inset -3px -3px 6px var(--neu-shadow-light);
                color: var(--vs-cdx-brand);
              }
              .v-stepper-neumorphic .v-step-circle.completed {
                box-shadow: inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light);
                color: var(--vs-cdx-brand);
              }
              .v-stepper-neumorphic .v-step-line.pending {
                background-color: transparent;
                box-shadow: inset 1px 1px 2px var(--neu-shadow-dark), inset -1px -1px 2px var(--neu-shadow-light);
              }
              .v-stepper-neumorphic .v-step-line.completed {
                background-color: var(--vs-cdx-brand);
                box-shadow: 0 0 4px var(--vs-cdx-brand);
              }
            `}
          </style>

          <Box className={`v-stepper-${resolvedDesign}`} style={{ paddingTop: '8px', paddingBottom: '16px', flexShrink: 0 }}>
            <Flex align="center" width="100%">
              {steps.map((step, index) => {
                const isCompleted = index < activeIndex;
                const isActive = index === activeIndex;
                const statusClass = isActive ? 'active' : isCompleted ? 'completed' : 'pending';
                const isFirst = index === 0;
                const isLast = index === steps.length - 1;

                return (
                  <React.Fragment key={step.id}>
                    <Box style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div 
                        className={`v-step-circle ${statusClass}`}
                        onClick={() => validateAndNavigate(step.id)}
                        role="button"
                        tabIndex={0}
                        aria-current={isActive ? 'step' : undefined}
                        aria-label={`Step ${index + 1}: ${step.title}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            validateAndNavigate(step.id);
                          }
                        }}
                      >
                        {isCompleted ? (
                          <Icon name="check" width="18" height="18" />
                        ) : (
                          step.icon ? step.icon : <span>{index + 1}</span>
                        )}
                      </div>

                      <Box 
                        display={{ initial: 'none', sm: 'block' }}
                        style={{ 
                          position: 'absolute', 
                          top: '100%', 
                          marginTop: '10px', 
                          width: '130px', 
                          cursor: 'pointer',
                          left: isFirst ? '0' : isLast ? 'auto' : '50%',
                          right: isLast ? '0' : 'auto',
                          transform: (!isFirst && !isLast) ? 'translateX(-50%)' : 'none',
                          textAlign: isFirst ? 'left' : isLast ? 'right' : 'center',
                        }}
                        onClick={() => validateAndNavigate(step.id)}
                      >
                        <Text 
                          size="2" 
                          weight={isActive ? "bold" : "regular"} 
                          style={{ 
                            color: isActive ? 'var(--gray-12)' : 'var(--gray-10)', 
                            display: 'block', 
                            lineHeight: 1.25,
                            wordBreak: 'break-word'
                          }}
                        >
                          {step.title}
                        </Text>
                        {step.description && (
                          <Text 
                            size="1" 
                            style={{ 
                              color: 'var(--gray-9)', 
                              display: 'block', 
                              marginTop: '2px',
                              lineHeight: 1.25,
                              wordBreak: 'break-word'
                            }}
                          >
                            {step.description}
                          </Text>
                        )}
                      </Box>
                    </Box>

                    {index < steps.length - 1 && (
                      <div className={`v-step-line ${isCompleted ? 'completed' : 'pending'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </Flex>

            {currentStep && (
              <Box display={{ initial: 'block', sm: 'none' }} style={{ marginTop: '16px', padding: '0 2px' }}>
                <Flex align="center" justify="between" gap="2">
                  <Text size="2" weight="bold" style={{ color: 'var(--gray-12)' }}>
                    {currentStep.title}
                  </Text>
                  <Badge variant="surface" color="gray" size="1">
                    {activeIndex + 1} of {totalSteps}
                  </Badge>
                </Flex>
                {currentStep.description && (
                  <Text size="1" color="gray" style={{ display: 'block', marginTop: '2px' }}>
                    {currentStep.description}
                  </Text>
                )}
              </Box>
            )}
          </Box>

          <Box 
            ref={activeContentRef}
            style={{ 
              position: 'relative', 
              marginTop: '20px', 
              marginBottom: '20px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1
            }}
          >
            {children}
          </Box>
        </div>
      </Column>
    </CodexContext.Provider>
  );
};

export const CodexItem = ({
  stepId,
  children,
}: CodexItemProps) => {
  const { activeStepId } = useContext(CodexContext);

  if (activeStepId !== stepId) return null;

  return (
    <div className="v-step-content-animation" style={{ width: '100%', minWidth: 0, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      {children}
    </div>
  );
};