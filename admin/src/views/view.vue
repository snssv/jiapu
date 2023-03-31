<template lang="pug">
    .main
        .head
            el-row(:gutter='10')
                el-col(:span='5')
                    el-input.input-with-select(placeholder='设备', v-model='form.device')
                el-col(:span='5')
                    el-date-picker(v-model='dateArea', type='daterange', align='right', unlink-panels='', range-separator='至', start-placeholder='发布时间开始', end-placeholder='结束', :picker-options='pickerOptions')

                el-col(:span='5')
                    el-button(type="primary" icon='el-icon-search' @click.native="getData(1)") 搜索


        .data_null(v-if="!items|| total<1")
        .data(v-else)
            el-table(:data='items', stripe='', height="85vh")
                el-table-column(label='创建日期' sortable width="150px")
                    template(slot-scope="scope") {{$dayA(scope.row.createAt)}}
                el-table-column(prop='url' sortable label='url' width="200px")
                el-table-column(prop='count' sortable label='数量' width="80px")

                el-table-column( prop='ip' label='ip' width="150px")
                el-table-column( prop='device' sortable label='设备号' width="180px")
                    template(slot-scope='scope')
                        p(@click="findByDevice(scope.row.device)" v-if="scope.row.device")
                            el-tooltip.item(effect="dark" content="搜索此设备发布" placement="top")
                                i.el-icon-search
                            span {{scope.row.device}}


                el-table-column(label='设备型号' sortable)
                    template(slot-scope='scope') {{userAgent(scope.row.userAgent)}}
                el-table-column(label='更新日期' sortable width="150px")
                    template(slot-scope="scope") {{$dayA(scope.row.updateAt)}}


        .foot
            el-pagination(background='', layout='prev, pager, next', :page-size='30' :total='total'  @current-change="getData")
            .total 共 {{total}} 条



</template>

<script>

export default {
    components:{

    },
    data () {
        return {
            delDialog: false,
            editDialog: false,
            editObj:null,
            pickerOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
            dateArea: null,
            input2: '',
            input3: '',
            select: '',
            form: {
                page:1,
                device:null,
                key:null,
                createAt:null,
            },
            items:null,
            total:0
        }
    },
    mounted(){
        this.getData()
    },
    computed: {
    },
    methods:{
        getData(p){
            this.form.page=p?p:1;
            let par = this.form;
            if(this.$route.query){
                par ={
                    ...par,
                    ...this.$route.query
                }
            }

            this.$get('view', par).then((res) =>{
                this.items = res[0];
                this.total = res[1];
            })
        },
        findByUser(id) {
            this.$router.push('/article?userId='+id)
        },
        findByDevice(id) {
            this.$router.push('/article?device='+id)
        },
        userAgent(txt) {
            if(txt && txt.indexOf(')')>=0){
                const arr1 = txt.split(')')[0]
                const arr2 = arr1.split('(')[1]
                const arr3 = arr2.split(';')[1]
                return arr3.replace(/_/g,'.')
            } else {
                return txt
            }
        },
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
