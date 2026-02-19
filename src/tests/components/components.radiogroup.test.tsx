import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { RadioGroupInput } from '../../components/radio/radio';
import { Toggle } from '../../components/toggle/toggle';

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

  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  Object.defineProperty(global, 'crypto', {
    value: { randomUUID: () => 'mock-uuid-for-me' },
  });
});

jest.mock('../../utils/vinci', () => ({
  getNearestParentBackground: jest.fn(() => '#ffffff'),
  adjustColor: jest.fn(() => '#dddddd'),
}));

const renderWithFormik = (ui: React.ReactElement, initialValues = {}, formikProps = {}) => {
  return render(
    <Theme>
      <Formik initialValues={initialValues} onSubmit={jest.fn()} {...formikProps}>
        <Form>{ui}</Form>
      </Formik>
    </Theme>
  );
};

const mockOptions = [
  { optionid: 1, optionvalue: "standard", text: "Standard Tier" },
  { optionid: 2, optionvalue: "premium", text: "Premium Tier" },
];

describe('VΣ Component(RadioGroup | Toggle) Tests', () => {

  describe('VΣ Component(RadioGroup)', () => {
    it('RadioGroup :: Rendered with label and options', () => {
      renderWithFormik(
        <RadioGroupInput 
          alias="subscription" 
          width={12} 
          inputLabel="Select Subscription" 
          inputOptions={mockOptions} 
        />
      );

      expect(screen.getByText('Select Subscription')).toBeInTheDocument();
      expect(screen.getByText('Standard Tier')).toBeInTheDocument();
      expect(screen.getByText('Premium Tier')).toBeInTheDocument();
      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(2);
    });

    it('RadioGroup :: Handled selection interaction', async () => {
      renderWithFormik(
        <RadioGroupInput alias="subscription" width={12} inputOptions={mockOptions} />,
        { subscription: 'standard' } 
      );

      const radios = screen.getAllByRole('radio');
      const standardRadio = radios[0];
      const premiumRadio = radios[1];
      expect(standardRadio).toHaveAttribute('aria-checked', 'true');
      expect(premiumRadio).toHaveAttribute('aria-checked', 'false');
      fireEvent.click(premiumRadio);

      await waitFor(() => {
        expect(standardRadio).toHaveAttribute('aria-checked', 'false');
        expect(premiumRadio).toHaveAttribute('aria-checked', 'true');
      });
    });

    it('RadioGroup :: Disabled all radio items when readOnly', () => {
      renderWithFormik(
        <RadioGroupInput alias="subscription" width={12} inputOptions={mockOptions} readOnly />
      );

      const radios = screen.getAllByRole('radio');
      radios.forEach(radio => {
        expect(radio).toHaveAttribute('data-disabled');
      });
    });

    it('RadioGroup :: Displays xForm error message for required field', async () => {
      renderWithFormik(
        <RadioGroupInput alias="subscription" width={12} inputOptions={mockOptions} errorText="Selection required" />,
        { subscription: '' },
        { initialErrors: { subscription: 'Required' }, initialTouched: { subscription: true } }
      );

      const errorMessage = await screen.findByText('Selection required');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('VΣ Component(Toggle)', () => {

    it('Toggle :: Render bespoke neumorphic variant and handles toggle', async () => {
      const { container } = renderWithFormik(
        <Toggle alias="enableFeature" width={12} inputtype="toggle-neumorphic" />,
        { enableFeature: false }
      );

      const toggleWrapper = container.querySelector('.neu-toggle-wrapper') as HTMLElement;
      expect(toggleWrapper).toBeInTheDocument();

      const hiddenCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
      expect(hiddenCheckbox).not.toBeChecked();

      fireEvent.click(toggleWrapper);

      await waitFor(() => {
        expect(hiddenCheckbox).toBeChecked();
      });
    });

    it('Toggle :: Disabled interaction when readOnly (Neumorphic)', () => {
      const { container } = renderWithFormik(
        <Toggle alias="enableFeature" width={12} inputtype="toggle-neumorphic" readOnly />,
        { enableFeature: false }
      );

      const toggleWrapper = container.querySelector('.neu-toggle-wrapper') as HTMLElement;
      const hiddenCheckbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

      fireEvent.click(toggleWrapper);

      expect(hiddenCheckbox).not.toBeChecked();
      expect(toggleWrapper).toHaveStyle({ pointerEvents: 'none' }); 
    });

    it('Toggle :: Disabled interactions when outline variant readOnly', () => {
      renderWithFormik(
        <Toggle alias="enableFeature" width={12} inputtype="toggle-outline" readOnly>
          Toggle AI
        </Toggle>,
        { enableFeature: false }
      );

      const toggleButton = screen.getByRole('button', { name: 'Toggle AI' });
      expect(toggleButton).toBeDisabled();
    });
  });

});