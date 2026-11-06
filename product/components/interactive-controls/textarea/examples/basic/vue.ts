import { defineComponent, h } from 'vue';
import { Textarea } from '@vyrnforge/vue/textarea';
import '@vyrnforge/web/styles/textarea.css';

export default defineComponent({
  setup() {
    return () => [
      h('label', { for: 'notes' }, 'Notes'),
      h(Textarea, { id: 'notes', name: 'notes', rows: 4, required: true }),
    ];
  },
});
