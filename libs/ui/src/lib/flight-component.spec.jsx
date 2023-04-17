import { render } from '@testing-library/react';
import { FlightComponent } from './flight-component';
import { EdlPointer } from '@commonplace/core';
import { DocuverseBuilder } from '@commonplace/document-model';

describe('FlightComponent', () => {
  it('should render successfully', () => {
    let dv = DocuverseBuilder().add(obj => ({
      test: obj.anEdl()
    })).build();

    let repo = dv.repo;

    const { baseElement } = render(<FlightComponent docPointers={[EdlPointer("test")]} repository={repo} />);
    expect(baseElement).toBeTruthy();
  });
});
