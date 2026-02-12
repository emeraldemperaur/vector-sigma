import React from 'react';
import { render, screen } from '@testing-library/react';
import { Container } from '../layouts/container/container';
import '@testing-library/jest-dom';


jest.mock('@radix-ui/themes', () => ({
  Box: ({ children, className, ...props }: any) => (
    <div data-testid="radix-box" className={className} data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
  Container: ({ children, className, ...props }: any) => (
    <div data-testid="radix-container" className={className} data-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

describe('VΣ Layouts(Container) Test', () => {

  test('Container :: Rendered base Container', () => {
    render(<Container>VΣ Test</Container>);

    const container = screen.getByTestId('radix-container');
    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent('VΣ Test');
    
    const props = JSON.parse(container.getAttribute('data-props') || '{}');
    expect(props.size).toBe('3');
    expect(props.px).toBe('3');
  });

  test('Container :: Rendered Fluid Box', () => {
    render(<Container fluid>Fluid VΣ</Container>);

    const box = screen.getByTestId('radix-box');
    expect(box).toBeInTheDocument();
    expect(box).toHaveTextContent('Fluid VΣ');

    const props = JSON.parse(box.getAttribute('data-props') || '{}');
    expect(props.width).toBe('100%');
    expect(props.px).toBe('3');
  });

  test('Container :: Enabled custom props (className, id, etc.)', () => {
    render(
      <Container id="my-id" className="sigma-class" data-vector="value">
        Content
      </Container>
    );

    const container = screen.getByTestId('radix-container');
    expect(container).toHaveClass('sigma-class');
    const props = JSON.parse(container.getAttribute('data-props') || '{}');
    expect(props.id).toBe('my-id');
    expect(props['data-vector']).toBe('value');
  });

});