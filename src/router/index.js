import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/user/index'),
    hidden: true
  },
  {
    path: '/register',
    component: () => import('@/views/user/register'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/usercenter',
    name: 'UserCenter',
    hidden: true,
    component: Layout,
    // component: () => import('@/views/routePage'),
    meta: { title: '个人中心' },
    redirect: '/UserCenter/profile',
    key: '/UserCenter',
    children: [
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/user/usercenter'),
        meta: { title: '用户信息', icon: 'component', noCache: false },
        hidden: true
      }
    ]
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    // hidden: true,
    children: [{
      path: 'dashboard',
      name: '报表统计',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '报表统计', icon: 'dashboard' }
    }]
  },
  {
    path: '/SysConfig',
    component: Layout,
    redirect: 'noRedirect',
    name: '系统配置管理',
    meta: { title: '系统配置管理', icon: 'thunderbolt' },
    children: [
      {
        path: 'tag',
        name: '脚本标签',
        component: () => import('@/views/sysconfig/tag'),
        meta: { title: '脚本标签' }
      },
      {
        path: 'dangercmd',
        name: '危险命令',
        component: () => import('@/views/sysconfig/dangercmd'),
        meta: { title: '危险命令' }
      },
      {
        path: 'excutor',
        name: '执行器',
        component: () => import('@/views/sysconfig/excutor'),
        meta: { title: '执行器' }
      }
    ]
  },
  {
    path: '/TasksManager',
    component: Layout,
    name: '任务中心',
    redirect: 'noRedirect',
    meta: { title: '任务中心', icon: 'example' },
    children: [
      {
        path: 'scripts',
        name: '操作管理',
        redirect: 'noRedirect',
        component: () => import('@/views/routePage'),
        meta: { title: '操作管理' },
        children: [
          {
            path: 'scriptManager',
            name: '操作脚本管理',
            component: () => import('@/views/tasks/scripts/scriptManager'),
            meta: { title: '操作脚本管理' },
            key: '/TasksManager/scripts/scriptManager'
          },
          {
            path: 'myAudit',
            name: '我提交的脚本审核',
            component: () => import('@/views/tasks/audit/myaudit'),
            meta: { title: '我提交的脚本审核' },
            key: '/TasksManager/audit/myAudit'
          }
        ]
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
