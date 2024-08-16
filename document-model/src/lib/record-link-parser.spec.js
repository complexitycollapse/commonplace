import { describe, it, expect } from '@jest/globals';
import { RecordLinkParser } from './record-link-parser';
import { Link, LinkPointer } from '@commonplace/core';

describe('RecordLinkParser', () => {
  it ('returns an empty list when there are no ends in the link', () => {
    expect(RecordLinkParser(Link(undefined), ["1st", "2nd"])).toEqual([]);
  });

  it ('returns an empty list when there are no records', () => {
    expect(RecordLinkParser(Link(undefined, ["invalid", []], ["also invalid", []]), ["1st", "2nd"])).toEqual([]);
  });

  it ('returns a record if a single field is found', () => {
    expect(RecordLinkParser(Link(undefined, ["invalid", []], ["1st", []]), ["1st", "2nd"])).toHaveLength(1);
  });

  it ('returns a record if multiple fields are found', () => {
    expect(RecordLinkParser(Link(undefined, ["1st", []], ["2nd", []]), ["1st", "2nd"])).toHaveLength(1);
  });

  it ('sets properties on returned objects to the end pointers of the matching ends', () => {
    let record = RecordLinkParser(Link(undefined, ["1st", [LinkPointer("1")]], ["2nd", [LinkPointer("2")]]), ["1st", "2nd"])[0];

    expect(record["1st"]).toEqual([LinkPointer("1")]);
    expect(record["2nd"]).toEqual([LinkPointer("2")]);
  });

  it ('ignores unrecognised properties in a record', () => {
    let record = RecordLinkParser(Link(undefined, ["1st", [LinkPointer("1")]], ["unrecognised", []], ["2nd", [LinkPointer("2")]]), ["1st", "2nd"])[0];

    expect(record["1st"]).toEqual([LinkPointer("1")]);
    expect(record["2nd"]).toEqual([LinkPointer("2")]);
  });

  it ('creates a second record whenever we go back to a previous field', () => {
    expect(RecordLinkParser(Link(undefined, ["2nd", []], ["1st", []]), ["1st", "2nd"])).toHaveLength(2);
  });

  it ('sets properties on the appropriate record', () => {
    let records = RecordLinkParser(Link(undefined, ["2nd", [LinkPointer("2")]], ["1st", [LinkPointer("1")]]), ["1st", "2nd"]);

    expect(records[1]["1st"]).toEqual([LinkPointer("1")]);
    expect(records[0]["2nd"]).toEqual([LinkPointer("2")]);
  });
});
