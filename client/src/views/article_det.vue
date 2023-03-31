<template lang="pug">
    .page_det
        .loading2(v-if="loading" )
        .private(v-else-if="isPrivate" )
            input.inp(placeholder="私密家谱，请输入密码访问" maxlength="4" v-model="privateCode" ref="Private" @keyup.enter="getPrivateData")
            .btn(@click="getPrivateData") 确定
        .data_bk(v-else)
            .dialogTree(:class="{show: isEdit && showPop}")
                .bg
                .wrap
                    i.icon-close(@click="showPop = null")
                    .head(v-if="showPop === 8" ) 编辑{{treeSet? treeSet.name:'__'}}信息
                    .head(v-else-if="showPop === 9" ) 移除{{treeSet? treeSet.name:'__'}}
                    .head(v-else)
                        span 给{{treeSet? treeSet.name:'__'}}添加{{childArr[showPop-1]}}信息
                        sub(v-if="showPop == 6" ) （将替换始迁祖）
                    .cont(v-if="showPop === 9" )
                        h2 确定要从家谱成员树中移除{{treeSet? treeSet.name:'__'}}吗？
                        p 人物信息仍存留在数据库中。
                    .cont(v-else)
                        .address(v-if="form")
                            .fl
                                input.inp(placeholder="请选取或输入所在地址" v-model='treeForm.address')
                            .fr(@click="showMap=true")
                                .lat lat: {{treeForm.lat}}
                                .lng lng: {{treeForm.lng}}
                            .fi(@click="showMap=true")
                                i.icon-location
                        dl
                            dt 姓名
                            dd.col3
                                input.inp(v-model="treeForm.name" :placeholder="'请输入姓名'+(showPop===8?'':'或6位编码检索')" ref="Name" )
                                .choose.people_set(v-if="treeSet && showPop>0  && showPop < 8" :class="{show:peoplesTotal>0}")
                                    i.icon-close.hover(@click="peoplesTotal=0")
                                    .head2 附近查到{{peoplesTotal}}个相似人物，如果确定是{{treeSet.name}}的{{childArr[showPop-1]}}，请直接点击“选择”按钮继续
                                    .con
                                        .li(v-for="(it,ind) in peoples" )
                                            dl
                                                dt(@click="$open(1,it.id)") {{it.name}}
                                                dd
                                                    p [{{it.code}}]，{{sexArr[it.sex]}}，{{it.clan}}族，生于{{$dayjs(parseInt(it.birthAt)).format('YYYY-MM-DD')}}
                                                    p {{it.summary || it.address}}
                                            .btn.jv.xxs(@click="choosePeople(it)") 选择
                        dl
                            dt 民族
                            dd
                                input.inp(v-model="treeForm.clan" placeholder="请选择" readonly="true" @click="clansSet = !clansSet")
                                .choose.clans_set(:class="{hide: !clansSet}")
                                    b(v-for="it in clans" @click="treeForm.clan = it; clansSet = false") {{it}}
                            dt 性别
                            dd
                                input.inp(v-model="sexArr[treeForm.sex]" placeholder="请选择" readonly="true" @click="sexSet = !sexSet")
                                .choose.sex_set(v-if="showPop === 1 || showPop > 5" :class="{show:sexSet}")
                                    .li(v-for="(it,ind) in sexArr" @click="treeForm.sex = ind;sexSet=false") {{it}}
                        dl
                            dt 生于
                            dd
                                .date_bar
                                    .val(v-if="treeForm.birthAt")
                                        span(@click="setDate(0)") {{$dayjs(treeForm.birthAt).format('YYYY-MM-DD')}}
                                        i.icon-close(@click="treeForm.birthAt=null")
                                    .val(v-else @click="setDate(0)")
                                        b 选择出生日期
                                        i.icon-calendar
                            dt 殁于
                            dd
                                .date_bar
                                    .val(v-if="treeForm.deathAt")
                                        span(@click="setDate(1)") {{$dayjs(treeForm.deathAt).format('YYYY-MM-DD')}}
                                        i.icon-close(@click="treeForm.deathAt=null")
                                    .val(v-else @click="setDate(1)")
                                        b 在世为空
                                        i.icon-calendar
                        dl
                            dt 详述
                            dd.col3
                                textarea.inp(placeholder="人物生平介绍，也可以后续补充" v-model="treeForm.content" )
                    .foot
                        .btn.xs.hui(@click="showPop = null") 取消
                        .btn.xs(@click="savePeople") 确定
            .left
                .wrap
                    .det_top
                        .title
                            span {{form.address}}
                            b {{form.ancestor}}
                            span 家谱
                        .ul
                            .li 民族：{{form.clan}}
                            .li 字辈：{{form.seniority}}
                        .ul.backup(v-if="userInfo && form && form.user && userInfo.id === form.user.id" )
                            .btn.xxs.lan(@click="backup(1)") 备份
                            .btn.xxs.hon(@click="backup(2)") 导入备份
                            .btn.xxs.lan(@click="backup(3)") 线上备份
                            .btn.xxs.jv(@click="backup(4)") 版本恢复
                            .btn.xxs(@click="$router.push('/article/edit?id='+form.id+'')") 编辑
                            .dialog_backup(:class="{show:backupShow, intop:backupShow === 4}")
                                .bg(@click="backupShow=null")
                                .cont(v-if="backupShow === 1" )
                                    .btn_group
                                        i.icon-close(@click="backupShow=null")
                                    .head 你可以将本家谱数据复制到本地保存，将来可以从备份恢复
                                    .con
                                        textarea.inp(v-model="backupA" readonly="true" ref="backupA" )
                                .cont(v-if="backupShow === 2" )
                                    .btn_group
                                        .btn.xxxs.hon(@click="backupPush") 提交
                                        i.icon-close(@click="backupShow=null")
                                    .head 从备份中复制数据到下面文本框后提交
                                    .con
                                        textarea.inp(v-model="backupB" ref="backupB" )
                                .cont.back_online(v-if="backupShow === 4" )
                                    .btn_group
                                        .btn.xxxs(@click="setBackup1") 预览
                                        .btn.xxxs.hon(@click="setBackup2") 恢复
                                        .btn.xxxs.lan(@click="setBackup3") 删除
                                        i.icon-close(@click="backupShow=null")
                                    .head 选中版本后预览或恢复
                                    .con
                                        b(v-for="(it,ind) in backupList" :class="{active:ind === backSetInd}" @click="backSetInd = ind") {{$dayjs(it.createAt).format('MMDDHHmm')}}

                .treebox_head(v-if="form && form.user" )
                    .fl
                        b 成员树
                        sub(v-if="isEdit" ) 选中成员后添加/编辑
                        sub(v-else-if="hasManage()") 点右边按钮编辑成员树
                        sub(v-else) 亲属可以向创建者申请成为管理员
                    .fr
                        .btn.xxs(v-if="hasManage()" @click="isEdit=!isEdit") {{isEdit?'结束':'开始'}}编辑
                        .btn.xxs(v-else @click="openManage" :class="{disabled:disaManage}") {{disaManage?'已经申请':'申请管理'}}
                        .manage_form(:class="{show:showManage}")
                            i.icon-close(@click="showManage=false")
                            .head 申请成为{{form.ancestor}}家谱管理员
                            textarea.inp(v-model="manageContent" ref="Manage" placeholder="你可以留下联系方式及申请理由给家谱创建者，创建者审核通过后你即将对家谱共同管理。")
                            .btn.xs(@click="pushManage") 提交

                .treebox_head(v-else)
                    .fl
                        b 成员树
                        sub 创建人或家谱管理员可以编辑成员树

                .treebox(:class="{isEdit:isEdit && treeSet && treeSet.name}")
                    .menu
                        .li(:class="{disabled:treeSet&&rmPeople&&rmPeople.indexOf(treeSet.id)>=0}" @click="showPopX(8)") 详细信息
                        .li(v-if="treeSet&&treeSet.root" @click="showPopX(6)") 添加父亲
                        .li(:class="{disabled:treeSet&&(treeSet.children || treeSet.root)}" @click="showPopX(9)") 移除{{treeSet?treeSet.name:''}}
                        .li(v-for="(it,ind) in childArr" :class="{disabled:editMate||treeSet&&rmPeople&&rmPeople.indexOf(treeSet.id)>=0}" @click="showPopX(ind+1)") 添加{{it}}
                    .tree
                        TreeChart(:json="treeDemo" :treeSet="treeSet" @click-node="clickNode" @click-mate="clickMate")
                .wrap
                    .mdview_tit 家谱详述：
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


                .comment_form(:class="{mob_min:mobMin}")
                    .reply(v-if="reply")
                        i.icon-close(@click="reply=null")
                        span 引用回复：{{reply.nickname}} {{reply.content}}
                    textarea.inp(v-model="formB.content", placeholder="如需纠错请留言，你的留言将受家谱创建者审核", ref="replyc", :class="{pad:reply}" @focus="mobInp()" @blur="mobInp(1)" maxlength="200")
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
                                span.tm {{$dayjs(it.createAt).format('YYYY-MM-DD HH:mm:ss')}}
                            FeelingBar(:val="it.feeling", :uid="it.id", :type="2")
                            .fr
                                i.icon-trash.hover(v-if="userInfo && form && form.user && (userInfo.id === form.user.id || userInfo.id === it.user.id || userInfo.role > 3)" @click="rmComment(it.id)")
                                i.icon-trash.disabled(v-else )
                        .pre {{it.content}}
                        .child(v-if="it.children" v-for="(itx,indx) in it.children")
                            .tit
                                .fl
                                    span.nm {{itx.nickname}}
                                    span.tm {{$dayjs(itx.updateAt).format('YYYY-MM-DD HH:mm:ss')}}
                                .fr
                                    FeelingBar(:val="itx.feeling", :uid="itx.id", :type="2")

                            .pre {{itx.content}}

        mapSet(:lat='treeForm.lat || zb.lat', :lng='treeForm.lng || zb.lng', :address='treeForm.address', v-if="showMap", @closeMap="setBack")
        dialogconfirm(:show-dialog='showConfirm', :ok-text="confTok", :cancel-text="confTcancel", :content="confTcon", v-on:confirm='confirmFn', v-on:cancel='cancelFn', :hide-confirm='false')

