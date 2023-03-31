<template lang="pug">
    .main
        .head
            el-row(:gutter='20')
                el-col(:span='5')
                    el-input.input-with-select(placeholder='文件名', v-model='form.name')


                el-col(:span='16')
                    el-button(type="primary" icon='el-icon-s-promotion' @click.native="save" :disabled="disabled") 保存
                    el-button(icon='el-icon-refresh' @click.native="form={name:null,content:null}") 清空
                el-col(:span='2')
                    el-button(type="danger" icon='el-icon-delete' @click.native="del") 删除

        .document
            textarea(v-model='form.content')
            .files
                el-input(placeholder='筛选' v-model="key")
                ul
                    li(v-for="it in items" @click="setFile(it)" v-if="!key || it.indexOf(key)>=0") {{it}}

</template>

<script>

    export default {
        components:{

        },
        data () {
            return {
                disabled:false,
                form: {
                    name: null,
                    content:null
                },
                key:null,
                items:null
            }
        },
        mounted(){
            this.getData()
        },
        computed: {
        },
        methods:{
            getData(){
                this.$get('file/document').then((res) =>{
                    if(res){
                        this.items = res
                    }
                }).catch( err => {
                    this.$toast('获取文件列表失败')
                })
            },
            setFile(it){
                this.$get('cdn/document/'+it+'?'+new Date().getTime()).then((res) =>{
                    if(res){
                        this.form.name = it;
                        this.form.content = /json$/.test(it)?JSON.stringify(res):res;
                    }
                }).catch( err => {
                    this.$toast('获取文件失败')
                })
            },
            isJsonFile(){
                // console.log(typeof this.form.content)
                try {
                    if (typeof JSON.parse(this.form.content) == "object") {
                        return true;
                    }
                } catch(e) {
                }
                return false;
            },
            save(){

                if(!this.form.name){
                    this.$toast('文件名不能为空')
                }else if(!this.form.content){
                    this.$toast('文件内容不能为空')
                }else if(/json$/.test(this.form.name) && !this.isJsonFile()){
                    this.$toast('JSON 文件格式不规范')
                }else {
                    this.disabled=true;
                    this.$post('file/document/',this.form).then((res) =>{
                        if(res){
                            this.$toast.success('文件保存成功')
                            this.getData()
                        }
                        this.disabled=false;
                    }).catch( err => {
                        this.disabled=false;
                        this.$toast.error('文件保存失败')
                    })
                }
            },
            del(){
                if(!this.form.name || this.items.indexOf(this.form.name)<0){
                    this.$toast('文件名不能为空')
                }else {
                    this.$post('file/document/delete',this.form).then((res) =>{
                        if(res){
                            this.$toast.success('文件删除成功')
                            this.getData()
                        }
                    }).catch( err => {
                        this.$toast.error('文件删除失败')
                    })
                }
            }

        },
        watch: {
            $route(){
            }
        },
        activated(){

        },
        deactivated(){

        }
    }
</script>
