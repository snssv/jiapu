<template lang="pug">
    .signin(:class="{show:!userInfo}")
        .box
            h1 欢迎使用

            el-form(ref='form', :model='form', label-width='80px')
                el-form-item(label='用户')
                    el-input(v-model='form.username' ref="username" @keyup.enter.native="signin")
                el-form-item(label='密码')
                    el-input(v-model='form.password', ref="password" type="password" @keyup.enter.native="signin")

                el-form-item
                    el-button(type='primary', @click='signin', :disabled="disabled" icon="el-icon-user-solid") -m 登录 m-


</template>

<script>
import { mapGetters } from "vuex"
import {regName,regPwd} from '../utils/validate'

export default {
    data () {
        return {
            form: {
                username: null,
                password: null
            },
            disabled: false
        }
    },
    components: {
    },
    computed: {
        ...mapGetters(["userInfo"])
    },
    created() {

    },
    watch:{
    },
    mounted(){
        this.getCaptcha()
    },
    methods:{
        signin(){
            // 检验用户名与密码
            if(!regName(this.form.username)){
                this.$refs.username.focus();
                this.$toast.warning('请输入合法用户名\n4-12位字母或数字（必须包含字母）');
            }else if(!regPwd(this.form.password)){
                this.$refs.password.focus();
                this.$toast.error('请输入6-12位密码');
            }else {
                this.disabled=true;
                let par = this.form;
                par.password=this.$md5(par.password)
                this.$store.dispatch('SignIn', par).then(() =>{
                    this.$toast.success('登录成功');
                    // this.$router.push('/mine/article')
                    this.disabled=false;
                    location.reload()
                }).catch( err => {
                    this.disabled=false;
                })
            }

        },

        // 图文验证码接口
        getCaptcha(){

        }
    }
}
</script>
