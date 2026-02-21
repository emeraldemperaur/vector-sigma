import React, { ReactNode, useEffect, useRef, useState, createContext, useContext } from 'react';
import { Flex, Text, Box } from '@radix-ui/themes';
import { Column } from "layouts/column/column"; 
import { Icon } from "components/icons/icons";
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import '../../styles/main.scss';

export type CodexDesign = 'material' | 'outline' | 'neumorphic';

interface CodexContextProps {
    activeStepId: string;
    setActiveStepId: (id: string) => void;
    design: CodexDesign;
}

const CodexContext = createContext<CodexContextProps>({ 
    activeStepId: '', 
    setActiveStepId: () => {}, 
    design: 'outline' 
});

export const useStepper = () => useContext(CodexContext);

export interface CodexProps {
    /**
     * * The design variation of the Codex component. 
     * Default: 'outline' 
     * Variants: 'outline', 'material', 'neumorphic'.
     * * @example
     * design="neumorphic"
     */
    design?: CodexDesign;
    /**
     * * The sectionId of the step that should be active on render. 
     * Defaults to the first child step when undefined.
     * * @example
     * defaultStepId="billing-info"
     */
    defaultStepId?: string;
    /**
     * * The required viewport column width for the Codex component.
     * i.e. 1 - 12
     * * @example
     * width={12}
     */
    width?: number;
    /**
     * * Option to render Codex component on a new row.
     * * @example
     * newRow
     */
    newRow?: boolean;
    /**
     * * Option to specify the .scss class selector for the Codex component.
     * * @example
     * className="teletraan-1-codex"
     */
    className?: string;
    /**
     * * Option to inject custom CSS to the Stepper wrapper.
     * * @example
     * style={{ margin: "20px 0" }}
     */
    style?: React.CSSProperties;
    /**
     * * The CodexItem child components.
     */
    children: ReactNode;
}

export interface CodexItemProps {
    /**
     * * The unique identifier for the step item.
     * * @example
     * stepId="step-1"
     */
    stepId: string;
    /**
     * * The display title for the step header.
     * * @example
     * title="Account Setup"
     */
    title: string;
    /**
     * * An optional subtitle description displayed below the title.
     * * @example
     * description="Enter your details"
     */
    subtitleDescription?: string;
    /**
     * * The content revealed when this step is active.
     */
    children: ReactNode;
    /**
     * * Option to provide a custom icon for the step circle.
     * * @example
     * icon={<Icon name="user" />}
     */
    icon?: ReactNode;
}

