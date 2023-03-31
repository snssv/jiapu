<template lang="pug">
    .menu
        ul
            li(v-for="(it,ind) in menu" @click="$emit('hideMenu')")
                router-link(:to="'/mine/'+link[ind]", :exact="'capital'=='/mine/'+link[ind]")
                    i(:class="'icon-menu'+ind")
                    span {{it}}
                    //sub {{val[ind]}}
                    i.icon-angle-right




</template>

<script>

    export default {
        components:{
        },
        data () {
            return {
                menu:['任务处理','我的家谱','家谱成员','我的收藏','我的留言','图片管理','信息设置','使用帮助'],
                link:['manage','article','people','favorites','comment','file','setting','help'],
                val: [0],
                active: 0
            }
        },
        mounted(){
            this.getData()
        },
        computed: {
        },
        methods:{
            getData(){
                this.$get('article').then((res) =>{
                    this.items = res[0];
                })
            },
        },
        watch: {
            // $route(){
            //
            // }
        },
        activated(){
            // if(this.$getStorage('article')){
            //     this.$set(this.val,1,this.$getStorage('article').length)
            // }
        },
        deactivated(){

        }
    }
</script>
