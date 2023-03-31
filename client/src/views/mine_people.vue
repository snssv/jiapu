<template lang="pug">
    .mine
        Menu
        mescroll-vue(ref="mescroll", :opt-down="mescrollDown", :opt-up="mescrollUp")
            .wrap.wrap_topad
                .nav_tabs
                    .tab.active
                        b 我创建的
                        sup {{total}}
                .data_null(v-if="!items||items.length<1")
                .article_list(v-for="(it,ind) in items")
                    .cover_bg(:type="it.code" @click="$open(2,it.id)")
                        .img(:style="it.cover?$rbg(it.cover):$avatarT(it.id)")
                    .cont
                        .tit
                            i.icon-eye-open
                            span {{it.views||0}}
                            i.icon-commit
                            span {{it.comment||0}}
                            i.icon-thumb
                            span {{it.feeling||0}}
                        .top_r
                            router-link.icon-edit(:to="'/people/edit?id='+it.id")
                            i.icon-trash(@click="remove(ind)")
                        .con.hover(@click="$open(1,it.id)")
                            .addr {{it.address}}
                            .namex
                                b {{it.name}}
                                sub [{{it.code}}]，{{sexArr[it.sex]}}，{{it.clan}}族
                            .seniority
                                i 生于：{{$dayjs(parseInt(it.birthAt)).format('YYYY-MM-DD')}}
                                i(v-if="it.deathAt" ) 殁于：{{$dayjs(parseInt(it.deathAt)).format('YYYY-MM-DD')}}
                        .wz
                            i.icon-location
                            span(v-if="it.lat") {{$distance(it.lat,it.lng)}}

        dialogconfirm(:show-dialog='showConfirm', :ok-text="confTok", :cancel-text="confTcancel", :content="confTcon", v-on:confirm='confirmFn', v-on:cancel='cancelFn', :hide-confirm='false')



</template>

<script>
    import Menu from '@/views/mine_menu'
    import dialogconfirm from '@/views/mo_confirm'
    import { mapGetters } from "vuex"
    import MescrollVue from 'vue-mescroll/mescroll'
    import CONT from "../utils/const";

    export default {
        components:{
            Menu,MescrollVue,dialogconfirm
        },
        data () {
            return {
                sexArr: CONT.sexArr,
                items:null,
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
            ...mapGetters(["token","userInfo"])
        },
        methods:{
            confirmFn(){
                this.$post('people/delete/'+this.items[this.rmid].id).then( res =>{
                    this.items.splice(this.rmid,1)
                    this.cancelFn()
                }).catch( err => {
                    this.cancelFn()
                })
            },
            cancelFn(){this.showConfirm = false;},
            remove(id){
                this.showConfirm = true;
                this.rmid=id;
            },
            getData(){
                // console.log(1)
                this.$get('people/my',{page:this.form.page}).then((res) =>{
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
