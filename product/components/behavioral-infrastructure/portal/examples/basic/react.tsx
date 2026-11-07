import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Portal } from '@vyrnforge/react/portal';
const host = document.createElement('div'); host.id = 'portal-host'; document.body.append(host);
createRoot(document.querySelector('#root')!).render(createElement(Portal, { target: host }, createElement('button', null, 'Portal action')));
