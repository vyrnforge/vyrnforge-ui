import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('div', { 'data-vf-flow': '', 'data-vf-flow-direction': 'inline', 'data-vf-flow-wrap': 'wrap', 'data-vf-flow-gap': 'md', 'data-vf-flow-align': 'center' }, [
      h(Button, { variant: 'primary', type: 'button' }, () => 'Save changes'),
      h(Button, { variant: 'secondary', type: 'button' }, () => 'Preview'),
      h(Button, { variant: 'ghost', type: 'button' }, () => 'Cancel')
    ]);
  }
};

createApp(App).mount('#root');
