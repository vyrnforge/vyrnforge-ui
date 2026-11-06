import { defineComponent, h } from 'vue';
import { Separator } from '@vyrnforge/vue/separator';

export default defineComponent({
  setup: () => () => [h('p', 'Account'), h(Separator), h('p', 'Security')],
});
