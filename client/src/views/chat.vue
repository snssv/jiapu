<template lang="pug">
    .chat(:class="{showRight:showRight,showLeft:showLeft}")
        .header
            .fl
                i.close.icon-menu(@click="showLeft = !showLeft")
                sup(v-if="newMsgTotal>0") {{newMsgTotal}}

            .tit {{activeRoom?activeRoom.name:'即时聊'}}
            .fr(@click="showRight=!showRight" v-if="activeRoom")
                .avatar
                sup(v-if="activeRoom.type=='a' && onlineUsers && onlineUsers[activeRoom.id]") {{onlineUsers[activeRoom.id].length}}
        .edit_bg(v-if="groupEdit" @click="groupEdit=false")
        .addGroup(v-if="groupEdit")
            h3 创建群组
            .close.icon-close(@click="groupEdit=false")
            .main
                input.inp(v-model="groupPar.name" maxlength="20" placeholder="群名")
                input.inp(v-model="groupPar.password" maxlength="20" placeholder="入群口令")
                textarea.inp(v-model="groupPar.summary" maxlength="240" placeholder="简介")
                .foot
                    .btn.empty(v-if="!token" @click="$store.commit('SET_SIGNPOP',true)")  抱歉，游客不能建群
                    .btn(v-else @click="addGroup") 确定创建
        .left_bg(@click="showLeft=false")
        .left
            .head
                .logo(@click="$router.push('/')")
                //i.icon-search(@click="setRoom(null);$router.push('/chat')")

            .geli(v-for="(itx,im) in roomGather" v-if="im!='g'")
                h3
                    b {{lnx[im]}}
                    sub [{{itx.length}}]
                i.icon-location.add(@click="showMap=true" v-if="im=='a'")
                .user_li
                    .sm(v-if="itx.length<1")
                        p(v-if="im=='a'" @click="showMap=true") 请选择你所在区域
                        p(v-if="im=='f'" @click="$router.push('author')")
                        p(v-if="im=='g'")
                    .li(v-else v-for="it in itx" @click="setRoom(it)")
                        .avatar(:style="$avatarT(it.id)")
                            .img(v-if="it.id&&it.id.length>20" :style="$avatar(it.id)")
                        h4 {{it.name}}
                        .ms(v-if='historyMsg && historyMsg[it.id]')
                            p {{lastHis(it.id)}}
                            sub {{lastHis(it.id,1)}}
                        sup(v-if="newMsg&&newMsg[it.id]" :id="'x'+it.id.substr(0,5)") {{newMsg[it.id]}}

        .msg.groups(v-if="!activeRoom")
            .search
                input.inp(placeholder="兴趣查找[关键字：群名或简介]")
                .btn.xs 附近的群
            .groups_list(v-if="items")
                .li(v-for="it in items" v-if="it.name!='rootRoom'")
                    .cover_bg
                        .img(:style="$rbg(it.cover)")
                    .con
                        h3 {{it.name}}
                        p {{it.summary||'没有简介'}}
                    .wz
                        i.icon-location
                        span(v-if="it.lat") {{$distance(it.lat,it.lng)}}
                    .btn.xxxs(v-if="isNoJoin(it.id)" @click="joinGroup(it.id)")
                        span(v-if="joinHisX.indexOf(it.id)>=0") 申请被拒
                        span(v-else-if="joinHis.indexOf(it.id)>=0") 等待批准
                        span(v-else) 申请加入
                    .btn.xxxs.empty(v-else @click="setRoom({...it,type:'g'})") 进入聊天

        .geli(v-else)
            .msg#MsgArea(v-if="historyMsg" @click="showMoBar=false")
                .list(v-for="(it,ind) in historyMsg[activeRoom.id]" v-if="it.msg&&it.msg.c" :type="it.msg.t" :class="{me:it.user&&userInfo&&it.user.id==userInfo.id}")
                    .avatar(v-if="it.user" :style="$avatarT(it.user.id)")
                        .img(v-if="!/visit/.test(it.user.id)" :style="$avatar(it.user.id)")
                    .avatar(v-else)
                    .time
                        b {{it.user.nickname}}
                        sub {{it.time}}
                    .cont.img(v-if="it.msg.t==1")
                        b {{$size(it.msg.s)}}
                        p(v-if="$dayjs().diff($dayjs(it.time),'day')>2") 图片已过期{{$dayjs().diff($dayjs(it.time),'day')}}天
                        div(v-else @click="loadImg(ind,it.msg.c)")
                            p {{imgLoading==ind?'正在':'点击'}}加载图片
                            img(v-if="isLoaded(it)" :src="chatImg(it.time,it.msg.c)" :id="'img_'+ind")
                            img(v-else :alt="chatImg(it.time,it.msg.c)" :id="'img_'+ind")


                    .cont(v-else-if="it.msg.t==2") {{it.msg.c}}
                    .cont.file(v-else-if="it.msg.t==5" @click="openFile(it)")
                        i.icon-clip
                        span  {{it.msg.n}}
                        p {{$size(it.msg.s)}}
                    .cont(v-else) {{(it.msg.c).replace(/\n+/g,'\n')}}

                .list.me(v-if="upFlag")
                    .avatar(:style="$avatarT(userInfo.id)")
                        .img(:style="$avatar(userInfo.id)")
                    .time
                        b {{userInfo.nickname}}
                        sub {{tempMsg.time}}
                    .cont.img(v-if="tempMsg.type==2")
                        b {{$size(tempMsg.size)}}
                        p 正在发送图片
                        img
                    .cont.file(v-else-if="tempMsg.type==5")
                        i.icon-clip
                        span  正在发送{{tempMsg.name}}
                    .cont(v-else) {{tempMsg.cont}}



            .fix_inp(:class="{showMoBar:showMoBar}")
                .mob_bar(@click="showMoBar=!showMoBar")
                    i.icon-microphone


                textarea.inp(v-model="msgTxt" :type="inpHeight" maxlength="2000" @click="showMoBar=false" ref='msgTxt' @keyup.delete="inpHei" @keyup.enter="inpHei" @keyup.ctrl.enter="sendMsg(0)" :placeholder="isPc()?'Ctrl+Enter 发送':'点此输入'")
                .btn(@click="sendMsg(0)" v-if="msgTxt") 发送
                .pc_bar(v-else)
                    .li
                        input(type="file" accept="image/*" multiple="3" ref='imgy' @change="imgUp('imgy')")
                        i.icon-image
                    .li
                        input(type="file" ref='imgz' @change="fileUp('imgz')")
                        i.icon-clip



            .right_bg(@click="showRight=false")
            .right(v-if="activeRoom")
                .head
                    h4(v-if="onlineUsers[activeRoom.id]") {{activeRoom.type=='f'?'好友资料': onlineUsers[activeRoom.id].length+'人在线'}}
                //.f_info
                    .pre {{activeRoom.summary?(activeRoom.summary).replace(/\n+/g,'\n'):'--'}}
                    .btn_group
                        .btn.xxs.empty.hon(v-if="activeRoom.role==2" @click="cleanHis") 解散群组
                        .btn.xxs.empty(v-if="activeRoom.type=='a'" @click="$router.push('/article/detail?id='+activeRoom.id)") 故事详情
                        .btn.xxs.empty(v-else-if="activeRoom.role>0") 编辑群信息
                        .btn.xxs.empty(v-else) 退出群组

                .user_li(v-if="activeRoom.type=='a'")
                    .li(v-for="it in onlineUsers[activeRoom.id]" @click="addFriend(it)")
                        .avatar(:style="$avatarT(it.id)")
                            .img(v-if="it.id&&it.id.length>20" :style="$avatar(it.id)")
                        p {{it.nickname}}

                .user_li(v-if="activeRoom.type=='g' && groupUsers")
                    .li(v-for="it in groupUsers" @click="addFriend(it.user)")
                        .avatar(:style="$avatarT(it.user.id)")
                            .img(v-if="it.user.id&&it.user.id.length>20" :style="$avatar(it.user.id)")
                        p {{it.user.nickname}}
                        i.icon-star(:type="it.role")
        .confirm(:class="{show:invitation}")
            .icon-close.close(@click="invitation=null")
            .cont
                a(target="_blank" v-if="invitation" :href="'/#/user?id='+invitation.user.id") {{invitation.user.nickname}}
                span 申请加入群
                b(v-if="invitation") {{invitation.group.name}}
            .nav_tabs
                .tab.cancel(@click="joinGroupsInv(2)") 拒绝
                .tab.sure(@click="joinGroupsInv(1)") 批准



        mapSet(:lat='zb.lat', :lng='zb.lng', :address='zb.address', v-if="showMap", @closeMap="setBack")

