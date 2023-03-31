<template lang="pug">
    .signpwd.form_box
        .box(v-if="step === 1" )
            h1 找回密码
            p 第一步: 输入用户名提取密保问题
            .form
                .item
                    i.icon-user-o
                    input.inp(v-model='username', ref="username" type="text", placeholder="请输入你的用户名"  maxlength="20" @keydown.enter="submit1")
                .item
                    .btn(type='primary', @click='submit1' :disabled="disabled") 下一步
        .box(v-if="step === 2" )
            h1 找回密码
            p 第二步: 根据密保问题输入密保答案进行验证
            .form
                .item
                    i.icon-user-o
                    input.inp(v-model='username', disabled="true")
                .item
                    i.icon-comment-o
                    input.inp(v-model='pwdQ', disabled="true")
                .item
                    i.icon-commit
                    input.inp(v-model='pwdA', ref="pwdA" type="text", placeholder="请输入密保答案"  maxlength="20" @keydown.enter="submit2")
                .item
                    .btn(type='primary', @click='submit2' :disabled="disabled") 下一步
        .box(v-if="step === 3" )
            h1 找回密码
            p 第三步: 重置新密码
            .form
                .item
                    i.icon-user-o
                    input.inp(v-model='username', disabled="true")
                .item
                    i.icon-lock
                    input.inp(v-model='pass2', ref="pass2" placeholder="新密码" type="password" maxlength="20")
                .item
                    i.icon-lock
                    input.inp(v-model='pass3', ref="pass3" placeholder="确认新密码" type="password" maxlength="20" @keydown.enter="submit3")
                .item
                    .btn(type='primary', @click='submit3' :disabled="disabled") 重置密码


</template>

<script>
    import { mapGetters } from "vuex"
    import marked from 'marked'
    import {regName, regEmail, regTxYzm, regPwd} from '../utils/validate'

    export default {
        components:{
            // marked
        },
        data () {
            return {
                username: null,
                pwdQ: null,
                pwdA: null,
                pass2: null,
                pass3: null,
                step: 1,
                disabled: false,
                terms:null
            }
        },
        mounted(){
            this.$store.commit('SET_SIGNPOP',false);
        },
        computed: {
            ...mapGetters(["userInfo"])
        },
        methods:{
            submit1(){
                // 检验用户名与密码
                if(!regName(this.username)){
                    this.$refs.username.focus();
                    this.$toast.error('请输入正确的用户名');
                }else {
                    this.disabled=true;
                    this.$post('user/get_pwd1', {
                        username:this.username
                    }).then(res =>{
                        // console.log(res)
                        if(res){
                            this.pwdQ = res;
                            this.step = 2
                        } else {
                            this.$toast.error('该用户没有设置密保问题，\n无法通过此方式重置密码');
                        }
                        this.disabled=false;
                    }).catch( err => {
                        this.disabled=false;
                    })
                }
            },
            submit2(){
                // 检验用户名与密码
                if(!regName(this.username)){
                    this.$refs.username.focus();
                    this.$toast.error('请输入正确的用户名');
                }else {
                    this.disabled=true;
                    this.$post('user/get_pwd2', {
                        username: this.username,
                        pwdA: this.pwdA
                    }).then(res =>{
                        // console.log(res)
                        if(res){
                            this.pwdA = res;
                            this.step = 3
                        } else {
                            this.$toast.error('密保答案错误');
                        }
                        this.disabled=false;
                    }).catch( err => {
                        this.disabled=false;
                    })
                }
            },
            submit3(){
                if (!regPwd(this.pass2)){
                    this.$refs.pass2.focus();
                    this.$toast.error('请输入6-12位新密码');
                } else if (!regPwd(this.pass3)){
                    this.$refs.pass3.focus();
                    this.$toast.error('请确认新密码');
                } else if (this.pass3 !== this.pass2){
                    this.$refs.pass3.focus();
                    this.$toast.error('两次新密码不一致');
                } else {
                    this.disabled=true;
                    this.$post('user/get_pwd3', {
                        username: this.username,
                        pwdA: this.pwdA,
                        password: this.$md5(this.pass2)
                    }).then(res =>{
                        // console.log(res)
                        if(res){
                            this.pwdA = res;
                            this.step = 3
                        } else {
                            this.$toast.error('密保答案错误');
                        }
                        this.disabled=false;
                    }).catch( err => {
                        this.disabled=false;
                    })
                }
            }
        },
        watch: {
        },
        activated(){
            this.$store.commit('SET_SIGNPOP',false);

        },
        deactivated(){

        }
    }
</script>
