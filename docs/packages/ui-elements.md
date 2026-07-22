# `@vyrnforge/ui-elements` — Foundation Current

## Purpose

Browser-native Custom Element foundation for public non-grid VyrnForge
components and plain HTML consumption.

## Current scope

- server-safe `VyrnForgeElement` base class;
- pre-upgrade property preservation;
- idempotent `vf-*` registration helper;
- canonical bubbling/composed event helpers;
- explicit `@vyrnforge/ui-elements/register` entry point;
- Light DOM package CSS based on shared `--vf-*` tokens.

Public component tags, form-associated controls, overlays, and framework
consumer support remain S6/S7 work. The current foundation does not claim GMF4
runtime compatibility.
