import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('div', { class: 'vf-example-stack' }, [
      h(Button, { type: 'button' }, () => 'Ready'),
      h(Button, { variant: 'secondary', disabled: true, type: 'button' }, () => 'Disabled'),
      h(Button, { loading: true, type: 'button' }, () => 'Loading'),
      h(Button, { loading: true, disabled: true, type: 'button' }, () => 'Loading and disabled')
    ]);
  }
};

createApp(App).mount('#root');
