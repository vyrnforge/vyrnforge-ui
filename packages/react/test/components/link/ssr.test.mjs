import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from '@vyrnforge/react/link';
import { registerReactNativeControlSsrTest } from '../../../../../product/_test-support/native-controls/native-control-ssr.mjs';

await registerReactNativeControlSsrTest('link');

