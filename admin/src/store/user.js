import router from '@/router'
import { Post, Get } from "@/utils/http";

const dsuser = localStorage.getItem('user')

const user = {
    state: {
        user: dsuser?JSON.parse(dsuser):null,
        signPop: false,
        calenPop: false,
        token: localStorage.getItem('token'),
        calen: new Date().getTime(),
        upimg: null
    },
    mutations: {
        SET_USER: (state, res) => {
            if(res){
                state.user = res;
                state.token = res.token;
                localStorage.setItem('user',JSON.stringify(res));
                localStorage.setItem('token',state.token);
            }else {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
            state.signPop=false;
        },
        SET_SIGNPOP:(state,signPop) => {
            state.signPop=signPop;
        },
        SET_IMG:(state,img) => {
            // console.log(img);
            state.upimg=img;
        }
    },
    actions: {
        //1---账户登录
        SignIn({ commit }, userInfo) {
            return new Promise((resolve, reject) => {
                Post('auth/signin/admin', userInfo).then(res => {
                    // console.log(res)
                    if (res&&res.username) {

                        commit('SET_USER', res);
                        resolve(res)
                    }else {
                        reject(res)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },

        //3---注册
        SignUp({ commit }, param) {
            return new Promise((resolve, reject) => {
                Post('auth/signup', param).then(res => {
                    if (res&&res.username) {
                        localStorage.setItem('user',JSON.stringify(res));
                        localStorage.setItem('token',res.token);
                        commit('SET_USER', res);
                        resolve(res)
                    }else {
                        reject(res)
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        //4----退出登录
        SignOut({ commit }) {
            return new Promise((resolve) => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                commit('SET_USER', null)
                // router.push('/')
                resolve()

            })
        },
        //5---清楚所有的本地缓存
        clearAll({ commit }) {
            return new Promise((resolve) => {
                //清除储存在state中的值
                commit('SET_USER', null)
                router.push('/')
                resolve()
            })
        }
    }
}

export default user
