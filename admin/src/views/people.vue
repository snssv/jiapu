<template lang="pug">
    .main
        .head
            el-row(:gutter='20')
                el-col(:span='4')
                    el-input.input-with-select(placeholder='关键字', v-model='form.key')
                el-col(:span='3')
                    el-input.input-with-select(placeholder='设备', v-model='form.device')
                el-col(:span='7')
                    el-date-picker(v-model='dateArea', type='daterange', align='right', unlink-panels='', range-separator='至', start-placeholder='发布时间开始', end-placeholder='结束', :picker-options='pickerOptions')

                el-col(:span='5')
                    el-button( @click.native="getData(1)") 高级选项
                    el-button(type="primary" icon='el-icon-search' @click.native="getData(1)") 搜索


        .data(v-if="items&&items[0]")
            el-table(:data='items', stripe='', height="85vh")
                el-table-column(label='操作' fixed="right", width="150px")
                    template(slot-scope='scope')
                        el-button(@click='del(scope.row.id)', type='warning', size='mini' plain) 删除
                        el-button(@click='edit(scope.row)', type='primary', size='mini' plain) 编辑


                el-table-column(prop='createAt' sortable label='创建日期' width="100px")
                el-table-column(prop='updateAt' sortable label='修改日期' width="100px")
                el-table-column(prop='name' label='姓名' width="80px")
                el-table-column(prop='birthAt' sortable label='生日' width="100px" :formatter="forDate")
                el-table-column(prop='deathAt' sortable label='忌日' width="100px" :formatter="forDate")
                el-table-column(prop='clan' label='民族' width="80px")
                el-table-column(label='关联家谱' width="200px")
                    template(slot-scope='scope')
                        label.el-button.el-button--warning.el-button--mini.is-plain(v-if="scope.row.catalog" v-for="(it,ind) in scope.row.catalog.split(',')" @click="showDet(it)") {{ind+1}}
                el-table-column(prop='address' label='地址' width="200px")
                el-table-column(prop='status' label='状态' :formatter="forSta")
                el-table-column(sortable prop='views' label='阅读量')
                el-table-column(sortable prop='comment' label='评论数')
                el-table-column(sortable prop='feeling' label='点赞数')
                el-table-column(label='详述' width="250px")
                    template(slot-scope='scope')
                        pre(@click="showDet(scope.row.id)") {{scope.row.content}}
                el-table-column(sortable prop='lat' label='经度')
                el-table-column(sortable prop='lng' label='纬度')
                el-table-column( prop='ip' label='ip' width="150px")
                el-table-column( prop='device'  label='设备号' width="160px")

                el-table-column(label='作者')
                    template(slot-scope='scope')
                        p(v-if="scope.row.user" @click="showDet(scope.row.user.id)")
                            el-tooltip.item(effect="dark" content="搜索他的家谱" placement="top")
                                i.el-icon-search
                            span {{scope.row.user.nickname || ' 佚名'}}
                        p(v-else) {{scope.row.nickname || ' 佚名'}}


        .foot
            el-pagination(background='', layout='prev, pager, next', :page-size='30' :total='total'  @current-change="getData")
            .total 共 {{total}} 条


        el-dialog(title='编辑内容', :visible.sync='editDialog', width='700px')
            span 这是一段信息
            span.dialog-footer(slot='footer')
                el-button(@click='editDialog = false') 取 消
                el-button(type='primary', @click='yesEdit') 确 定

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
                    category:null,
                    page:1,
                    device:null,
                    key:null,
                    happendAt:null,
                    createAt:null
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
                if(this.dateArea){
                    par.start = this.dateArea[0].getTime()
                    par.end = this.dateArea[1].getTime()
                }else {
                    par.start = null
                    par.end = null
                }
                this.$get('people/admin', par ).then((res) =>{
                    this.items = res[0];
                    this.total = res[1];
                })
            },
            showDet(id) {
                window.open(this.$BASEWEB+'#/article/t?id='+id)
            },
            forDate(row, column) {
                // console.log(row[column.property])
                return row[column.property] ? this.$dayx(row[column.property]) : '';
            },
            forCat(row) {
                return this.$arrCate[row.category];
            },
            forSta(row) {
                return this.$arrStat[row.status]
            },
            edit(it){
                this.editObj = it;
                this.editDialog = true;
            },
            yesEdit(){

            },
            del(it){
                this.delObj = it;
                this.delDialog = true;
            },
            yesDel(){

            }
        },
        watch: {
        },
        activated(){

        },
        deactivated(){

        }
    }
</script>
