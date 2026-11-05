import React, { useState, useRef, useEffect } from 'react';
import { Flex } from '@radix-ui/themes';
import { Icon } from "components/icons/icons";
import { useStepper } from '../codex/codex';
import { adjustColor, getNearestParentBackground } from "utils/vinci";
import '../../styles/main.scss';

export type ButtonAesthetic = 'outline' | 'material' | 'neumorphic';

/**
 * CodexControlsProps Interface
 * @description Configuration properties for `<CodexControls>`.
 * Coordinates wizard progression ("Back", "Continue", "Submit") using custom-styled
 * enterprise buttons supporting Material, Neumorphic and Outline aesthetics.
 */
export interface CodexControlsProps {
  /**
   * The `stepId` to navigate to when 'Continue' is clicked.
   * When omitted or undefined, the forward button mutates into the final 'Submit' action.
   * @example "billing-step"
   */
  nextStepId?: string;

  /**
   * The `stepId` to navigate to when 'Back' is clicked.
   * When omitted or undefined, the 'Back' button remains hidden.
   * @example "general-info-step"
   */
  prevStepId?: string;

  /**
   * Display label for the forward navigation button.
   * @default "Continue"
   */
  nextLabel?: string;

  /**
   * Icon name rendered beside `nextLabel`.
   * @default "doublearrowright"
   */
  nextIcon?: string;

  /**
   * Display label for the back navigation button.
   * @default "Back"
   */
  prevLabel?: string;

  /**
   * Icon name rendered beside `prevLabel`.
   * @default "doublearrowleft"
   */
  prevIcon?: string;

  /**
   * Display label for the terminal action button on the final step.
   * @default "Submit"
   */
  finishLabel?: string;

  /**
   * Icon name rendered beside `finishLabel`.
   * @default "paperplane"
   */
  finishIcon?: string;

  /**
   * Sets the terminal action button `type="submit"` to trigger Formik's onSubmit handler.
   * @default true
   */
  onSubmit?: boolean;

  /**
   * Callback fired immediately before navigating to the next step.
   */
  onNext?: () => void;

  /**
   * Callback fired immediately before navigating to the previous step.
   */
  onPrev?: () => void;

  /**
   * Callback fired when the terminal finish button is clicked (when `onSubmit={false}`).
   */
  onFinish?: () => void;

  /**
   * Disables both navigation buttons (e.g., during parent network requests).
   * @default false
   */
  disabled?: boolean;

  /**
   * Physical size scale for the navigation buttons.
   * @default "2"
   */
  size?: "1" | "2" | "3";

  /**
   * Optional custom SCSS class selector for the outer container.
   */
  className?: string;

