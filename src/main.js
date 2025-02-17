import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useStore } from '@/stores';

import App from './App.vue'
import router from './router'
import 'element-plus/dist/index.css'
import axios from "axios";

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  if (import.meta.hot) {
    import.meta.hot.accept((updatedModules) => {
      console.log('文件变更了：', updatedModules);
    });
  }

  
axios.defaults.baseURL = 'http://localhost:8081'

app.use(createPinia())
app.use(router)
const store = useStore();
store.initializeAuth();
app.mount('#app')
