import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { Input } from '../../components/input/input';
import { PasswordInput } from '../../components/input/passwordInput';
import { PhoneInput } from '../../components/input/phoneInput';
import { CreditCardInput } from '../../components/input/xCreditCardInput';

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

const renderWithFormik = (ui: React.ReactElement, initialValues = {}, formikProps = {}) => {
  return render(
    <Theme>
      <Formik initialValues={initialValues} onSubmit={jest.fn()} {...formikProps}>
        <Form>{ui}</Form>
      </Formik>
    </Theme>
  );
};

describe('VΣ Component(Input | PasswordInput | PhoneInput | CreditCardInput) Tests', () => {

  describe('VΣ Component(Input)', () => {
    it('Input :: Rendered with label and placeholder', () => {
      renderWithFormik(
        <Input alias="username" width={12} inputLabel="Username" placeholder="Enter username" />
      );

      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    });

    it('Input :: Handled typing and updated value state', async () => {
      renderWithFormik(
        <Input alias="username" width={12} placeholder="Enter username" />,
        { username: '' }
      );

      const input = screen.getByPlaceholderText('Enter username') as HTMLInputElement;
      await act(async () => {
        fireEvent.change(input, { target: { value: 'OptimusPrime' } });
      });
      expect(input.value).toBe('OptimusPrime');
    });

    it('Input :: Displayed an error message for required field', async () => {
      await act(async () => {
        renderWithFormik(
          <Input alias="username" width={12} errorText="Username is required!" />,
          { username: '' },
          { initialErrors: { username: 'Required' }, initialTouched: { username: true } }
        );
      });

      const errorMessage = await screen.findByText('Username is required!');
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe('VΣ Component(PasswordInput)', () => {
    it('PasswordInput :: Toggled password visibility when show icon clicked', () => {
      renderWithFormik(
        <PasswordInput alias="password" width={12} placeholder="Enter password" />
      );

      const input = screen.getByPlaceholderText('Enter password') as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: 'Show password' });
      expect(input.type).toBe('password');
      fireEvent.click(toggleButton);
      expect(input.type).toBe('text');
      expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();
    });
  });

  describe('VΣ Component(PhoneInput)', () => {
    it('PhoneInput :: Rendered country selector and phone input', () => {
      renderWithFormik(
        <PhoneInput alias="phone" width={12} inputLabel="Mobile Number" />
      );

      expect(screen.getByText('Mobile Number')).toBeInTheDocument();
      const countrySelect = screen.getByRole('combobox');
      expect(countrySelect).toBeInTheDocument();
      const phoneInput = screen.getByPlaceholderText('Phone Number');
      expect(phoneInput).toBeInTheDocument();
      expect(phoneInput).toHaveAttribute('type', 'tel');
    });
  });

  describe('VΣ Component(CreditCardInput)', () => {
    it('CreditCardInput :: Rendered IMask component', () => {
      renderWithFormik(
        <CreditCardInput alias="cc" width={12} inputLabel="Card Number" />
      );

      expect(screen.getByText('Card Number')).toBeInTheDocument();
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', '0000 0000 0000 0000');
    });

    it('CreditCardInput :: Rendered initial values', async () => {
      await act(async () => {
        renderWithFormik(
          <CreditCardInput alias="cc" width={12} />,
          { cc: '41112222' } 
        );
      });
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('4111 2222');
    });
  });

});