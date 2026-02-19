import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Formik, Form } from 'formik';
import { Theme } from '@radix-ui/themes';
import { File as FileInput } from '../../components/file/file';
import { FileMultiple } from '../../components/file/filemultiple';

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

  global.URL.createObjectURL = jest.fn(() => 'mock-preview-url');
  global.URL.revokeObjectURL = jest.fn();
});

jest.mock('../../utils/vinci', () => ({
  getNearestParentBackground: jest.fn(() => '#ffffff'),
  adjustColor: jest.fn(() => '#dddddd'),
  formatBytes: jest.fn(() => '1.5 MB'),
  ACCEPTED_FORMATS: 'image/*,application/pdf',
  ACCEPTED_EXTENSIONS: '.jpg,.png,.pdf',
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

const createMockFile = (name: string, type: string): File => {
  return new window.File(['dummy content'], name, { type });
};

describe('VΣ Component(File | FileMultiple) Tests', () => {

  describe('VΣ Component(File)', () => {
    it('File :: Rendered the default empty state', () => {
      renderWithFormik(
        <FileInput alias="singleFile" width={12} inputLabel="Upload Document" />,
        { singleFile: null }
      );

      expect(screen.getByText('Upload Document')).toBeInTheDocument();
      expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    it('File :: Handled file selection and displays file details', async () => {
      renderWithFormik(
        <FileInput alias="singleFile" width={12} />,
        { singleFile: null }
      );

      const mockFile = createMockFile('test-resume.pdf', 'application/pdf');
      
      const hiddenInput = document.querySelector('input[name="singleFile"]') as HTMLInputElement;
      fireEvent.change(hiddenInput, { target: { files: [mockFile] } });

      await waitFor(() => {
        expect(screen.getByText('test-resume.pdf')).toBeInTheDocument();
        expect(screen.getByText('1.5 MB')).toBeInTheDocument(); 
      });
    });

    it('File :: Cleared the selected file when remove button clicked', async () => {
      const mockFile = createMockFile('test-image.png', 'image/png');
      
      renderWithFormik(
        <FileInput alias="singleFile" width={12} preview />,
        { singleFile: mockFile }
      );

      expect(screen.getByText('test-image.png')).toBeInTheDocument();

      const removeButton = screen.getByRole('button');
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText('Upload File')).toBeInTheDocument();
      });
    });
  });

  describe('VΣ Component(FileMultiple)', () => {
    it('FileMultiple :: Rendered the empty state', () => {
      renderWithFormik(
        <FileMultiple alias="multiFiles" width={12} inputLabel="Upload Certificates" />,
        { multiFiles: [] }
      );
      expect(screen.getByText('Upload Certificates')).toBeInTheDocument();
      expect(screen.getByText('Choose files...')).toBeInTheDocument();
    });

    it('FileMultiple :: Handled selecting multiple files and rendered file type icon cards', async () => {
      renderWithFormik(
        <FileMultiple alias="multiFiles" width={12} preview={true} />,
        { multiFiles: [] }
      );
      const file1 = createMockFile('cert1.pdf', 'application/pdf');
      const file2 = createMockFile('photo.png', 'image/png');
      const hiddenInput = document.querySelector('input[name="multiFiles"]') as HTMLInputElement;
      fireEvent.change(hiddenInput, { target: { files: [file1, file2] } });

      await waitFor(() => {
        expect(screen.getByText('2 files selected')).toBeInTheDocument();
        expect(screen.getByText('cert1.pdf')).toBeInTheDocument();
        expect(screen.getByText('photo.png')).toBeInTheDocument();
      });
    });

    it('FileMultiple :: Removed a selected file from the selection', async () => {
      const file1 = createMockFile('keep-this.pdf', 'application/pdf');
      const file2 = createMockFile('remove-this.pdf', 'application/pdf');

      renderWithFormik(
        <FileMultiple alias="multiFiles" width={12} />,
        { multiFiles: [file1, file2] } 
      );

      expect(screen.getByText('2 files selected')).toBeInTheDocument();
      const removeButtons = screen.getAllByRole('button');
      fireEvent.click(removeButtons[1]);

      await waitFor(() => {
        expect(screen.getByText('1 file selected')).toBeInTheDocument();
        expect(screen.queryByText('remove-this.pdf')).not.toBeInTheDocument();
        expect(screen.getByText('keep-this.pdf')).toBeInTheDocument();
      });
    });
    
    it('FileMultiple :: Displayed xForm error message for required field', async () => {
      renderWithFormik(
        <FileMultiple alias="multiFiles" width={12} errorText="Please upload at least one file." />,
        { multiFiles: [] },
        { initialErrors: { multiFiles: 'Required' }, initialTouched: { multiFiles: true } }
      );
      const errorMessage = await screen.findByText('Please upload at least one file.');
      expect(errorMessage).toBeInTheDocument();
    });
  });

});