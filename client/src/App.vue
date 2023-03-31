<template lang="pug">
    #app(:class="{ishome: $route.path=='/people' || $route.path =='/article', ischat:/chat/.test($route.path)}")
        //.loading(ref="loading" :class="{active:$lock}")
        signin
        header.hide_mob

            a.logo(href="/#/home")
            .menu
                router-link(to="/article", :class="{active:(/article/.test($route.path) || $route.path=='/')}") 附近家谱
                router-link(to="/people", :exact="'capital'=='/people'") 公众人物

            .right
                router-link(to="/article/edit", :exact="'capital'=='/article/edit'")
                    i.icon-edit
                    span 创建
                //router-link(to="/chat", :exact="'capital'=='/chat'")
                //    i.icon-loudspeaker
                //    span 闲聊
                router-link(to="/mine", :exact="'capital'=='/mine'")
                    i.icon-user-o
                    span(v-if="token && userInfo") 欢迎，{{userInfo.nickname || '佚名1984'}}
                    span(v-else) 个人中心

        header.hide_pc(v-if="$route.path=='/home'")
            .logo
        header.hide_pc(v-else)
            i.close.icon-close(v-if="isDet" @click="close")
            .back.logo(@click="back")
            //i.back.icon-angle-left(@click="back")
            .tit {{this.$route.name}}
            i.icon-menu(@click="showMenu = !showMenu" v-if="$route.path.indexOf('mine/') >= 0" )

        .search_bg(:class="{show:hotPop}" @click="hotPop=false")
        .search_box
            i.icon-search.toggle_ico(v-if="!hotMob" @click="hotMob=!hotMob")
            .search(:class="{show:hotMob}")
                span
                    input.inp(type="search" placeholder="关键词搜索", v-model="key" @focus="hotPop=true" @keyup.enter="search")
                span.btnx(@click="search")
                    i.icon-search
            .hot_key(:class="{show:hotPop}" @click="hotPop=hotMob=false")
                .con
                    .label(v-for="it in hotKey" @click="hotSet(it.keyword)")
                        b {{it.keyword}}
                        //sup {{it.count}}


        .hide_pc.nav_menu(:class="{show:showMenu}" @click="showMenu=false")
            Menu.root(@hideMenu="showMenu=false")
        .main
            transition(:name="transitionName" :searchKey="key")
                keep-alive
                    router-view.router-view
        footer(:class="{hide:this.$route.meta.F}")
            ul
                li(@click="key=null")
                    router-link(to="/article", :class="{active:($route.path=='/article' || $route.path=='/')}")
                        i.icon-clans
                        span 家谱
                li
                    router-link(to="/people", :exact="'capital'=='/people'")
                        i.icon-users
                        span 人物
                li
                    router-link(to="/article/edit", :exact="'capital'=='/article/edit'")
                        i.icon-edit
                        span 创建
                li
                    router-link(to="/help", :exact="'capital'=='/chat'")
                        i.icon-menu7
                        span 帮助
                li
                    router-link(to="/mine", :exact="'capital'=='/mine'")
                        i.icon-user-o
                        span 我的

        calendar(:class="{show:calenPop}")


</template>

<script>
    import Menu from '@/views/mine_menu'
    import { mapGetters } from "vuex"
    import signin from './views/signin'
    import { regUrl} from "./utils/validate";
    import calendar from './views/mo_calendar'

    export default {
        data(){
            return {
                showMenu: false,
                key: this.$route.query.key,
                transitionName: '',
                hotKey:null,
                hotPop:false,
                hotMob:false, // 移动端搜索框显示/隐藏
                isDet: /detail/.test(this.$route.path) && history.length<3
            }
        },
        name: 'App',
        computed: {
            ...mapGetters(["userInfo","calenPop","token"])
        },
        components: {
            signin,calendar,Menu
        },
        mounted(){
            this.getHotKey()
        },
        methods:{
            signout(){
                this.$store.dispatch('SignOut')
            },
            search(){
                let t = this.key;
                if(t){
                    t = decodeURIComponent(t.trim());
                }
                this.key = t;
                // console.log(t)
                if(this.key!=this.$route.query.key){
                    this.$router.push(this.$route.path+'?key='+t)
                }
                this.hotPop = false;
                this.hotMob = false;
            },
            getHotKey(){
                this.$get('search/hot').then(res =>{
                    if(res && !res.data){
                        this.hotKey = res[0]
                    }
                }).catch(err=>{})

                if(this.token){
                    this.$get('message/new').then((res) =>{
                        if(res && !res.data){
                            // console.log(res)
                        }
                    }).catch(err=>{
                    })

                }
            },
            hotSet(t){
                this.key = t;
                this.search()
            },
            back(){
                this.$router.push(this.$route.path=='/article'?'/home':'/')
                // if(history.length<3){
                //     this.$router.push('/')
                // }else {
                //     this.$router.back()
                // }
            },
            close(){
                window.close()
            }
        },
        watch: {
            $route(to, from) {
                if (to.meta.I > from.meta.I) {
                    this.transitionName = 'slide-left'
                } else if (to.meta.I < from.meta.I) {
                    this.transitionName = 'slide-right'
                } else {
                    this.transitionName = 'slide-none'
                }
                this.$post('view',{url:to.path})
            }
        }
    }
</script>

