const mrzb = {lat:26.473951,
    lng:109.412155,
    address:'靖州烂泥冲'};localStorage.setItem('zb',JSON.stringify(mrzb));

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Router from 'vue-router'

Vue.use(Router)
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
}

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// Vue.prototype.$ELEMENT = { size: 'small', zIndex: 3000 };

// import {
//     Button,
//     Select,
//     Loading,
//     Icon,
//     Row,
//     Col,
//
// } from 'element-ui';
//
// Vue.use(
//     Button,
//     Select,
//     Loading,
//     Icon,
//     Row,
//     Col,
// );

Vue.use(ElementUI);

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
Vue.use(Toast, {timeout: 4000});


import VueAMap from "vue-amap"
const amapKeys = Object.keys(localStorage).filter(key => key.match(/^_AMap_/))
amapKeys.forEach(key => {
    // console.log(key)
    localStorage.removeItem(key);
})

Vue.use(VueAMap);
VueAMap.initAMapApiLoader({
    key: "160cab8ad6c50752175d76e61ef92c50",
    plugin: ["Autocomplete","Geocoder", "PlaceSearch", "Geolocation", "Scale", "OverView", "ToolBar", "MapType"],
    // 默认高德 sdk 版本为 1.4.4
    v: "1.4.4"
});


// console.log(process.env)
// console.log(7777777)
// console.log(process.env.BASE_URL)
const Ym = location.hostname.replace('ais.','')
const mod = {
    // dev: 'localhost',
    dev: Ym||'192.168.2.105',
    // dev: '192.168.101.184',
    pud: Ym||'jiapuu.com',
}
Vue.prototype.$BASEAPI = process.env.NODE_ENV=='development'?'http://'+mod.dev+':3016/api/':location.protocol+'//api.'+mod.pud+'/api/';
Vue.prototype.$BASECDN = process.env.NODE_ENV=='development'?'http://'+mod.dev+':3018/':location.protocol+'//cdn.'+mod.pud+'/';
Vue.prototype.$BASEWEB = process.env.NODE_ENV=='development'?'http://'+mod.dev+':8060/':location.protocol+'//'+mod.pud+'/';

import '@/assets/stylus/app.styl'
import {Get, Post} from "./utils/http";



import Dayjs from 'vue-dayjs';
Vue.use(Dayjs,{lang:'cn'});


import Fingerprint2 from 'fingerprintjs2'
import CryptoJS from "crypto-js"

import md5 from 'js-md5';
Vue.prototype.$md5 = md5;

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
    const n = new Date(parseInt(t)),
        y = n.getFullYear(),
        m = n.getMonth()+1,
        d = n.getDate();
    let c = (y>0?(y<10?'000'+y:y<100?'00'+y:y<1000?'0'+y:y):y)+'-'+(m<10?'0'+m:m)+'-'+(d<10?'0'+d:d)
    return  x + c
};

Vue.prototype.$dayA = (t) => {
    return  Vue.prototype.$dayjs(t).format('YYYY-MM-DD HH:mm:ss')
};
Vue.prototype.$dayB = (t) => {
    return  Vue.prototype.$dayjs(t).format('YYYY-MM-DD')
};

//api
Vue.prototype.$lock = false; //post 请求锁
Vue.prototype.$post = Post;
Vue.prototype.$get = Get;

Vue.prototype.$arrRole = ['普通会员',null,null,null,null,'管理员',null,null,null,'站长'];
Vue.prototype.$arrStat = ['正常','隐藏'];
Vue.prototype.$arrLeve = ['供应','求购','顺路帮'];
Vue.prototype.$arrLtit = ['老少皆宜，人人可见的','无悖人性但不适合在大庭广众的','令人心生理严重不适的','恶意灌水的广告垃圾'];
Vue.prototype.$arrCate = ['吃的','穿的','百货','特产','运输','劳力'];
Vue.prototype.$arrArea = ['5km','100km','500km','1000km','2000km','无限'];
Vue.prototype.$arrSort = ['内容更新时间','阅读量','评论数','点赞数'];

Vue.prototype.$getStorage = (t) =>{
    let m = localStorage.getItem(t);
    return m?JSON.parse(m):null
};
Vue.prototype.$setStorage = (t,s) =>{
    localStorage.setItem(t,JSON.stringify(s))
};
Vue.prototype.$rbg = (url) =>{
    if (url) return 'background-image:url(' + url + ')';
};
Vue.prototype.$avatar = (id) =>{
    if (id) return Vue.prototype.$rbg(Vue.prototype.$BASECDN+'/cdn/'+id+'/img/avatar.jpg');
};
Vue.prototype.$open = (t,id) =>{
    window.open('/#/'+(t==1?'article':'page')+'/detail?id='+id)
};
const FINAL = 6378137.0;
Vue.prototype.calcDegree = (d) =>{
    //求某个经纬度的值的角度值
    return d*Math.PI/180.0 ;
};
/**
 * 根据两点经纬度值，获取两地的实际相差的距离
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
    return val+' 距您当前'+valb;
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
        b: location.hostname,
        c: parseInt(Math.random()*5e6),
        d: deviceId
    })), CryptoJS.enc.Utf8.parse("0421AC1F30CC4D45"), {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
    // console.log(decrypt.toString().replace(/^U2FsdGVkX/,''))
    return decrypt.toString()
};



Vue.config.productionTip = false

new Vue({
    router,
    store,
    data: {
        eventHub: new Vue()
    },
    render: h => h(App),
}).$mount('#app')

