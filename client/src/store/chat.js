import router from '@/router'
import io from 'socket.io-client';


import Vue from 'vue';


const getStorage = (t) =>{
    let m = localStorage.getItem(t);
    return m?JSON.parse(m):null
};
const setStorage = (t,s) =>{
    localStorage.setItem(t,JSON.stringify(s))
};
const chat = {
    state: {
        socket:null,
        roomGather: {a:getStorage('articleRoom')||[],f:[],g:[]},
        articleRoom: [],
        onlineUsers: {},
        activeRoom: null,
        upLock: false,
        upFlag: false,
        historyMsg: getStorage('historyMsg')||{},
        newMsg: {},
        newMsgTotal: 0,
        address: null
    },
    mutations: {
        SET_SOCKET: (state, res) => {
            // console.log(res)
            state.socket = res
            // console.log(state.socket)


        },
        SET_GROUP_MESSAGE:(state,res) => {

        },
        SET_ONLINE_USERS:(state,res) => {
            state.onlineUsers = {...res,...state.onlineUsers}
            // console.log('SET_ONLINE_USERS',state.onlineUsers)
        },
        SET_ONLINE_USER_JOIN:(state,res) => {
            console.log('SET_ONLINE_USER_JOIN',res)
            // if(state.onlineUsers && JSON.stringify(state.onlineUsers).indexOf(res.id)<1){
            //     state.onlineUsers.push(res)
            // }
        },
        SET_ONLINE_USER_OUT:(state,res) => {
            console.log('SET_ONLINE_USER_OUT',res)
            // state.onlineUsers.splice(state.onlineUsers.findIndex(v => v.id == res),1);
        },
        ADD_MESSAGE: (state, res) => {
            // console.log('ADD_MESSAGE');
            // console.log(res);


            let newObj = state.historyMsg||{};
            let newArr=[];
            if(state.historyMsg && state.historyMsg[res.room.id]){
                newArr = state.historyMsg[res.room.id]
            }
            const newT = {msg:res.msg,time:res.time,user:res.user};
            if(newArr.length>=100){
                // 最多保留50条
                newArr.shift()
            }
            newArr.push(newT);
            // newArr = Array.from(new Set(newArr))

            //去重
            // const nRx = newArr

            // let nR = []
            // let nX = []
            // newArr.forEach(it => {
            //     if(nX.indexOf(it.time+it.user.id+'')<0){
            //         console.log(nX)
            //         nX.push(it.time+it.user.id)
            //         nR.push(it)
            //     }
            // })
            //
            // console.log(JSON.stringify(state.historyMsg).indexOf(newT.time)<0)
            if(
                state.activeRoom&&state.activeRoom.id != res.room.id

            ){
                // console.log(state.activeRoom.id);
                const nx = state.newMsg[res.room.id] || 0;
                state.newMsg[res.room.id] = parseInt(nx)+1;
                state.newMsgTotal=0
                Object.keys(state.newMsg).forEach((it,key)=>{
                    // console.log(it)
                    state.newMsgTotal += state.newMsg[it]
                })
                // console.log('newMsg Num', nx);
            }

            // console.log(nR)
            //  自己进入房间
            // if(state.onlineUsers && JSON.stringify(state.onlineUsers).indexOf(res.user.id)<1){
            //     state.onlineUsers.push(res.user)
            // }

            newObj[res.room.id] = newArr.sort(Vue.prototype.$objSort('time')); // 防止重复写入
            state.historyMsg = newObj;
            // state.historyMsg = null;
            setStorage('historyMsg',newObj)
            // console.log('historyMsg',newObj)
            setTimeout(()=>{
                let MsgArea = document.getElementById('MsgArea')
                if(MsgArea){
                    MsgArea.scrollTop = MsgArea.scrollHeight * 10000
                }
            },350)


            // console.log(new Date().getTime() - new Date(res.time).getTime())
            if(new Date().getTime() - new Date(res.time).getTime()<2000){
                new Notification('新消息提醒',{
                    body: res.msg.c,
                    tag: 'new msg',
                    icon: Vue.prototype.$BASECDN+'/cdn/avatar/0.svg',
                })
                // console.log(Vue.prototype.$BASECDN+'/cdn/avatar/0.svg')
            }
        },
        ADD_MESSAGE_HIS: (state, res) => {
            // console.log('ADD_MESSAGE_HIS');
            // console.log(res);
            let newObj = state.historyMsg||{};
            newObj[res.room] = res.msg;
            // state.newMsg[res.room] = res.msg.length;
            state.historyMsg = newObj;

        },
        SET_HISTORY:(state,res) => {
            state.historyMsg =  res
        },
        SET_FRIEND_MESSAGE:(state,res) => {

        },
        ADD_FRIEND_MESSAGE: (state, res) => {

        },
        SET_ACTIVE_ROOM:(state,res) => {
            // console.log(444)
            // console.log(res);
            if(res&&res.id){
                if(state.newMsgTotal>0){
                    state.newMsgTotal = state.newMsgTotal - state.newMsg[res.id]
                }
                state.newMsg[res.id]=0
            }
            state.activeRoom = res
        },
        SET_ROOM_GATHER: (state, res) => {
            // console.log(res)
            // console.log(state.roomGather)
            if(res&&res.type!='r'&&JSON.stringify(state.roomGather).indexOf(res.id)<0){
                state.roomGather[res.type].push({id:res.id,name:res.name,type:'a',summary:res.summary});
            }
            setStorage('articleRoom',state.roomGather.a)
        },
        SET_GROUP_GATHER: (state, res) => {
            if(res&&JSON.stringify(state.roomGather.g).indexOf(res.id)<0){
                state.roomGather.g.push({id:res.id,name:res.name,type:'g',summary:res.summary,role:res.role});
            }
        },
        SET_ARTICLE_ROOM: (state, res) => {
            if(res&&JSON.stringify(state.articleRoom).indexOf(res)<0){
                state.articleRoom.push(res);
            }
        },
        SET_FRIEND_GATHER:(state,res) => {

            console.log(res)
            // if(res){
            //     state.roomGather.push(res)
            // }

        },
        SET_USER_GATHER: (state, res) => {

        },
        UP_END: (state, res) => {
            state.upFlag = res
        },
        UP_LOCK: (state, res) => {
            state.upFlag = res
        }
    },
    actions: {

        connectSocket({ commit },par) {
            // console.log(this.state.user.user);
            // console.log(this.state.userInfo);


            let user = this.state.user.user;
            /* eslint-disable */
            const uid = MVUE.jiaMi2({
                id: user.id,
                name: user.nickname
            })

            /* eslint-disable */
            let socket = io.connect(Vue.prototype.$BASEAPI.replace('api/','')+'?uid='+uid, { reconnection: true });

            socket.on('connect', async () => {
                // 获取聊天室所需所有信息

                // socket.emit('chatData', {...par,user:user});
                if(!/visitors/.test(user.id)){
                    socket.emit('chatData', user.id);
                }


                // 先保存好socket对象
                commit('SET_SOCKET', socket);
            });
            socket.on('disconnect', async () => {
                console.log('你已经离开房间')
                setTimeout(() => {
                    location.reload()
                },5000)
            });



            // 初始化事件监听
            socket.on('addGroup', (res) => {
                console.log('on addGroup', res);
                if (res.code) {
                    return Vue.prototype.$toast(res.msg);
                }
                commit('SET_GROUP_GATHER', res.data);
            });


            socket.on('joinRoom', async (res) => {
                // console.log('on joinRoom', res.data);
                const vx = new RegExp('游客||'+user.nickname)
                if (res.code) {
                    return Vue.prototype.$toast.error(res.msg);
                }else if(res.msg && !vx.test(res.msg) ){
                    return Vue.prototype.$toast(res.msg);
                }
                // if(res.data&&res.data.user){
                //     commit('SET_ONLINE_USER_JOIN', res.data.user);
                // }
                // commit('SET_ROOM_GATHER', res.data.room);
                // commit('SET_ACTIVE_ROOM', res.data.room);
            });

            socket.on('articleMessage', (res) => {
                // console.log('on articleMessage', res);
                if (!res.code) {
                    commit('ADD_MESSAGE', res.data);
                }else {
                    commit('UP_LOCK',true)
                }

                commit('UP_END',false)
            });
            socket.on('getOnlineUsers', (res) => {
                // console.log('on getOnlineUsers', res);
                if (!res.code&&res.data) {
                    commit('SET_ONLINE_USERS', res.data);
                }
            });
            socket.on('getRoomHis', (res) => {
                // console.log('on getRoomHis', res);
                if(res.data && res.data.msg){
                    commit('ADD_MESSAGE_HIS', {room:res.data.room_id,msg:res.data.msg});
                    // res.data.msg.forEach(it =>  {
                    //     commit('ADD_MESSAGE', {...it,room:{id:res.data.room_id}});
                    // })
                }
            });

            // socket.on('userJoin', (res) => {
            //     // console.log('on userJoin', res);
            //     commit('SET_ONLINE_USER_JOIN', res.data);
            // });
            //
            // socket.on('userOut', (res) => {
            //     // console.log('on userOut', res);
            //     commit('SET_ONLINE_USER_OUT', res.data);
            // });

            socket.on('upEnd', (res) => {
                // console.log('on userOut', res);
                commit('UP_END',false)
            });

            socket.on('chatData', (res) => {
                if (res.code) {
                    return Vue.prototype.$toast(res.msg);
                }
                this.dispatch('handleChatData', res.data);
            });

        },
        async handleChatData({ commit, dispatch, state, rootState }, payload) {
            // console.log(777);
            // console.log(payload);
            let user = this.state.user.user;
            let socket = state.socket;

            let groupArr = payload.groups;
            let friendArr = payload.friends[0];
            // let userArr = payload.userData;

            if (groupArr) {
                groupArr.forEach(it=>{
                    // console.log(it)
                    commit('SET_GROUP_GATHER', it);
                })
            }
            if (friendArr.length) {
                // for (let friend of friendArr) {
                //     socket.emit('joinFriendSocket', {
                //         userId: user.userId,
                //         friendId: friend.userId,
                //     });
                //     commit('SET_FRIEND_GATHER', friend);
                // }
            }



        },
    }
}

export default chat
