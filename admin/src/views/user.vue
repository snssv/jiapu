<template lang="pug">
    .main
        .head
            el-row(:gutter='20')
                el-col(:span='3')
                    el-input.input-with-select(placeholder='关键字', v-model='form.key')
                el-col(:span='3')
                    el-input.input-with-select(placeholder='设备', v-model='form.device')
                el-col(:span='7')
                    el-date-picker(v-model='dateArea', type='daterange', align='right', unlink-panels='', range-separator='至', start-placeholder='注册时间开始', end-placeholder='结束', :picker-options='pickerOptions')

                el-col(:span='3')
                    el-button(type="primary" icon='el-icon-search' @click.native="getData(1)") 搜索


        .data(v-if="items&&items[0]")
            el-table(:data='items', stripe='', height="85vh")
                el-table-column(label='操作' fixed="right", width="180px")
                    template(slot-scope='scope')
                        el-button(v-if="scope.row.status>0" @click='del(scope.row.id)', type='warning', size='mini' plain) 恢复
                        el-button(v-else @click='del(scope.row.id)', type='warning', size='mini' plain) 禁用
                        el-button(@click='edit(scope.row)', type='primary', size='mini' plain) 重置密码


                el-table-column(prop='createAt' sortable label='注册日期' width="150px" :formatter="forHap")
                el-table-column( prop='username' label='用户名')
                el-table-column(label='昵称' width="200")
                    template(slot-scope='scope')
                        p(@click="findArticle(scope.row.id)")
                            el-tooltip.item(effect="dark" content="搜索他的家谱" placement="top")
                                i.el-icon-search
                            span {{scope.row.nickname || ' 佚名'}}


                el-table-column( prop='status' label='状态' :formatter="forSta")
                el-table-column(sortable prop='role' label='身份' :formatter="forRole")
                el-table-column(sortable prop='mobileAuth' label='手机' :formatter="forAuth")
                el-table-column(sortable prop='emailAuth' label='邮箱' :formatter="forAuthM")
                el-table-column(sortable prop='level' label='等级')
                el-table-column(sortable prop='integral' label='经验')
                el-table-column(sortable prop='coin' label='金币')
                el-table-column( prop='ip' label='ip' width="150px")
                el-table-column( prop='device'  label='设备号' width="160px")


        .foot
            el-pagination(background='', layout='prev, pager, next', :page-size='30' :total='total'  @current-change="getData")
            .total 共 {{total}} 条


        el-dialog(title='重置用户密码', :visible.sync='editDialog', width='300px')
            .de(v-if="userInfo.role==9")
                p 用户名：{{editObj?editObj.username:''}}
                el-input(v-model="editPass" ref="password" placeholder="6-12位密码")
            .de(v-else) 忘记密码尽量用短信或邮箱验证找回，此功能仅站长有权限


            .dialog-footer(slot='footer')
                el-button(@click='editDialog = false') 取 消
                el-button(v-if="userInfo.role==9" type='primary', @click='yesEdit' :disabled="disabled") 确 定

        el-dialog(title='删除警告', :visible.sync='delDialog', width='30%')
            span 确定要删除这条内容吗？
            span.dialog-footer(slot='footer')
                el-button(@click='delDialog = false') 取 消
                el-button(type='primary', @click='yesDel' :disabled="disabled") 确 定


</template>

<script>

    import { mapGetters } from "vuex"
    import {regName,regPwd} from '../utils/validate'

    export default {
        components:{

        },
        data () {
            return {
                disabled: false,
                delDialog: false,
                editDialog: false,
                editObj:null,
                editPass:null,
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
            ...mapGetters(["userInfo"])
        },
        methods:{
            getData(p){
                this.form.page=p?p:1;
                this.$get('user/admin', this.form ).then((res) =>{
                    this.items = res[0];
                    this.total = res[1];
                })
            },
            findArticle(id) {
                window.open('/#/article?userId='+id)
            },
            forHap(row) {
                return this.$dayA(row.createAt);
            },
            forRole(row) {
                return this.$arrRole[row.role];
            },
            forAuth(row) {
                return row.mobileAuth?'已认证':'未认证';
            },
            forAuthM(row) {
                return row.emailAuth?'已认证':'未认证';
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
                if(!regPwd(this.editPass)){
                    this.$refs.password.focus();
                    this.$toast.error('请输入6-12位密码');
                }else {
                    this.disabled=true;

                    this.$post('user/password/admin', {
                        id: this.editObj.id,
                        password: this.$md5(this.editPass)
                    }).then(() =>{
                        this.$toast.success('修改成功');
                        this.editPass=null;
                        this.editDialog=false;
                        this.disabled=false;
                    }).catch( err => {
                        this.disabled=false;
                    })
                }

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
