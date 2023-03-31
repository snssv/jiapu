<template lang="pug">
    .mine.help
        .nav_tabs
            .tab(v-for="(it,ind) in tabArr" @click="toLink(ind)", :class="{active:tabInd==ind}")
                b {{it}}
        .wrap
            .mdview(v-if="tabInd==0" v-html="about")
            .mdview(v-if="tabInd==1" v-html="help")
            .mdview(v-if="tabInd==2" v-html="terms")




</template>

<script>

    import marked from 'marked';
    export default {
        components:{
        },
        data () {
            return {
                tabAr1: ["about","help","terms"],
                tabArr: ["关于我们","使用帮助","协议条款"],
                tabInd: this.$route.query.tab||1,
                about: null,
                help: null,
                terms: null,
            }
        },
        mounted(){
        },
        computed: {
        },
        created(){

        },
        methods:{
            toLink(ind){
                this.$router.push(this.tabAr1[ind])
                this.tabInd=ind
            },
            getData(){
                this.$get('cdn/document/about.md?' + Date.now()).then((res) =>{
                    if(res){
                        this.about = res?marked(res):null
                    }
                }).catch(err => {
                });
                this.$get('cdn/document/help.md?' + Date.now()).then((res) =>{
                    if(res){
                        this.help = res?marked(res):null
                    }
                }).catch(err => {
                });
                this.$get('cdn/document/terms.md?' + Date.now()).then((res) =>{
                    if(res){
                        this.terms = res?marked(res):null
                    }
                }).catch(err => {
                });
            },

        },
        watch: {

        },
        activated(){
            const Pas = this.$route.path
            if(Pas==='/about'){
                this.tabInd = 0
            }else if(Pas==='/terms'){
                this.tabInd = 2
            }else {
                this.tabInd = 1
            }
            this.getData()
        },
        deactivated(){

        }
    }
</script>
