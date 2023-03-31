import Vue from 'vue'
import Vuex from 'vuex'
import user from './user'
import chat from './chat'
import getters from './getters'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        user,chat
    },
    getters
})

export default store
