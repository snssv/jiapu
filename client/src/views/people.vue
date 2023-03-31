<template lang="pug">
    .home

        .navbar
            i.icon-location
            span 距离
            strong(v-if="zb&&zb.address") {{zb.address}}
            b(v-if="!zb.address") {{zb.lat}}
            b(v-if="!zb.address") {{zb.lng}}
            span 附近
            b {{$arrArea[form.area]}}
            span 范围内共有
            em {{total}}
            span 个
            span(v-if="$route.query.key") 关于[{{$route.query.key}}]的人员
            span(v-else) 公众人物
            .icon-filter(@click="showFilter=true")
        .filter(:class="{show:showFilter}")
            .close.icon-close(@click="showFilter=false")
            .head 筛选
            .cont
                .address(@click="showMap=true;setZb=2" v-if="zb")
                    .fl
                        p {{zb?zb.address:'_'}}
                    .fr
                        .lat lat: {{zb?zb.lat:'_'}}
                        .lng lng: {{zb?zb.lng:'_'}}
                    .fi
                        i.icon-location

                .address_sub(@click="showMap=true;setZb=1")
                    span 你当前位于：{{zb1?(zb1.address+'['+zb1.lat+','+zb1.lng)+']':'-'}}，如果相差较远，请
                    b 点此校正

                .select
                    dl
                        dt 范围
                        dd
                            .nav_tabs
                                .tab(v-for="(it,ind) in $arrArea", :class="{active: ind==form.area}" @click="form.area=ind") {{it}}

                    .btn.check(@click="showFilter=false;form.page=1;getData()")
                        i.icon-check
                        span 确定

        mescroll-vue(ref="mescroll", :opt-down="mescrollDown", :opt-up="mescrollUp")
            .wrap_acrticle
                .icon-help(v-if="!showFirstTip" @click="toHelp")
                .data_null(v-if="!items||items.length<1")
                .article_list(v-for="(it,ind) in items")
                    .cover_bg(:type="it.code" @click="$open(1,it.id)")
                        .img(:style="it.cover?$rbg(it.cover):$avatarT(it.id)")
                    .cont
                        .tit
                            i.icon-eye-open
                            span {{it.views||0}}
                            i.icon-commit
                            span {{it.comment||0}}
                            i.icon-thumb
                            span {{it.feeling||0}}
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
                        .fot {{$dayjs(it.createAt).format('YYYY-MM-DD HH:mm:ss')}}

                .navtip.hover(v-if="!items||items.length<10" @click="token?$router.push('/article/edit'):$store.commit('SET_SIGNPOP', true)")
                    h3 简单四步，创建自己的家谱
                    .ol
                        .li 1. 注册/登录
                        .li 2. 创建家谱
                        .li 3. 提交保存
                        .li 4. 编辑成员

        mapSet(v-if="showMap", :lat='zb.lat', :lng='zb.lng', :address='zb.address', @closeMap="setBack")

        dialogconfirm(:show-dialog='showConfirm', :ok-text="confTok", :cancel-text="confTcancel", :content="confTcon", v-on:confirm='confirmFn', v-on:cancel='cancelFn', :hide-confirm='false')

</template>

