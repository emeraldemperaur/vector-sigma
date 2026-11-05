import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { Codex, CodexItem } from '../../layouts/codex/codex';
import { CodexControls } from '../../layouts/codex/codexcontrols';

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

jest.mock('../../utils/vinci', () => ({
  getNearestParentBackground: jest.fn(() => '#ffffff'),
  adjustColor: jest.fn(() => '#dddddd'),
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<Theme>{ui}</Theme>);
};

describe('VΣ Layouts(Codex) Test', () => {

  it('Codex :: Rendered all step titles and defaulted to first step', () => {
    renderWithTheme(
      <Codex width={12}>
        <CodexItem stepId="step-1" title="Account Setup" subtitleDescription="Basic info">
          <div data-testid="content-1">Step 1 Content</div>
        </CodexItem>
        <CodexItem stepId="step-2" title="Payment Details">
          <div data-testid="content-2">Step 2 Content</div>
        </CodexItem>
      </Codex>
    );

    expect(screen.getAllByText('Account Setup')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Basic info')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Payment Details')[0]).toBeInTheDocument();
    expect(screen.getByTestId('content-1')).toBeInTheDocument();
    expect(screen.queryByTestId('content-2')).not.toBeInTheDocument();
  });

  it('Codex :: Displayed defaultStepId codex page on initial render', () => {
    renderWithTheme(
      <Codex width={12} defaultStepId="step-2">
        <CodexItem stepId="step-1" title="Account Setup">
          <div data-testid="content-1">Step 1 Content</div>
        </CodexItem>
        <CodexItem stepId="step-2" title="Payment Details">
          <div data-testid="content-2">Step 2 Content</div>
        </CodexItem>
      </Codex>
    );

    expect(screen.queryByTestId('content-1')).not.toBeInTheDocument();
    expect(screen.getByTestId('content-2')).toBeInTheDocument();
  });

  it('Codex :: Changed the active step when a step header is clicked', async () => {
    renderWithTheme(
      <Codex width={12}>
        <CodexItem stepId="step-1" title="Account Setup">
          <div data-testid="content-1">Step 1 Content</div>
        </CodexItem>
        <CodexItem stepId="step-2" title="Payment Details">
          <div data-testid="content-2">Step 2 Content</div>
        </CodexItem>
      </Codex>
    );

    expect(screen.getByTestId('content-1')).toBeInTheDocument();
    expect(screen.queryByTestId('content-2')).not.toBeInTheDocument();
    
    const step2Header = screen.getAllByText('Payment Details')[0];
    fireEvent.click(step2Header);

    await waitFor(() => {
        expect(screen.queryByTestId('content-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('content-2')).toBeInTheDocument();
    });
  });

  it('Codex :: Rendered neumorphic variant', () => {
    const { container } = renderWithTheme(
      <Codex width={12} design="neumorphic">
        <CodexItem stepId="step-1" title="Only Step">
          <div>Content</div>
        </CodexItem>
      </Codex>
    );

    const stepperWrapper = container.querySelector('.v-stepper-neumorphic');
    expect(stepperWrapper).toBeInTheDocument();
  });
});

describe('VΣ Layouts(CodexControls) Test', () => {
    
    it('CodexControls :: Navigated between steps using the Next and Back buttons', async () => {
      renderWithTheme(
        <Codex width={12}>
          <CodexItem stepId="step-1" title="Step 1">
            <div data-testid="content-1">
              <CodexControls nextStepId="step-2" />
            </div>
          </CodexItem>
          <CodexItem stepId="step-2" title="Step 2">
            <div data-testid="content-2">
              <CodexControls prevStepId="step-1" />
            </div>
          </CodexItem>
        </Codex>
      );

      const nextButton = screen.getByRole('button', { name: /Continue/i });
      fireEvent.click(nextButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('content-1')).not.toBeInTheDocument();
        expect(screen.getByTestId('content-2')).toBeInTheDocument();
      });

      const backButton = screen.getByRole('button', { name: /Back/i });
      fireEvent.click(backButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('content-1')).toBeInTheDocument();
        expect(screen.queryByTestId('content-2')).not.toBeInTheDocument();
      });
    });

    it('CodexControls :: Triggered bespoke onNext, onPrev, onFinish callback functions', async () => {
      const mockOnNext = jest.fn();
      const mockOnFinish = jest.fn();

      renderWithTheme(
        <Codex width={12}>
          <CodexItem stepId="step-1" title="Step 1">
            <div data-testid="content-1">
              <CodexControls 
                nextStepId="step-2" 
                nextLabel="Bespoke Next" 
                onNext={mockOnNext} 
                onSubmit={false}
              />
            </div>
          </CodexItem>
          <CodexItem stepId="step-2" title="Step 2">
            <div data-testid="content-2">
              <CodexControls 
                finishLabel="Launch App" 
                onFinish={mockOnFinish} 
                onSubmit={false}
              />
            </div>
          </CodexItem>
        </Codex>
      );

      const customNextButton = screen.getByRole('button', { name: /Bespoke Next/i });
      fireEvent.click(customNextButton);
      
      await waitFor(() => {
        expect(mockOnNext).toHaveBeenCalledTimes(1);
      });

      const finishButton = screen.getByRole('button', { name: /Launch App/i });
      fireEvent.click(finishButton);
      
      await waitFor(() => {
        expect(mockOnFinish).toHaveBeenCalledTimes(1);
      });
    });
});