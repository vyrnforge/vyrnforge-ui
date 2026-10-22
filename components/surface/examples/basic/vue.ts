import { defineComponent, h } from 'vue';
import { Surface } from '@vyrnforge/vue/surface';
import '@vyrnforge/web/styles/surface.css';

export default defineComponent({
  setup() {
    return () => h(Surface, { as: 'article' }, () => [
      h('h2', 'Release summary'),
      h('p', 'Surface supplies the visual boundary; application CSS owns spacing and layout.'),
    ]);
  },
});
