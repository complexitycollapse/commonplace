import { render } from '@testing-library/react';
import { FlightComponent } from './flight-component';
import { Edl, EdlPointer } from '@commonplace/core';
import { PartRepository, StaticPartFetcher } from '@commonplace/html';
import { DefaultsEdlZettel } from '@commonplace/document-model';

describe('FlightComponent', () => {
  it('should render successfully', () => {
    let repository = PartRepository(StaticPartFetcher("/assets/content/", async () => { return { ok: true, json: () =>{ return {"cps":[],"lks":[]}; } }; }));
    let defaults = DefaultsEdlZettel().renderLinks;
    const { baseElement } = render(<FlightComponent docPointers={[EdlPointer("test")]} repository={repository} defaults = {defaults} />);
    expect(baseElement).toBeTruthy();
  });
});
