import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Formik } from 'formik';
import { CountrySelect } from '../../components/dropdown/countrydropdown';


global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

if (typeof window.PointerEvent === 'undefined') {
    class PointerEvent extends MouseEvent {
        pointerId: number;
        constructor(type: string, params: PointerEventInit = {}) {
            super(type, params);
            this.pointerId = params.pointerId || 1;
        }
    }
    window.PointerEvent = PointerEvent as any;
}

if (typeof window.HTMLElement.prototype.hasPointerCapture === 'undefined') {
    window.HTMLElement.prototype.hasPointerCapture = () => false;
    window.HTMLElement.prototype.setPointerCapture = () => {};
    window.HTMLElement.prototype.releasePointerCapture = () => {};
}


const FormikWrapper = ({ children, initialValues = { testCountry: '' } }: any) => (
    <Formik initialValues={initialValues} onSubmit={jest.fn()}>
        {children}
    </Formik>
);

describe('VΣ Component(CountrySelect)', () => {

    it('CountrySelect :: Rendered label and default placeholder', () => {
        render(
            <FormikWrapper>
                <CountrySelect 
                    alias="testCountry" 
                    width={12} 
                    inputLabel="Primary Citizenship" 
                />
            </FormikWrapper>
        );

        expect(screen.getByText('Primary Citizenship')).toBeInTheDocument();
        expect(screen.getByText('Select Country...')).toBeInTheDocument();
    });

    it('CountrySelect :: Opened popover and displayed countries on click', () => {
        render(
            <FormikWrapper>
                <CountrySelect 
                    alias="testCountry" 
                    width={12} 
                />
            </FormikWrapper>
        );

        const triggerButton = screen.getByRole('button');
        fireEvent.click(triggerButton);
        expect(screen.getByText('Canada')).toBeInTheDocument();
        expect(screen.getByText('United States')).toBeInTheDocument();
    });

    it('CountrySelect :: Rendered search bar when enableSearch == true', () => {
        render(
            <FormikWrapper>
                <CountrySelect 
                    alias="testCountry" 
                    width={12} 
                    enableSearch={true} 
                />
            </FormikWrapper>
        );

        const triggerButton = screen.getByRole('button');
        fireEvent.click(triggerButton);
        const searchInput = screen.getByPlaceholderText('Search countries...');
        expect(searchInput).toBeInTheDocument();
    });

    it('CountrySelect :: Rendered checkboxes when multiselect enabled', () => {
        render(
            <FormikWrapper initialValues={{ testCountry: [] }}>
                <CountrySelect 
                    alias="testCountry" 
                    width={12} 
                    multiselect={true} 
                />
            </FormikWrapper>
        );

        const triggerButton = screen.getByRole('button');
        fireEvent.click(triggerButton);
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('CountrySelect :: Displayed validation error messages', () => {
        render(
            <FormikWrapper 
                initialValues={{ testCountry: '' }}
            >
                <Formik initialValues={{ testCountry: '' }} initialErrors={{ testCountry: 'Required' }} initialTouched={{ testCountry: true }} onSubmit={jest.fn()}>
                    <CountrySelect 
                        alias="testCountry" 
                        width={12} 
                        errorText="Please select a country."
                    />
                </Formik>
            </FormikWrapper>
        );

        expect(screen.getByText('Please select a country.')).toBeInTheDocument();
    });
});