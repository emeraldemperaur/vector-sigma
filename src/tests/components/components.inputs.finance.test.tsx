import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { CurrencyInput } from '../../components/inputcurrency/inputcurrency';
import { StockInput } from '../../components/inputcurrency/stockInput';

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

jest.mock('../../utils/currencyconfig', () => ({
  CURRENCIES: {
    USD: { code: 'USD', symbol: '$', country: 'US', scale: 2 },
    EUR: { code: 'EUR', symbol: '€', country: 'EU', scale: 2 }
  }
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

describe('VΣ Component(CurrencyInput |StockInput) Tests', () => {

  describe('VΣ Component(CurrencyInput)', () => {
    it('CurrencyInput :: Rendered default USD currency', async () => {
      await act(async () => {
        renderWithFormik(
          <CurrencyInput alias="price" width={12} inputLabel="Product Price" />,
          { price: '', priceCurrency: 'USD' }
        );
      });

      expect(screen.getByText('Product Price')).toBeInTheDocument();
      expect(screen.getByText('USD')).toBeInTheDocument();
      expect(screen.getByText('$')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    });

    it('CurrencyInput :: IMask formatted initial numeric values', async () => {
      await act(async () => {
        renderWithFormik(
          <CurrencyInput alias="price" width={12} />,
          { price: 1234567.89, priceCurrency: 'USD' }
        );
      });
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('1,234,567.89');
    });

    it('Displayed an error message for required field', async () => {
      await act(async () => {
        renderWithFormik(
          <CurrencyInput alias="price" width={12} errorText="Price cannot be blank" />,
          { price: '', priceCurrency: 'USD' },
          { initialErrors: { price: 'Required' }, initialTouched: { price: true } }
        );
      });
      expect(screen.getByText('Price cannot be blank')).toBeInTheDocument();
    });
  });

  describe('VΣ Component(StockInput)', () => {
    it('StockInput :: Rendered defaultValue ticker symbol badge', async () => {
      await act(async () => {
        renderWithFormik(
          <StockInput alias="tslaPrice" width={12} inputLabel="Target Price" defaultvalue="TSLA" />,
          { tslaPrice: '' }
        );
      });

      expect(screen.getByText('Target Price')).toBeInTheDocument();
      expect(screen.getByText('TSLA')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
    });

    it('StockInput :: IMask formatted initial numeric values', async () => {
      await act(async () => {
        renderWithFormik(
          <StockInput alias="aaplPrice" width={12} defaultvalue="AAPL" />,
          { aaplPrice: 150.5 }
        );
      });

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('150.50');
    });

    it('StockInput :: Displayed an error message for required field', async () => {
      await act(async () => {
        renderWithFormik(
          <StockInput alias="aaplPrice" width={12} defaultvalue="AAPL" errorText="Stock price is required" />,
          { aaplPrice: '' },
          { initialErrors: { aaplPrice: 'Required' }, initialTouched: { aaplPrice: true } }
        );
      });

      expect(screen.getByText('Stock price is required')).toBeInTheDocument();
    });
  });

});