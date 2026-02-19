import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { CheckboxGroupInput } from '../../components/checkbox/checkbox';

jest.mock('../../utils/vinci', () => ({
  getNearestParentBackground: jest.fn(() => '#ffffff'),
  adjustColor: jest.fn(() => '#dddddd'),
}));

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

const renderWithFormik = (ui: React.ReactElement, initialValues = { factions: [] }, formikProps = {}) => {
  return render(
    <Theme>
      <Formik initialValues={initialValues} onSubmit={jest.fn()} {...formikProps}>
        <Form>{ui}</Form>
      </Formik>
    </Theme>
  );
};

const mockOptions = [
  { optionid: 1, optionvalue: 'Kaiju', text: 'Kaiju' },
  { optionid: 2, optionvalue: 'Mecha', text: 'Mecha' },
  { optionid: 3, optionvalue: 'Zaibatsu', text: 'Zaibatsu' },
];

describe('VΣ Component(CheckboxGroupInput) Test', () => {

  it('CheckboxGroupInput :: Rendered checkboxes with option labels', () => {
    renderWithFormik(
      <CheckboxGroupInput 
        alias="factions" 
        width={12} 
        inputLabel="Select Cybertron Faction"
        inputOptions={mockOptions}
      />
    );

    expect(screen.getByText('Select Cybertron Faction')).toBeInTheDocument();
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
    expect(screen.getByText('Kaiju')).toBeInTheDocument();
    expect(screen.getByText('Mecha')).toBeInTheDocument();
  });

  it('CheckboxGroupInput :: Selected and unselected multiple options', async () => {
    renderWithFormik(
      <CheckboxGroupInput 
        alias="factions" 
        width={12} 
        inputOptions={mockOptions}
      />
    );

    const kaijuCheckbox = screen.getAllByRole('checkbox')[0];
    const mechaCheckbox = screen.getAllByRole('checkbox')[1];
    expect(kaijuCheckbox).toHaveAttribute('data-state', 'unchecked');
    expect(mechaCheckbox).toHaveAttribute('data-state', 'unchecked');
    fireEvent.click(kaijuCheckbox);
    await waitFor(() => {
      expect(kaijuCheckbox).toHaveAttribute('data-state', 'checked');
    });

    fireEvent.click(mechaCheckbox);
    await waitFor(() => {
      expect(mechaCheckbox).toHaveAttribute('data-state', 'checked');
    });

    fireEvent.click(kaijuCheckbox);
    await waitFor(() => {
      expect(kaijuCheckbox).toHaveAttribute('data-state', 'unchecked');
      expect(mechaCheckbox).toHaveAttribute('data-state', 'checked'); 
    });
  });

  it('CheckboxGroupInput :: Disabled checkboxes interaction when readOnly', () => {
    renderWithFormik(
      <CheckboxGroupInput 
        alias="factions" 
        width={12} 
        inputOptions={mockOptions}
        readOnly
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it('CheckboxGroupInput :: Rendered neumorphic variant', () => {
    renderWithFormik(
      <CheckboxGroupInput 
        alias="factions" 
        width={12} 
        inputtype="checkbox-neumorphic"
        inputOptions={mockOptions}
      />
    );
    const firstCheckbox = screen.getAllByRole('checkbox')[0];
    expect(firstCheckbox.classList.contains('neu-checkbox')).toBe(true);
  });

});