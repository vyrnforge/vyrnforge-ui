import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('div', { 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-wrap': 'wrap', 'data-vf-flow-gap': 'md', 'data-vf-flow-align': 'center' }, [
      h(Button, { variant: 'primary', type: 'button' }, () => 'Primary'),
      h(Button, { variant: 'secondary', type: 'button' }, () => 'Secondary'),
      h(Button, { variant: 'ghost', type: 'button' }, () => 'Ghost')
    ]);
  }
};

createApp(App).mount('#root');
