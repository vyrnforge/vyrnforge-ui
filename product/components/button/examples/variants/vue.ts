import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('div', { class: 'vf-example-stack' }, [
      h(Button, { variant: 'primary', type: 'button' }, () => 'Primary'),
      h(Button, { variant: 'secondary', type: 'button' }, () => 'Secondary'),
      h(Button, { variant: 'ghost', type: 'button' }, () => 'Ghost')
    ]);
  }
};

createApp(App).mount('#root');
