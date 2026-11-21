import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('div', { 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-wrap': 'wrap', 'data-vf-flow-gap': 'md', 'data-vf-flow-align': 'center' }, [
      h(Button, { size: 'sm', type: 'button' }, () => 'Small'),
      h(Button, { size: 'md', type: 'button' }, () => 'Medium'),
      h(Button, { size: 'lg', type: 'button' }, () => 'Large')
    ]);
  }
};

createApp(App).mount('#root');