export const Codex = ({
    design = 'outline',
    defaultStepId,
    width = 12,
    newRow,
    className,
    style,
    children
}: CodexProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

    const steps = React.Children.toArray(children)
        .filter((child): child is React.ReactElement<CodexItemProps> => React.isValidElement(child))
        .map((child) => ({
            id: child.props.stepId,
            title: child.props.title,
            description: child.props.subtitleDescription,
            icon: child.props.icon
        }));

    const [activeStepId, setActiveStepId] = useState<string>('');

    useEffect(() => {
        if (steps.length > 0 && !activeStepId) {
            const initialId = defaultStepId && steps.some(s => s.id === defaultStepId) 
                ? defaultStepId 
                : steps[0].id;
            setActiveStepId(initialId);
        }
    }, [defaultStepId, steps, activeStepId]);

    useEffect(() => {
        if (design === 'neumorphic' && containerRef.current) {
            const parentBg = getNearestParentBackground(containerRef.current.parentElement);
            setNeuVars({
                '--neu-bg': parentBg,
                '--neu-shadow-dark': adjustColor(parentBg, -20), 
                '--neu-shadow-light': adjustColor(parentBg, 20),
            } as React.CSSProperties);
        }
    }, [design]);

    const activeIndex = steps.findIndex(s => s.id === activeStepId);

    return (
        <CodexContext.Provider value={{ activeStepId, setActiveStepId, design }}>
            <Column span={width} newLine={newRow}>
                <div ref={containerRef} className={className} style={{ width: '100%', ...style, ...neuVars }}>
                    
                    <style dangerouslySetInnerHTML={{__html: `
                        .v-step-circle {
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-weight: bold;
                            transition: all 0.3s ease;
                            z-index: 2;
                            position: relative;
                            cursor: pointer;
                        }
                        .v-step-line {
                            flex: 1;
                            height: 2px;
                            transition: background-color 0.3s ease;
                        }
                        .v-step-content-animation {
                            animation: fadeIn 0.4s ease-in-out;
                        }
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }

                        .v-stepper-outline .v-step-circle.pending {
                            border: 2px solid var(--gray-6);
                            background: transparent;
                            color: var(--gray-10);
                        }
                        .v-stepper-outline .v-step-circle.active {
                            border: 2px solid var(--accent-9);
                            background: var(--accent-2);
                            color: var(--accent-9);
                        }
                        .v-stepper-outline .v-step-circle.completed {
                            border: 2px solid var(--accent-9);
                            background: var(--accent-9);
                            color: white;
                        }
                        .v-stepper-outline .v-step-line.pending { background-color: var(--gray-5); }
                        .v-stepper-outline .v-step-line.completed { background-color: var(--accent-9); }

                        .v-stepper-material .v-step-circle.pending {
                            background: var(--color-surface);
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                            color: var(--gray-10);
                        }
                        .v-stepper-material .v-step-circle.active {
                            background: var(--accent-9);
                            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                            color: white;
                            transform: scale(1.1);
                        }
                        .v-stepper-material .v-step-circle.completed {
                            background: var(--accent-9);
                            color: white;
                        }
                        .v-stepper-material .v-step-line.pending { background-color: var(--gray-5); }
                        .v-stepper-material .v-step-line.completed { background-color: var(--accent-9); }

                        .v-stepper-neumorphic .v-step-circle {
                            background: var(--neu-bg);
                            border: none;
                        }
                        .v-stepper-neumorphic .v-step-circle.pending {
                            box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
                            color: var(--gray-10);
                        }
                        .v-stepper-neumorphic .v-step-circle.active {
                            box-shadow: inset 4px 4px 8px var(--neu-shadow-dark), inset -4px -4px 8px var(--neu-shadow-light);
                            color: var(--accent-9);
                        }
                        .v-stepper-neumorphic .v-step-circle.completed {
                            box-shadow: inset 2px 2px 4px var(--neu-shadow-dark), inset -2px -2px 4px var(--neu-shadow-light);
                            color: var(--accent-9);
                        }
                        .v-stepper-neumorphic .v-step-line.pending {
                            background-color: transparent;
                            box-shadow: inset 1px 1px 2px var(--neu-shadow-dark), inset -1px -1px 2px var(--neu-shadow-light);
                        }
                        .v-stepper-neumorphic .v-step-line.completed {
                            background-color: var(--accent-9);
                            box-shadow: 0 0 4px var(--accent-9);
                        }
                    `}} />

                    <Box className={`v-stepper-${design}`} style={{ paddingBottom: '60px', paddingTop: '10px' }}>
                        <Flex align="center" width="100%">
                            {steps.map((step, index) => {
                                const isCompleted = index < activeIndex;
                                const isActive = index === activeIndex;
                                const statusClass = isActive ? 'active' : isCompleted ? 'completed' : 'pending';

                                return (
                                    <React.Fragment key={step.id}>
                                        
                                        <Box style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <div 
                                                className={`v-step-circle ${statusClass}`}
                                                onClick={() => setActiveStepId(step.id)}
                                            >
                                                {isCompleted ? (
                                                    <Icon name="check" width="20" height="20" />
                                                ) : (
                                                    step.icon ? step.icon : <span>{index + 1}</span>
                                                )}
                                            </div>

                                            <Box 
                                                style={{ 
                                                    position: 'absolute', 
                                                    top: '100%', 
                                                    marginTop: '12px', 
                                                    width: '120px', 
                                                    textAlign: 'center',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => setActiveStepId(step.id)}
                                            >
                                                <Text size="2" weight={isActive ? "bold" : "regular"} style={{ color: isActive ? 'var(--gray-12)' : 'var(--gray-10)', display: 'block', lineHeight: 1.2 }}>
                                                    {step.title}
                                                </Text>
                                                {step.description && (
                                                    <Text size="1" color="gray" style={{ display: 'block', marginTop: '4px' }}>
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
                    </Box>

                    <Box style={{ position: 'relative' }}>
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
        <div className="v-step-content-animation" style={{ width: '100%' }}>
            {children}
        </div>
    );
};