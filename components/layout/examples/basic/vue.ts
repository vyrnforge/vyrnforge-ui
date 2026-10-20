import { defineComponent, h } from 'vue';
import { Container, Stack } from '@vyrnforge/vue/layout';

export const AccountOverview = defineComponent({
  setup() {
    return () => h(Container, { as: 'main', size: 'lg', gutter: 'md' }, () =>
      h(Stack, { as: 'section', gap: 'lg', 'aria-labelledby': 'account-heading' }, () => [
        h(Stack, { as: 'header', gap: 'xs' }, () => [
          h('h2', { id: 'account-heading' }, 'Account overview'),
          h('p', 'Review workspace details and recent activity.'),
        ]),
        h(Stack, { direction: 'inline', gap: 'sm', align: 'center' }, () => [
          h('button', { type: 'button' }, 'Edit profile'),
          h('button', { type: 'button' }, 'Manage team'),
        ]),
      ])
    );
  },
});
