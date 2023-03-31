<template lang="pug">
    .mine
        Menu
        mescroll-vue(ref="mescroll", :opt-down="mescrollDown", :opt-up="mescrollUp")
            .wrap.message_list.wrap_topad
                .nav_tabs
                    .tab.active
                        b e
                        sup {{total}}
                .data_null(v-if="!items||items.length<1")
                .li(v-for="it in items")
                    .con(v-html="content(it)")
                    p {{$dayjs(it.createAt).format('YYYY-MM-DD hh:mm:ss')}}




</template>

<script>
    import Menu from '@/views/mine_menu'
    import { mapGetters } from "vuex"
    import MescrollVue from 'vue-mescroll/mescroll'

    export default {
        components:{
            Menu,MescrollVue
        },
        data () {
            return {
                items:null,
                total: 0,
                form:{
                    page:1
                }
            }
        },
        mounted(){
            // this.getData()
        },
        created(){
            this.mescrollDown = {
                auto: true,
                callback: this.downCallback,
                page: {
                    num: 1,
                    size: 30,
                }
            };
            this.mescrollUp = {
                auto: true, //初始时是否执行
                callback: this.upCallback, //上拉加载的回调函数
                page: {
                    num: this.form.page,
                    size: 30,
                },
                toTop:{
                    src:this.$BASECDN+'cdn/arrow-up-b.svg'
                }
            }
        },
        computed: {
            ...mapGetters(["userInfo"])
        },
        methods:{
            getData(){
                // console.log(1)
                this.$get('message',{page:this.form.page}).then((res) =>{
                    if(res && !res.data){
                        this.total = res[1];
                        if(this.form.page<2){
                            this.items = res[0];
                        }else {
                            res[0].forEach(it => {
                                this.items.push(it)
                            })
                        }
                        this.$refs.mescroll.instance.endSuccess(res[0].length,res[1])
                    }else {
                        this.$refs.mescroll.instance.endErr()
                    }
                }).catch(err => {
                    this.$refs.mescroll.instance.endErr()
                })
            },
            content(it){
                let ms = '';
                switch (it.type){
                    case 1:

                        break;
                    case 2:
                        ms = '<h3>'+(!it.from?'某游客':('<a href="/#/user?id='+it.from.id+'" target="_blank">'+(it.from.nickname||'佚名1984')+'</a>'))+'成功访问了你的<a href="/#/article/detail?id='+it.host+'" target="_blank">加密故事</a></h3>';
                        break;
                    case 3:
                        ms = '<h3>'+(!it.from?'某游客':('<a href="/#/user?id='+it.from.id+'" target="_blank">'+(it.from.nickname||'佚名1984')+'</a>'))+'修改了<a href="/#/article/detail?id='+it.host+'" target="_blank">这篇故事</a>的等级</h3>';
                        break;
                    case 4:
                        ms = '<h3>'+(!it.from?'某游客':'<a href="/#/user?id='+it.from.id+'" target="_blank">'+(it.from.nickname||'佚名1984')+'</a>')+'评论了你的<a href="/#/article/detail?id='+it.host+'" target="_blank">故事</a></h3><p>'+it.content+'</p>';
                        break;
                }
                return ms
            },
            //上拉加载
            upCallback() {
                if(this.total>=10){
                    this.form.page+=1;
                    this.getData();
                }else {
                    this.$refs.mescroll.instance.endErr()
                }
            },
            //下拉刷新
            downCallback() {
                // this.$refs.mescroll.instance.start();
                this.form.page = 1;
                this.getData()
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
