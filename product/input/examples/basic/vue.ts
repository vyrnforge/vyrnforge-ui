import { defineComponent, h } from 'vue';
import { Input } from '@vyrnforge/vue/input';
import '@vyrnforge/web/styles/input.css';

export default defineComponent({
  setup() {
    return () => [
      h('label', { for: 'email' }, 'Email'),
      h(Input, { id: 'email', type: 'email', name: 'email', autocomplete: 'email', required: true }),
    ];
  },
});
