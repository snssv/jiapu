
const mrzb = {lat:26.473951,
    lng: 109.412155,
    address: '靖州烂泥冲', code: 418404};localStorage.setItem('zb',JSON.stringify(mrzb));

window.mrzb = mrzb


import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import Router from 'vue-router'
import marked from 'marked';

Vue.use(Router)
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
Vue.use(Toast, {timeout: 3800});

import VueAMap from "vue-amap"
const amapKeys = Object.keys(localStorage).filter(key => key.match(/^_AMap_/))
amapKeys.forEach(key => {
    // console.log(key)
    localStorage.removeItem(key);
})
const mapKey = "43ba0a4315e7939572b267bb8573562e"
Vue.use(VueAMap);
VueAMap.initAMapApiLoader({
    key: mapKey,
    plugin: ["Autocomplete","Geocoder", "PlaceSearch", "Geolocation", "Scale", "OverView", "ToolBar", "MapType"],
    // 默认高德 sdk 版本为 1.4.4
    v: "1.4.4"
});
window._AMapSecurityConfig = {
    securityJsCode:'9df524fca9e3e91aa149f4cffd84e93c',
}


// console.log(process.env)
// console.log(7777777)
// console.log(process.env.BASE_URL)
const Ym = location.hostname.replace('www.','')
const mod = {
    // dev: 'localhost',
    dev: Ym||'192.168.2.105',
    // dev: '192.168.101.184',
    pud: Ym||'jiapuu.com',
}
Vue.prototype.$BASEAPI = process.env.NODE_ENV=='development'?'http://'+mod.dev+':3016/api/':location.protocol+'//api.'+mod.pud+'/api/';
Vue.prototype.$BASECDN = process.env.NODE_ENV=='development'?'http://'+mod.dev+':3018/':location.protocol+'//cdn.'+mod.pud+'/';

import "@/assets/stylus/app.styl"
import {Get, Post} from "./utils/http";


import Dayjs from 'vue-dayjs';
Vue.use(Dayjs,{lang:'cn'});


import Fingerprint2 from 'fingerprintjs2'
import CryptoJS from "crypto-js"

import md5 from 'js-md5';
Vue.prototype.$md5 = md5;

Vue.prototype.$md2html = (txt) => {
    return txt ? marked(txt.replace(/\[\]\(\/cdn/g, '[]('+Vue.prototype.$BASECDN+'cdn')).replace(/<a\s/g,'<a target="_blank" ').replace(/<img\s/g,'<img onclick="window.open(this.src)" ') : null;
};
Vue.prototype.$datex = () => {
    //return Vue.prototype.$dayjs().format('YYYYMMDDHHmmssSSS')
    const n = new Date(),
        y = n.getFullYear(),
        m = n.getMonth()+1,
        d = n.getDate(),
        h = n.getHours(),
        w = n.getMinutes(),
        s = n.getSeconds(),
        x = n.getMilliseconds();
    let c = (y)+(m<10?'0'+m:m)+(d<10?'0'+d:d)+(h<10?'0'+h:h)+(w<10?'0'+w:w)+(s<10?'0'+s:s)+x
    return  c
};
Vue.prototype.$dayx = (t) => {
    let x = typeof(t)=='number'&&t<-62196100924000?'- ':'';
    // console.log(t)
    const n = new Date(t),
        y = n.getFullYear(),
        m = n.getMonth()+1,
        d = n.getDate();
    let c = (y>0?(y<10?'000'+y:y<100?'00'+y:y<1000?'0'+y:y):y)+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d)
    return  x + c
};

Vue.prototype.$size = (s) => {
    s = s||0;
    let t = ''
    if(s<1024){
        t = s + 'b'
    }else if(s<1024*1024){
        t = (s/1024).toFixed(2) + 'kb'
    }else {
        t = (s/(1024*1024)).toFixed(2) + 'mb'
    }
    return  t
};

//api
Vue.prototype.$lock = false; //post 请求锁
Vue.prototype.$post = Post;
Vue.prototype.$get = Get;

