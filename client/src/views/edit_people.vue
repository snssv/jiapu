<template lang="pug">
    .editor.people_det
        .step2(:class="{review: review}")
            .left
                .tips 预览
                .wrap
                    .people_top
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
                                .box(v-for="(it,ind) in peoples" @click="$open(0,it.id)")
                                    .namex {{it.ancestor}}-{{it.clan}}族
                                    .addre {{it.address}}

                    .mdview_tit 人物详述：
                    .mdview#mds(v-html="$md2html(form.content)")

                .btn_group.hide_pc
                    .btn.empty(@click="review = false") 返回
                    .btn.jv(@click="publish", :disabled="disabled") 发布
            .right
                .top_bar
                    .fr
                        .li(@click="cleanCon")
                            i.icon-loop
                            span 清空
                        .li(@click="showHis")
                            i.icon-time
                            span 历史

                .address(v-if="form")
                    .fl
                        input.inp(placeholder="请选取或输入所在地址" v-model='form.address')
                    .fr(@click="showMap=true")
                        .lat lat: {{form.lat}}
                        .lng lng: {{form.lng}}
                    .fi(@click="showMap=true")
                        i.icon-location

                .select

                    dl
                        dt 姓名
                        dd
                            input.inp(placeholder="姓名", v-model="form.name", maxlength="6", ref='ancestor')

                    dl
                        dt 性别
                        dd
                            input.inp(placeholder="请选择", v-model="sexArr[form.sex]", readonly="true" @click="sexSet = !sexSet")
                            .choose.sex_set(:class="{show:sexSet}")
                                .li(v-for="(it,ind) in sexArr" @click="form.sex = ind;sexSet=false") {{it}}
                        dt 民族
                        dd
                            input.inp(placeholder="请选择", v-model="form.clan", readonly="true" @click="clansSet = !clansSet")
                            .clans_set(:class="{hide: !clansSet}")
                                b(v-for="it in clans" @click="form.clan = it; clansSet = false") {{it}}

                    dl
                        dt 生于
                        dd
                            .date_bar
                                .val(v-if="form.birthAt")
                                    span(@click="setDate(0,form.birthAt)") {{$dayjs(parseInt(form.birthAt)).format('YYYY-MM-DD')}}
                                    i.icon-close(@click="form.birthAt=null")
                                .val(v-else @click="setDate(0)")
                                    b 选择出生日期
                                    i.icon-calendar
                        dt 殁于
                        dd
                            .date_bar
                                .val(v-if="form.deathAt")
                                    span(@click="setDate(1,form.deathAt)") {{$dayjs(parseInt(form.deathAt)).format('YYYY-MM-DD')}}
                                    i.icon-close(@click="form.deathAt=null")
                                .val(v-else @click="setDate(1)")
                                    b 在世为空
                                    i.icon-calendar


                textarea.inp(placeholder="在此输入家谱详述[支持markdown语法，两个回车键换行]", ref='mdTes' v-model="form.content", maxlength="5000" @change="autoSave")
                .upimgs
                    .img(v-if='userInfo' v-for='it in upimgs' :style="upImgBg(it)")
                        dl
                            dt(@click="imgAdd(it)") 插入
                            dd(@click="imgDel(it)")
                                i.icon-close

                    .img.upimg
                        .btnx
                            i.icon-camera
                        input#upFile(type="file" accept="image/png, image/jpeg, image/gif" multiple onchange="upImg()")

                .private_set.checkbox.hover(:class="{true:form.public}", @click="publicPeople()") 设为公众人物（要求人物详述至少200字以上）

                .btn_group
                    .btn.empty.hide_pc(@click="form.content?review = true:$toast.error('还没有描述内容')") 预览
                    .btn.jv(@click="publish", :disabled="disabled") 提交

                .tips
                    h3 你需要知道：
                    ol
                        li 严禁发布违背道德良知的非法内容以及任何不相关的垃圾信息
                        li
                            | 家谱和人物详述均支持丰富的图文混排编辑，只需了解一点
                            b(onclick="window.open('/#/help')") 简单的markdown语法[查看]
                            | 就能得心应手地编辑
                        li 程序会自动抓取介绍内容里第一张图片作为家谱封面或人物头像
                        li 创建家谱后可以编辑成员目录树，亲友可向创建者申请成为管理员后对家谱进行编辑维护
                        li 100年内出生的非公众人物的详细信息默认不予显示
                        //li 如果以游客身份创建，发布后将无法修改，但是家谱内成员可通过相匹配的有效证件申请成为该家谱创建者
                        //li 向家谱创建者申请管理后可以对家谱共同维护
                        li 因时间精力有限[个人独立开发]，暂时仅支持百家姓家谱
                        //li 本小站乃一失业多年山区老农民工呕心独立创作，能力有限，还请某些江湖大佬手下留情莫要攻击，在此叩谢了
                        li
                            | 若有合作意向，请
                            b(@click="showChat = !showChat") 点此狂call站长
                    .wechat(:class="{show:showChat}")

        .his_item(:class="{show:hisShow}")
            .close.icon-close(@click="hideHis")
            h4 历史记录
            .li(v-for="(it,ind) in hisItem", :class="{active:ind == hisInd}" @click="setHis(it,ind)")
                b {{ind}}
                p {{it}}


        mapSet(:lat='form.lat', :lng='form.lng', :address='form.address', v-if="showMap", @closeMap="setBack")

        dialogconfirm(:show-dialog='showConfirm', :ok-text="confTok", :cancel-text="confTcancel", :content="confTcon", v-on:confirm='confirmFn', v-on:cancel='cancelFn', :hide-confirm='false')


