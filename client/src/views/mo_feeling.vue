<template lang="pug">
    .feeling_bar
        //span.val {{val2}}
        span.list(v-for="(it,ind) in feelingArr" @click="subFeeling(ind)"  :class="{active:mySet==ind}")
            i(:class="'icon-like'+it")
            span {{ind === 0 ? val : totalArr[ind]}}




</template>

<script>
    import { mapGetters } from "vuex"

    export default {

        name: 'feeling',
        components:{
        },
        model: {
        },
        props: ['val','uid','type'],
        data () {
            return {
                flag:false,
                // feelingArr:['👍','👎'],
                feelingArr:['','-n'],
                mySet:null,
                val2:this.val,
                totalArr:[0,0]
            }
        },
        mounted(){

        },
        computed: {
            ...mapGetters(["token","userInfo"])
        },
        methods:{
            getData(){
                this.$get('feeling',{
                    hostId:this.uid
                }).then(res => {
                    if(res && !res.data){
                        this.totalArr=res[0]
                        this.val2 =res[1]
                        // this.$emit('changeFeel',res[1])
                    }
                }).catch(err =>{})
                if(this.token){

                    this.$get('feeling/my',{
                        hostId:this.uid
                    }).then(res => {
                        if(res && !res.data){
                            this.mySet = res[0][0].val
                        }
                    }).catch(err =>{})
                }
            },
            subFeeling(t){
                this.$post('feeling',{
                    type:this.type,
                    val:t,
                    hostId:this.uid
                }).then(res => {
                    if(res && !res.data){
                        this.getData()
                    }
                }).catch(err =>{})
            }
        },
        watch: {
            uid(){
                this.getData()
            }
        }
    }
</script>
