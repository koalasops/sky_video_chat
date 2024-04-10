import './assets/css/main.css';
import 'primeicons/primeicons.css'
import { createApp } from 'vue'
import App from './App.vue'
import Layout from '@/layouts'
import router from '@/router';

import { supabase } from "@/utils/supabase.js";
window.supabase = supabase;
createApp(App).use(router)
.component('Layout', Layout).mount('#app')
