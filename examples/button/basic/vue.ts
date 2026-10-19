import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('div', { class: 'vf-example-stack' }, [
      h(Button, { variant: 'primary' }, () => 'Save changes'),
      h(Button, { variant: 'secondary' }, () => 'Preview'),
      h(Button, { variant: 'ghost' }, () => 'Cancel')
    ]);
  }
};

createApp(App).mount('#root');
