<template lang="pug">
    .mine
        Menu
        mescroll-vue(ref="mescroll", :opt-down="mescrollDown", :opt-up="mescrollUp")
            .wrap.comment_list
                .data_null(v-if="!items||items.length<1")
                .li(v-for="it in items")
                    .fl
                        .tm
                            i.icon-time
                            span {{$dayjs(it.updateAt).format('YYYY-MM-DD hh:mm:ss')}}
                            i.icon-thumb
                            span {{it.feeling||0}}
                        .pre {{it.content}}
                    .fr
                        router-link.btn.xs(:to="'/'+(typeArr[it.type])+'/detail?id='+it.hostId") 相关{{typeTxt[it.type]}}



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
                this.$get('follows/my',{page:this.form.page}).then((res) =>{
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
            //上拉加载
            upCallback() {
                if(this.total>=30){
                    this.form.page+=1;
                    this.getData();
                }else {
                    this.$refs.mescroll.instance.endErr()
                }
            },
            //下拉刷新
            downCallback() {
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
