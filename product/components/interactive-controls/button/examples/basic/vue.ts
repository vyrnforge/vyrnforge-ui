import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('div', { class: 'vf-example-stack' }, [
      h(Button, { variant: 'primary', type: 'button' }, () => 'Save changes'),
      h(Button, { variant: 'secondary', type: 'button' }, () => 'Preview'),
      h(Button, { variant: 'ghost', type: 'button' }, () => 'Cancel')
    ]);
  }
};

createApp(App).mount('#root');
