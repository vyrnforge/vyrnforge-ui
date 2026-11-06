import { createApp, h } from 'vue';
import { Button } from '@vyrnforge/vue/button';

const App = {
  setup() {
    return () => h('form', {
      class: 'vf-example-stack',
      onSubmit: (event: Event) => event.preventDefault()
    }, [
      h('label', { for: 'vf-button-form-value' }, 'Example value'),
      h('input', { id: 'vf-button-form-value', name: 'example', value: 'Original' }),
      h(Button, { type: 'submit', variant: 'primary' }, () => 'Submit form'),
      h(Button, { type: 'reset', variant: 'secondary' }, () => 'Reset form'),
      h(Button, { type: 'button', variant: 'ghost' }, () => 'Other action')
    ]);
  }
};

createApp(App).mount('#root');
