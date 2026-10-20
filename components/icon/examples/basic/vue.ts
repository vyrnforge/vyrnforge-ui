import { createApp, h } from 'vue';
import { Icon } from '@vyrnforge/vue/icon';
import { bookmarkIcon } from '@vyrnforge/icons/bookmark';

const App = {
  setup() {
    return () => h(Icon, { icon: bookmarkIcon, variant: 'outlined', shape: 'rounded', label: 'Bookmark' });
  }
};

createApp(App).mount('#root');
