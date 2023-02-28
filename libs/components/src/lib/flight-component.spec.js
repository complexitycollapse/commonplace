import { render } from '@testing-library/react';
import { FlightComponent } from './flight-component';
import { PartRepository, EdlPointer } from '@commonplace/core';
import { StaticPartFetcher } from '@commonplace/html';
import { DefaultsDocModel } from '@commonplace/document-model';

describe('FlightComponent', () => {
  it('should render successfully', () => {
    // TODO Need to add the defaults to the repo
    let repository = PartRepository(StaticPartFetcher("/assets/content/", async () => { return { ok: true, json: () =>{ return {"cps":[],"lks":[]}; } }; }));
    let defaults = DefaultsDocModel(repository);
    const { baseElement } = render(<FlightComponent docPointers={[EdlPointer("test")]} repository={repository} defaults = {defaults} />);
    expect(baseElement).toBeTruthy();
  });
});
