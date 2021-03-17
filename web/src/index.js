import state from "./store/state";
import mutations from "./store/mutations";
import actions from "./store/actions";
import getters from "./store/getters";

import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
  state,
  mutations,
  actions,
  getters,
});

export default store;
