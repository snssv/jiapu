<template lang="pug">
    .mine
        .wrap.wrap_mine
            .a(v-if="token")
                .head_info
                    .avatar
                        .img.upimg(:style="$avatar(userInfo.id)")
                            i.icon-camera
                            input(type="file" accept="image/png, image/jpeg" ref='imgx' @change="avatarUp()")
                .name
                    h3 {{userInfo.nickname||'佚名1984'}}

                    h4(v-if="userInfo.createAt") {{$dayjs(userInfo.createAt).format('YYYY-MM-DD hh:mm:ss')}}
                    dl
                        dt
                            i.icon-gift
                            span 积分 {{userInfo.integral}}

                        dd
                            i.icon-buoy-o
                            span 经验 {{userInfo.coin}}


                    .btn.empty(@click="signout") 退出登录

            .b(v-else)
                .head_info
                    .avatar
                .name
                    h3 {{userInfo.nickname}}
                    .btn_group
                        .btn(@click="signin") 登录
                        router-link.btn.jv.empty(to="/signup") 注册
                .box
                    h2 欢迎访问家谱网
                    p
                        | 你可以在这里查找附近的家谱，也可以为你的祖上/亲属创建家谱，还可以备份你的家谱到自己的电脑上。
                        router-link(to="/help") 更多帮助
            Menu.root


</template>

<script>
    import Menu from '@/views/mine_menu'
    import { mapGetters } from "vuex"

    export default {
        components:{
            Menu
        },
        data () {
            return {
                avatar:null

            }
        },
        mounted(){
        },
        created(){
        },
        computed: {
            ...mapGetters(["userInfo","token"])
        },
        methods:{
            signin(){
                this.$store.commit('SET_SIGNPOP',true)
            },
            signout(){
                this.$store.dispatch('SignOut')
                location.reload()
            },
            avatarUp(){
                const maxSize = 70 * 1024, fileObj = this.$refs.imgx.files;
                if (fileObj[0] && fileObj[0].type.indexOf("image") == 0) {
                    // console.log(fileObj[0] )
                    /* eslint-disable */
                    if (fileObj[0].size > maxSize) {
                        compressImg(fileObj[0],  imgBase64=> {
                            this.avatar = imgBase64;
                            this.avatarUpTo()
                        })
                    } else {
                        directTurnIntoBase64(fileObj[0],  imgBase64 => {
                            this.avatar = imgBase64;
                            this.avatarUpTo()
                        });
                    }
                    /* eslint-disable */
                }

            },
            avatarUpTo(){
                this.$post('user/upload',{type:'avatar',name:'avatar',file:this.avatar}).then( res=>{
                    this.$toast.success('上传成功');
                    location.reload()
                }).catch()

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
