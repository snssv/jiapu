<template lang="pug">
    .main
        .head
            el-row(:gutter='20')
                el-col(:span='5')
                    el-input.input-with-select(placeholder='关键字', v-model='form.key')
                el-col(:span='3')
                    el-input.input-with-select(placeholder='设备', v-model='form.device')
                el-col(:span='4')
                    el-date-picker(v-model='dateArea', type='daterange', align='right', unlink-panels='', range-separator='至', start-placeholder='发布时间开始', end-placeholder='结束', :picker-options='pickerOptions')

                el-col(:span='4')
                    el-button( @click.native="getData(1)") 高级选项
                    el-button(type="primary" icon='el-icon-search' @click.native="getData(1)") 搜索


        .data_null(v-if="!items|| total<1")
        .data(v-else)
            el-table(:data='items', stripe='', height="85vh")
                el-table-column(label='操作' fixed="right", width="150px")
                    template(slot-scope='scope')
                        el-button(@click='del(scope.row.id)', type='warning', size='mini' plain) 删除
                        el-button(@click='edit(scope.row)', type='primary', size='mini' plain) 编辑


                el-table-column(prop='createAt' sortable label='创建日期' width="150px" :formatter="forCra")
                el-table-column(prop='updateAt' sortable label='更新日期' width="150px" :formatter="forHap")

                el-table-column( prop='status' label='状态' :formatter="forSta" width="60" )
                el-table-column( prop='device'  label='设备号' width="180px")
                    template(slot-scope='scope')
                        p(@click="findByDevice(scope.row.device)" v-if="scope.row.device")
                            el-tooltip.item(effect="dark" content="搜索此设备发布" placement="top")
                                i.el-icon-search
                            span {{scope.row.device}}

                el-table-column(label='作者' width="150px")
                    template(slot-scope='scope')
                        p(v-if="scope.row.user" @click="findByUser(scope.row.user.id)")
                            el-tooltip.item(effect="dark" content="搜索他的家谱" placement="top")
                                i.el-icon-search
                            span.hover {{scope.row.user.nickname || ' 佚名'}}
                        p.hover(v-else) {{scope.row.nickname || ' 佚名'}}
                el-table-column( label='始祖' width="150px")
                    template(slot-scope='scope')
                        span.hover(@click="showDet(scope.row.id)") {{scope.row.ancestor}}

                el-table-column( prop='seniority' label='字辈' width="200px")
                el-table-column( prop='address' label='地址' width="300px")
                el-table-column(sortable prop='lat' label='经度' width="80px")
                el-table-column(sortable prop='lng' label='纬度' width="80px")
                el-table-column( prop='ip' label='ip' width="150px")
                el-table-column(sortable prop='views' label='阅读量')
                el-table-column(sortable prop='comment' label='评论数')
                el-table-column(sortable prop='feeling' label='点赞数')
                el-table-column(sortable prop='private' label='需密码')
                    template(slot-scope='scope') {{scope.row.private?'是':'否'}}



        .foot
            el-pagination(background='', layout='prev, pager, next', :page-size='30' :total='total'  @current-change="getData")
            .total 共 {{total}} 条


        el-dialog(title='编辑内容', :visible.sync='editDialog', width='700px')
            el-form(ref='form', :model='form', label-width='80px')
                el-form-item(label='状态')
                    el-radio-group(v-model='editObj.status')
                        el-radio-button(label='0') 正常
                        el-radio-button(label='1') 隐藏

            span.dialog-footer(slot='footer')
                el-button(@click='editDialog = false') 取 消
                el-button(type='primary', @click='yesEdit' :disabled="disabled") 确 定

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
                editObj:{
                    tag:null,
                },
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
                    createAt:null,
                    sortA:0,
                    sortB:0,
                },
                items:null,
                total:0,
                disabled: false

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
                if(this.$route.query){
                    par ={
                        ...par,
                        ...this.$route.query
                    }
                }

                this.$get('article/admin', par).then((res) =>{
                    this.items = res[0];
                    this.total = res[1];
                })
            },
            showDet(id) {
                window.open(this.$BASEWEB+'#/article/t?id='+id)
            },
            findByUser(id) {
                this.$router.push('/article?userId='+id)
            },
            findByDevice(id) {
                this.$router.push('/article?device='+id)
            },
            forCra(row) {
                return this.$dayA(row.createAt);
            },
            forHap(row) {
                return this.$dayA(row.updateAt);
            },
            forCat(row) {
                return this.$arrCate[row.category];
            },
            forSta(row) {
                return this.$arrStat[row.status]
            },
            forTyp(row) {
                return this.$arrLeve[row.type]
            },
            edit(it){
                this.editObj = it;
                this.editDialog = true;
            },
            yesEdit(){
                // console.log(this.editObj.level)

                this.disabled = true;
                this.$post('article/admin', {
                    id: this.editObj.id,
                    status: Number(this.editObj.status),
                }).then(res => {
                    // console.log(res);
                    if(res && res.id) {
                        this.$toast.success('修改成功')
                        this.getData(1);
                    }
                    this.editDialog = false;
                    this.disabled = false;
                }).catch(err => {
                    this.disabled = false;
                    this.$toast.error('修改失败')
                })
            },
            del(it){
                this.delObj = it;
                this.delDialog = true;
            },
            yesDel(){
                this.delDialog = false;
                this.$post('article/delete/'+this.delObj).then(res => {
                    this.$toast.success('删除成功')
                    this.getData(1);
                }).catch(err => {
                    this.$toast.error('删除失败')
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
