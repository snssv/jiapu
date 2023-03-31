<template lang="pug">
    .author(v-if="user")
        .wrap
            .left
                .head_info
                    .avatar(:style="$avatar(user.id)")
                    h3 {{user.nickname ||'佚名1984'}}

                    .tm(v-if="user.createAt") 注册时间 {{$dayjs(user.createAt).format('YYYY-MM-DD hh:mm:ss')}}
                    .tm(v-if="user.createAt") 最近活跃 {{$dayjs(user.updateAt).format('YYYY-MM-DD hh:mm:ss')}}
                    .xc
                        .li
                            i.icon-gift
                            span {{user.integral}}

                        .li
                            i.icon-buoy-o
                            span {{user.coin}}
                        .li
                            i.icon-fire
                            span {{user.hot}}

                //.tags
                    b 标签：
                    router-link.label(v-for="it in user.tags" :to="'/people?key='+it" v-if="it") {{it}}

            .right
                .wrap
                    .mdview(v-html="$md2html(user.content || '> 该用户还没想好怎么介绍自己')")



</template>

<script>
    import { mapGetters } from "vuex"
    import {regId} from '../utils/validate'

    export default {
        components:{
        },
        data () {
            return {
                loadAvatar:false,
                avatar:null,

                user: null,
                items:null,
                total:0,
                page: 0

            }
        },
        mounted(){
            this.getData()
            if(this.userInfo){
                this.loadAvatar = true
            }
        },
        created(){
        },
        computed: {
            ...mapGetters(["token","userInfo"])
        },
        methods:{
            getData(){
                const id = this.$route.query.id;
                if(!id) {return false;}
                if(regId(id)) {

                    this.$get('user/' + this.$route.query.id).then((res) => {
                        this.user = res;


                        this.getArticle()

                    }).catch(() => {
                        // this.$router.push('/')
                    })
                }
            },
            getArticle(){
                const id = this.$route.query.id;
                if(!id) {return false;}
                if(regId(id)) {

                    this.$get('article/user/' + this.$route.query.id).then((res) => {
                        // this.user = res;
                        if(res && !res.data){
                            this.total = res[1];
                            if(this.page<2){
                                this.items = res[0];

                            }else {
                                res[0].forEach(it => {
                                    this.items.push(it)
                                })
                            }
                        }

                    }).catch(() => {
                        // this.$router.push('/')
                    })
                }
            },
        },
        watch: {

        },
        activated(){

        },
        deactivated(){

        }
    }
</script>