</template>

<script>

    import mapSet from '@/views/mo_map_set'
    import { mapGetters } from "vuex"

    export default {
        components:{
            mapSet
        },
        data () {
            return {
                zb: this.$getStorage('zb1') || window.mrzb,
                showMap:false,

                lnx:{a:'附近群',g:'我的群',f:'私信'},
                showMoBar:false,
                showLeft:this.isPc(),
                showRight:this.isPc(),
                imgLoading:-1,
                msgTxt:null,

                invitation:null,

                find:{},
                items:null,

                groupUsers:null,

                tempMsg:{
                    time:'19:00',
                    size:0
                },
                groupEdit:false,
                groupPar:{
                    name:null,
                    password:null,
                    summary:null
                },
                inpHeight:0,

                joinHis: this.$getStorage('joinHis')||[],
                joinHisX: this.$getStorage('joinHisX')||[],
                initNo:0
            }
        },
        computed: {
            ...mapGetters(['token',"userInfo","socket",'historyMsg','newMsg','newMsgTotal','roomGather','activeRoom','articleRoom','onlineUsers','upLock','upFlag','address'])
        },
        mounted(){
            this.initSocket()
            this.getData()
            this.intRoom()

        },
        methods:{
            setBack(t){
                this.showMap=false;
                // console.log(t)
                if(t&&t.lat){
                    this.zb = t;
                    this.$setStorage('zb1',t)
                    this.$addr()
                }

            },
            joinGroupsInv(t){
                // console.log(this.invitation)
                this.socket.emit('joinGroupsInv',{
                    id: this.invitation.id,
                    status: t,
                    admin: this.userInfo.nickname,
                    user: this.invitation.user.nickname,
                    userId: this.invitation.user.id,
                    group: this.invitation.group.name,
                    groupId: this.invitation.group.id,
                });
                this.invitation = null;
            },
            isPc(){
                return window.innerWidth>768
            },
            lastHis(id,t){
                const v = this.historyMsg
                // console.log(this.userInfo.id)
                let x = null
                if(v && v[id]){
                    const c = v[id][v[id].length-1]
                    // console.log(c)
                    const d = ['txt','图片','文档']
                    if(c){
                        if(t){
                            // console.log(this.Dayjs())
                            if(this.$dayjs(c.time).diff(this.$dayjs(),'day')<0){
                                x = c.time.substr(5,5)
                            }else {
                                x = c.time.substr(11,5)
                            }
                        }else {
                            x = (c.user.id==this.userInfo.id?'我':c.user.nickname)+': '+ (c.msg.t==0?c.msg.c: d[c.msg.t])
                        }
                    }
                }
                return x
            },
            initSocket(){
                this.$store.dispatch('connectSocket', this.room);


                setTimeout(() => {
                    this.socket.on('joinGroupPass', async (res) => {
                        console.log('on joinGroupPass', res);
                        // console.log('my groupUsers', this.roomGather.g);

                        // this.$toast(res.msg)
                        if(res.inv){
                            if (res.inv==1){
                                this.$store.commit('SET_GROUP_GATHER', res.room);
                                this.socket.emit('joinGroupRoom',{room:res.room})
                            }
                            if (res.inv==2){
                                this.joinHisX.push(res.room.id);
                                this.$setStorage('joinHisX',this.joinHisX);
                            }
                        }
                        if(res.data){
                            this.roomGather.g.forEach(it => {
                                // console.log(it)
                                if(it.role>0  &&  it.id == res.data.group.id){
                                    this.invitation = res.data;
                                    this.showConfirm = true;
                                }
                            })
                        }

                        if (res.msg) {
                            this.$toast(res.msg);
                        }

                    });
                    if(this.roomGather && this.roomGather.a){
                        // console.log(this.roomGather.a)
                        // console.log(this.roomPar())
                        this.roomGather.a.forEach(it=>{
                            this.joinRoom(it)
                        })

                    }

                },500)

            },
            joinRoom(r){
                this.socket.emit('joinRoom',
                    this.jiaMi2({
                    room: r,
                    user:{
                        id:this.userInfo.id,
                        nickname:this.userInfo.nickname
                    }
                }))
            },
            getData(){
                // const par = this.$route.query;
                if(!this.isPc()){
                    this.showMoBar=false
                    this.showLeft=false
                    this.showRight=false
                }
                if(!this.activeRoom){
                    this.showRight=false;
                    this.$get('group').then((res) => {
                        this.items= res[0]


                    }).catch(() => {

                    })

                }

                if(this.token){
                    this.$get('group/invitation').then((res) => {
                        if(res  && res[1] > 0){
                            this.invitation = res[0][0]
                        }
                    }).catch(() => {

                    })
                }

            },
            intRoom(){

                const vx = this.address || this.$getStorage('zbx')
                if(vx){

                    setTimeout(() => {
                        this.setRoom({
                            type:'a',
                            id:vx.adcode,
                            name: vx.city+vx.district
                        })

                    },200)
                }else if(this.initNo<5) {
                    if(this.initNo<=1){
                        this.showMap = true
                    }else {
                        this.$addr()
                    }
                    this.initNo +=1
                }
            },
            roomPar(){
                const x = this.activeRoom;

                return x?{
                    type: x.type,
                    id: x.id,
                    name: x.name
                }:{
                    type: 'a',
                    id: null,
                    name: null
                }
            },
            setRoom(it){

                this.$store.commit('SET_ROOM_GATHER', it);
                this.$store.commit('SET_ACTIVE_ROOM', it);
                if(it){
                    if(it.type=='a'){
                        // console.log(this.$route.query)
                        // if( this.$route.query && this.$route.query.id != it.id){
                        //
                        //     this.$router.push('/chat?type=a&id='+it.id)
                        // }
                        if(this.articleRoom.indexOf(this.roomPar().id)<0){
                            // console.log(333555555)
                            this.$store.commit('SET_ARTICLE_ROOM',this.roomPar().id)
                            this.joinRoom(this.roomPar())
                        }
                    }else {
                        if(it.type=='g'){
                            this.$get('group/users',{group:it.id}).then((res) => {
                                this.groupUsers= res[0]
                            }).catch(() => {

                            })
                        }
                    }
                    // console.log(333555)

                    this.scrollFoot()
                    this.showRight=this.isPc();
                }else {
                    this.showRight=false
                }
            },
            addGroup(){
                if(/visitors/.test(this.userInfo.id) || !this.userInfo.id) {
                    this.$toast('游客不能建群')
                }else if(!this.groupPar.name || this.groupPar.name.trim()==''){
                    this.$toast('群名不能为空')
                }else {
                    this.groupPar.name=this.groupPar.name.replace(/\s/g,'');
                    this.socket.emit('addGroup',{
                        ...this.groupPar,
                        userId:this.userInfo.id
                    });
                }
            },
            joinGroup(id){
                if(/visitors/.test(this.userInfo.id) || !this.userInfo.id) {
                    this.$toast('请登录')
                    this.$store.commit('SET_SIGNPOP',true)
                }else {

                    this.joinHis.push(id);
                    this.$setStorage('joinHis',this.joinHis);

                    this.socket.emit('joinGroup',{
                        groupId: id,
                        userId: this.userInfo.id
                    });

                    // this.$post('group/join',{group:id}).then(res => {
                    //     console.log(res)
                    //
                    // })
                }
            },
            isNoJoin(id){
                return  JSON.stringify(this.roomGather).indexOf(id)<0
            },
            addFriend(it){
                if(/visitors/.test(it.id)||/visitors/.test(this.userInfo.id)){
                    this.$toast('没办法和游客建立私聊')
                }else if(JSON.stringify(this.roomGather.f).indexOf(it.id)>=0){
                    this.$router.push('/chat/f/'+it.id)
                }else {
                    console.log(3)
                    // 请求添加好友

                }
            },
            sendMsg(t){
                //msgType 0 txt 1 img 2 audio 3 video 4 event 5 file
                let msg = this.msgTxt;
                if(msg){
                    msg =  msg.trim();
                }
                if(!msg && t==0){
                    return false
                }
                this.socket.emit('articleMessage',{
                    room: this.roomPar(),
                    user:{
                        id:this.userInfo.id,
                        nickname:this.userInfo.nickname
                    },
                    type:0,
                    msg:{
                        t:t||0,
                        c:msg
                    }
                });
                this.setTemp({
                    t:t||0,
                    c:msg
                });
                this.inpHeight = 0;
                this.msgTxt = null;
                this.scrollFoot()
            },
            lockUp(it){
                if(it.size>5100000){
                    this.$toast.error('只允许上传5M以下的图片')
                    return false
                }
                const tday = this.$dayjs().format('YYYYMMDD');
                let tsz = this.$getStorage('FZSLOCK')||{n:tday,v:0};
                if(tsz.n!=tday){tsz.v=0}
                if(tsz.v>51000000 || this.upLock){
                    this.$toast('抱歉，今天资源上传限额已满')
                    return false
                }else {
                    this.$setStorage('FZSLOCK',{n:tday,v:tsz.v+it.size})
                }
                // console.log(tsz)
                if(it.size<=5100000 && tsz<=51000000){
                    //  临时显示发送状态
                    this.setTemp(it)
                    this.scrollFoot()
                }
            },
            setTemp(it){
                this.tempMsg.time = this.$dayjs().format('HH:mm:ss');
                this.tempMsg.size = it.size;
                this.tempMsg.name = it.name;
                this.tempMsg.cont = it.c;
                this.$store.commit('UP_END',true);
            },
            loadImg(t,c) {
                this.imgLoading = t;
                let loadedImg = this.$getStorage('loadedImg') || []
                let e = document.getElementById('img_'+t)
                if(e.src){
                    window.open(e.src)
                }else {
                    e.src = e.alt
                    if(loadedImg.indexOf(c)<0){
                        loadedImg.push(c)
                        this.$setStorage('loadedImg',loadedImg)
                    }
                }
            },
            isLoaded(it){
                const x = this.$getStorage('loadedImg')
                return (it.user && this.userInfo && it.user.id == this.userInfo.id) || (x && x.indexOf(it.msg.c)>-1)
            },
            imgUp(t){
                let x = 0
                console.log(t)
                const fileObj = [...this.$refs[t].files];
                console.log(fileObj)
                console.log(typeof(fileObj))
                console.log(fileObj.length)
                fileObj.forEach((it) => {
                    // console.log(it)
                    this.lockUp(it)

                    if(x<9 && /image/.test(it.type)){
                        this.socket.emit('imgMessage',{
                            room: this.roomPar(),
                            user:{
                                id:this.userInfo.id,
                                nickname:this.userInfo.nickname
                            },
                            type:0,
                            msg:{
                                t:1,
                                c:it,
                                x:it.type.replace(/image\/|\+xml/g,''),
                                n:it.name,
                                s:it.size
                            }
                        });
                        x+=1
                    }
                })
            },
            fileUp(t){
                const it = this.$refs[t].files[0];
                this.lockUp(it)

                // console.log(it)
                if(/image/.test(it.type)||/\.(txt|zip|pdf|doc|docx|mp3|mp4|ai|svg|psd)$/.test(it.name)){
                    // console.log(it.type)
                    this.socket.emit('imgMessage',{
                        room: this.roomPar(),
                        user:{
                            id:this.userInfo.id,
                            nickname:this.userInfo.nickname
                        },
                        type:0,
                        msg:{
                            t:5,
                            c:it,
                            x:it.name.substring(it.name.lastIndexOf('.') + 1),
                            n:it.name,
                            s:it.size
                        }
                    })
                }
            },
            chatImg(t,c){
                return this.$BASECDN+'cdn/chat/'+t.substring(0,10).replace(/-/g,'')+'/'+c
            },
            openFile(it){
                window.open(this.$BASECDN+'cdn/chat/'+it.time.substring(0,10).replace(/-/g,'')+'/'+it.msg.c)
            },
            inpHei(){
                let t = 0;
                try {
                    if(this.msgTxt){
                        t = this.msgTxt.match(/[\r\n]+/g).length
                    }
                }catch (e) {
                    t = 0
                }
                this.inpHeight = t>5?5:t
            },
            cleanHis(){
                let sx = this.historyMsg
                sx[this.activeRoom.id]=null
                // console.log(this.historyMsg[this.activeRoom.id])
                this.$store.commit('SET_HISTORY', sx);
                // console.log(this.historyMsg[this.activeRoom.id])
            },
            scrollFoot(){

                this.$nextTick(()=>{
                    let MsgArea = document.getElementById('MsgArea')
                    if(MsgArea){
                        MsgArea.scrollTop = MsgArea.scrollHeight * 10000
                    }
                })
            }

        },
        watch: {
            $route(){
                this.getData()
            },
            address(){
                this.intRoom()
            },
            // historyMsg(){
            //     console.log(4364535654654)
            //     alert(5)
            //     // this.$toast('eww')
            //     // this.scrollFoot()
            // },
            // newMsg(){
            //     console.log('newMsg Change')
            // }
        },
        activated(){
        },
        deactivated(){
            this.setRoom(null)
        }
    }
</script>
