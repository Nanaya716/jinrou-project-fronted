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
          meta: { title: '人狼平台-首页' },
        }, {
          path: '/lobby',
          name: 'lobby',
          component: () => import('@/views/lobby.vue'),
          meta: { title: '人狼平台-房间大厅' },
        }, {
          path: '/room/:roomId',
          name: 'room',
          component: () => import('@/views/room.vue'),
          meta: { title: '人狼平台-村子' },
        }, {
          path: '/chatRoom',
          name: 'chatRoom',
          component: () => import('@/views/chatRoom.vue'),
          meta: { title: '人狼平台-休息室' },
        }, {
          path: '/KnowledgePage',
          name: 'KnowledgePage',
          component: () => import('@/views/KnowledgePage.vue'),
          meta: { title: '人狼手册' },
        },
        {
          path: '/userPage',
          name: 'userPage',
          component: () => import('@/views/userPage.vue'),
          meta: { title: '人狼平台-用户详情' },
        },
        {
          path: '/villageHistory',
          name: 'villageHistory',
          component: () => import('@/views/villageHistory.vue'),
          meta: { title: '战绩历史' },
        },
        {
          path: '/about',
          name: 'about',
          component: () => import('@/views/about.vue'),
          meta: { title: '人狼平台-关于' },
        },
        {
          path: '/user/:userId',
          name: 'UserProfile',
          component: () => import('@/views/UserProfile.vue'),
          meta: { title: '人狼平台-用户详情' },
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const store = useStore()

  // 检查 store.auth.user 是否存在且不为 null，并且试图访问登陆页，则重定向到主页
  if (store.auth.user && to.name.startsWith('welcome-')) {
    console.log("到主页")
    next('/')
  }
  // 检查 store.auth.user 是否存在且为 null，并且试图访问主页，则重定向到登陆页
  else if (store.auth.user == null && !to.name.startsWith('welcome-')) {
    console.log("到登录页")
    next('/welcome')
  } else {
    document.title = to.meta.title || '人狼平台'; // 如果没有设置 meta.title，则使用默认标题
    // 如果是 'room' 页面，使用 roomId 动态设置标题
    if (to.name === 'room' && to.params.roomId) {
      var title = `人狼平台-村子#${to.params.roomId}`; // 将 roomId 加入标题中
    }
    next()
  }
})


export default router
