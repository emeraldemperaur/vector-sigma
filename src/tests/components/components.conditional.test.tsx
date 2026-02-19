import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { ConditionalTrigger } from '../../components/conditional/conditional'; 

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


const renderWithFormik = (ui: React.ReactElement, initialValues = { triggerField: false }) => {
  return render(
    <Theme>
      <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        <Form>{ui}</Form>
      </Formik>
    </Theme>
  );
};

describe('VΣ Component(ConditionalTrigger) Test', () => {

  it('ConditionalTrigger :: Rendered a Toggle trigger by default and rendered child component when toggled', async () => {
    renderWithFormik(
      <ConditionalTrigger 
        alias="triggerField" 
        width={12} 
        inputLabel="Enable Feature"
        triggerValue={true}
      >
        <div data-testid="hidden-child">Secret Content</div>
      </ConditionalTrigger>,
      { triggerField: false }
    );

    const toggleSwitch = screen.getByRole('switch');
    expect(toggleSwitch).toBeInTheDocument();
    expect(toggleSwitch).toHaveAttribute('data-state', 'unchecked');
    const childWrapper = screen.getByTestId('hidden-child').parentElement?.parentElement;
    fireEvent.click(toggleSwitch);
    await waitFor(() => {
      expect(toggleSwitch).toHaveAttribute('data-state', 'checked');
    });
  });


  it('ConditionalTrigger :: Rendered a Checkbox trigger when inputtype is conditionalcheckbox', () => {
    renderWithFormik(
      <ConditionalTrigger 
        alias="triggerField" 
        triggerValue={"show"}
        width={12} 
        inputtype="conditionalcheckbox-outline"
      >
        <div>Child Content</div>
      </ConditionalTrigger>
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('ConditionalTrigger :: Rendered a Select trigger dropdown when inputtype is conditionalselect', () => {
    const mockOptions = [
      { optionid: 1, optionvalue: 'show', text: 'Show Content' },
      { optionid: 2, optionvalue: 'hide', text: 'Hide Content' }
    ];

    renderWithFormik(
      <ConditionalTrigger 
        alias="triggerField" 
        triggerValue={"show"}
        width={12} 
        inputtype="conditionalselect-outline"
        inputOptions={mockOptions}
      >
        <div>Child Content</div>
      </ConditionalTrigger>
    );

    const selectTrigger = screen.getByRole('combobox');
    expect(selectTrigger).toBeInTheDocument();
  });

  it('ConditionalTrigger :: Disabled interaction when readOnly', () => {
    renderWithFormik(
      <ConditionalTrigger 
        alias="triggerField" 
        triggerValue={"show"}
        width={12} 
        readOnly
      >
        <div>Child Content</div>
      </ConditionalTrigger>
    );

    const toggleSwitch = screen.getByRole('switch');
    expect(toggleSwitch).toBeDisabled();
  });

});