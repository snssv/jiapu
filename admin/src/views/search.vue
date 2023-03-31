<template lang="pug">
    .main
        .head
            el-row(:gutter='20')
                el-col(:span='6')
                    el-input.input-with-select(placeholder='关键字', v-model='form.key')

                el-col(:span='5')
                    el-button(type="primary" icon='el-icon-search' @click.native="getData(1)") 搜索


        .data_null(v-if="!items|| total<1")
        .data(v-else)
            el-table(:data='items', stripe='', height="85vh")
                el-table-column(label='操作' fixed="right", width="150px")
                    template(slot-scope='scope')
                        //el-button(@click='del(scope.row.id)', type='warning', size='mini' plain) 删除
                        el-button(@click='changeLock(scope.row.id)', :type="(scope.row.locked?'danger':'primary')", size='mini' plain) {{scope.row.locked?'解除':'屏蔽'}}


                el-table-column(prop='createAt' sortable label='创建日期' width="180px" :formatter="forHap")
                el-table-column(prop='updateAt' sortable label='更新日期' width="180px" :formatter="forUpd")
                el-table-column(sortable prop='type' label='分类' width="100px")
                el-table-column(sortable prop='keyword' label='关键词')
                el-table-column(sortable label='屏蔽')
                    template(slot-scope='scope')
                        el-tag(:type="(scope.row.locked?'danger':'primary')", size='mini' plain) {{scope.row.locked?'是':'否'}}


        .foot
            el-pagination(background='', layout='prev, pager, next', :page-size='30' :total='total'  @current-change="getData")
            .total 共 {{total}} 条


        el-dialog(title='删除警告', :visible.sync='delDialog', width='30%')
            span 确定要删除这条内容吗？
            span.dialog-footer(slot='footer')
                el-button(@click='delDialog = false') 取 消
                el-button(type='primary', @click='yesDel') 确 定


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

                dateArea: null,
                input2: '',
                input3: '',
                select: '',
                form: {
                    page:1,
                    key:null,
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

                this.$get('search/hot', par).then((res) =>{
                    this.items = res[0];
                    this.total = res[1];
                })
            },
            showDet(id) {
                window.open(this.$BASEWEB+'#/article/detail?id='+id)
            },
            findByUser(id) {
                this.$router.push('/article?userId='+id)
            },
            findByDevice(id) {
                this.$router.push('/article?device='+id)
            },
            forHap(row) {
                return this.$dayA(row.createAt);
            },
            forUpd(row) {
                return this.$dayA(row.updateAt);
            },
            del(it){
                this.delObj = it;
                this.delDialog = true;
            },
            yesDel(it){
                this.delObj = it;
                this.delDialog = true;
            },
            changeLock(id){
                this.$post('search/changeLock/'+id).then(res=>{
                    this.getData()
                }).catch()
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
