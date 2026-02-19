import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { AvatarInput } from '../../components/avatar/avatar';


beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'mock-preview-url');
  global.URL.revokeObjectURL = jest.fn();
  
  Object.defineProperty(window, 'crypto', {
    value: { randomUUID: () => 'mock-uuid-for-me' },
  });
});

const renderWithFormik = (ui: React.ReactElement, formikProps = {}) => {
  return render(
    <Theme>
      <Formik 
        initialValues={{ profilePic: null }} 
        onSubmit={jest.fn()} 
        {...formikProps}
      >
        <Form>{ui}</Form>
      </Formik>
    </Theme>
  );
};

describe('VΣ Component(AvatarInput) Test', () => {
  
  it('AvatarInput :: Rendered Avatar in the default state', () => {
    renderWithFormik(
      <AvatarInput 
        alias="profilePic" 
        width={12} 
        inputLabel="Upload VΣ Profile" 
      />
    );

    expect(screen.getByText('Upload VΣ Profile')).toBeInTheDocument();
    
    expect(screen.getByText('Upload')).toBeInTheDocument();

    const fileInput = screen.getByLabelText('Upload VΣ Profile') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput.type).toBe('file');
  });

  it('AvatarInput :: Handled file selection and displayed a preview', async () => {
    renderWithFormik(
      <AvatarInput alias="profilePic" width={12} inputLabel="Profile" />
    );

    const file = new File(['(⌐□_□)'], 'mitochromeone.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(file);
    });

    const previewImage = screen.getByAltText('Avatar');
    expect(previewImage).toBeInTheDocument();
    expect(previewImage).toHaveAttribute('src', 'mock-preview-url');
  });

  it('AvatarInput :: Displayed xForm error message for required field', () => {
    renderWithFormik(
      <AvatarInput 
        alias="profilePic" 
        width={12} 
        errorText="A profile is required!" 
      />,
      {
        initialErrors: { profilePic: 'Required' },
        initialTouched: { profilePic: true }
      }
    );
    expect(screen.getByText('A profile is required!')).toBeInTheDocument();
  });

});