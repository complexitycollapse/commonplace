import { render } from '@testing-library/react';
import { FlightComponent } from './flight-component';
import { Doc } from '@commonplace/core';
describe('FlightComponent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FlightComponent docs={[Doc()]} />);
    expect(baseElement).toBeTruthy();
  });
});
