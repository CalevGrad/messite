import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

Vue.mixin({
    data() {
        return {
            ADDRS: 'http://127.0.0.1:8000/api',
            COUNT_MESSAGES: 20,
            COUNT_MESSAGES_FOR_UPDATE: 5,
        }
    }
})

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
