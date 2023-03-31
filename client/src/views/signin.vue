<template lang="pug">
    .signin.form_box(:class="{show:signPop}")
        .box
            i.close.icon-close(@click="$store.commit('SET_SIGNPOP',false)")
            .logo

            .form(ref='form', :model='form')
                .item
                    i.icon-user-o
                    input.inp(v-model='form.username', placeholder="用户名" ref="username")
                .item
                    i.icon-lock
                    input.inp(:value='form.password', placeholder="密码" ref="password" type="password" @keydown.enter="signin")

                .item
                    .btn(type='primary', @click='signin', :disabled="disabled") 登录
                .li
                    a.fl(@click="tosignup") 还没账号？现在注册
                    router-link.fr(to="/signpwd")
                        span 找回密码
                        i.icon-angle-right


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
            ...mapGetters(["user","signPop"])
        },
        created() {

        },
        watch:{
        },
        mounted(){
        },
        methods:{
            tosignup(){
                this.$store.commit('SET_SIGNPOP',false);
                this.$router.push('/signup')
            },
            signin(){
                // 检验用户名与密码
                const psw = this.$refs.password.value
                if(!regName(this.form.username)){
                    this.$refs.username.focus();
                    this.$toast.warning('请输入合法用户名\n4-12位字母或数字（必须包含字母）');
                }else if(!regPwd(psw)){
                    this.$refs.password.focus();
                    this.$toast.error('请输入6-12位密码');
                }else {
                    this.disabled=true;
                    const par = {
                        ...this.form,
                        password:this.$md5(psw)
                    }
                    this.$store.dispatch('SignIn', par).then(() =>{
                        this.$toast.success('登录成功');
                        // this.$router.push('/mine/article')
                        this.disabled=false;
                        location.reload()
                    }).catch( err => {
                        // this.$toast.error('出错了');
                        this.disabled=false;
                    })
                }
            }
        }
    }
</script>
