<template lang="pug">
    .mine
        Menu

        mescroll-vue(ref="mescroll", :opt-down="mescrollDown", :opt-up="mescrollUp")
            .wrap.file_list
                .data_null(v-if="!items||items.length<1")
                .li(v-for="(it,ind) in items")
                    .img(:style="bg(it.filename)")
                        .btn_group
                            .btn.xs(@click="show(it)") 查看
                            .btn.xs.jv(@click="remove(ind)") 删除
                    .fot
                        h3 {{it.originalname||'未命名'}}
                        p {{$dayjs(it.createAt).format('YYYY-MM-DD hh:mm:ss')}}


        dialogconfirm(:show-dialog='showConfirm', :ok-text="confTok", :cancel-text="confTcancel", :content="confTcon", v-on:confirm='confirmFn', v-on:cancel='cancelFn', :hide-confirm='false')


</template>

<script>
    import Menu from '@/views/mine_menu'
    import { mapGetters } from "vuex"
    import MescrollVue from 'vue-mescroll/mescroll'
    import dialogconfirm from '@/views/mo_confirm'
    export default {
        components:{
            Menu,MescrollVue,dialogconfirm
        },
        data () {
            return {
                items:null,
                total: 0,
                form:{
                    page:1
                },
                rmid:null,
                confirmLock:false,
                showConfirm:false,
                confTok:'确定删除',
                confTcancel:'取消',
                confTcon:'如果你有文章引用了这张图片，删除后将可能影响该文章图片的正常显示',
            }
        },
        mounted(){
            // this.getData()
        },
        created(){
            this.mescrollDown = {
                auto: true,
                callback: this.downCallback,
                page: {
                    num: 1,
                    size: 30,
                }
            };
            this.mescrollUp = {
                auto: true, //初始时是否执行
                callback: this.upCallback, //上拉加载的回调函数
                page: {
                    num: this.form.page,
                    size: 30,
                },
                toTop:{
                    src:this.$BASECDN+'cdn/arrow-up-b.svg'
                }
            }
        },
        computed: {
            ...mapGetters(["userInfo"])
        },
        methods:{
            confirmFn(){
                this.$post('file/delete'+this.items[this.rmid].id).then(res => {
                    this.items.splice(this.rmid,1)
                    this.cancelFn()
                }).catch( err => {
                    this.cancelFn()
                    this.disabled=false;
                })
            },
            cancelFn(){this.showConfirm = false;},
            remove(id){
                this.showConfirm = true;
                this.rmid=id;
            },
            getData(){
                this.$get('file/my',{page:this.form.page}).then((res) =>{
                    if(res && !res.data){
                        this.total = res[1];
                        if(this.form.page<2){
                            this.items = res[0];
                        }else {
                            res[0].forEach(it => {
                                this.items.push(it)
                            })
                        }
                        this.$refs.mescroll.instance.endSuccess(res[0].length,res[1])
                    }else {
                        this.$refs.mescroll.instance.endErr()
                    }
                }).catch(err => {
                    this.$refs.mescroll.instance.endErr()
                })
            },
            bg(n){
                return this.$rbg(this.$BASECDN+'cdn/'+this.userInfo.id+'/img/'+n+'.jpg')
            },
            show(it){
                window.open(this.$BASECDN+'cdn/'+this.userInfo.id+'/img/'+it.filename+'.jpg')
            },
            //上拉加载
            upCallback() {
                if(this.total>=30){
                    this.form.page+=1;
                    this.getData();
                }else {
                    this.$refs.mescroll.instance.endErr()
                }
            },
            //下拉刷新
            downCallback() {
                this.form.page = 1;
                this.getData()
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
