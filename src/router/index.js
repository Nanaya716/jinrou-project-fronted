import { createRouter, createWebHistory } from 'vue-router'
import { useStore } from "@/stores";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/welcome',
      name: 'welcome',
      redirect: '/welcome-login',  // 或者其他你希望的默认子路由
      component: () => import('@/views/WelcomeView.vue'),
      children: [
        {
          path: '/welcome',
          name: 'welcome-login',
          component: () => import('@/components/welcome/LoginPage.vue')
        }, {
          path: '/register',
          name: 'welcome-register',
          component: () => import('@/components/welcome/RegisterPage.vue')
        }, {
          path: '/forget',
          name: 'welcome-forget',
          component: () => import('@/components/welcome/ForgetPage.vue')
        }
      ]
    }, {
      path: '/',
      name: 'index',
      component: () => import('@/views/IndexView2.vue'),
      redirect: '/main',
      children: [
        {
          path: '/main',
          name: 'main',
          component: () => import('@/views/main.vue'),
        }, {
          path: '/lobby',
          name: 'lobby',
          component: () => import('@/views/lobby.vue'),
        }, {
          path: '/room/:roomId',
          name: 'room',
          component: () => import('@/views/room.vue'),
        },{
          path: '/chatRoom',
          name: 'chatRoom',
          component: () => import('@/views/chatRoom.vue'),
        },{
          path: '/KnowledgePage',
          name: 'KnowledgePage',
          component: () => import('@/views/KnowledgePage.vue'),
        },
        {
          path: '/userPage',
          name: 'userPage',
          component: () => import('@/views/userPage.vue'),
        },
        {
          path: '/villageHistory',
          name: 'villageHistory',
          component: () => import('@/views/villageHistory.vue'),
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('@/views/about.vue'),
        },
        {
          path: '/user/:userId',
          name: 'UserProfile',
          component: () => import('@/views/UserProfile.vue'),
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const store = useStore()

  console.log(store.auth.user)
  // 检查 store.auth.user 是否存在且不为 null，并且试图访问登陆页，则重定向到主页
  if (store.auth.user && to.name.startsWith('welcome-')) { 
    next('/')
  }
  // 检查 store.auth.user 是否存在且为 null，并且试图访问主页，则重定向到登陆页
  else if (store.auth.user == null && !to.name.startsWith('welcome-')) {
    next('/welcome')
  } else {
    next()
  }
})
  

export default router
