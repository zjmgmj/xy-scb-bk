<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(accordion, v-model="collapseName")
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", labelWidth="70px")
  .erp-content(slot="right")
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    .table-content
      basic-elx-table(
        :tableValue="tableValue",
        :total="totalCount",
        :currentPage="currentPage",
        :pageSize="pageSize",     
        @paginateChange="tableChange",
        @tableRowEdit="rowEdit",
        @tableRowDel="rowDel",
        @rowSelection="rowSelection")
    el-dialog(ref="dialog", title="职员设置", top="10px", :visible="dialogShow", width="1200px", @close="editCancel")
      edit-box(v-if="dialogShow", :form="editForm", @save="editSave", @cancel="editCancel")    
</template>

<script>  
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '~/components/buttonGroup.vue'  
  import erplrPanel from '~/components/erplrPanel'
  import basicElxTable from '~/components/basicElxTable'
  import leftSearch from '~/components/leftSearch'  
  export default {
    layout: 'backend',
    components: {      
      basicElxTable,
      erplrPanel,
      leftSearch,      
      buttonGroup,
      editBox
    },
    data () {
      return {
        collapseName: ['1'],
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
          // {lbl: '刷新', type: 'refresh', icon: 'el-icon-refresh'}
        ],
        editForm: {
          employeeName: '',
          orgCode: '',
          deptCode: '',
          employeeMnemcode: '',          
          employeeClass: '',
          employeeJob: '',
          employeeSex: '男',
          employeeDegree: '',
          employeeSpecialty: '',
          employeeIdcard: '',
          employeeAddr: '',
          employeePhone: '',
          employeeMobile: '',
          employeeEmail: '',
          employeeTechnical: '',
          employeeNation: '',
          employeeParty: '',
          employeeNative: '',
          employeeMarriage: '未婚',
          employeeBirthday: '',
          employeeJoindate: '',
          workgroupName: '',
          employeeRemark: '',
          worktypeName: '',
          employeeState: 0,
          employeeId: '',
          memberCode: '',
          employeeCode: ''
        },           
        searchFormItems: [
          {lbl: '代码', prop: 'employeeCode', val: ''},
          {lbl: '姓名', prop: 'employeeName', val: ''},
          {lbl: '助记码', prop: 'employeeMnemcode', val: ''},
          { lbl: '机构', prop: 'orgNodecode', val: '', type: 'org' },
          { lbl: '部门', prop: 'deptNodecode', val: '', type: 'dept' }
        ],        
        tableValue: {
          hasCbx: false,
          selection: false,
          pageination: true,
          showRowIndex: true,
          showSummary: false,
          tableHead: [
            {lbl: '姓名', prop: 'employeeName', width: '100'},
            {lbl: '代码', prop: 'employeeCode', width: '100'},
            {lbl: '机构', prop: 'orgName', width: '100'},
            {lbl: '部门', prop: 'deptName', width: '100px'},
            {lbl: '助记码', prop: 'employeeMnemcode', width: '100px'},
            {lbl: '员工类别', prop: 'employeeClass', width: '100px'},
            {lbl: '职位', prop: 'employeeJob', width: '100px'},
            {lbl: '专业', prop: 'employeeSpecialty', width: '100px'},
            {lbl: '职称', prop: 'employeeTechnical', width: '100px'},
            {lbl: '性别', prop: 'employeeSex', width: '50'},
            {lbl: '学历', prop: 'employeeDegree', width: '100px'},
            {lbl: '政治面貌', prop: 'employeeParty', width: '100px'},
            {lbl: '民族', prop: 'employeeNation', width: '100px'},
            {lbl: '籍贯', prop: 'employeeNative', width: '100px'},
            {lbl: '婚姻', prop: 'employeeMarriage', width: '100px'},
            {lbl: '状态',  prop: 'employeeState', width: '80', formatter: (row, column, cellValue, index) => {
              return cellValue === 0 ? '√' : ''
            }},
            {lbl: '出生日期', prop: 'employeeBirthday', width: '100', formatter: (row, column, cellValue, index) => {
              return cellValue ?  this.date2Str(new Date(cellValue)) : null
            }},
            {lbl: '入职时间', prop: 'employeeJoindate', width: '100', formatter: (row, column, cellValue, index) => {
              return cellValue ?  this.date2Str(new Date(cellValue)) : null
            }},
            {lbl: '身份证号', prop: 'employeeIdcard', width: '150px'},
            {lbl: '工种名称', prop: 'worktypeName'},
            {lbl: '电话', prop: 'worktypeName'},
            {lbl: '手机', prop: 'employeeMobile', width: '150px'},
            {lbl: '电子邮箱', prop: 'employeeEmail', width: '150px'},
            {lbl: '家庭地址', prop: 'employeeAddr', width: '150px'},
            {lbl: '备注', prop: 'employeeRemark', width: '150px'},
            {type: 'action', width: '100px', fixed: 'right', actionBtns: [
                {lbl: '修改', type: 'edit'}, 
                {lbl: '删除', type: 'del'}
              ]
            }
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {
          page: this.currentPage,
          start: 0,
          limit: this.pageSize,
          'queryBean.likeCol': ['employeeCode', 'employeeName', 'employeeMnemcode'],
          sort: '[{"property":"employeeCode","direction":"DESC"}]'
        },
        loading: false,
        dialogShow: false,
        smsTemplate: {},
        copySmsTemplate: {},
        dialogTitle: '新增员工',
        tableSelect: []
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser
      })
    },    
    created () {
      this.copyEditForm = JSON.stringify(this.editForm)
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          page: this.currentPage,
          'queryBean.likeCol': ['employeeCode', 'employeeName', 'employeeMnemcode'],
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,
          sort: '[{"property":"employeeCode","direction":"DESC"}]'
        }
        this.loadData()
      })
    },
    methods: {
      editSave() {
        this.editForm = JSON.parse(this.copyEditForm)
        this.dialogShow = false
        this.loadData()
      },
      editCancel () {
        this.editForm = JSON.parse(this.copyEditForm)
        this.dialogShow = false
      },
      rowSelection (row) {
        this.tableSelect = row
      },
      tableChange (val) {
        console.log(val)
        this.currentPage = val
        this.queryObject.page = this.currentPage
        this.queryObject.start = (this.currentPage - 1) * this.pageSize
        this.loadData()
      },
      buttonGroupClick (type) {
        switch (type) {
          case 'add':
            this.dialogTitle = '新增仓库'
            this.dialogShow = true
            break
          case 'edit':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要编辑的数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据编辑')
              return false
            }
            this.editForm = JSON.parse(JSON.stringify(this.tableSelect[0]))
            this.rowEdit()
            break
          case 'del':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要删除的数据')
              return false
            }
            if (this.tableSelect.length > 1) {
              this.$message.error('只能选择一条数据编辑')
              return false
            }
            this.rowDel()
            break
          default:
            console.log('error')
            break
        }
      },
      searchForm (values) {
        this.currentPage = 1
        this.queryObject = {
          page: this.currentPage,
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize,
          sort: '[{"property":"employeeCode","direction":"DESC"}]'
        }
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }        
        this.queryObject['queryBean.likeCol'] = ['employeeCode', 'employeeName', 'employeeMnemcode']
        this.loadData()    
      },
      rowDbclick (obj) {
        this.rowEdit(obj.row)
      },
      rowEdit (row) {
        this.dialogTitle = '编辑仓库'
        if (row) {
          this.editForm = Object.assign({}, row)
        }
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            employeeCode: list[0].employeeCode,
            memberCode: list[0].memberCode
          }
          this.delete(this.paramsFormat('basicEmployee', params))
        })
      },
      async loadData () {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/employeeAjax.do', 'post', this.queryObject)
          this.totalCount = 0
          this.tableValue.tableData = []
          if (data.employeeList.length > 0) {
            this.tableValue.tableData = data.employeeList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {
          const { data } = await this.proxy(this, 'scscm/app/employeeAjax!delete.do', 'post', params)
          console.log(data)
          if (data.map.state === '3') {
            this.dialogShow = false
            this.msgShow(this, '删除成功', 'success')
            this.loadData()
          } else {
             this.msgShow(this, data.map.msg)
          }
        } catch (e) {
          console.error(e)
          this.msgShow(this)
          this.loading = false
        }
      }
    }
  }
</script>
<style>
  .baidu-map{
    width: 100%;
    height: 550px;
  }
  .bm-serch{
  }
</style>