Vue.prototype.$arrLeve = ['供应','求购','顺路帮'];
Vue.prototype.$arrDate = ['7天','1个月','半年'];
Vue.prototype.$arrCate = ['吃的','穿的','百货','特产','运输','劳力'];
Vue.prototype.$arrArea = ['5km','100km','500km','1000km','2000km','无限'];
Vue.prototype.$arrSort = ['更新时间','阅读量','评论数','点赞数'];

Vue.prototype.$getStorage = (t) =>{
    let m = localStorage.getItem(t);
    return m && m !== 'undefined' ? JSON.parse(m):null
};
Vue.prototype.$setStorage = (t,s) =>{
    localStorage.setItem(t,JSON.stringify(s))
};
Vue.prototype.$rbg = (url) =>{
    if (url) {
        if(!/^http/.test(url)){
            url = Vue.prototype.$BASECDN+''+url
        }
        return 'background-image:url(' + url + ')';
    }
};
Vue.prototype.$avatarT = (id) =>{
    if (id) return Vue.prototype.$rbg(Vue.prototype.$BASECDN+'/cdn/avatar/'+id.substring(id.length-1).toLocaleLowerCase()+'.svg');
};
Vue.prototype.$avatar = (id) =>{
    if (id && !/^visitors/.test(id)) return Vue.prototype.$rbg(Vue.prototype.$BASECDN+'/cdn/'+id+'/img/avatar.jpg?'+new Date().getDate());
};
Vue.prototype.$objSort = (v) =>{
    return (v1,v2) => {
        return v1[v] - v2[v]
    }
};
// let newWin = null
Vue.prototype.$open = (t,id) =>{
    const ar = ['article','people']
    // if(newWin){
    //     newWin.location.href ='/#/'+ar[t||0]+'/t?id='+id
    // }else {
    //     newWin = window.open('/#/'+ar[t||0]+'/t?id='+id)
    // }
    window.open('/#/'+ar[t||0]+'/t?id='+id)
    // Vue.prototype.$router.push('/#/'+ar[t||0]+'/t?id='+id)
};
Vue.prototype.showMap = (lat,lng) =>{
    if(lat&&lng){
        const ur = !/^zh/.test(navigator.language)?'map.baidu.com':'google.com/maps';
        window.open('https://'+ur+'/@'+lat+','+lng+',14z')
    }
};

Vue.prototype.$addr = () =>{
    const zb = Vue.prototype.$getStorage('zb1') || Vue.prototype.$getStorage('zb') || mrzb
    console.log(zb)
    Vue.prototype.$get('https://restapi.amap.com/v3/geocode/regeo?key='+mapKey+'&s=rsv3&language=undefined&location='+zb.lng+','+zb.lat+'&radius=1000&extensions=all&platform=JSON&logversion=2.0&appname=http%3A%2F%2Flocalhost%3A8060%2F%23%2Fchat&csid=1B9A151C-8F99-4C21-87B0-08ADA2457B80&sdkversion=1.4.4').then(result =>{
        if (result.info === 'OK') {
            if (result && result.regeocode && result.regeocode.addressComponent.city) {
                Vue.prototype.$setStorage('zbx', result.regeocode.addressComponent)
                // location.reload()
                store.state.chat.address = result.regeocode.addressComponent
            }
        }
    })
};

const FINAL = 6378137.0;
Vue.prototype.calcDegree = (d) =>{
    //求某个经纬度的值的角度值
    return d*Math.PI/180.0 ;
};

/**
 * 根据两点经纬度值，获取两地的实际相差的距离
 * zb1 真实坐标
 * zb 上次选择的坐标
 * @param {Object} f    第一点的坐标位置[latitude,longitude]
 * @param {Object} t    第二点的坐标位置[latitude,longitude]
 */
