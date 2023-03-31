<template lang="pug">
    .mine.mine_acrticle
        Menu
        mescroll-vue(ref="mescroll", :opt-down="mescrollDown", :opt-up="mescrollUp")
            .wrap.wrap_topad
                .nav_tabs
                    .tab(v-for="(it,ind) in tabArr" @click="tabSet(ind)", :class="{active:tabInd==ind}")
                        b {{it}}
                        sup {{totals[ind]}}
                .data_null(v-if="!items||items.length<1")
                .article_list(v-for="(it,ind) in items")
                    .cover_bg(:type="it.category")
                        .img(:style="$rbg(it.cover)")
                    .cont
                        .tit
                            i.icon-eye-open
                            span {{it.views||0}}
                            i.icon-commit
                            span {{it.comment||0}}
                            i.icon-thumb
                            span {{it.feeling||0}}
                        .top_r
                            router-link.icon-edit(:to="'/article/edit?id='+it.id")
                            i.icon-trash(@click="remove(ind)")
                        .con.hover(@click="$open(it.type,it.id)")
                            .addr {{it.address}}
                            .namex
                                b {{it.ancestor}}
                                sub(v-if="it.clan") {{it.clan}}族
                            .seniority 字辈：{{it.seniority}}
                        .wz
                            i.icon-location
                            span {{$distance(it.lat,it.lng)}}
                        .fot {{$dayx(it.updateAt)}}

                .navtip.hover(v-if="!items||items.length<10" @click="token?$router.push('/article/edit'):$store.commit('SET_SIGNPOP', true)")
                    h3 简单四步，创建自己的家谱
                    .ol
                        .li 1. 注册/登录
                        .li 2. 创建家谱
                        .li 3. 提交保存
                        .li 4. 编辑成员

        dialogconfirm(:show-dialog='showConfirm', :ok-text="confTok", :cancel-text="confTcancel", :content="confTcon", v-on:confirm='confirmFn', v-on:cancel='cancelFn', :hide-confirm='false')



</template>

<script>
    import Menu from '@/views/mine_menu'
    import dialogconfirm from '@/views/mo_confirm'
    import { mapGetters } from "vuex"
    import MescrollVue from 'vue-mescroll/mescroll'

    export default {
        components:{
            Menu,MescrollVue,dialogconfirm
        },
        data () {
            return {
                tabArr: ["我创建的","参与管理"],
                tabInd: 0,
                totals: [0,0],
                items: [],
                total: 0,
                disabled:false,
                showConfirm:false,
                confTok:'嗯',
                confTcancel:'想想',
                confTcon:'确定要删除这条记录吗？',
                rmid:null,
                form:{
                    page:1
                }
            }
        },
        mounted(){

        },
        computed: {
            ...mapGetters(["token"])
        },
        created(){
            this.mescrollDown = {
                auto: false,
                callback: this.downCallback,
                page: {
                    num: 1,
                    size: 30,
                }
            };
            this.mescrollUp = {
                auto: false, //初始时是否执行
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
        methods:{
            confirmFn(){
                this.$post('article/delete/'+this.items[this.rmid].id).then( res =>{
                    this.items.splice(this.rmid,1)
                    this.cancelFn()
                }).catch( err => {
                    this.cancelFn()
                    this.disabled=false;
                })
            },
            cancelFn(){this.showConfirm = false;},
            remove(id){
                this.showConfirm = true;
                this.rmid=id;
            },
            tabSet(ind){
                this.items=null
                this.form.page = 1
                this.tabInd = ind
                this.getData()
            },
            getData(){
                const url = ['my','manage']
                const ind = this.tabInd
                this.$get('article/'+url[ind]).then((res) =>{
                    if(res && !res.data){
                        this.totals[ind] = res[1];

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
                });
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
            token(){
                if(this.$route.path=='/mine/article'){
                    this.form.page = 1;
                    this.getData()
                }
            }
        },
        activated(){
            this.getData()
        },
        deactivated(){

        }
    }
</script>
