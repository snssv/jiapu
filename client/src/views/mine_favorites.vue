<template lang="pug">
    .mine
        Menu
        mescroll-vue(ref="mescroll", :opt-down="mescrollDown", :opt-up="mescrollUp")
            .wrap.comment_list
                .data_null(v-if="!items||items.length<1")
                .article_list(v-for="(it,ind) in items")
                    .tag(:type="it.article.type")
                        i(:class="'icon-type'+it.article.category")
                    .cover_bg(:type="it.article.category")
                        .img(:style="$rbg(it.article.cover)" @click="$open(it.article.type,it.article.id)")
                    .cont
                        .tit
                            i.icon-eye-open
                            span {{it.article.views||0}}
                            i.icon-commit
                            span {{it.article.comment||0}}
                            i.icon-thumb
                            span {{it.article.feeling||0}}
                        .top_r
                            i.icon-eye-close2(@click="remove(it.id)")
                        .con(@click="$open(it.article.type,it.article.id)") {{it.article.summary}}
                        .wz
                            i.icon-location
                            span(v-if="it.article.lat") {{$distance(it.article.lat,it.article.lng)}}
                        .fot {{$dayx(it.article.updateAt)}}



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
                this.$get('favorites/my',{page:this.form.page}).then((res) =>{
                    if(res && !res.data){
                        this.setFavArr(res[0])
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
            setFavArr(res){
                let  newArr = this.$getStorage('favArr')||[];
                if(this.form.page==1){
                    newArr = []
                }
                res.forEach(it => {
                    if(newArr.indexOf(it.article.id)<0){
                        newArr.push(it.article.id)
                    }
                    this.$setStorage('favArr',newArr)
                })
            },
            remove(id){
                this.$post('favorites/delete',{id:id}).then( res => {
                    if(res && !res.data){
                        this.$toast.success('已取消收藏');
                        this.getData();
                        // console.log(res)
                    }
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
            this.getData()
        },
        deactivated(){

        }
    }
</script>
