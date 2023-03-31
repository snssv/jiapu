<template lang="pug">
    .main
        .head
            el-row(:gutter='20')

                el-col(:span='7')
                    el-input.input-with-select(placeholder='关键字', v-model='form.key')

                el-col(:span='7')
                    el-date-picker(v-model='dateArea', type='daterange', align='right', unlink-panels='', range-separator='至', start-placeholder='发布时间开始', end-placeholder='结束', :picker-options='pickerOptions')

                el-col(:span='5')
                    el-button(type="primary" icon='el-icon-search' @click.native="getData(1)") 搜索


        .data_null(v-if="!items|| total<1")
        .data.file_tab(v-else)
            el-table(:data='items', stripe='', height="85vh")
                el-table-column(label='操作' fixed="right", width="80px")
                    template(slot-scope='scope')
                        el-button(@click='del(scope.row.id)', type='warning', size='mini' plain) 删除


                el-table-column(sortable prop='createAt' label='创建日期' width="180px" :formatter="forHap")
                el-table-column(sortable prop='url' label='作者' width="360px")
                    template(slot-scope='scope')
                        p(@click="findByUser(scope.row.url)")
                            el-tooltip.item(effect="dark" content="搜索他的文件" placement="top")
                                i.el-icon-search
                            span {{scope.row.url}}
                el-table-column(label='缩略图' width="100px")
                    template(slot-scope='scope')
                        .img(@click="showDet(scope.row)" :style="$rbg($BASECDN+'cdn/'+scope.row.url+'/img/'+scope.row.filename+'.jpg')")
                el-table-column(sortable label='原始文件名' width="250px")
                    template(slot-scope='scope')
                        pre(@click="showDet(scope.row)") {{scope.row.originalname}}
                el-table-column(sortable prop='size' label='文件大小' width="110px")
                el-table-column(sortable prop='type' label='类型' width="100px")
                el-table-column(sortable prop='filename' label='文件名' width="200px")



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
                    page:1,
                    device:null,
                    key:null,
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
                if(this.$route.query){
                    par ={
                        ...par,
                        ...this.$route.query
                    }
                }

                this.$get('file', par).then((res) =>{
                    this.items = res[0];
                    this.total = res[1];
                })
            },
            showDet(id) {
                window.open(this.$BASECDN+'/cdn/'+id.url+'/img/'+id.filename+'.jpg')
            },
            findByUser(id) {
                this.$router.push('/file?url='+id)
            },
            forHap(row) {
                return this.$dayA(row.createAt);
            },
            forUpd(row) {
                return this.$dayA(row.updateAt);
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
