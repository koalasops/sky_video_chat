import { createRouter, createWebHistory } from "vue-router";
import Home from '@/views/home';
import Room from '@/views/room';
import Login from '@/auth/login';
import Register from '@/auth/register';
const router = createRouter({
    history: createWebHistory(),
    routes:[
        {
            path: '/auth/register',
            name: 'register',
            component: Register,
        },
        {
            path: '/auth/login',
            name: 'login',
            component: Login
        },
        {
            path: '/',
            name: "home",
            component: Home,
            meta: {
                title: 'Dashboard'
            }
        },
        {
            path: '/room',
            name: "room",
            component: Room,
            meta: {
                title: 'ChatRoom'
            }
        }
    ]
});
router.afterEach((to, from, next) => {
    const titleFromParams = to.params?.pageTitle
    if(titleFromParams) {
        document.title = `${titleFromParams} - ${document.title}`
    } else {
        document.title = to.meta?.title ?? 'SkyWay'
    }
});
export default router;