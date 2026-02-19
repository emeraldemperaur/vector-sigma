import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { Dropdown } from '../../components/dropdown/dropdown';
import { OptionSelect } from '../../components/select/select';
import { MultipleSelect } from '../../components/selectmultiple/selectmultiple';

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
  { optionid: 1, optionvalue: "kaiju", text: "Kaiju" },
  { optionid: 2, optionvalue: "mecha", text: "MekaGodzilla" },
  { optionid: 3, optionvalue: "zaibatsu", text: "Zaibatsu" },
];

describe('VΣ Component(Dropdown | OptionSelect | MultipleSelect) Tests', () => {

  describe('VΣ Component(Dropdown)', () => {
    it('Dropdwon :: Rendered with label and placeholder', () => {
      renderWithFormik(
        <Dropdown 
          alias="faction" 
          width={12} 
          inputLabel="Choose Cybertronian Faction" 
          placeholder="Select an option" 
          inputOptions={mockOptions} 
        />
      );

      expect(screen.getByText('Choose Cybertronian Faction')).toBeInTheDocument();
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Select an option');
    });

    it('Dropdown :: Displayed an error message for required field', async () => {
      renderWithFormik(
        <Dropdown alias="faction" width={12} inputOptions={mockOptions} errorText="Faction is required" />,
        { faction: '' },
        { initialErrors: { faction: 'Required' }, initialTouched: { faction: true } }
      );

      const errorMessage = await screen.findByText('Faction is required');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('VΣ Component(OptionSelect)', () => {
    it('OptionSelect :: Disabled interaction when readOnly', () => {
      renderWithFormik(
        <OptionSelect 
          alias="category" 
          width={12} 
          inputOptions={mockOptions} 
          readOnly 
        />
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('OptionSelect :: Rendered neumorphic variant', () => {
      renderWithFormik(
        <OptionSelect 
          alias="category" 
          width={12} 
          inputtype="dropdown-neumorphic" 
          inputOptions={mockOptions} 
        />
      );
      const trigger = screen.getByRole('combobox');
      expect(trigger.classList.contains('neu-select-trigger')).toBe(true);
    });
  });

  describe('VΣ Component(MultipleSelect)', () => {

    it('MultipleSelect :: Opened popover and toggled an option', async () => {
      renderWithFormik(
        <MultipleSelect alias="interests" width={12} inputOptions={mockOptions} />,
        { interests: [] }
      );
      const trigger = screen.getByRole('button');
      fireEvent.click(trigger);
      const optionKaiju = await screen.findByText('Kaiju');
      expect(optionKaiju).toBeInTheDocument();
      const optionContainer = optionKaiju.closest('.multiselect-item') as HTMLElement;
      fireEvent.click(optionContainer);
      await waitFor(() => {
        expect(trigger).toHaveTextContent('Kaiju');
      });
    });
  });

});