import Vue from "vue";
import App from "./App.vue";

import vuex from "./index";

new Vue({
  store: vuex,
  render: (h) => h(App),
}).$mount("#app");
