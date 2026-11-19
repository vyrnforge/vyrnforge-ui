import { defineComponent, h } from 'vue';
import '@vyrnforge/web/styles/layout.css';

export const AccountOverview = defineComponent({
  setup() {
    return () => h('main', { style: { maxInlineSize: '64rem', marginInline: 'auto', paddingInline: 'var(--vf-space-md)' } }, [
      h('section', { 'data-vf-flow': '', 'data-vf-flow-gap': 'lg', 'aria-labelledby': 'account-heading' }, [
        h('header', { 'data-vf-flow': '', 'data-vf-flow-gap': 'xs' }, [
          h('h2', { id: 'account-heading' }, 'Account overview'), h('p', 'Review workspace details and recent activity.'),
        ]),
        h('div', { 'data-vf-auto-grid': '', 'data-vf-auto-grid-gap': 'md' }, [
          h('article', 'Profile settings'), h('article', 'Team access'), h('article', 'Recent activity'),
        ]),
        h('div', { 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-wrap': 'wrap', 'data-vf-flow-gap': 'sm' }, [
          h('button', { type: 'button' }, 'Edit profile'), h('button', { type: 'button' }, 'Manage team'),
        ]),
      ]),
    ]);
  },
});