</template>

<script>
import {regId, regPhone} from '../utils/validate'
import {mapGetters} from "vuex"
import FeelingBar from './mo_feeling'
import TreeChart from "./mo_tree";
import CONT from '../utils/const'
import mapSet from '@/views/mo_map_set'
import dialogconfirm from '@/views/mo_confirm'

export default {
    components: {
        FeelingBar, TreeChart, mapSet, dialogconfirm
    },
    data() {
        return {
            deviceId: localStorage.getItem('mira'),
            mobInv: null,
            mobMin: true,
            loading: true,
            isEdit: false,
            editMate: false,
            showMap: false,
            showPop: null,
            treeSet: null,
            isPrivate: true,
            clans: CONT.clans,
            clansSet: false,
            sexSet: false,
            childArr: ['配偶', '儿子', '女儿', '义子', '义女', '父亲'],
            treeDemo: null,
            privateCode: null,
            showManage: false,
            disaManage: false,
            manageContent: null,
            backupList: null,
            backupShow: null,
            backupA: null,
            backupB: null,
            backSetInd: 0,
            form: {
                "cover": null,
                "content": "",
                "level": 0,
                "lat": 0,
                "lng": 0,
                "address": 0,
            },
            sexArr: CONT.sexArr,
            dateSet: 0,
            zb: this.$getStorage('zb'),
            treeForm: {
                address: this.$getStorage('zb').address,
                lat: this.$getStorage('zb').lat,
                lng: this.$getStorage('zb').lng,
                name: '',
                clan: '',
                sex: 1,
                birthAt: null,
                deathAt: null,
                content: null
            },
            articleId: null,
            peoples: null,
            peoplesTotal: 0,
            items: [],
            total: 0,
            disabled: false,
            formB: { // 留言表单
                content: null,
                nickname: null,
                type: 0,
                hostId: this.$route.query.id
            },
            token: localStorage.getItem('token') ? 'Bearer ' + localStorage.getItem('token') : '',
            isToken: false,
            reply: null,
            tags: [],
            levelPop: false,
            chatFrame: null,
            surnames: CONT.surnames,
            rmPeople: this.$getStorage('rmPeople') || [],
            rmCommentId: null,
            showConfirm: false,
            confTok: '确定',
            confTcancel: '取消',
            confTcon: '确定要删除这条留言吗？',
        }
    },
    mounted() {
        this.getData()
        if (this.userInfo && this.userInfo.nickname) {
            this.formB.nickname = this.userInfo.nickname
            this.isToken = true
        }
    },
    computed: {
        ...mapGetters(["calen", "userInfo"])
    },
    methods: {
        rmComment(id) {
            this.showConfirm = true
            this.rmCommentId = id
        },
        confirmFn() {
            this.$post('comment/delete/' + this.rmCommentId).then(res => {
                this.getComment()
            }).catch()
            this.showConfirm = false;
        },
        cancelFn() {
            this.showConfirm = false;
        },
        clickNode(node) {
            // delete node.extend
            const sdd = JSON.parse(JSON.stringify(node))
            delete sdd.extend
            this.treeSet = sdd
            // this.$toast('open:' + sdd.id)

            if (!this.isEdit) {
                this.$open(1, sdd.id)
            }
            // console.log(1,node)
            // console.log(2,this.treeSet)
        },
        clickMate(node) {
            // delete node.extend
            this.editMate = node
            if (!this.isEdit) {
                this.$open(1, node.id)
            }
        },
        showPopX(t) {
            if (t === 9) {
                // 移除当前人物
                if (this.treeSet.children && this.treeSet.children.length) {
                    this.$toast.error('移除失败，请先移除子成员')
                } else if (this.treeSet && this.rmPeople && this.rmPeople.indexOf(this.treeSet.id) >= 0) {
                    this.savePeople(9)
                } else {
                    this.showPop = t
                }
            } else {
                this.clansSet = false;
                this.sexSet = false;
                if (t === 8) {
                    this.$get('people/' + this.treeSet.id).then(res => {
                        if (res) {
                            this.treeForm = {
                                name: res.name,
                                address: res.address,
                                lat: res.lat,
                                lng: res.lng,
                                clan: res.clan,
                                sex: res.sex,
                                birthAt: parseInt(res.birthAt),
                                deathAt: parseInt(res.deathAt),
                                content: res.content
                            }
                        }
                    }).catch(err => {
                        if (err.status === 418) {
                            this.$toast.warning(this.treeSet.name + '已被删除，你可以重新创建')
                            this.rmPeople.push(this.treeSet.id)
                            this.$setStorage('rmPeople', this.rmPeople)
                            this.treeSet = null
                            this.showPop = null
                        }
                    })
                } else {
                    if (t !== 1) {
                        this.treeForm.clan = this.form.clan
                        this.treeForm.address = this.form.address
                        this.treeForm.lat = this.form.lat
                        this.treeForm.lng = this.form.lng
                    }
                    this.treeForm.name = t === 2 || t === 3 || t === 6 ? this.form.ancestor.charAt(0) : null;
                    this.treeForm.birthAt = null;
                    this.treeForm.deathAt = null;
                }
                this.peoples = []
                this.peoplesTotal = 0
                this.showPop = t
                this.$refs.Name.focus()
                this.treeForm.sex = this.showPop === 1 || this.showPop === 3 || this.showPop === 5 ? 0 : 1;
            }
        },
        setBack(t) {
            this.showMap = false;
            if (t && t.lat) {
                this.treeForm.lat = t.lat;
                this.treeForm.lng = t.lng;
                this.treeForm.address = t.address;
                this.$setStorage('zb', t)
            }
        },
        setBackup1() {
            const cd = JSON.parse(this.backupList[this.backSetInd].content)
            if (cd.tree) {
                this.treeDemo = JSON.parse(cd.tree);
            } else {
                this.treeDemo = {name: this.form.ancestor, root: true}
            }
            this.form.content = cd.content;
        },
        setBackup2() {
            this.setBackup1()
            const cd = JSON.parse(this.backupList[this.backSetInd].content)
            const tm = this.$dayjs(this.backupList[this.backSetInd].createAt).format('YYYY-MM-DD hh:mm:ss')
            this.$post('article', {
                id: this.form.id,
                tree: cd.tree,
                content: cd.content
            }).then(res => {
                if (res) {
                    this.$toast.success('已经恢复到' + tm + '备份版本');
                }
            }).catch()
        },
        setBackup3() {
            this.$post('backup/delete/' + this.backupList[this.backSetInd].id).then(res => {
                this.backupList.splice(this.backSetInd, 1)
            }).catch()
        },
        hasManage() {
            if (!this.userInfo) {
                return false
            }
            let sf = false;
            if (this.form.manageId && this.form.manageId.indexOf(this.userInfo.id) >= 0) {
                if (this.form.user.id !== this.userInfo.id) {
                    this.articleId = this.form.id
                }
                sf = true
            }
            return this.form.user.id === this.userInfo.id || sf
        },
        openManage() {
            if (!this.token) {
                this.$store.commit('SET_SIGNPOP', true)
            } else {
                this.$post('manage/check/', {id: this.$route.query.id}).then(res => {
                    // console.log(res)
                    if (res) {
                        this.$toast('已经提交过申请，请等待创建者审核')
                        this.disaManage = true
                    } else {
                        this.showManage = true
                    }
                }).catch()
            }
        },
        pushManage() {
            if (!this.manageContent || this.manageContent.length < 11) {
                this.$toast.error('请认真输入申请内容')
                this.$refs.Manage.focus()
            } else {
                this.$post('manage', {
                    hostId: this.$route.query.id,
                    content: this.manageContent
                }).then(res => {
                    this.showManage = false
                    this.disaManage = true
                }).catch()
            }
        },
        setDate(t) {
            this.dateSet = t;
            let dt = new Date(t == 0 ? parseInt(this.treeForm.birthAt) || Date.now() : parseInt(this.treeForm.deathAt) || Date.now());
            changeDate(dt.getFullYear(), dt.getMonth() + 1)
            // changeDate(2013,dt.getMonth()+1)
            this.$store.commit('SHOW_CALEN', true)
        },
        mobInp(t) {
            if (t) {
                this.mobInv = setTimeout(() => {
                    this.mobMin = true
                }, 3000)
            } else {
                this.mobMin = false
                clearTimeout(this.mobInv);
                this.mobInv = null;
            }
        },
        getPrivateData() {
            if (this.privateCode) {
                this.getData(this.privateCode)
            } else {
                this.$toast.error('请输入密码访问');
                this.$refs.Private.focus()
            }
        },
        getData(code) {
            const id = this.$route.query.id;
            if (!id) {
                return false;
            }
            if (regId(id)) {
                if (!code && this.$getStorage('private' + this.$route.query.id)) {
                    code = this.$getStorage('private' + this.$route.query.id)
                }
                this.$get('article/' + this.$route.query.id + '/' + (code || 0)).then((res) => {
                    this.$setStorage('private' + this.$route.query.id, code)
                    this.form = res;
                    // this.$toast(res.user.nickname)
                    document.title = res.ancestor + '家谱-' + res.address
                    this.isPrivate = false
                    this.loading = false
                    if (res.tree) {
                        this.treeDemo = JSON.parse(res.tree)
                    }
                    if (!res.tree && res.ancestorId) {
                        this.$get('people/' + res.ancestorId).then((res2) => {
                            if (res2) {
                                this.treeDemo = {
                                    id: res2.id,
                                    root: true,
                                    name: res2.name,
                                    sex: res2.sex,
                                    clan: res2.clan,
                                    address: res2.address,
                                    birthAt: res2.birthAt,
                                    deathAt: res2.deathAt
                                }
                            }
                        }).catch()
                    }
                    this.getComment()
                }).catch((err) => {
                    if (err && err.data) {
                        if (err.data.statusCode === 406) {
                            this.isPrivate = true
                            localStorage.removeItem('private' + this.$route.query.id)
                        }
                        if (err.data.statusCode === 418) {
                            this.$router.push('/article')
                        }
                    }
                })
            } else {
                this.$toast('找不到该页面');
                this.$router.push('/mine/article')
            }
        },
        getComment() {
            this.$get('comment/host/' + this.$route.query.id + '').then(res => {
                if (res && !res.data) {
                    this.items = res[0]
                    this.total = res[1]
                }
            }).catch()
        },
        commentUp() {
            let par = this.formB;
            if (!this.token) {
                this.$toast('登录后再留言');
                this.$store.commit('SET_SIGNPOP', true)
                return false
            }
            if (!par.content || par.content.length < 7) {
                this.$toast.error('内容至少7个字');
                this.$refs.replyc.focus()
                return false
            }
            this.disabled = true;
            this.$post('comment', par).then(res => {
                if (res && !res.data) {
                    this.$toast.success('发布成功');
                    this.formB.content = null
                    this.getData()
                }
                this.disabled = false;
            }).catch(err => {
                this.disabled = false;
            })
        },
        toChat() {
            this.$store.commit('SET_ACTIVE_ROOM', {
                type: 'a',
                id: this.form.id,
                name: this.form.id.substring(0, 8).toLocaleUpperCase() + '聊吧'
            });
            this.$router.push('/chat?type=a&id=' + this.form.id)
        },
        choosePeople(it) {
            this.$post('people/link', {
                id: it.id,
                type: 1, // 0为unlink
                articleId: this.form.id
            }).then(res => {
                if (res) {
                    this.changeTree(res)
                }
            }).catch()
        },
        changeTree(res) {
            // 更新树结构
            // console.log(res)
            const newPar = {
                id: res.id || this.treeSet.id,
                type: this.showPop,
                name: res.name,
                address: res.address,
                clan: res.clan,
                sex: res.sex,
                birthAt: res.birthAt,
                deathAt: res.deathAt,
            }
            // console.log(newPar)
            const vs = JSON.stringify(this.treeDemo).replaceAll(',"extend":true', '')
            const old = JSON.stringify(this.treeSet).replaceAll(',"extend":true', '')
            if (this.showPop === 6) {
                // 添加父亲
                // console.log(vs)
                // vs.replace('"root":true,', '')
                delete this.treeDemo.root
                delete this.treeSet.root
                this.treeDemo = {
                    ...newPar,
                    root: true,
                    children: [this.treeDemo]
                }
                this.form.ancestor = res.name
            } else {
                if (this.showPop === 8) {
                    this.treeSet = {
                        ...this.treeSet,
                        ...newPar
                    }

                } else {
                    if (this.showPop === 4 || this.showPop === 5) {
                        newPar.godson = true
                    }
                    if (this.showPop === 1) {
                        let ms = this.treeSet.mate || []
                        ms.push(newPar)
                        this.treeSet.mate = ms
                    } else {
                        let ms = this.treeSet.children || []
                        ms.push(newPar)
                        this.treeSet.children = ms
                    }
                }
                this.treeDemo = JSON.parse(vs.replace(old, JSON.stringify(this.treeSet)))
            }
            this.saveTree()
        },
        savePeople(t) {
            const par = {
                name: this.treeForm.name,
                address: this.treeForm.address,
                lat: this.treeForm.lat,
                lng: this.treeForm.lng,
                clan: this.treeForm.clan,
                sex: this.treeForm.sex,
                birthAt: this.treeForm.birthAt,
                deathAt: this.treeForm.deathAt,
                content: this.treeForm.content
            }
            if (this.showPop === 9 || t === 9) {
                // 删除
                if (!t) {
                    this.$post('people/link', {
                        id: this.treeSet.id,
                        type: 0, // 0为unlink
                        articleId: this.form.id
                    }).then().catch()
                }
                // 更新树结构
                const vs = JSON.stringify(this.treeDemo).replaceAll(',"extend":true', '')
                const old = JSON.stringify(this.treeSet).replaceAll(',"extend":true', '')
                const th1 = vs.replaceAll(old, '')
                this.treeDemo = JSON.parse(th1
                    .replace(/,,/g, ',').replace(/,,/g, ',')
                    .replace(/,]/g, ']').replace(/,]/g, ']')
                    .replace(/\[,/g, '[').replace(/\[,/g, '[')
                    .replace(/,}/g, '}').replace(/,}/g, '}')
                    .replace(/\{,/g, '{').replace(/\{,/g, '{')
                )
                this.saveTree()
                this.treeSet = null
            } else {
                if (!par.name || this.surnames.indexOf(par.name.charAt(0)) < 0) {
                    this.$toast.error('请正确输入姓名')
                    this.$refs.Name.focus()
                    return false
                }
                if (!par.birthAt) {
                    this.$toast.error('请选择出生日期')
                    return false
                }
                let url = 'people';
                if (this.showPop === 8) {
                    par.id = this.treeSet.id
                    if (this.articleId) {
                        url = 'article/people'
                        par.articleId = this.articleId
                    }
                } else {
                    par.catalog = this.form.id
                }
                this.disabled = true
                this.$post(url, par).then(res => {
                    if (res) {
                        this.changeTree(res)
                    } else if (this.showPop === 8 && this.articleId) {
                        this.$toast.success('修改成功')
                        this.changeTree(this.treeForm)
                    }
                    this.disabled = false;
                }).catch(err => {
                    this.disabled = false;
                })
            }
        },
        saveTree() {
            setTimeout(() => {
                let odd = JSON.stringify(this.treeDemo).replaceAll(',"extend":true', '')
                this.treeForm = JSON.parse(odd)
                this.$post('article', {
                    id: this.form.id,
                    ancestor: this.treeDemo.name,
                    tree: odd
                }).then(res => {
                    if (res) {
                        this.$toast.success('修改已保存');
                    }
                }).catch()
                this.showPop = null
            }, 1200)
        },
        backup(t) {
            this.backupShow = t;
            if (t === 1) {
                this.backupA = JSON.stringify({
                    id: this.form.id,
                    ancestor: this.form.ancestor,
                    seniority: this.form.seniority,
                    clan: this.form.clan,
                    tree: this.form.tree,
                    content: this.form.content,
                })
                setTimeout(() => {
                    this.$refs.backupA.select()
                }, 200)
            } else if (t === 2) {
                setTimeout(() => {
                    this.$refs.backupB.focus()
                }, 200)
            } else if (t === 3) {
                this.$post('backup/' + this.form.id).then(res => {
                    this.$toast.success('备份成功');
                    this.backupShow = null
                }).catch(err => {
                    this.backupShow = null
                })
            } else if (t === 4) {
                this.$get('backup/' + this.form.id).then(res => {
                    this.backupList = res[0]
                }).catch()
            }
        },
        backupPush() {
            const par = this.backupB
            if (par && par.length > 10) {
                try {
                    const par2 = JSON.parse(par)
                    if (par2 && regId(par2.id) && par2.id === this.$route.query.id) {
                        this.$post('article', par2).then(res => {
                            this.backupB = null
                            this.backupShow = null
                            this.$toast('备份更新成功')
                            this.getData()
                        })
                    } else {
                        this.$toast.error('数据id不正确')
                    }
                } catch (err) {
                    this.$toast.error('数据格式不正确')
                }
            } else {
                this.$toast.error('请认真检查备份数据')
            }
        }
    },
    watch: {
        '$route.query.id'() {
            this.getData()
        },
        '$route'(to, from) {
            if (from.path === '/article/edit') {
                this.getData()
            }
        },
        calen() {
            if (this.dateSet === 0) {
                this.treeForm.birthAt = this.calen
            } else {
                this.treeForm.deathAt = this.calen
            }
        },
        'treeForm.name'() {
            if (this.treeForm.name) {
                this.treeForm.name = this.treeForm.name.replace(/\s+/g, '')
            }
            if (this.showPop !== 8 && this.treeForm.name && this.treeForm.name.length > 1) {
                let par = null
                if (this.surnames.indexOf(this.treeForm.name.charAt(0)) >= 0) {
                    // 用姓名去搜索people
                    par = {name: this.treeForm.name}
                } else if (this.treeForm.name.length === 6) {
                    // 用编码去搜索people
                    par = {code: this.treeForm.name}
                }
                if (par) {
                    this.$get('people', par).then(res => {
                        this.peoples = res[0]
                        this.peoplesTotal = res[1]
                    }).catch()
                }
            }
        },
    },
    activated() {

    },
    deactivated() {

    }
}
</script>
