const getters = {
    // user
    signPop: state => state.user.signPop,
    calenPop: state => state.user.calenPop,
    calen: state => state.user.calen,
    token: state => state.user.token,
    userInfo: state => state.user.user,
    upimg: state => state.user.upimg,
    // user: state => state.user,
    socket: state => state.chat.socket,
    upLock: state => state.chat.upLock,
    upFlag: state => state.chat.upFlag,
    roomGather: state => state.chat.roomGather,
    articleRoom: state => state.chat.articleRoom,
    onlineUsers: state => state.chat.onlineUsers,
    activeRoom: state => state.chat.activeRoom,
    historyMsg: state => state.chat.historyMsg,
    newMsg: state => state.chat.newMsg,
    newMsgTotal: state => state.chat.newMsgTotal,
    address: state => state.chat.address,
}
export default getters
