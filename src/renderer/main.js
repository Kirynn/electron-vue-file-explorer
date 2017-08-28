import Vue from 'vue'
import axios from 'axios'

import VueEvents from 'vue-events'
import App from './App'
import router from './router'
import store from './store'


Vue.use(require('vue-electron'))
Vue.use(VueEvents)

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    template: '<App/>'
}).$mount('#app')