import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'


VueRouter.prototype.goBack = function() {
    window.history.go(-1)
}
const originalPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}
Vue.use(VueRouter);

// 字段说明 K--keepAlive(缓存机制), R--requireAuth(是否需要登录), F--isFooter(底部是否隐藏), I--index(路由返回动画下标,路由层级越深,则index值要越大)
const routes = [
    {path: '/home', name: '首页', component: () => import('@/views/home'), meta: {I:1, K: true}},
    {path: '/article', name: '最近家谱', children:[], component: () => import('@/views/article'), meta: {I:2, K: true}},
    {path: '/article/t', name: '家谱详情', component: () => import('@/views/article_det'), meta: {I:3, F: true}},
    {path: '/article/edit', name: '家谱编辑', component: () => import('@/views/edit'), meta: {I:4, F: true}},
    {path: '/people', name: '公众人物', component: () => import('@/views/people'), meta: {I:5, K: true}},
    {path: '/people/t', name: '人物详情', component: () => import('@/views/people_det'), meta: {I:6, F: true}},
    {path: '/people/edit', name: '人物编辑', component: () => import('@/views/edit_people'), meta: {I:7, F: true}},
    {path: '/user', name: '用户信息', component: () => import('@/views/user'), meta: {I:8, K: true}},
    {path: '/chat', name: '即时聊', component: () => import('@/views/chat'), meta: {I:9, F: true}},
    {path: '/signup', name: '注册', component: () => import('@/views/signup'), meta: {I:30, F: true}},
    {path: '/signpwd', name: '找回密码', component: () => import('@/views/signpwd'), meta: {I:31, F: true}},
    {path: '/about', name: '关于我们', component: () => import('@/views/help'), meta: {I:20, F: true}},
    {path: '/help', name: '使用帮助', component: () => import('@/views/help'), meta: {I:21, F: true}},
    {path: '/terms', name: '协议条款', component: () => import('@/views/help'), meta: {I:22, F: true}},
    {path: '/mine', name: '我的', component: () => import('@/views/mine'), meta: {I:10, K: true}},
    {path: '/mine/manage', name: '任务处理', component: () => import('@/views/mine_manage'), meta: {I:11, F: true, R: true}},
    {path: '/mine/article', name: '我的家谱', component: () => import('@/views/mine_article'), meta: {I:12, F: true, R: true}},
    {path: '/mine/people', name: '家谱成员', component: () => import('@/views/mine_people'), meta: {I:13, F: true, R: true}},
    {path: '/mine/favorites', name: '我的收藏', component: () => import('@/views/mine_favorites'), meta: {I:14, F: true, R: true}},
    {path: '/mine/follows', name: '我的关注', component: () => import('@/views/mine_follows'), meta: {I:15, F: true, R: true}},
    {path: '/mine/comment', name: '我的留言', component: () => import('@/views/mine_comment'), meta: {I:16, F: true, R: true}},
    {path: '/mine/file', name: '我的文件', component: () => import('@/views/mine_file'), meta: {I:17, F: true, R: true}},
    {path: '/mine/setting', name: '信息设置', component: () => import('@/views/mine_setting'), meta: {I:18, F: true, R: true}},
    {path: '/mine/help', redirect: '/help'},
    {path: '/user/detail', redirect: '/author/detail'},
    // {path: '/', redirect: '/home'},
    {path: '/*', redirect: '/home'}
]

const router = new VueRouter({
    routes,
    linkActiveClass: 'active',
    linkExactActiveClass: 'active',
    scrollBehavior(to, from, savedPosition) {
        if (to.path == '/') {
            if (savedPosition) {
                return savedPosition
            } else {
                return {x: 0, y: 0 }
            }
        }

    }
})

router.beforeEach((to, from, next) => {
    if (to.meta.R) {
        if (store.getters.token) {
            next();
        } else {
            store.commit('SET_SIGNPOP', true)
        }
    } else {
        next();
    }
    if (to.name) {
        document.title = to.name + ' - 家谱网';
    }
})

export default router
