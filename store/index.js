import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const state = {
	eventCover: {
	    style: { display: "",opacity: ""}
	  },
}
const store = new Vuex.Store({
    state,
    mutations: {},
    actions: {}
})
export default store