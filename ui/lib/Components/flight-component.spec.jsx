import { render } from '@testing-library/react';
import { FlightComponent } from './flight-component';
import { EdlPointer } from '@commonplace/core';
import { DocuverseBuilder } from '@commonplace/document-model';
import { describe, it, expect } from 'vitest';

describe('FlightComponent', () => {
  it('should render successfully', () => {
    let dv = DocuverseBuilder().add(obj => ({
      test: obj.anEdl()
    })).build();

    const { baseElement } = render(<FlightComponent docPointers={[EdlPointer("test")]} repository={ dv.repo } />);
    expect(baseElement).toBeTruthy();
  });
});
