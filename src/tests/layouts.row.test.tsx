import React from 'react';
import { render, screen } from '@testing-library/react';
import { Row } from '../layouts/row/row';
import '@testing-library/jest-dom';


jest.mock('@radix-ui/themes', () => ({
  Grid: ({ children, className, ...props }: any) => (
    <div 
      data-testid="radix-grid" 
      className={className} 
      data-props={JSON.stringify(props)}
    >
      {children}
    </div>
  ),
}));

describe('VΣ Layouts(Row) Test', () => {
  test('Row :: Rendered children correctly', () => {
    render(
      <Row>
        <span>VΣ Tester 1</span>
        <span>VΣ Tester 2</span>
      </Row>
    );

    expect(screen.getByText('VΣ Tester 1')).toBeInTheDocument();
    expect(screen.getByText('VΣ Tester 2')).toBeInTheDocument();
  });

  test('Row :: Rendered default/fixed props', () => {
    render(<Row>VΣ Content</Row>);
    
    const grid = screen.getByTestId('radix-grid');
    const props = JSON.parse(grid.getAttribute('data-props') || '{}');
    expect(props.gap).toBe('4');
    expect(props.columns).toBe('12');
    expect(props.width).toBe('auto');
  });

  test('Row :: Rendered dynamic gap', () => {
    render(<Row gap="9">VΣ Content</Row>);
    
    const grid = screen.getByTestId('radix-grid');
    const props = JSON.parse(grid.getAttribute('data-props') || '{}');

    expect(props.gap).toBe('9');
  });

});