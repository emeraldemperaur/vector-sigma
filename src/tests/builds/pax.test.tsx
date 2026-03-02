import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VectorSigma } from '../../vectorSigma';

describe('VΣ Engine(VectorSigma) Tests', () => {

    describe('VectorSigma{} class :: Builder Pattern & xForm Object Data Integrity', () => {
        it('VectorSigma :: Instantiated empty xForm object and chained builder methods', () => {
            const vs = new VectorSigma()
                .setName('Autobot Registration')
                .setBrand('#FF0000')
                .createSection('sec-1', 'Basic Info', 'Enter details')
                .addQueryToSection('sec-1', {
                    queryId: 1,
                    inputAlias: 'autobotName',
                    inputType: 'text',
                    inputLabel: 'Designation',
                    inputWidth: 12
                });

            const xForm = vs.getxForm();
            
            expect(xForm.name).toBe('Autobot Registration');
            expect(xForm.brandColor).toBe('#FF0000');
            expect(xForm.model.length).toBe(1);
            expect(xForm.model[0].sectionId).toBe('sec-1');
            expect(xForm.model[0].queries[0].inputAlias).toBe('autobotName');
        });

        it('VectorSigma :: Generated a valid JSON string payload', () => {
            const vs = new VectorSigma().setName('VΣ JSON Test');
            const jsonString = vs.toJSON();
            
            expect(typeof jsonString).toBe('string');
            expect(jsonString).toContain('"name": "VΣ JSON Test"');
        });
    });

    describe('VectorSigma * Zod :: Schema Validation', () => {
        it('VectorSigma :: Raised a DX error when instantiated with an invalid schema object', () => {
            const badxFormData = { 
                name: "Corrupted Form", 
                model: "This xForm data model should be an array, not a string"
            };
            expect(() => new VectorSigma(badxFormData)).toThrow(/VectorSigma Validation Error/);
        });

        it('VectorSigma :: Parsed a valid xForm JSON string initializer', () => {
            const goodxFormData = JSON.stringify({
                uuid: "1234",
                name: "Valid xForm",
                model: []
            });

            const vs = new VectorSigma(goodxFormData);
            expect(vs.isValid).toBe(true);
            expect(vs.getxForm().name).toBe('Valid xForm');
        });
    });

    describe('VectorSigma * Formik :: React render with persisting Formik Lifecycle', () => {
        it('VectorSigma :: Rendered the xForm, tracked status codes, and hydrated xForm data on submit', async () => {
            const mockSubmit = jest.fn();
            
            const vs = new VectorSigma()
                .setName('VΣ Lifecycle Test')
                .createSection('sec-1', 'Identity')
                .addQueryToSection('sec-1', {
                    queryId: 1,
                    inputAlias: 'agentName',
                    inputType: 'text',
                    inputLabel: 'AI Agent Name',
                    inputWidth: 12,
                    defaultValue: '',
                    inputPlaceholder: 'Enter AI agent name'
                });

            render(vs.render({ onSubmit: mockSubmit }));
            expect(vs.statusCode).toBe(0);
            expect(vs.timeCreated).toBeGreaterThan(0);
            const inputElement = screen.getByPlaceholderText('Enter AI agent name');
            const submitButton = screen.getByRole('button', { name: 'Submit' });
            expect(inputElement).toBeInTheDocument();
            expect(submitButton).toBeInTheDocument();
            fireEvent.change(inputElement, { target: { value: 'Optimus Prime' } });

            await waitFor(() => {
                expect(vs.statusCode).toBe(1);
                expect(vs.timeInProgress).not.toBeNull();
            });

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockSubmit).toHaveBeenCalled();
                expect(vs.statusCode).toBe(2);
                expect(vs.timeSubmitted).not.toBeNull();
                const hydratedForm = vs.getxForm();
                expect(hydratedForm.model[0].queries[0].queryResponse).toBe('Optimus Prime');
            });
        });
    });
});