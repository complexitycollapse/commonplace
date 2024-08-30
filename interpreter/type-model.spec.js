import { describe, it, expect } from 'vitest';
import TypeModel from './type-model';
import { Link, LinkPointer } from '@commonplace/core';

describe("TypeModel", () => {
  it('sets the type correctly', () => {
    expect(TypeModel("type string").type).toBe("type string");
  });

  it('sets hasType to false if no type is specified', () => {
    expect(TypeModel().hasType).toBe(false);
  });

  it('sets hasType to true if a type is specified', () => {
    expect(TypeModel("type").hasType).toBe(true);
  });

  it('sets hasStringType to true if a string type is specified', () => {
    expect(TypeModel("type").hasStringType).toBe(true);
  });

  it('sets hasPointerType to true if a LinkPointer type is specified', () => {
    expect(TypeModel(LinkPointer("name")).hasPointerType).toBe(true);
  });

  it('requests resolution of a LinkPointer type', () => {
    expect(TypeModel(LinkPointer("name")).unresolved).toEqual([LinkPointer("name")]);
  });

  it('stops requesting resolution of the LinkPointer type when it has been resolved', () => {
    const model = TypeModel(LinkPointer("name"));

    model.resolve(LinkPointer("name"), Link());

    expect(model.unresolved).toEqual([]);
  });

  it('sets all the type predicates to false when the type is set to undefined', () => {
    const model = TypeModel(LinkPointer("name"));

    model.setType(undefined);

    expect(model.hasType).toBe(false);
    expect(model.hasStringType).toBe(false);
    expect(model.hasPointerType).toBe(false);
  });

  it('updates the type predicates when the type is set to a string', () => {
    const model = TypeModel();

    model.setType("string type");

    expect(model.hasType).toBe(true);
    expect(model.hasStringType).toBe(true);
    expect(model.hasPointerType).toBe(false);
  });

  it('updates the type predicates when the type is set to a LinkPointer', () => {
    const model = TypeModel();

    model.setType(LinkPointer("name"));

    expect(model.hasType).toBe(true);
    expect(model.hasStringType).toBe(false);
    expect(model.hasPointerType).toBe(true);
  });
});
