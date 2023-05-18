import { finalObject } from "@commonplace/utils";
import { LeafCache, LocalCache, PartRepository } from "@commonplace/core";
import { DocModelBuilderBuilder, EdlBuilder, LinkBuilder, MarkupBuilder, SpanBuilder } from "./test-builders2";
import { WellKnownObjectsPartFetcher, wellKnownParts } from '../well-known-objects';

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
    let builders = Object.entries(proxyBase).filter(([, val]) => val.build);
    builders.forEach(([, builder]) => builder.resolvePointer(nameLookup));
    let docuverse = Object.fromEntries(builders.map(([key, builder]) => [key, builder.build(proxyBase)]));
    let parts = proxyBase.allBuilders.map(builder => builder.getPart ? builder.getPart(proxyBase) : undefined)
      .filter(x => x && x.pointer && x.content);

    docuverse.cache = proxyBase.cache;
    docuverse.repo = proxyBase.repo;
    docuverse.cache.addParts(parts);
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

export function MockPartRepository(parts) {
  let repo = PartRepository(WellKnownObjectsPartFetcher());

  let obj = {
    repo,
    getPartLocally: pointer => repo.getPartLocally(pointer),
    addParts: parts => {
      parts.forEach(part => repo.cache.addPart(part));
    },
    getPart: repo.getPart,
    getManyParts: repo.getManyParts
  }

  obj.addParts(parts);
  return obj;
}

export function createTestCache(parts, includeWellKnownObjects) {
  let cache = LeafCache();
  let testCache = Object.create(LocalCache(cache));
  testCache.parts = [];
  testCache.addPart = part => {
    cache.addPart(part);
    testCache.parts.push(part);
  }
  if (includeWellKnownObjects) { wellKnownParts.forEach(part => testCache.addPart(part)); }
  parts.forEach(part => testCache.addPart(part));
  testCache.addParts = parts => parts.forEach(part => testCache.addPart(part));
  testCache.internalCache = cache;
  return testCache;
}

function makeDocuverseProxy() {
  let dv = {
    aSpan: SpanBuilder,
    aLink: LinkBuilder,
    aMarkupRule: MarkupBuilder,
    anEdl: EdlBuilder,
    aDocModelBuilder: DocModelBuilderBuilder,
    cache: createTestCache([], true),
    repo: MockPartRepository([]),
    allBuilders: []
  };
  return dv;
}

// eslint-disable-next-line no-undef
const makeProxy = (target, handler) => new Proxy(target, handler);
