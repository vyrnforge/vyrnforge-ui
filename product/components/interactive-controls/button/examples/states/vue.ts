import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('div', { 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-wrap': 'wrap', 'data-vf-flow-gap': 'md', 'data-vf-flow-align': 'center' }, [
      h(Button, { type: 'button' }, () => 'Ready'),
      h(Button, { variant: 'secondary', disabled: true, type: 'button' }, () => 'Disabled'),
      h(Button, { loading: true, type: 'button' }, () => 'Loading'),
      h(Button, { loading: true, disabled: true, type: 'button' }, () => 'Loading and disabled')
    ]);
  }
};

createApp(App).mount('#root');
