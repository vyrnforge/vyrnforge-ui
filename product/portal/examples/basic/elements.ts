import { definePortalElement } from '@vyrnforge/elements/portal';
definePortalElement();
const host = document.createElement('div'); host.id = 'portal-host'; document.body.append(host);
const portal = document.createElement('vf-portal'); portal.setAttribute('target', '#portal-host'); portal.innerHTML = '<button>Portal action</button>'; document.querySelector('#root')!.append(portal);
