<template lang="pug">
    .mine.setting
        Menu
        .wrap
            .cont(v-if="userInfo && form")
                .form_box
                    h1 基本资料
                    .form(ref='form', :model='form')
                        .item
                            p 你的账号昵称【对外展示】，注意不要与登录用的用户名【你自己知道的唯一账号】相同以避免被盗号风险
                        //.item
                            i.icon-user-o
                            input.inp(v-model='form.username' ref="username" maxlength="12" readonly)
                        .item
                            i.icon-user-o
                            input.inp(v-model='form.nickname', ref="nickname" type="text" maxlength="16")

                        .item
                            .btn.empty(type='primary', @click='setInfo', :disabled="disabled") 确定修改
                .form_box
                    h1 修改密码
                    .form
                        .item
                            i.icon-lock
                            input.inp(v-model='pass1', ref="password1" placeholder="旧密码" type="password" maxlength="20")
                        .item
                            i.icon-lock
                            input.inp(v-model='pass2', ref="password2" placeholder="新密码" type="password" maxlength="20")
                        .item
                            i.icon-lock
                            input.inp(v-model='pass3', ref="password3" placeholder="确认新密码" type="password" maxlength="20")

                        .item
                            .btn.empty(@click='send_pass_change') 修改密码
                .form_box
                    h1 密保问题
                    .form(ref='form', :model='form')
                        .item
                            i.icon-comment-o
                            input.inp(v-model='form.pwdQ', ref="pwdQ" type="text" maxlength="10")
                        .item
                            i.icon-commit
                            input.inp(v-model='form.pwdA', ref="pwdA" type="text" maxlength="10" @keydown.enter="setInfo(2)")

                        .item
                            .btn.empty(@click='setInfo(2)') 设置
                //.form_box
                //    h1 验证邮箱
                //    .form(ref='form', :model='form')
                //        .item
                //            i.icon-mail-o
                //            input.inp(v-model='form.email', ref="email" type="email" maxlength="20" @keydown.enter="setInfo")
                //
                //        .item
                //            .btn.empty(@click='send_email_code') 验证邮箱

            .cont(v-else @click="$store.commit('SET_SIGNPOP',true)") 请先登录




</template>

<script>
    import Menu from '@/views/mine_menu'
    import { mapGetters } from "vuex"
    import {regName,regPwd,regTxYzm} from '../utils/validate'
    export default {
        components:{
            Menu
        },
        data () {
            return {
                form: null,
                disabled: false,
                pass1: null,
                pass2: null,
                pass3: null,
                page: {
                    num: 1,
                    size: 30,
                }
            }
        },
        mounted(){
            this.form = this.userInfo;
        },
        created(){
            this.mescrollDown = {
                auto: false,
                callback: this.downCallback
            }
        },
        computed: {
            ...mapGetters(["userInfo"])
        },
        methods:{
            setInfo(t){
                let par = {
                    id:this.form.id,
                    nickname:this.form.nickname,
                }
                if(t===2){
                    if(!this.form.pwdQ || !this.form.pwdA){
                        this.$toast.error('密保问题与答案需要成对')
                        return false
                    }else {
                        par.pwdQ = this.form.pwdQ
                        par.pwdA = this.form.pwdA
                    }
                }

                this.disabled=true;
                this.$post('user/update', par).then(res =>{
                    if(res){
                        this.$toast.success('修改成功');
                        this.$store.commit('SET_USER', res);
                    }
                    this.disabled=false;
                }).catch( err => {
                    this.disabled=false;
                })
            },
            send_pass_change(){
                if (!regPwd(this.pass1)) {
                    this.$toast.error('请输入6-12位旧密码');
                } else if (!regPwd(this.pass2)){
                    this.$toast.error('请输入6-12位新密码');
                } else if (!regPwd(this.pass3)){
                    this.$toast.error('请确认新密码');
                } else if (this.pass3 !== this.pass2){
                    this.$toast.error('两次新密码不一致');
                } else {
                    this.disabled=true;
                    this.$post('user/password',{
                        oldPassword: this.$md5(this.pass1),
                        newPassword: this.$md5(this.pass2),
                    }).then(res =>{
                        if(res){
                            this.$toast.success('密码更新成功');
                            this.$store.dispatch('SignOut')
                            this.$router.push('/article')
                            this.$store.commit('SET_SIGNPOP', true)
                        }
                        this.disabled=false;
                    }).catch( err => {
                        this.disabled=false;
                    })
                }
            },
        },
        watch: {
        },
        activated(){

        },
        deactivated(){

        }
    }
</script>
