import { defineComponent, h } from 'vue';
import { Input } from '@vyrnforge/vue/input';
import '@vyrnforge/web/styles/input.css';

export default defineComponent({
  setup() {
    return () => [
      h('label', { for: 'quantity' }, 'Quantity'),
      h(Input, { id: 'quantity', type: 'number', name: 'quantity', min: 0, step: 1 }),
      h('label', { for: 'starts-on' }, 'Starts on'),
      h(Input, { id: 'starts-on', type: 'date', name: 'startsOn' }),
      h('label', { for: 'accent' }, 'Accent color'),
      h(Input, { id: 'accent', type: 'color', name: 'accent', value: '#245edb' }),
    ];
  },
});
