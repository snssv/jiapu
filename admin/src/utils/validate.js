//检验用户名 6-12位字母或数字与字母组合
export function regName(str) {
    return str && /^(?![0-9]+$)[0-9A-Za-z]{4,12}$/.test(str);
}
//检验password 6-12位数字与字母组合
export function regPwd(str) {
    return str && /^\w{6,12}$/.test(str);
    // return str && /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$/.test(str);
}
//检验图形验证码
export function regTxYzm(str) {
    return str && /^[0-9a-z]{4,8}$/.test(str);
}
//检验数字验证码
export function regYzm(str) {
    return str && /^\d{4,6}$/.test(str);
}
//检验手机号
export function regPhone(str) {
    return str && /^[1]\d{10}$/.test(str);
}

//检验QQ号 //或者国际电话
export function regQQ(str) {
    return str && /^\d{5,18}$/.test(str);
}

//检验真实姓名
export function regId(str) {
    return str && /^(\w{8})-(\w{4})-(\w{4})-(\w{4})-(\w{12})$/.test(str);
}


//检验真实姓名
export function regRealName(str) {
    return str && /^[\u0391-\uFFE5a-zA-Z·.。;&\\s]{2,20}$/.test(str);
}


//检验银行卡号
export function regBankNo(str) {
    return str && /^[0-9]{14,19}$/.test(str);
}

//检验网址
export function regUrl(str) {
    return str && /(https?):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(str) || str && /^www\.(\w{2,30})\.\w{2,4}/.test(str);
}
//检验邮箱号
export function regEmail(str) {
    const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    return reg.test(str);
}

//检验护照和身份证
export function regSfz(str) {
    const reg = /^[a-zA-Z\d]{8,19}$/;
    return reg.test(str);
}


