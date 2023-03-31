<template lang="pug">
    .page_det.people_det(v-if="form" )
        .left
            .wrap
                //pre {{form}}
                .people_top
                    .btn.xxs(v-if="hasManage()" @click="$router.push('/people/edit?id='+form.id+'')") 编辑
                    .avatar(:style="$rbg(form.cover)")
                    .ul
                        .name
                            b {{form.name || '__'}}
                            sub 编码：{{form.code}}
                        .li
                            b 性别：{{sexArr[form.sex]}}
                            i
                            b 民族：{{form.clan}}
                        .li
                            b 生于：{{$dayjs(parseInt(form.birthAt)).format('YYYY-MM-DD')}}
                            i
                            b(v-if="form.deathAt" ) 殁于：{{$dayjs(parseInt(form.deathAt)).format('YYYY-MM-DD')}}
                        .li
                            b 籍贯：{{form.address}}

                    .catalog
                        .head 相关联家谱：
                        .con
                            .box(v-for="(it,ind) in articles" @click="$open(0,it.id)")
                                .namex {{it.ancestor}}-{{it.clan}}族
                                .addre {{it.address}}
                .mdview_tit 人物详述：
                .mdview(v-html="$md2html(form.content || '> 暂时没有详述内容')")

        .right
            .top_tit
                .fl.av(v-if="form.user" @click="$router.push('/user?id='+form.user.id)")
                    .avatar
                        .img(:style="$avatar(form.user.id)")
                    span {{form.user.nickname || '佚名1984'}}
                    .tm
                        span 发表于{{$dayjs(form.createAt).format('YYYY-MM-DD HH:mm:ss')}}
                        span(v-if="form.createAt!=form.updateAt" ) ，更新于{{$dayjs(form.updateAt).format('YYYY-MM-DD HH:mm:ss')}}
                .fl(v-else)
                    i.icon-user-o
                    span {{form.nickname || '佚名1984'}}
                    .tm 发表于{{$dayjs(form.updateAt).format('YYYY-MM-DD HH:mm:ss')}}
                //.fr
                //    .label.ts
                //        i.icon-law
                //        span 非法内容投诉




            .comment_form(:class="{mob_min:mobMin}")
                .reply(v-if="reply")
                    i.icon-close(@click="reply=null")
                    span 引用回复：{{reply.nickname}} {{reply.content}}
                textarea.inp(v-model="formB.content", placeholder="如需纠错请留言，你的留言将受人物信息创建者审核", ref="replyc", :class="{pad:reply}" @focus="mobInp()" @blur="mobInp(1)" maxlength="200")
                input.inp(v-model="formB.nickname", placeholder="你的名字", ref="replyn", maxlength="20", @focus="mobInp()" @blur="mobInp(1)" :readonly="isToken")
                .btn.xs(@click="commentUp()", :disabled="disabled") 发表评论

            .comment_list
                .titxl
                    span.list
                        i.icon-commit
                        span {{form.comment}}
                    span.list
                        i.icon-eye-open
                        span {{form.views}}
                    FeelingBar(:val="form.feeling", :uid="form.id", :type="0")

                .page_nav
                    label 1

                .li(v-for="(it,ind) in items")
                    .tit
                        .avatar
                            .img(v-if="it.user", :style="$avatar(it.user.id)")
                        .fl
                            span.nm {{it.user && it.user.nickname}}
                            span.tm {{$dayjs(it.updateAt).format('YYYY-MM-DD HH:mm:ss')}}
                        .fr
                            FeelingBar(:val="it.feeling", :uid="it.id", :type="2")
                            i.icon-trash.hover(v-if="userInfo && form && form.user && (userInfo.id === form.user.id || userInfo.id === it.user.id || userInfo.role > 3)" @click="rmComment(it.id)")
                            i.icon-trash.disabled(v-else )

                    .pre {{it.content}}
                    .child(v-if="it.children" v-for="(itx,indx) in it.children")
                        .tit
                            .fl
                                span.nm {{itx.nickname}}
                                span.tm {{$dayjs(itx.createAt).format('YYYY-MM-DD HH:mm:ss')}}
                            .fr
                                FeelingBar(:val="itx.feeling", :uid="itx.id", :type="2")

                        .pre {{itx.content}}

        mapSet(:lat='treeForm.lat', :lng='treeForm.lng', :address='treeForm.address', v-if="showMap", @closeMap="setBack")
        dialogconfirm(:show-dialog='showConfirm', :ok-text="confTok", :cancel-text="confTcancel", :content="confTcon", v-on:confirm='confirmFn', v-on:cancel='cancelFn', :hide-confirm='false')

