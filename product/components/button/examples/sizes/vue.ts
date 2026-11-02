import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('div', { class: 'vf-example-stack' }, [
      h(Button, { size: 'sm', type: 'button' }, () => 'Small'),
      h(Button, { size: 'md', type: 'button' }, () => 'Medium'),
      h(Button, { size: 'lg', type: 'button' }, () => 'Large')
    ]);
  }
};

createApp(App).mount('#root');