Vue.prototype.$distance = (lat,lng) =>{
    const xza = Vue.prototype.$getStorage('zb') || mrzb;
    const xzb = Vue.prototype.$getStorage('zb1') || mrzb;
    let flat = Vue.prototype.calcDegree(lat),
        flng = Vue.prototype.calcDegree(lng),
        tlat = Vue.prototype.calcDegree(xza.lat),
        tlng = Vue.prototype.calcDegree(xza.lng),
        result = Math.sin(flat)*Math.sin(tlat),
        tlatb = Vue.prototype.calcDegree(xzb.lat),
        tlngb = Vue.prototype.calcDegree(xzb.lng),
        resultb = Math.sin(flat)*Math.sin(tlatb) ;
    result += Math.cos(flat)*Math.cos(tlat)*Math.cos(flng-tlng) ;
    resultb += Math.cos(flat)*Math.cos(tlatb)*Math.cos(flng-tlngb) ;
    let val = parseInt(Math.acos(result)*FINAL);
    let valb = parseInt(Math.acos(resultb)*FINAL);
    if(val>1024){
        val=parseInt(val/1000)+'km'
    }else{
        val=val+'m'
    }
    if(valb>1024){
        valb=parseInt(valb/1000)+'km'
    }else{
        valb=valb+'m'
    }
    return '距离'+val;
};

// Vue.prototype.$getPosition = (t)=>{
//     navigator.geolocation.getCurrentPosition((position) => {
//         let lat =position.coords.latitude,lng =position.coords.longitude;
//         Vue.prototype.$setStorage(t||'zb',{'lng':lng,'lat':lat})
//         // console.log(lng, lat);
//     });
// };



let deviceId = localStorage.getItem('mira');
Fingerprint2.getV18(
    {
        preprocessor: null,
        audio: {
            timeout: 1000,
            // 在iOS 11上，音频上下文只能用于响应用户交互。我们要求用户在iOS 11上显式启用音频指纹https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
            excludeIOS11: true
        },
        fonts: {
            swfContainerId: 'fingerprintjs2',
            swfPath: 'flash/compiled/FontList.swf',
            userDefinedFonts: [],
            extendedJsFonts: false
        },
        screen: {
            // 当用户旋转移动设备时确保指纹一致
            detectScreenOrientation: true
        },
        plugins: {
            sortPluginsFor: [/palemoon/i],
            excludeIE: false
        },
        extraComponents: [],
        excludes: {
            // Unreliable on Windows, see https://github.com/Valve/fingerprintjs2/issues/375
            'enumerateDevices': true,
            // 取决于浏览器缩放
            'pixelRatio': true,
            //取决于某些浏览器的隐身模式
            'doNotTrack': true,
            // 已经使用JS字体
            'fontsFlash': true
        },
        NOT_AVAILABLE: 'not available',
        ERROR: 'error',
        EXCLUDED: 'excluded'
    }, function (result, components) {
        // console.log('指纹一');//结果是哈希指纹
        // console.log(result);//结果是哈希指纹
        // console.log(JSON.stringify(views));//组件是{key：'foo'的数组，值：'组件值'}
        // deviceId = Fingerprint2.x64hash128(views.join(''), views.length-1);
        deviceId = result;
        if (deviceId){
            // console.log(deviceId)
            deviceId=deviceId.substring(8, 24).toUpperCase()
        }
        localStorage.setItem('mira',deviceId);
        // console.log('指纹二');//结果是哈希指纹
        // console.log(deviceId);
    });
Vue.prototype.jiaMi = function() {
    let decrypt = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(JSON.stringify({
        a: Date.now()+parseInt(localStorage.getItem('serverTime')||0),
        b: localStorage.getItem('tempName'),
        c: parseInt(Math.random()*5e6),
        d: deviceId,
        e: location.hostname
    })), CryptoJS.enc.Utf8.parse("0421AC1F30CC4D45"), {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    // console.log(decrypt.toString().replace(/^U2FsdGVkX/,''))
    return decrypt.toString()
};

Vue.prototype.jiaMi2 = function(a) {
    let decrypt = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(JSON.stringify({
        a: a,
        d: deviceId
    })), CryptoJS.enc.Utf8.parse("0421AC1F30CC4D45"), {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    // console.log(decrypt.toString().replace(/^U2FsdGVkX/,''))
    return decrypt.toString()
};

// // 请求 Notification 授权
// if (
//     window.Notification
//     && (window.Notification.permission === 'default' || window.Notification.permission === 'denied')
// ) {
//     window.Notification.requestPermission();
// }

Vue.config.productionTip = false

window.MVUE = new Vue({
    router,
    store,
    data: {
        eventHub: new Vue()
    },
    render: h => h(App),
}).$mount('#app')

