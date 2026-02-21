import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { DatePicker } from '../../components/datepicker/datepicker';
import { DateRangePicker } from '../../components/daterangepicker/daterangepicker';
import { DateTimePicker } from '../../components/datetimepicker/datetimepicker';

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

describe('VΣ Component(DatePicker | DateRangePicker | DateTimeicker) Tests', () => {

  describe('VΣ Component(DatePicker)', () => {
    it('DatePicker :: Rendered with label and placeholder', () => {
      renderWithFormik(
        <DatePicker alias="singleDate" inputLabel="Start Date" placeholder="Pick a date" width={12}/>
      );
      expect(screen.getByText('Start Date')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Pick a date')).toBeInTheDocument();
    });

    it('DatePicker :: Displayed an error message for required field', async () => {
      renderWithFormik(
        <DatePicker alias="singleDate" errorText="Date is required" width={12}/>,
        { singleDate: null },
        { initialErrors: { singleDate: 'Required' }, initialTouched: { singleDate: true } }
      );

      const errorMessage = await screen.findByText('Date is required');
      expect(errorMessage).toBeInTheDocument();
    });

    it('DatePicker :: Disabled interaction when readOnly', () => {
      renderWithFormik(
        <DatePicker alias="singleDate" placeholder="Pick a date" readOnly width={12}/>
      );

      const input = screen.getByPlaceholderText('Pick a date');
      expect(input).toBeDisabled();
    });
  });

  describe('VΣ Component(DateRangePicker)', () => {
    it('DateRangePicker :: Rendered and parsed initial object dates correctly', () => {
      const startDate = new Date('2024-01-01T12:00:00Z');
      const endDate = new Date('2024-01-10T12:00:00Z');

      renderWithFormik(
        <DateRangePicker alias="dateRange" placeholder="Select range" />,
        { dateRange: { from: startDate, to: endDate } } 
      );
      const input = screen.getByPlaceholderText('Select range') as HTMLInputElement;
      expect(input.value).toContain('Jan 1, 2024');
      expect(input.value).toContain('Jan 10, 2024');
    });

    it('Rendered neumorphic variant', () => {
      renderWithFormik(
        <DateRangePicker alias="dateRange" inputtype="daterangepicker-neumorphic" placeholder="Neumorphic range" />
      );
      const input = screen.getByPlaceholderText('Neumorphic range');
      expect(input).toBeInTheDocument();
    });
  });

  describe('VΣ Component(DateTimePicker)', () => {
    it('DateTimePicker :: Rendered with initial date and time', () => {
      const initialDateTime = new Date('2024-05-15T14:30:00');

      renderWithFormik(
        <DateTimePicker alias="meetingTime" placeholder="Select time" />,
        { meetingTime: initialDateTime }
      );
      const input = screen.getByPlaceholderText('Select time') as HTMLInputElement;
      expect(input.value).toContain('May 15, 2024');
      expect(input.value).toContain('2:30 PM');
    });

    it('DateTimePicker :: Displayed hint icon and tooltip trigger when isHinted', () => {
      renderWithFormik(
        <DateTimePicker 
          alias="meetingTime" 
          isHinted 
          hintText="Select your local time" 
          hintUrl="https://timezone.com"
        />
      );
      const hintLink = screen.getByRole('link');
      expect(hintLink).toHaveAttribute('href', 'https://timezone.com');
    });
  });

});