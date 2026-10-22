import { defineComponent, h } from 'vue';
import { VisuallyHidden } from '@vyrnforge/vue/visually-hidden';

export default defineComponent({
  setup: () => () => h(VisuallyHidden, null, () => 'Notifications'),
});
