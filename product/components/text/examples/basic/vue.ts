import { createApp, h } from 'vue';
import { Text } from '@vyrnforge/vue/text';

const App = {
  setup() {
    return () => h('div', { class: 'vf-example-stack' }, [
      h(Text, { as: 'h2', variant: 'heading' }, () => 'Typography foundation'),
      h(Text, { as: 'p' }, () => 'Native elements keep their semantics while VyrnForge supplies the visual typography contract.'),
      h(Text, { as: 'p', variant: 'body-sm' }, () => 'Small body text remains readable without becoming a new semantic element.'),
      h(Text, { variant: 'label' }, () => 'Account name'),
      h(Text, { as: 'h3', variant: 'title' }, () => 'Section title')
    ]);
  }
};

createApp(App).mount('#root');
