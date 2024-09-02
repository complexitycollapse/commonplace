import { describe, it, expect } from 'vitest';
import TypeBuilder from './type-builder';
import { Link, LinkPointer } from '@commonplace/core';

describe("TypeBuilder", () => {
  it('sets the type correctly', () => {
    expect(TypeBuilder("type string").type).toBe("type string");
  });

  it('sets hasType to false if no type is specified', () => {
    expect(TypeBuilder().hasType).toBe(false);
  });

  it('sets hasType to true if a type is specified', () => {
    expect(TypeBuilder("type").hasType).toBe(true);
  });

  it('sets hasStringType to true if a string type is specified', () => {
    expect(TypeBuilder("type").hasStringType).toBe(true);
  });

  it('sets hasPointerType to true if a LinkPointer type is specified', () => {
    expect(TypeBuilder(LinkPointer("name")).hasPointerType).toBe(true);
  });

  it('requests resolution of a LinkPointer type', () => {
    expect(TypeBuilder(LinkPointer("name")).outstanding).toEqual([LinkPointer("name")]);
  });

  it('stops requesting resolution of the LinkPointer type when it has been resolved', () => {
    const builder = TypeBuilder(LinkPointer("name"));

    builder.resolve(LinkPointer("name"), Link());

    expect(builder.outstanding).toEqual([]);
  });

  it('raises an type resolved event when the type link is resolved', () => {
    let hookCalled;
    const resolvedValue = Link();
    const builder = TypeBuilder(LinkPointer("name"));
    builder.addHook("resolved", (type, ev) => {
      expect(type).toBe("resolved");
      expect(ev.pointer).toEqual(LinkPointer("name"));
      expect(ev.requirement).toBe("type");
      expect(ev.value).toBe(resolvedValue);
      hookCalled = true;
    });

    builder.resolve(LinkPointer("name"), resolvedValue);

    expect(hookCalled).toBe(true);
  });

  it('sets all the type predicates to false when the type is set to undefined', () => {
    const builder = TypeBuilder(LinkPointer("name"));

    builder.setType(undefined);

    expect(builder.hasType).toBe(false);
    expect(builder.hasStringType).toBe(false);
    expect(builder.hasPointerType).toBe(false);
  });

  it('updates the type predicates when the type is set to a string', () => {
    const builder = TypeBuilder();

    builder.setType("string type");

    expect(builder.hasType).toBe(true);
    expect(builder.hasStringType).toBe(true);
    expect(builder.hasPointerType).toBe(false);
  });

  it('updates the type predicates when the type is set to a LinkPointer', () => {
    const builder = TypeBuilder();

    builder.setType(LinkPointer("name"));

    expect(builder.hasType).toBe(true);
    expect(builder.hasStringType).toBe(false);
    expect(builder.hasPointerType).toBe(true);
  });

  it('raises an event to request resolution when the type is set to a LinkPointer', () => {
    let hookCalled;
    const builder = TypeBuilder();
    builder.addHook("resolution requested", (type, ev) => {
      expect(type).toBe("resolution requested");
      expect(ev.pointers).toEqual([LinkPointer("name")]);
      hookCalled = true;
    });

    builder.setType(LinkPointer("name"));

    expect(hookCalled).toBe(true);
  });
});
