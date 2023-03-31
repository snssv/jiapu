<template lang="pug">
    .editor

        .step2(:class="{review: review}")
            .left
                .tips 预览
                .wrap
                    .det_top
                        .title
                            span {{form.address}}
                            b {{form.ancestor||'___'}}
                            span 家谱
                        .ul
                            .li 民族：{{form.clan}}
                            .li 字辈：{{form.seniority}}
                .treebox_head
                    .fl
                        b 成员树
                        sub 保存家谱后再继续编辑家谱成员
                .treebox
                    .tree
                        TreeChart(:json="treeDemo")
                .wrap
                    .mdview_tit 家谱详述：
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
                        dt 始祖
                        dd
                            input.inp(placeholder="始祖/始迁祖姓名", v-model="form.ancestor", :readonly="form.id" maxlength="6", ref='ancestor')
                        dt 民族
                        dd
                            input.inp(placeholder="请选择", v-model="form.clan", readonly="true" @click="clansSet = !clansSet")
                            .clans_set(:class="{hide: !clansSet}")
                                b(v-for="it in clans" @click="form.clan = it; clansSet = false") {{it}}

                    dl
                        dt 字辈
                        dd
                            input.inp(placeholder="例：再正通光昌胜秀", v-model="form.seniority", maxlength="30")


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

                .private_set(:class="{open:setPrivate}")
                    p
                        span 如果你不想公开此家谱，请
                        b(@click="setPrivate = !setPrivate") 点此
                        span 设置访问码以便你的亲友访问
                    input.inp(placeholder="请输入4位访问码，如果不填则为公开", v-model="form.privateCode", maxlength="4")




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
                clansSet: false,
                hisItem: null,
                hisInd: 0,
                treeDemo:{
                    name: '始祖',
                    mate:[{name:'配偶',sex:0}],
                    children:[{name:'长子'},{name:'长女',sex:0},{name:'次子'},{name:'次女',sex:0},{name:'义子',godson:1}]
                },
                token: localStorage.getItem('token')?'Bearer '+ localStorage.getItem('token'):'',
                upimgs: [],
                surnames: CONT.surnames,
                form: {
                    ancestor: null,
                    clan: '侗',
                    seniority:null,
                    privateCode:null,
                    content: null,
                    lat:null,
                    lng:null,
                    address:null,
                    cover:null,
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
                editName:null,
            }
        },
        watch: {
            '$route.query.id'(){
                this.init()
            },
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
            }
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
                }
                const li = this.$getStorage('article');
                if(!this.$route.query.md  && !this.$route.query.id){
                    this.form.content = null;
                    this.form.name = this.$datex();
                }

                if(this.$route.query.md && li){
                    this.form = li[parseInt(this.$route.query.md)]
                    delete this.form.id
                }
                if(this.$route.query.id){
                    this.$get('article/'+this.$route.query.id+'/0').then( res => {
                        if(res.user&&res.user.id==this.userInfo.id){
                            const newRes = {
                                ...res,
                            }
                            delete newRes.user;
                            delete newRes.updateAt;
                            delete newRes.createAt;
                            this.form = newRes;
                            if(res.tree){
                                const Tre = JSON.parse(res.tree)
                                this.treeDemo = Tre
                                if(Tre.name !== this.form.ancestor){
                                    this.form.ancestor = Tre.name
                                }
                            }else {
                                this.treeDemo = {
                                    name: '待添加',
                                    children:[{name:'长子'},{name:'次子'}]
                                }
                            }
                        }else {
                            this.$toast.error('你不是作者')
                        }
                    }).catch( err => {})
                }else {
                    this.form.ancestor = null
                    this.form.ancestorId = null
                    this.form.seniority = null
                    this.form.id = null
                    this.form.cover = null
                    this.form.content = null
                }

                if(!this.form.lat){
                    this.form.lat = this.zb.lat;
                    this.form.lng = this.zb.lng;
                    this.form.address = this.zb.address;
                }
            },
            cleanCon(){
                this.form.content = null
                this.form.ancestor = null
                this.form.seniority = null
            },
            autoSave (){
                const Tarr = this.$getStorage('editorArticle')||[];
                const con = this.form.content && this.form.content.trim()
                if(con && con.length>10 && Tarr.indexOf(con)<0){
                    // this.$toast('已自动保存')
                    Tarr.push(con);
                    if(Tarr.length>10){
                        Tarr.shift(-1)
                    }
                    this.$setStorage('editorArticle',Tarr)
                }
            },
            showHis(){
                this.autoSave();
                let his = this.$getStorage('editorArticle');
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
            publish(){
                let par = {
                    ancestor: this.form.ancestor,
                    ancestorId: this.form.ancestorId,
                    seniority: this.form.seniority,
                    privateCode: this.form.privateCode,
                    clan: this.form.clan,
                    cover: this.form.cover,
                    lat: this.form.lat,
                    lng: this.form.lng,
                    address: this.form.address,
                    content: this.form.content,
                };
                if (par.ancestor) {
                    par.ancestor = par.ancestor.replace(/\s+/g,"")
                }
                if(!par.ancestor || this.surnames.indexOf(par.ancestor.charAt(0)) < 0){
                    this.$refs.ancestor.focus();
                    this.$toast.error('请正确输入始祖姓名');
                    return false
                }
                if(this.form.id || this.$route.query.id){
                    delete par.ancestorId
                    par.id = this.form.id || this.$route.query.id
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

                if(this.$route.query.id){
                    par.name = this.editName
                }

                this.saveList(par.name,par);

                if(this.token || this.confirmLock ){
                    this.disabled=true;
                    this.$post('article', par).then( res =>{
                        if(res){
                            this.$toast.success('发布成功');
                            this.$router.push('/article/t?id='+res.id);

                            // 保存id方便游客用户继续编辑
                            let list = this.$getStorage('my_article') || [];
                            list.push(res.id)
                            this.$setStorage('my_article', list)

                            // 清除本地相应内容免得重复发布
                            let nr = this.$getStorage('article');
                            if(res.content ==  nr.pop().content){
                                this.$setStorage('article',nr)
                            }
                        }
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
                let li = this.$getStorage('article'),newArr=[];
                if(li){
                    li.forEach((it) => {
                        if(it.name!=t){
                            newArr.push(it)
                        }
                    })
                }
                newArr.push(c);
                this.$setStorage('article',newArr);
                this.items = newArr
            },
        },
        destroyed(){
        }
    }
</script>
