import React from 'react';
import { render, screen } from '@testing-library/react';
import { Column } from '../../layouts/column/column';
import '@testing-library/jest-dom';

jest.mock('@radix-ui/themes', () => ({
  Box: ({ children, className, ...props }: any) => (
    <div
      data-testid="radix-box"
      className={className}
      data-props={JSON.stringify(props)}
    >
      {children}
    </div>
  ),
}));

describe('VΣ Layouts(Column) Test', () => {
  test('Column :: Rendered with default full span', () => {
    render(<Column>VΣ Default</Column>);

    const box = screen.getByTestId('radix-box');
    const props = JSON.parse(box.getAttribute('data-props') || '{}');
    expect(props.gridColumn.initial).toBe('span 12');
  });


  test('Column :: Rendered column on newLine', () => {
  render(<Column newLine>VΣ New Line Content</Column>);

  const box = screen.getByTestId('radix-box');
  const props = JSON.parse(box.getAttribute('data-props') || '{}');
  expect(props.gridColumn.initial).toBe('1 / span 12');
});

  test('Column :: Rendered with dynamic responsive props', () => {
    render(
      <Column 
        sm={6}        
        md={true}    
        lg="auto"     
        xl={3} 
      >
        VΣ Responsive Content
      </Column>
    );

    const box = screen.getByTestId('radix-box');
    const props = JSON.parse(box.getAttribute('data-props') || '{}');
    const gridColumn = props.gridColumn;
    expect(gridColumn.sm).toBe('span 6');
    expect(gridColumn.md).toBe('span 12');
    expect(gridColumn.lg).toBe('auto');
    expect(gridColumn.xl).toBe('span 3');
  });

});