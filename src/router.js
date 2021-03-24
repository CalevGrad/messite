import Vue from 'vue'
import Router from 'vue-router'
import Auth from "@/views/Auth";
import Mail from "@/views/Mail";

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Mail,
        },
        {
            path: '/auth/',
            component: Auth,
        }
    ]
})