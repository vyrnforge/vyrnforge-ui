import { defineComponent, h } from 'vue';
import { Icon } from '@vyrnforge/vue/icon';
import { bookmarkIcon } from '@vyrnforge/web/icon';

export default defineComponent({ setup: () => () => h(Icon, { icon: bookmarkIcon, variant: 'outlined', shape: 'rounded', label: 'Bookmark' }) });
