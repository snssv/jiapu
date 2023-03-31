import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

import Home from '@/views/home'
import People from '@/views/people'
import User from '@/views/user'
import Black from '@/views/black'
import Comment from '@/views/comment'
import File from '@/views/file'
import Sms from '@/views/sms'
import Smtp from '@/views/smtp'
import Message from '@/views/message'
import Search from '@/views/search'
import View from '@/views/view'
import Setting from '@/views/setting'
import Document from '@/views/document'

VueRouter.prototype.goBack = function() {
    // this.isBack = true
    window.history.go(-1)
}

Vue.use(VueRouter);

// 字段说明 K--keepAlive(缓存机制), R--requireAuth(是否需要登录), F--isFooter(底部是否显示), I--index(路由返回动画下标,路由层级越深,则index值要越大)
const routes = [
    // {path: '/', name: '所有家谱', component: Home, meta: {K: true}},
    {path: '/article', name: '所有家谱', component: Home, meta: {K: true}},
    {path: '/people', name: '家谱人物', component: People, meta: {K: true}},
    {path: '/black', name: '设置限制', component: Black, meta: {K: true}},
    {path: '/user', name: '所有用户', component: User, meta: {K: true}},
    {path: '/comment', name: '评论管理', component: Comment, meta: {K: true}},
    {path: '/file', name: '文件管理', component: File, meta: {K: true}},
    {path: '/sms', name: '短信发送', component: Sms, meta: {K: true}},
    {path: '/smtp', name: '邮件记录', component: Smtp, meta: {K: true}},
    {path: '/message', name: '站内消息', component: Message, meta: {K: true}},
    {path: '/view', name: '访问统计', component: View, meta: {K: true}},
    {path: '/search', name: '搜索记录', component: Search, meta: {K: true}},
    {path: '/setting', name: '系统设置', component: Setting, meta: {K: true}},
    {path: '/document', name: '文档编辑', component: Document, meta: {K: true}},


    {path: '/*', redirect: '/article'}
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
    if (store.getters.userInfo) {
        next();
    } else {
        store.commit('SET_USER', null)
    }

    if (to.name) {
        document.title = 'D-'+ to.name;
    }
})

export default router