</template>

<script>
    import { mapGetters } from "vuex"
    import FeelingBar from './mo_feeling'
    import TreeChart from "./mo_tree";
    import CONT from '../utils/const'
    import mapSet from '@/views/mo_map_set'
    import dialogconfirm from '@/views/mo_confirm'
    export default {
        components:{
            FeelingBar, TreeChart, mapSet, dialogconfirm
        },
        data () {
            return {
                deviceId: localStorage.getItem('mira'),
                mobInv:null,
                mobMin:true,
                isEdit:false,
                showMap:false,
                showPop: null,
                treeSet: null,
                clans: CONT.clans,
                clansSet: false,
                sexSet: false,
                childArr: ['配偶','儿子','女儿','义子','义女'],
                treeDemo: CONT.treeDemo,
                form: {
                    "cover": null,
                    "content": "",
                    "level": 0,
                    "lat": 0,
                    "lng": 0,
                    "address": 0,
                    "nickname": "",
                },
                sexArr: CONT.sexArr,
                dateSet:0,
                treeForm: {
                    address: this.$getStorage('zb').address,
                    lat: this.$getStorage('zb').lat,
                    lng: this.$getStorage('zb').lng,
                    name: '',
                    clan: '',
                    sex: 1,
                    birthAt: null,
                    deathAt: null,
                },
                articles: [],
                items:[],
                total:0,
                disabled: false,
                formB:{ // 留言表单
                    content:null,
                    nickname:null,
                    type:1,
                    hostId:this.$route.query.id
                },
                token: localStorage.getItem('token')?'Bearer '+ localStorage.getItem('token'):'',
                isToken:false,
                reply:null,
                tags:[],
                levelPop:false,
                chatFrame:null,
                surnames: CONT.surnames,
                rmCommentId:null,
                showConfirm:false,
                confTok:'确定',
                confTcancel:'取消',
                confTcon:'确定要删除这条留言吗？',
            }
        },
        mounted(){
            if(this.userInfo&&this.userInfo.nickname){
                this.formB.nickname=this.userInfo.nickname
                this.isToken=true
            }
            this.getData()
        },
        computed: {
            ...mapGetters(["calen","userInfo"])
        },
        methods:{
            rmComment(id){
                this.showConfirm = true
                this.rmCommentId = id
            },
            confirmFn(){
                this.$post('comment/delete/'+this.rmCommentId).then(res=>{
                    this.getComment()
                }).catch()
                this.showConfirm = false;
            },
            cancelFn(){
                this.showConfirm = false;
            },
            clickNode(node){
                this.treeSet = {name:node.name, id:node.id, hasChild:(node.children?true:false)}
            },
            setBack(t){
                this.showMap=false;
                if(t&&t.lat){
                    this.treeForm.lat = t.lat;
                    this.treeForm.lng = t.lng;
                    this.treeForm.address = t.address;
                    this.$setStorage('zb',t)
                }
            },
            hasManage(){
                if(!this.userInfo){
                    return false
                }
                let sf = false;
                if(this.articles){
                    this.articles.forEach(it=>{
                        if(it.manageId && it.manageId.indexOf(this.userInfo.id) >= 0){
                            sf = true
                        }
                    })
                }
                return this.token && (this.form.user && this.userInfo.id === this.form.user.id || sf)
            },
            setDate(t){
                this.dateSet = t;
                let dt = new Date(t==0?this.treeForm.birthAt||Date.now():this.treeForm.deathAt||Date.now());
                changeDate(dt.getFullYear(),dt.getMonth()+1)
                // changeDate(2013,dt.getMonth()+1)
                this.$store.commit('SHOW_CALEN', true)
            },
            mobInp(t){
                if(t){
                    this.mobInv = setTimeout(() => {
                        this.mobMin = true
                    },3000)
                }else {
                    this.mobMin = false
                    clearTimeout(this.mobInv);
                    this.mobInv=null;
                }
            },
            getData(){
                const id = this.$route.query.id;
                const code = this.$route.query.code;
                // this.$toast('id:'+id+', code:'+code)
                if((!id || id === 'undefined') && (!code || code === 'undefined')) {return false;}
                // this.$toast('id:'+id+', code:'+code)
                this.$get('people/' + (id?id:code)).then((res) => {
                    this.form = res;
                    // this.$toast(res.user.nickname)
                    document.title = res.name + '-人物详情-家谱'
                    if(res.catalog){
                        this.$get('article/catalog/' + res.catalog).then((res2) => {
                            // console.log(res2)
                            this.articles = res2[0]
                        }).catch()
                    }
                    this.getComment()

                }).catch(() => {
                    // this.$toast('找不到该页面');
                    // this.$router.push('/')
                })
            },
            getComment(){
                this.$get('comment/host/' + this.$route.query.id+'').then(res =>{
                    if (res && !res.data){
                        // res[0].forEach(it => {
                        //     it.content=marked(it.content)
                        //     this.items.push(it)
                        // })
                        this.items=res[0]
                        this.total=res[1]
                    }
                    // console.log(res)
                }).catch(() => {
                })
            },
            commentUp(){
                if(!this.token){
                    this.$toast('登录后再留言');
                    this.$store.commit('SET_SIGNPOP', true)
                    return false
                }
                let par  = this.formB;
                if(!par.content || par.content.length<7){
                    this.$toast.error('内容至少7个字');
                    this.$refs.replyc.focus()
                    return false
                }
                if(!par.nickname){
                    this.$toast.error('留个名字吧');
                    this.$refs.replyn.focus()
                    return false
                }
                if(this.reply){
                    par.parentId= this.reply.id
                }
                this.disabled=true;
                this.$post('comment', par).then(res =>{
                    if(res && !res.data){
                        this.$toast.success('发布成功');
                        this.formB.content=null
                        this.getData()
                    }
                    this.disabled=false;
                    // console.log(res)
                }).catch( err => {
                    this.disabled=false;
                })
            },
            toChat(){
                this.$store.commit('SET_ACTIVE_ROOM', {
                    type:'a',
                    id:this.form.id,
                    name:this.form.id.substring(0,8).toLocaleUpperCase()+'聊吧'
                });
                this.$router.push('/chat?type=a&id='+this.form.id)
            },
            savePeople(){
                const par = {
                    name: this.treeForm.name,
                    address: this.treeForm.address,
                    lat: this.treeForm.lat,
                    lng: this.treeForm.lng,
                    clan: this.treeForm.clan,
                    sex: this.treeForm.sex,
                    birthAt: this.treeForm.birthAt,
                    deathAt: this.treeForm.deathAt,
                }
                if(!par.name || this.surnames.indexOf(par.name.charAt(0)) < 0){
                    this.$toast.warning('请正确输入姓名')
                    return false
                }
                if(!par.birthAt){
                    this.$toast.warning('请选择出生日期')
                    return false
                }
                if(this.showPop === 8){
                    par.id = this.treeSet.id
                }
                this.$post('people', par).then( res =>{
                    if(res){
                        // this.$toast.success('发布成功');

                    }
                    this.disabled=false;
                }).catch( err => {
                    this.disabled=false;
                })
            }
        },
        watch: {
            '$route.query.id'(){
                this.getData()
            },
            '$route'(to,from){
                if(from.path==='/people/edit') {
                    this.getData()
                }
            },
            calen(){
                if(this.dateSet === 0){
                    this.treeForm.birthAt = this.calen
                }else {
                    this.treeForm.deathAt = this.calen
                }
            },
            'treeForm.name'(){
                if(this.treeForm.name && this.treeForm.name.length>1){
                    if(this.surnames.indexOf(this.treeForm.name.charAt(0)) >= 0){
                        console.log(this.treeForm.name.length);
                        // 用姓名去搜索people
                    }else if( this.treeForm.name.length === 6){
                        // 用编码去搜索people
                        console.log(this.treeForm.name);
                    }
                }
            },
            showPop(){
                this.clansSet = false;
                this.sexSet = false;
                if(this.showPop===8){
                    this.$get('people/' + this.treeSet.id).then(res => {
                        if(res){
                            this.treeForm = {
                                name: res.name,
                                address: res.address,
                                lat: res.lat,
                                lng: res.lng,
                                clan: res.clan,
                                sex: res.sex,
                                birthAt: parseInt(res.birthAt),
                                deathAt: parseInt(res.deathAt),
                            }
                        }
                    }).catch(() => {
                        // this.$router.push('/')
                    })
                }else {
                    this.treeForm.name = null;
                    this.treeForm.birthAt = null;
                    this.treeForm.deathAt = null;
                }
                this.treeForm.sex = this.showPop === 1 || this.showPop === 3 || this.showPop === 5 ? 0 : 1;
            }
        },
        activated(){

        },
        deactivated(){

        }
    }
</script>