  /**
   * Inline React CSS styles applied to the outer container.
   */
  style?: React.CSSProperties;
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
  onSubmit = true,
  onNext,
  onPrev,
  onFinish,
  disabled = false,
  size = "2",
  className,
  style,
}: CodexControlsProps) => {

  const { validateAndNavigate, setActiveStepId, brandColor, design, strictValidation } = useStepper();
  const [isValidating, setIsValidating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [neuVars, setNeuVars] = useState<React.CSSProperties>({});

  const resolvedDesign: ButtonAesthetic = (design || 'outline').replace('codex-', '') as ButtonAesthetic;
  const isFinalStep = !nextStepId;

  useEffect(() => {
    if (resolvedDesign === 'neumorphic' && containerRef.current) {
      const parentBg = getNearestParentBackground(containerRef.current.parentElement);
      const computedBg = parentBg && parentBg !== 'transparent' ? parentBg : '#ecf0f3';
      setNeuVars({
        '--neu-bg': computedBg,
        '--neu-shadow-dark': adjustColor(computedBg, -22),
        '--neu-shadow-light': adjustColor(computedBg, 22),
      } as React.CSSProperties);
    }
  }, [resolvedDesign]);

  const handlePrev = () => {
    if (disabled || isValidating) return;
    if (onPrev) onPrev();
    if (prevStepId) {
      setActiveStepId(prevStepId);
    }
  };

  const handleNext = async () => {
    if (disabled || isValidating) return;

    if (nextStepId) {
      if (strictValidation) {
        setIsValidating(true);
        const success = await validateAndNavigate(nextStepId);
        setIsValidating(false);
        if (success && onNext) {
          onNext();
        }
      } else {
        if (onNext) onNext();
        setActiveStepId(nextStepId);
      }
    } else {
      if (onFinish && !onSubmit) {
        onFinish();
      }
    }
  };

  const resolvedBrand = brandColor || 'var(--accent-9)';
  const primaryBg = isFinalStep && !brandColor ? 'var(--green-9)' : resolvedBrand;

  return (
    <div
      ref={containerRef}
      className={`vs-codex-controls-wrapper ${className || ''}`}
      style={{
        width: '100%',
        fontFamily: "'Libre Franklin', sans-serif",
        marginTop: 'auto', 
        ...neuVars,
        ...style,
      }}
    >
      <style>
        {`
          .vs-btn {
            font-family: inherit;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            user-select: none;
            white-space: nowrap;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            outline: none;
            border: none;
            text-decoration: none;
            box-sizing: border-box;
            gap: 8px;
          }

          /* Size Scaling */
          .vs-btn-size-1 {
            height: 32px;
            padding: 0 14px;
            font-size: 0.8125rem;
            letter-spacing: -0.01em;
          }
          .vs-btn-size-2 {
            height: 40px;
            padding: 0 18px;
            font-size: 0.875rem;
            letter-spacing: -0.01em;
          }
          .vs-btn-size-3 {
            height: 46px;
            padding: 0 24px;
            font-size: 0.9375rem;
            letter-spacing: 0em;
          }

          .vs-btn:disabled, .vs-btn.vs-disabled {
            opacity: 0.55;
            cursor: not-allowed !important;
            transform: none !important;
            box-shadow: none !important;
          }

          .vs-btn-outline-secondary {
            background-color: transparent;
            border: 1.5px solid var(--gray-7);
            color: var(--gray-11);
          }
          .vs-btn-outline-secondary:hover:not(:disabled) {
            border-color: var(--gray-9);
            color: var(--gray-12);
            background-color: var(--gray-a2);
          }
          .vs-btn-outline-secondary:active:not(:disabled) {
            transform: scale(0.98);
          }

          .vs-btn-outline-primary {
            background-color: ${primaryBg};
            border: 1.5px solid ${primaryBg};
            color: #ffffff;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          .vs-btn-outline-primary:hover:not(:disabled) {
            opacity: 0.92;
            box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          }
          .vs-btn-outline-primary:active:not(:disabled) {
            transform: scale(0.98);
          }

          .vs-btn-material-secondary {
            background-color: var(--color-surface);
            border: 1px solid var(--gray-5);
            color: var(--gray-11);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
          }
          .vs-btn-material-secondary:hover:not(:disabled) {
            background-color: var(--color-surface);
            color: var(--gray-12);
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.09);
            transform: translateY(-1px);
          }
          .vs-btn-material-secondary:active:not(:disabled) {
            transform: translateY(0) scale(0.98);
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }

          .vs-btn-material-primary {
            background-color: ${primaryBg};
            color: #ffffff;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08);
          }
          .vs-btn-material-primary:hover:not(:disabled) {
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18), 0 6px 20px rgba(0, 0, 0, 0.12);
            transform: translateY(-1px);
          }
          .vs-btn-material-primary:active:not(:disabled) {
            transform: translateY(0) scale(0.98);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
          }

          .vs-btn-neumorphic-secondary {
            background-color: var(--neu-bg);
            color: var(--gray-11);
            border: none;
            border-radius: 12px;
            box-shadow: 4px 4px 8px var(--neu-shadow-dark), -4px -4px 8px var(--neu-shadow-light);
          }
          .vs-btn-neumorphic-secondary:hover:not(:disabled) {
            color: var(--gray-12);
            box-shadow: 5px 5px 10px var(--neu-shadow-dark), -5px -5px 10px var(--neu-shadow-light);
          }
          .vs-btn-neumorphic-secondary:active:not(:disabled) {
            box-shadow: inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light);
            transform: scale(0.98);
          }

          .vs-btn-neumorphic-primary {
            background-color: ${primaryBg};
            color: #ffffff;
            border: none;
            border-radius: 12px;
            box-shadow: 4px 4px 10px var(--neu-shadow-dark), -4px -4px 10px var(--neu-shadow-light);
          }
          .vs-btn-neumorphic-primary:hover:not(:disabled) {
            box-shadow: 5px 5px 14px var(--neu-shadow-dark), -5px -5px 14px var(--neu-shadow-light);
          }
          .vs-btn-neumorphic-primary:active:not(:disabled) {
            box-shadow: inset 2px 2px 6px rgba(0,0,0,0.35);
            transform: scale(0.98);
          }

          /* Spinner */
          @keyframes vsSpin {
            to { transform: rotate(360deg); }
          }
          .vs-btn-spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.35);
            border-radius: 50%;
            border-top-color: #ffffff;
            animation: vsSpin 0.6s linear infinite;
          }
        `}
      </style>

      <Flex
        gap="3"
        justify="between"
        align="center"
        style={{
          borderTop: '1px solid var(--gray-5)',
          paddingTop: '20px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {prevStepId ? (
          <button
            type="button"
            onClick={handlePrev}
            disabled={disabled || isValidating}
            className={`vs-btn vs-btn-size-${size} vs-btn-${resolvedDesign}-secondary`}
          >
            {prevIcon && <Icon name={prevIcon} height="15" width="15" />}
            <span>{prevLabel}</span>
          </button>
        ) : (
          <div aria-hidden="true" />
        )}

        <button
          type={isFinalStep && onSubmit ? "submit" : "button"}
          onClick={isFinalStep && onSubmit ? undefined : handleNext}
          disabled={disabled || isValidating}
          className={`vs-btn vs-btn-size-${size} vs-btn-${resolvedDesign}-primary ${disabled || isValidating ? 'vs-disabled' : ''}`}
        >
          {isValidating && <div className="vs-btn-spinner" aria-hidden="true" />}

          {!isFinalStep ? (
            <>
              <span>{nextLabel}</span>
              {nextIcon && !isValidating && <Icon name={nextIcon} height="15" width="15" />}
            </>
          ) : (
            <>
              <span>{finishLabel}</span>
              {finishIcon && !isValidating && <Icon name={finishIcon} height="15" width="15" />}
            </>
          )}
        </button>
      </Flex>
    </div>
  );
};