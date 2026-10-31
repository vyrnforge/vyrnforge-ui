import { describe, expect, it } from 'vitest';
import {
  allowedInternalDependencies,
  frameworkPortNames,
  publicPackageNames,
  publicPackagePaths,
} from './public-package-model.mjs';

describe('public package model', () => {
  it('keeps package names unique and derives the expected workspace paths', () => {
    expect(new Set(publicPackageNames).size).toBe(publicPackageNames.length);
    expect(publicPackagePaths).toEqual(publicPackageNames.map((name) => `packages/${name}`));
  });

  it('keeps framework ports inside the public package set', () => {
    expect(frameworkPortNames.every((name) => publicPackageNames.includes(name))).toBe(true);
  });

  it('encodes the approved internal dependency graph', () => {
    expect(allowedInternalDependencies.core).toEqual([]);
    expect(allowedInternalDependencies.web).toEqual(['@vyrnforge/core']);
    expect(allowedInternalDependencies.icons).toEqual(['@vyrnforge/web']);

    for (const port of frameworkPortNames) {
      expect(allowedInternalDependencies[port]).toEqual(['@vyrnforge/core', '@vyrnforge/web']);
    }
  });

  it('only points dependency edges at declared public packages', () => {
    expect(Object.keys(allowedInternalDependencies).sort()).toEqual([...publicPackageNames].sort());

    for (const dependencies of Object.values(allowedInternalDependencies)) {
      for (const dependency of dependencies) {
        expect(dependency.startsWith('@vyrnforge/')).toBe(true);
        expect(publicPackageNames).toContain(dependency.slice('@vyrnforge/'.length));
      }
    }
  });
});
