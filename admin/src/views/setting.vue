<template lang="pug">
    .main
        .setting
            el-button(type="primary" icon='el-icon-s-promotion' @click.native="save") 保存
            el-form(:model="form" label-width="150px")
                el-form-item(v-for="(it,key) in form" v-if="key.indexOf('At')<0 && typeof it != 'boolean' && key != 'id'" :label="key")
                    el-input(v-if="typeof it != 'boolean'" v-model="form[key]")



</template>

<script>

    export default {
        components:{

        },
        data () {
            return {

                form: {
                    smtpHost:'123',
                    smtpPort:123,
                },
                disabled:false,
                total:0
            }
        },
        mounted(){
            this.getData()
        },
        computed: {
        },
        methods:{
            getData(){

                this.$get('setting').then((res) =>{
                    if(res&&res.smtpHost){
                        this.form = res
                    }
                })
            },
            save(){
                this.$post('setting',this.form).then((res) =>{
                    if(res){
                        // this.form = res
                        this.$toast.success('保存成功')
                    }
                })
            }

        },
        watch: {
            $route(){
                this.getData(1)
            }
        },
        activated(){

        },
        deactivated(){

        }
    }
</script>
