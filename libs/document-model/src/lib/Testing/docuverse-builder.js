import { finalObject } from "@commonplace/utils";
import { testing } from "@commonplace/core";
import { DocModelBuilderBuilder, EdlBuilder, LinkBuilder, SpanBuilder } from "./test-builders2";

export function DocuverseBuilder() {
  let proxyBase = makeDocuverseProxy();
  let requirements = new Map();
  let obj = {};

  function add(descriptionFn) {
    let proxy = makeProxy(proxyBase, {
      get(target, name) {
        if (Object.hasOwn(proxyBase, name)) { return proxyBase[name]; }
        if (requirements.has(name)) { return requirements.get(name); }
        else {
          let newBuilder = BuilderProxy(name);
          requirements.set(name, newBuilder);
          return newBuilder;
        }
      }
    });

    let next = descriptionFn(proxy);
    Object.assign(proxyBase, next);

    return obj;
  }

  function build() {
    for (let builderProxy of requirements.values()) {
          builderProxy.wrap(proxyBase);
    }

    let nameLookup = new Map(Object.entries(proxyBase).map(([key, value]) => [value, key]));
    let builders = Object.entries(proxyBase).filter(([key, val]) => val.build);
    builders.forEach(([key, builder]) => builder.resolvePointer(nameLookup));
    let docuverse = Object.fromEntries(builders.map(([key, builder]) => [key, builder.build(proxyBase)]));
    let parts = builders.map(([key, builder]) => builder.getPart ? builder.getPart(proxyBase) : undefined)
      .filter(x => x && x.pointer && x.content);

    docuverse.repo = proxyBase.repo;
    docuverse.repo.addParts(parts);

    return docuverse;
  }

  return finalObject(obj, {
    add,
    build
  });
}

function BuilderProxy(name) {
  let wrapped = undefined;
  return makeProxy({
    wrap(builders) {
      if (Object.hasOwn(builders, name)) {
        wrapped = builders[name];
      } else {
        throw "Undefined symbol in docuverse: " + name;
      }
    }
  }, {
    get(target, name) {
      if (name === "wrap") {
        return target[name];
      }
      return wrapped[name];
    },
    set(target, name, val) {
      wrapped[name] = val;
    }
  });
}

function makeDocuverseProxy() {
  let dv = {
    aSpan: SpanBuilder,
    aLink: LinkBuilder,
    anEdl: EdlBuilder,
    aDocModelBuilder: DocModelBuilderBuilder,
    repo: testing.MockPartRepository([])
  };
  return dv;
}

// eslint-disable-next-line no-undef
const makeProxy = (target, handler) => new Proxy(target, handler);
