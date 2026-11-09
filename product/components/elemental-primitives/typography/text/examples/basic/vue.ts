import { createApp, h } from 'vue';
import { Text } from '@vyrnforge/vue/text';

const App = {
  setup() {
    return () => h('div', { class: 'vf-example-stack' }, [
      h(Text, { as: 'h2', variant: 'heading-md' }, () => 'Typography foundation'),
      h(Text, { as: 'p', variant: 'body-md' }, () => 'Native elements keep their semantics while VyrnForge supplies the visual typography contract.'),
      h(Text, { as: 'blockquote', variant: 'body-lg' }, () => 'Semantic quotation with an independent visual role.'),
      h(Text, { as: 'mark', variant: 'body-md' }, () => 'Important annotation'),
      h(Text, { as: 'time', variant: 'caption', datetime: '2026-11-10' }, () => 'November 10, 2026')
    ]);
  }
};

createApp(App).mount('#root');
