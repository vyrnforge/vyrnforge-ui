import { createApp, h } from 'vue';
import { Portal } from '@vyrnforge/vue/portal';
const host = document.createElement('div'); host.id = 'portal-host'; document.body.append(host);
createApp({ render: () => h(Portal, { to: host }, () => h('button', 'Portal action')) }).mount('#root');