</template>

<script>
    import mapSet from '@/views/mo_map_set'
    import dialogconfirm from '@/views/mo_confirm'

    import { mapGetters } from "vuex"
    import {regPhone, regPwd} from "../utils/validate";
    import TreeChart from "./mo_tree";
    import CONT from '../utils/const'

    export default {
        name: 'Editorbar',
        components:{
            mapSet, dialogconfirm, TreeChart
        },
        data () {

            return {
                review: false,
                hisShow: false,
                setPrivate: false,
                clans: CONT.clans,
                sexArr:CONT.sexArr,
                clansSet: false,
                sexSet: false,
                hisItem: null,
                hisInd: 0,
                token: localStorage.getItem('token')?'Bearer '+ localStorage.getItem('token'):'',
                upimgs: [],
                surnames: CONT.surnames,
                peoples: null,
                peoplesTotal:0,
                articleId: null, //如果是关联家谱管理员，通过article进行修改
                form: {
                    "cover": null,
                    "content": "",
                    "level": 0,
                    "lat": 0,
                    "lng": 0,
                    "address": 0,
                    "nickname": "",
                },
                category:0,
                showFilter:false,
                showMap:false,
                zb: this.$getStorage('zb1') || this.$getStorage('zb'),
                showChat:false,
                disabled:false,
                confirmLock:false,
                showConfirm:false,
                confTok:'继续发布',
                confTcancel:'免费注册',
                confTcon:'游客发布的信息不可以继续修改或删除，确定要继续以游客身份发布吗？',
            }
        },
        watch: {
            upimg(){
                // console.log(this.upimg);
                const xv = localStorage.getItem('upimgs')
                if(!xv || xv && xv.indexOf(this.upimg)<0){
                    let imgs = this.$getStorage('upimgs') || {}
                    if(!imgs[this.userInfo.id]){
                        imgs[this.userInfo.id] = []
                    }
                    imgs[this.userInfo.id].push(this.upimg)
                    this.$setStorage('upimgs', imgs)
                    this.imgAdd(this.upimg)
                    this.initImgs()
                }
            },
            calen(){
                if(this.dateSet === 0){
                    this.form.birthAt = this.calen
                }else {
                    this.form.deathAt = this.calen
                }
            },
        },
        mounted(){

            this.init()
            this.initImgs()

            this.autoSave()
        },
        computed: {
            ...mapGetters(["calen", "userInfo", 'upimg'])
        },
        methods:{
            setDate(t,s){
                this.dateSet = t;
                const ys = this.$dayjs(parseInt(s||0))
                changeDate(ys.$y,ys.$M+1)
                this.$store.commit('SHOW_CALEN', true)
            },
            confirmFn(){
                this.confirmLock = true;
                this.publish()
                this.showConfirm = false;
            },
            cancelFn(){
                this.showConfirm = false;
                this.$router.push('/signup')
            },
            upImgBg(name){
                return this.$rbg(this.$BASECDN + 'cdn/'+ this.userInfo.id+'/img/'+name+'.jpg')
            },
            changeAvatar(){
                const vd = document.getElementById("mds").getElementsByTagName('img')[0]
                if(vd){
                    this.form.cover = vd.src.replace(this.$BASECDN,'/')
                }
            },
            imgAdd(it){
                if(!this.form.content){
                    this.form.content = '## 标题'
                }
                this.form.content += '\n\n![](/cdn/'+ this.userInfo.id+'/img/'+it+'.jpg)'.replace(/null/g, '')
            },
            imgDel(it){
                let vx = localStorage.getItem('upimgs').replace('"'+it+'"', '').replace(',]', ']').replace('[,', '[').replace(',,', ',')
                localStorage.setItem('upimgs', vx)
                this.initImgs()
            },
            initImgs(){
                if(this.userInfo && this.$getStorage('upimgs')){
                    this.upimgs = this.$getStorage('upimgs')[this.userInfo.id]
                }
            },
            init(){

                this.confirmLock = false;
                if (!this.token) {
                    this.$store.commit('SET_SIGNPOP',true)
                    return
                }
                const li = this.$getStorage('people');
                if(!this.$route.query.md  && !this.$route.query.id){
                    this.form.content = null;
                    this.form.name = this.$datex();
                }

                if(this.$route.query.md && li){
                    this.form = li[parseInt(this.$route.query.md)]
                    delete this.form.id
                }
                if(this.$route.query.id){
                    this.articleId = null
                    this.$get('people/manage/'+this.$route.query.id).then( res => {
                        if(res.user&&res.user.id==this.userInfo.id){
                            this.form = res;
                        }else if(res.catalog){
                            this.$get('article/catalog/' + res.catalog).then((res2) => {
                                if(res2 && res2[0]){
                                    res2[0].forEach(it=>{
                                        if (it.manageId.indexOf(this.userInfo.id)>=0){
                                            this.form = res;
                                            this.articleId = it.id
                                        }
                                    })
                                    if (!this.articleId) {
                                        this.$toast.error('你不是作者')
                                    }
                                }
                            }).catch()
                        }
                    }).catch( err => {})
                }

                if(!this.form.lat){
                    this.form.lat = this.zb.lat;
                    this.form.lng = this.zb.lng;
                    this.form.address = this.zb.address;
                }
            },
            cleanCon(){
                this.form.content = null
                if(!this.form.id){
                    this.form.name = null
                }
            },
            autoSave (){
                let Tarr = this.$getStorage('editorPeople')||[];
                const con = this.form.content && this.form.content.trim()
                if(con && con.length>10 && Tarr.indexOf(con)<0){
                    // this.$toast('已自动保存')
                    Tarr.push(con);
                    if(Tarr.length>10){
                        Tarr.shift(-1)
                    }
                    this.$setStorage('editorPeople',Tarr)
                }
                this.changeAvatar()
            },
            showHis(){
                this.autoSave();
                let his = this.$getStorage('editorPeople');
                this.hisItem = his;
                this.hisInd = his?his.length - 1:0;
                this.hisShow = true;
            },
            hideHis(){
                this.hisShow = false;
            },
            setHis(it,ind){
                this.hisInd = ind
                this.form.content = it
                this.$refs.mdTes.focus()
            },
            setBack(t){
                this.showMap=false;
                if(t&&t.lat){
                    this.zb = t;
                    this.form.lat = t.lat;
                    this.form.lng = t.lng;
                    this.form.address = t.address;
                    this.$setStorage('zb',t)
                }
            },
            publicPeople(){
                if(this.form.public){
                    this.form.public = false
                }else {
                    if(this.form.content && this.form.content.length >= 200){
                        this.form.public = true
                    } else {
                        this.$toast.error('公众人物要求200字以上详述内容')
                        this.form.public = false
                    }
                }
            },
            publish(){
                let par = {
                    name: this.form.name,
                    sex: this.form.sex,
                    clan: this.form.clan,
                    cover: this.form.cover,
                    birthAt: this.form.birthAt,
                    deathAt: this.form.deathAt,
                    public: this.form.public,
                    lat: this.form.lat,
                    lng: this.form.lng,
                    address: this.form.address,
                    content: this.form.content,
                    id: this.form.id
                };
                if (par.name) {
                    par.name = par.name.replace(/\s+/g,"")
                }
                if(!par.name || this.surnames.indexOf(par.name.charAt(0)) < 0){
                    this.$refs.ancestor.focus();
                    this.$toast.error('请正确输入姓名');
                    return false
                }
                const vds = document.getElementById('mds').innerText
                if(vds){
                    par.summary = vds.substring(0,30);
                }
                if(this.upimgs&&this.upimgs.length>0){
                    const vd = document.getElementById("mds").getElementsByTagName('img')[0]
                    if(vd){
                        par.cover = vd.src.replace(this.$BASECDN,'/')
                    }else {
                        this.upimgs.forEach(it=>{
                            this.imgAdd(it)
                        })
                        par.cover = '/cdn/'+ this.userInfo.id+'/img/'+this.upimgs[0]+'.jpg)'
                        par.content = this.form.content
                    }
                }
                this.saveList(par.name,par);

                if(this.token || this.confirmLock ){
                    this.disabled=true;
                    let url = 'people';
                    if(this.articleId){
                        url = 'article/people'
                        par.articleId = this.articleId
                    }
                    this.$post(url, par).then( res =>{
                        // if(res){
                            this.$toast.success('发布成功');
                            this.$router.push('/people/t?id='+(par.id || res.id));

                            // 保存id方便游客用户继续编辑
                            // let list = this.$getStorage('my_people') || [];
                            // list.push(res.id)
                            // this.$setStorage('my_people', list)
                            //
                            // // 清除本地相应内容免得重复发布
                            // let nr = this.$getStorage('people');
                            // if(res.content ==  nr.pop().content){
                            //     this.$setStorage('people',nr)
                            // }
                        // }
                        this.disabled=false;
                    }).catch( err => {
                        this.disabled=false;
                    })
                }else {
                    this.$store.commit('SET_SIGNPOP',true)
                    // this.showConfirm = true
                }
            },
            saveList(t,c){
                let li = this.$getStorage('people'),newArr=[];
                if(li){
                    li.forEach((it) => {
                        if(it.name!=t){
                            newArr.push(it)
                        }
                    })
                }
                newArr.push(c);
                this.$setStorage('people',newArr);
                this.items = newArr
            },
        },
        destroyed(){
        }
    }
</script>
