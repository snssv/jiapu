<template lang="pug">
    #app
        <!--.postLock(:class="{show:$lock}")-->
        signin
        .home(:class="{mini:mini}")
            .left(v-if="userInfo")
                .mini_toggle
                    i.el-icon-s-unfold(@click="mini=false" v-if="mini")
                    i.el-icon-s-fold(@click="mini=true" v-if="!mini")
                .head
                    h1 管理后台
                    p 欢迎您：{{userInfo.nickname}}
                    el-button(type="primary" size="small" icon="el-icon-arrow-left" @click.native="logout()") 退出
                ul.menu
                    li(v-for="it in menu")
                        router-link(:to="it.url", :exact="it.url=='capital'")
                            i(:class="'el-icon-'+it.ico")
                            span {{it.txt}}
                    //-li
                        i.el-icon-odometer
                        span 总工作台

            .right
                transition
                    router-view
</template>

<script>
    import { mapGetters } from "vuex"
    import signin from './views/signin'

    export default {
        data(){
            return {
                mini:false,
                menu:[
                    {txt:'所有家谱', ico:'document-copy', url:'/article'},
                    {txt:'家谱人物', ico:'collection', url:'/people'},
                    {txt:'评论管理', ico:'chat-line-square', url:'/comment'},
                    {txt:'邮件管理', ico:'message', url:'/smtp'},
                    {txt:'短信发送', ico:'mobile-phone', url:'/sms'},
                    // {txt:'站内消息', ico:'chat-dot-round', url:'/message'},
                    {txt:'用户管理', ico:'user', url:'/user'},
                    {txt:'设备限制', ico:'turn-off-microphone', url:'/black'},
                    {txt:'文件管理', ico:'receiving', url:'/file'},
                    {txt:'搜索记录', ico:'search', url:'/search'},
                    {txt:'访问统计', ico:'pie-chart', url:'/view'},
                    {txt:'系统设置', ico:'setting', url:'/setting'},
                    {txt:'文档编辑', ico:'edit', url:'/document'},
                ]
            }
        },
        name: 'App',
        computed: {
            ...mapGetters(["userInfo"])
        },
        components: {
            signin
        },
        mounted(){
            // this.getData()
        },
        methods:{
            logout(){
                this.$store.dispatch('SignOut');
                location.reload()
            },
            getData(){
                this.$get('article').then((res) =>{
                    this.items = res[0];
                    this.total = res[1];
                })
            }
        }
    }
</script>