<script>
    import mapSet from '@/views/mo_map_set'
    import { mapGetters } from "vuex"

    import MescrollVue from 'vue-mescroll/mescroll'
    import dialogconfirm from '@/views/mo_confirm'
    import CONT from "../utils/const";
    export default {
        name:'home',
        components:{
            mapSet,MescrollVue,dialogconfirm
        },
        data () {
            return {
                items:null,
                total:0,
                setZb:2,
                showFirstTip: this.$getStorage('firstTip')?false:true,
                showFilter:false,
                showMap:false,
                showSort:false,
                zb: this.$getStorage('zb'),
                zb1: this.$getStorage('zb1'),
                dateSet:0,
                sexArr: CONT.sexArr,
                form:{
                    sortA:0,
                    sortB:0,
                    category:999,
                    area:0,
                    tag:null,
                    page:1,
                    start:null,
                    end:null,
                },
                hotKey:null,
                hotPop:false,
                hideArr: this.$getStorage('hideArr') || [],
                favArr: this.$getStorage('favArr') || [],
                confirmLock:false,
                showConfirm:false,
                confTok:'开始定位',
                confTcancel:'手动校正',
                confTcon:'为了更精准获取信息，请设置你当前所在位置。本站不收集跟踪任何隐私数据，若仍不放心，可选择手动校正位置。',


            }
        },
        mounted(){
            // this.getData()
            this.setLat()
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
            ...mapGetters(["calen","userInfo","token"])
        },
        methods:{
            setDate(t){
                this.dateSet = t;
                let dt = new Date(t==0?this.form.start:this.form.end);
                changeDate(dt.getFullYear(),dt.getMonth()+1)
                this.$store.commit('SHOW_CALEN', true)
            },
            confirmFn(){
                this.$toast('正在定位，请稍候');
                navigator.geolocation.getCurrentPosition((position) => {
                    let lat =position.coords.latitude,lng =position.coords.longitude;
                    let zb = {
                        lat:position.coords.latitude,
                        lng:position.coords.longitude,
                        address:'017758'
                    }
                    this.$toast('定位结束');
                    localStorage.setItem('zb1',JSON.stringify(zb));
                });
                this.showConfirm = false;
            },
            cancelFn(){
                this.showConfirm = false;
                this.showMap=true;
                this.setZb=1
            },
            setLat(){
                if(!this.$getStorage('zb1')){
                    this.showConfirm = true

                }
            },
            getData(){
                let zb = this.zb || this.mrzb;
                if(!this.zb){
                    navigator.geolocation.getCurrentPosition((position) => {
                        zb.lat=position.coords.latitude;
                        zb.lng=position.coords.longitude;
                        this.$setStorage('zb', zb);
                        this.$setStorage('zb1', zb);
                        this.zb = zb;
                        this.zb1 = zb;
                    });
                }

                let par = {
                    ...this.form,
                    lat: zb.lat,
                    lng: zb.lng,
                    key: this.$route.query.key
                }
                if(par.start && par.end && par.start > par.end){
                    const a = par.start;
                    par.start = par.end;
                    par.end = a;
                }
                this.$get('people',par).then((res) =>{
                    if(res && !res.data){
                        this.total = res[1];
                        if(this.form.page<2){
                            this.items = res[0];

                            if(res[0].length<3 && this.form.area<5){
                                this.form.area+=1;
                                this.getData();
                            }
                        }else {
                            res[0].forEach(it => {
                                this.items.push(it)
                            })
                        }
                        this.$refs.mescroll.instance.endSuccess(res[0].length,res[1])

                        if(par.key){
                            this.$get('search/all', {type:'article',keyword:par.key}).then((res) =>{
                            }).catch(() => {})
                        }
                    }else {
                        this.$refs.mescroll.instance.endErr()
                    }
                }).catch(() => {
                    this.$refs.mescroll.instance.endErr()
                })
            },
            setBack(t){
                // console.log(t);
                this.showMap=false;
                if(t&&t.lat){
                    if(this.setZb==1){
                        this.zb1= t;
                        this.$setStorage('zb1',t)
                    }else {
                        this.zb = t;
                        this.$setStorage('zb',t)
                    }
                }
            },
            follow(id){

            },
            chat(id){
                if(!this.userInfo){
                    this.$toast('请先登录')
                    this.$store.commit('SET_SIGNPOP',true)
                }else {
                    window.open('/#/chat?type=f&id='+id)
                }

            },
            closeTip(){
                this.showFirstTip=false;
                this.$setStorage('firstTip',1)
            },
            toHelp(){
                this.closeTip();
                this.$router.push('/help');
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
            $route() {
                // console.log(this.$route.path)
            },
            '$route.query.key'(){
                this.form.page = 1;
                this.getData()
            },
            calen(){
                if(this.dateSet==0){
                    this.form.start = this.calen;
                }else {
                    this.form.end = this.calen;
                }
                // this.$store.state.user.calenPop = false;
            }
        },
        activated(){

        },
        deactivated(){

        }
    }
</script>
