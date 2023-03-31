import axios from 'axios'
import store from '@/store'
// import qs from 'qs'
import router from "@/router";
import Vue from 'vue';



/**
 * 提示函数
 * 禁止点击蒙层、显示一秒后关闭
 */
const tip = msg => {
    Vue.prototype.$toast.error(msg)
}


/**
 * 请求失败后的错误统一处理
 * @param {Number} status 请求失败的状态码
 */
const errorHandle = (status, msg) => {
    // 状态码判断

    switch (status) {
        // 401: 未登录状态，跳转登录页
        case 401:
            tip('登录过期，请重新登录');
            store.dispatch('SignOut').then()
            store.commit('SET_SIGNPOP',true)
            location.reload()
            break;
        // 404请求不存在
        case 403:
        case 404:
            tip('请求的资源不存在\n'+msg);
        case 411:
            localStorage.setItem('serverTime',msg)
            tip('请求超时请重试\n'+msg);
            break;
        case 500:
            tip('服务500错误\n'+msg);
            break;
        default:
            tip(msg?msg:status)
            console.log(msg);
    }
}


// 创建axios实例
const service = axios.create({timeout: 1000 * 12});

// 设置post请求头
service.defaults.baseURL = '';
service.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';
// token && (service.defaults.headers.Authorization = 'Bearer '+token);
/**
 * 请求拦截器
 * 每次请求前，如果存在token则在请求头中携带token
 */
service.interceptors.request.use(
    config => {
        // 登录流程控制中，根据本地是否存在token判断用户的登录情况
        // 但是即使token存在，也有可能token是过期的，所以在每次的请求头中携带token
        // 后台根据携带的token判断用户的登录情况，并返回给我们对应的状态码
        // 而后我们可以在响应拦截器中，根据状态码进行一些统一的操作。
        // console.log(config)
        const token = localStorage.getItem('token');
        // console.log(token)
        // console.log(localStorage.getItem('token'));
        if(/^http/.test(config.url)){
            config.baseURL = ''
        }else if(/^cdn/.test(config.url)){
            config.baseURL =  Vue.prototype.$BASECDN
        }else {
            config.baseURL =  Vue.prototype.$BASEAPI

            config.headers.token = Vue.prototype.jiaMi()+'ej!W&'+Vue.prototype.$md5('mira'+new Date().getTime())+'Eq';
            if(localStorage.getItem('token')){
                config.headers.Authorization = 'Bearer '+localStorage.getItem('token');
            }
        }

        return config;
    },
    error => Promise.error(error)
)

// 响应拦截器
service.interceptors.response.use(
    // 请求成功
    res => {if(Vue.prototype.$lock){setTimeout(() => {Vue.prototype.$lock=false},2000)}; return /^20/.test(res.status) ? Promise.resolve(/^cdn|http/.test(res.config.url)?res.data:res.data.data) : Promise.reject(res)},
    // 请求失败
    error => {
        if(Vue.prototype.$lock){setTimeout(() => {Vue.prototype.$lock=false},2000)}
        const { response } = error;
        if (response) {
            // 请求已发出，但是不在2xx的范围
            errorHandle(response.status, response.data.msg||response.data.message);
            // return Promise.reject(response);
            return Promise.error(response);
        } else {
            // 处理断网的情况
            // eg:请求超时或断网时，更新state的network状态
            // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
            // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
            if (!window.navigator.onLine) {
                store.commit('changeNetwork', false);
            } else {
                // return Promise.reject(error);
                return Promise.error(error);
            }
        }
    }
);



export function Post(url, params) {
    if(Vue.prototype.$lock){return Promise.reject()}else {
        Vue.prototype.$lock=true;
        return service({url: url, method: 'post',data: params})
    }
}

export function Get(url, params) {
    if(params){
        let nd = "?";
        let xx = Object.entries(params);
        xx.forEach((val) => {
            if(val[1] || val[1] == 0){
                nd+=val[0]+'='+val[1]+'&'
            }
        });
        url = url+nd.replace(/&$/,'');
    }
    return service({url: url, method: 'get'})
}


//5,跳转路由
export const link = ((url, param, inx) => {
    if (url) {
        if(/^\/downapp$/.test(url)){
            window.open(this.$URL.app, "_blank")
        }else{
            router.push({ path: url, query: { type: param, index: inx } })
        }
    } else {
        window.location.href = url
    }
})

