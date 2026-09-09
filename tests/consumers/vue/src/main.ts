import { createApp } from "vue";
import { VyrnForgeVue } from "@vyrnforge/ui-vue";

import "@vyrnforge/ui-core/styles/index.css";
import "@vyrnforge/ui-elements/styles/index.css";

import App from "./App.vue";
import "./styles.css";

createApp(App).use(VyrnForgeVue).mount("#app");
