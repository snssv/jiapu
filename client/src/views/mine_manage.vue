<template lang="pug">
    .mine
        Menu
        mescroll-vue(ref="mescroll", :opt-down="mescrollDown", :opt-up="mescrollUp")
            .wrap.manage_list.wrap_topad
                .nav_tabs
                    .tab(v-for="(it,ind) in tabArr" @click="tabSet(ind)", :class="{active:tabInd==ind}")
                        b {{it}}
                        sup {{totals[ind]}}
                .li(v-for="it in items")
                    span(v-if="tabInd===0" )
                        .btn_group(v-if="userInfo.id === it.fromUser.id" )
                            .btn.xxs.empty.disabled {{passArr[it.pass||0]}}
                            .btn.xxs.hon 删除
                        .btn_group(v-else-if="it.pass==0")
                            .btn.xxs(@click="review(it.id, 1)") 通过
                            .btn.xxs.hon(@click="review(it.id, 2)") 拒绝
                        .btn_group(v-else)
                            .btn.xxs.empty.disabled 已{{it.pass === 1 ? '通过':'拒绝'}}
                        .tit
                            span.time {{$dayjs(it.createAt).format('YYYY-MM-DD hh:mm:ss')}}
                            b.hover(@click="$open(1, it.fromUser.id)") {{it.fromUser.nickname}}
                            span 申请成为
                            b.hover(@click="$open(0, it.hostId)") {{it.hostName}}家谱
                            span 的管理员:
                    span(v-else)
                        .tit
                            span.time {{$dayjs(it.createAt).format('YYYY-MM-DD hh:mm:ss')}}
                            b.hover(@click="$open(1, it.fromUser.id)") {{it.fromUser && it.fromUser.nickname}}
                            span 在
                            b.hover(v-if="it.type == 1" @click="$open(1, it.hostId)") {{it.hostName}}人物信息
                            b.hover(v-else @click="$open(0, it.hostId)") {{it.hostName}}家谱
                            span 添加了留言:
                    .con 留言内容：{{it.content}}


</template>

<script>
import Menu from '@/views/mine_menu'
import { mapGetters } from "vuex"
import MescrollVue from 'vue-mescroll/mescroll'

export default {
    components:{
        Menu,MescrollVue
    },
    data () {
        return {
            tabArr: ["任务处理","站内消息"],
            tabInd: 0,
            totals: [0,0],
            items:null,
            total: 0,
            passArr:['待审核','已通过','已拒绝'],
            form:{
                page:1
            }
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
        tabSet(ind){
            this.items=null
            this.form.page = 1
            this.tabInd = ind
            this.getData()
        },
        review(id,pass){
            this.$post('manage/review',{id:id, pass:pass}).then(res => {
                this.getData();
            }).catch()
        },
        getData(){
            const url = ['manage/my','message']
            const ind = this.tabInd
            this.$get(url[ind],{page:this.form.page}).then((res) =>{
                // console.log(res)
                if(res && !res.data){
                    this.totals[ind] = res[1];
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
        //上拉加载
        upCallback() {
            if(this.total>=10){
                this.form.page+=1;
                this.getData();
            }else {
                this.$refs.mescroll.instance.endErr()
            }
        },
        //下拉刷新
        downCallback() {
            // this.$refs.mescroll.instance.start();
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
