<template lang="pug">
    .signup.form_box
        .box
            h1 用户注册

            .form
                .item
                    i.icon-user-o
                    input.inp(v-model='parmas.username' ref="username", placeholder="账号[4-12位字母可包含数字,例:yang123]" maxlength="12")
                .item
                    i.icon-lock
                    input.inp(ref="password", placeholder="密码[6-12位]"  maxlength="12" type="password")

                .item
                    i.icon-star
                    input.inp(v-model='parmas.nickname', ref="nickname" type="text", placeholder="显示用的昵称"  maxlength="16")

                p
                    |注1：穷逼站长暂时没能力做短信验证，所以还请你牢记自己的账号和密码，真怕记不住，就只能
                    b.hover(@click="showQA=!showQA") 设置密保问题
                    |作为辅助了；
                .item(v-if="showQA" )
                    i.icon-comment-o
                    input.inp(v-model='parmas.pwdQ', ref="pwdQ" type="text", placeholder="请输入密保问题[找回密码的提示]"  maxlength="10")
                .item(v-if="showQA" )
                    i.icon-commit
                    input.inp(v-model='parmas.pwdA', ref="pwdA" type="text", placeholder="请输入密保答案"  maxlength="10" @keydown.enter="signup")
                p 注2：点击“立即注册”便确认你已经同意注册及使用条款。

                .item
                    .btn(type='primary', @click='signup', :disabled="disabled") 立即注册
                .li
                    a.fl(@click="tosignin") 已有账号？现在登录

        .terms.mdview(v-html="terms")

</template>

<script>
    import { mapGetters } from "vuex"
    import marked from 'marked'
    import {regName,regPwd,regTxYzm} from '../utils/validate'

    export default {
        components:{
            // marked
        },
        data () {
            return {
                showQA: false,
                parmas: {
                    username: null,
                    nickname: null,
                    pwdQ: null,
                    pwdA: null,
                },
                disabled: false,
                terms:null,
                token: localStorage.getItem('token')?'Bearer '+ localStorage.getItem('token'):'',
            }
        },
        mounted(){
            if(this.userInfo && this.token){
                this.$router.push('/')
            }
            this.getterms()
        },
        computed: {
            ...mapGetters(["userInfo"])
        },
        methods:{
            getterms(){
                this.$get('cdn/document/terms.md').then( res =>{
                    this.terms = marked(res)
                    // console.log(res)
                })
            },
            tosignin(){
                this.$store.commit('SET_SIGNPOP',true);
                // this.$router.push('/signup')
            },
            signup(){
                // 检验账号与密码
                const pw = this.$refs.password.value
                if(!regName(this.parmas.username)){
                    this.$refs.username.focus();
                    this.$toast.warning('请输入合法账号\n6-12位字母或数字（必须包含字母）');
                }else if(!regPwd(pw)){
                    this.$refs.password.focus();
                    this.$toast.error('请输入合法密码\n6-12位数字与字母组合');
                }else if(this.parmas.pwdQ && !this.parmas.pwdA){
                    this.$refs.pwdA.focus();
                    this.$toast.error('如果设置密保问题，答案不能为空');
                }else {
                    this.disabled=true;
                    const par = {
                        ...this.parmas,
                        password: this.$md5(pw),
                        parent: regTxYzm(this.$route.query.code)?this.$route.query.code:null
                    };

                    this.$store.dispatch('SignUp', par).then(() =>{
                        this.$toast.success('注册成功');
                        setTimeout(()=>{

                            this.$store.dispatch('SignIn', {
                                username: par.username,
                                password: par.password,
                                now: true
                            }).then(() =>{
                                this.$toast.success('登录成功');
                                // this.$router.push('/mine/article')
                                this.$router.push('/mine/article');
                                this.disabled=false;
                                // location.reload()
                            })
                        },500)
                        // this.$router.push('/mine');
                        // location.reload()
                        // this.disabled=false;
                    }).catch( err => {
                        // this.disabled=false;
                    })
                }
            }
        },
        watch: {
        },
        activated(){

        },
        deactivated(){

        }
    }
</script>
