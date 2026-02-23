import React from 'react';
import { Button, Flex } from '@radix-ui/themes';
import { Icon } from "components/icons/icons";
import { useStepper } from './codex';
import '../../styles/main.scss';

export interface CodexControlsProps {
    /**
     * * The ID of the step to navigate to when 'Next' is clicked.
     * If omitted, the primary button becomes a 'Finish' button.
     * * @example
     * nextStepId="step-3"
     */
    nextStepId?: string;
    /**
     * * The ID of the step to navigate to when 'Back' is clicked.
     * If omitted, the 'Back' button is hidden.
     * * @example
     * prevStepId="step-1"
     */
    prevStepId?: string;
    /**
     * * Custom text for the Next button.
     * Default: "Continue"
     */
    nextLabel?: string;
     /**
     * * Custom icon for the Next button.
     * Default: "doublearrowright"
     */
    nextIcon?: string;
    /**
     * * Custom text for the Previous button.
     * Default: "Back"
     */
    prevLabel?: string;
    /**
     * * Custom icon name for the Previous button.
     * Default: "doublearrowleft"
     */
    prevIcon?: string;
    /**
     * * Custom text for the Finish button (rendered when nextStepId undefined).
     * Default: "Submit"
     */
    finishLabel?: string;
    /**
     * * Custom icon name for the Finish button (rendered when no nextStepId undefined).
     * Default: "paperplane"
     */
    finishIcon?: string;
     /**
     * * Option to enable `onFinish` control button as `submit` button type.
     * Default: true
     */
    onSubmit?: boolean;
    /**
     * * Optional callback triggered before navigating to the next step.
     * Useful for triggering form validation.
     */
    onNext?: () => void;
    /**
     * * Optional callback triggered before navigating to the previous step.
     */
    onPrev?: () => void;
    /**
     * * Optional callback triggered when the Finish button is clicked.
     */
    onFinish?: () => void;
}

export const CodexControls = ({
    nextStepId,
    prevStepId,
    nextLabel = "Continue",
    prevLabel = "Back",
    finishLabel = "Submit",
    prevIcon = "doublearrowleft",
    nextIcon = "doublearrowright",
    finishIcon = "paperplane",
    onSubmit = false,
    onNext,
    onPrev,
    onFinish
}: CodexControlsProps) => {
    
    const { setActiveStepId, brandColor } = useStepper();

    const handlePrev = () => {
        if (onPrev) onPrev();
        if (prevStepId) setActiveStepId(prevStepId);
    };

    const handleNext = () => {
        if (nextStepId) {
            if (onNext) onNext();
            setActiveStepId(nextStepId);
        } else {
            if (onFinish) onFinish();
        }
    };

    return (
        <Flex 
            gap="3" 
            mt="6" 
            justify="between" 
            align="center"
            style={{ borderTop: '1px solid var(--gray-5)', paddingTop: '20px', width: '100%' }}
        >
            {prevStepId ? (
                <Button variant="soft" color="gray" onClick={handlePrev} style={{ cursor: 'pointer' }}>
                    {prevIcon && (
                        <>
                            <Icon name={prevIcon}/>&nbsp;
                        </>
                    )}
                    {prevLabel}
                </Button>
            ) : (
                <div /> 
            )}

            <Button 
                variant="solid" 
                color={brandColor ? undefined : (nextStepId ? "blue" : "green")} 
                onClick={handleNext}
                style={{ 
                    cursor: 'pointer',
                    ...(brandColor ? { backgroundColor: 'var(--codex-brand)', color: '#fff' } : {}) 
                }}
                type={onSubmit && !nextStepId ? "submit" : "button"}
            >
                {nextStepId ? (
                    <>
                        {nextIcon && <><Icon name={nextIcon}/>&nbsp;</>}
                        {nextLabel}
                    </>
                ) : (
                    <>
                        {finishIcon && <><Icon name={finishIcon}/>&nbsp;</>}
                        {finishLabel}
                    </>
                )}
            </Button>
        </Flex>
    );
};