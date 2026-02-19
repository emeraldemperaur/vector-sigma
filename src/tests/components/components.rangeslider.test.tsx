import React from 'react';
import { render, screen } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { SliderInput } from '../../components/slider/slider';
import { RangeSlider } from '../../components/slider/range';

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

describe('VΣ Component(SliderInput | RangeSlider) Tests', () => {

  describe('VΣ Component(SliderInput)', () => {
    it('SliderInput :: Rendered default minvalue when initialValue(Formik) not provided', () => {
      renderWithFormik(
        <SliderInput alias="roomCount" width={12} inputLabel="Number of Rooms" minvalue={5} />,
        { roomCount: undefined }
      );

      expect(screen.getByText('Number of Rooms')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('SliderInput :: Rendered initial Formik state value', () => {
      renderWithFormik(
        <SliderInput alias="roomCount" width={12} />,
        { roomCount: 42 }
      );
      expect(screen.getByText('42')).toBeInTheDocument();
      const sliderThumb = screen.getByRole('slider');
      expect(sliderThumb).toHaveAttribute('aria-valuenow', '42');
    });

    it('SliderInput :: Displayed xForm error message for required field', async () => {
      renderWithFormik(
        <SliderInput alias="roomCount" width={12} errorText="Room count is required" />,
        { roomCount: 0 },
        { initialErrors: { roomCount: 'Required' }, initialTouched: { roomCount: true } }
      );
      const errorMessage = await screen.findByText('Room count is required');
      expect(errorMessage).toBeInTheDocument();
    });

    it('SliderInput :: Disabled slider interaction when readOnly', () => {
      renderWithFormik(
        <SliderInput alias="roomCount" width={12} readOnly />,
        { roomCount: 10 }
      );
      const sliderThumb = screen.getByRole('slider');
      expect(sliderThumb).toHaveAttribute('data-disabled');
    });
  });

  describe('VΣ Component(RangeSlider)', () => {
    it('RangeSlider :: Rendered range with an array of Formik initialValues', () => {
      renderWithFormik(
        <RangeSlider alias="priceRange" width={12} inputLabel="Price Range" />,
        { priceRange: [20, 80] } 
      );
      expect(screen.getByText('Price Range')).toBeInTheDocument();
      expect(screen.getByText('20 - 80')).toBeInTheDocument();
      const sliderThumbs = screen.getAllByRole('slider');
      expect(sliderThumbs).toHaveLength(2);
      expect(sliderThumbs[0]).toHaveAttribute('aria-valuenow', '20');
      expect(sliderThumbs[1]).toHaveAttribute('aria-valuenow', '80');
    });

    it('RangeSlider :: Fallback mechanism triggered safely when Formik value is missing or not array data type', () => {
      renderWithFormik(
        <RangeSlider alias="priceRange" width={12} minvalue={10} />,
        { priceRange: undefined }
      );
      expect(screen.getByText('10')).toBeInTheDocument();
      const sliderThumbs = screen.getAllByRole('slider');
      expect(sliderThumbs).toHaveLength(1);
    });

    it('RangeSlider :: Rendered neumorphic variant', () => {
      renderWithFormik(
        <RangeSlider alias="priceRange" width={12} inputtype="range-neumorphic" />,
        { priceRange: [10, 50] }
      );

      const sliders = screen.getAllByRole('slider');
      const trackContainer = sliders[0].closest('.neu-slider');
      expect(trackContainer).toBeInTheDocument();
    });
  });

});