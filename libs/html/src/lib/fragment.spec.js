import { test, expect, describe, it } from '@jest/globals';
import { testing, Endset, Link } from '@commonplace/core';
import { Fragment, RootFragment } from './fragment';

let makeSpan = testing.spans.makeSpan;

function make(edit) {
  let endset = Endset(undefined, [edit]);
  return Fragment(edit, endset, Link("test", endset));
}

function engulfedFragment(f) {
  return Fragment(f.edit.clone({length: f.edit.length - 1}));
}

function mock(tryAddResult, edit) {
  let obj = {
    edit,
    children: [],
    tryAdd(frag) { 
      if (tryAddResult === "engulfs") {
        obj.children.push(frag);
      }
      return tryAddResult; 
    }
  };

  return obj;
}

describe('tryAdd', () => {
  it('returns "engulfs" if this engulfs that', () => {
    let us = make(makeSpan());
    let that = make(us.edit.clone({length: 1}));

    expect(us.tryAdd(that)).toBe("engulfs");
  });

  it('returns "engulfs" if the fragment is the RootFragment', () => {
    let us = RootFragment();
    let that = make(makeSpan());

    expect(us.tryAdd(that)).toBe("engulfs");
  });

  it('returns "engulfedBy" if this engulfs that', () => {
    let that = make(makeSpan());
    let us = make(that.edit.clone({length: 1}));

    expect(us.tryAdd(that)).toBe("engulfedBy");
  });

  it('returns "engulfedBy" if that is the root fragment', () => {
    let us = make(makeSpan());
    let that = RootFragment();

    expect(us.tryAdd(that)).toBe("engulfedBy");
  });

  it('returns "overlapping" if this overlaps that', () => {
    let that = make(makeSpan());
    let us = make(that.edit.clone({start: that.edit.start + 1}));

    expect(us.tryAdd(that)).toBe("overlapping");
  });

  it('returns "separate" if the fragments do not overlap', () => {
    let that = make(makeSpan());
    let us = make(that.edit.clone({start: that.edit.next}));

    expect(us.tryAdd(that)).toBe("separate");
  });

  it('adds the fragment as a child if this engulfs it', () => {
    let us = make(makeSpan());
    let that = make(us.edit.clone({length: 1}));

    us.tryAdd(that);

    expect(us.children).toEqual([that]);
    expect(us.children[0]).toBe(that);
  });

  describe('handling children', () => {
    it('adds the fragment as a child to the RootFragment', () => {
      let us = RootFragment();
      let that = make(makeSpan());
  
      us.tryAdd(that);
  
      expect(us.children).toEqual([that]);
      expect(us.children[0]).toBe(that);
    });
  
    it('does not add the fragment as a child if this is engulfed by it', () => {
      let that = make(makeSpan());
      let us = make(that.edit.clone({length: 1}));
  
      us.tryAdd(that);
  
      expect(us.children).toEqual([]);
    });
  
    it('does not add the fragment as a child if this is separate from it', () => {
      let that = make(makeSpan());
      let us = make(that.edit.clone({start: that.edit.next}));
  
      us.tryAdd(that);
  
      expect(us.children).toEqual([]);
    });
  
    it('does not add the fragment as a child if this overlaps it', () => {
      let that = make(makeSpan());
      let us = make(that.edit.clone({start: that.edit.start + 1}));
  
      us.tryAdd(that);
  
      expect(us.children).toEqual([]);
    });
  });

  describe('handling grandchildren', () => {
    it('adds the fragment if it is separate from the child', () => {
      let parent = Fragment(makeSpan());
      parent.children.push(mock("separate"));
      let that = engulfedFragment(parent);

      parent.tryAdd(that);

      expect(parent.children).toContain(that);
    });

    it('adds the fragment to the child rather than the parent if the child engulfs it', () => {
      let parent = Fragment(makeSpan());
      let child = mock("engulfs");
      parent.children.push(child);
      let that = engulfedFragment(parent);

      let result = parent.tryAdd(that);

      expect(result).toBe("engulfs");
      expect(parent.children).not.toContain(that);
      expect(child.children).toContain(that);
    });

    it('interposes the new fragment if it engulfs a child', () => {
      let parent = Fragment(makeSpan());
      let that = engulfedFragment(parent);
      let child = mock("engulfedBy", that.edit.clone({length: 1}));
      parent.children.push(child);

      let result = parent.tryAdd(that);

      expect(result).toBe("engulfs");
      expect(parent.children).toContain(that);
      expect(that.children).toContain(child);
    });

    it('interposes all children that it engulfs', () => {
      let parent = Fragment(makeSpan({length: 100}));
      let that = Fragment(parent.edit.clone({length: 50}));
      let engulfedChild1 = Fragment(parent.edit.clone({length: 20}));
      let engulfedChild2 = Fragment(parent.edit.clone({start: engulfedChild1.edit.next, length: 20}));
      parent.children.push(engulfedChild1);
      parent.children.push(engulfedChild2);

      let result = parent.tryAdd(that);
      
      expect(result).toBe("engulfs");
      expect(parent.children).not.toContain(engulfedChild1);
      expect(parent.children).not.toContain(engulfedChild2);
      expect(that.children).toContain(engulfedChild1);
      expect(that.children).toContain(engulfedChild2);
    });

    it('only interposes children it engulfs', () => {
      let parent = Fragment(makeSpan({length: 100}));
      let that = Fragment(parent.edit.clone({length: 50}));
      let engulfedChild = Fragment(parent.edit.clone({length: 20}));
      let nonEngulfedChild = Fragment(parent.edit.clone({start: that.edit.next, length: 20}));
      parent.children.push(engulfedChild);
      parent.children.push(nonEngulfedChild);

      let result = parent.tryAdd(that);
      
      expect(result).toBe("engulfs");
      expect(parent.children).toContain(nonEngulfedChild);
      expect(that.children).not.toContain(nonEngulfedChild);
    });

    it('does not add engulfing fragment if it overlaps a different child', () => {
      let parent = Fragment(makeSpan({length: 100}));
      let that = Fragment(parent.edit.clone({length: 50}));
      let engulfedChild = Fragment(parent.edit.clone({length: 20}));
      let overlappingChild = Fragment(parent.edit.clone({start: that.edit.next - 1, length: 50}));
      parent.children.push(engulfedChild);
      parent.children.push(overlappingChild);

      let result = parent.tryAdd(that);
      
      expect(result).toBe("overlapping");
      expect(parent.children).not.toContain(that);
    });
  });
});
