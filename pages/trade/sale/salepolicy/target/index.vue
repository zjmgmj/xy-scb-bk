<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(v-model="collapseName")
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search")
  .erp-content(slot="right")
    .up(style="height: 70%")
      button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
      .table-content
        basic-elx-table(
          :tableValue="tableValue",
          :total="totalCount",
          :currentPage="currentPage",
          :pageSize="pageSize",
          :id="'table-up'",
          @paginateChange="tableChange",
          @tableRowEdit="rowEdit",
          @tableRowDel="rowDel",
          @rowSelection="rowSelectionFun")
    .down(style="height: 30%")
      basic-elx-table(:tableValue="tableBottomValue") 
    edit-box(:form="editForm", @save="editSave", @close="editCancel", v-if="dialogShow")    
    //- audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
</template>

<script>  
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '@/components/buttonGroup.vue'  
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftSearch from '@/components/leftSearch'  
  import auditGlideView from '@/components/billtypeaudit'
  export default {
    layout: 'backend',
    components: {      
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftSearch,
      editBox,
      auditGlideView
    },
    
    data () {
      return {
        fileMod: {
          fileBilltype: '',
          fileOpcode: ''
        },
        auditGlideShow: false,
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '起始日期', prop: 'startDate', val: '20', type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
          {lbl: '结束日期', prop: 'endDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
          {lbl: '单据号', prop: 'targetBillcode', val: ''},
          {lbl: '指标类型', prop: 'targetType', val: '', type: 'basic', ddtypeClass: 'targetType'},          
          {lbl: '业务机构', prop: 'orgCode', val: '', type:"org"},
          {lbl: '业务部门', prop: 'deptCode', val: '', type:"dept"},
          {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee"},
          {lbl: '制单人', prop: 'operatorCode', val: '', type:"operator"},
          {lbl: '备注', prop: 'contractRemark', val: ''}
        ],
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
        ],
        editForm: {
          deptCode: '000003',
          deptName: '财务部',
          orgCode: '000000',
          orgName: '测试A公司',
          orgAbbreviate: 'A公司',
          operatorName: '系统管理员',
          operatorCode: '0000',
          targetId: '',
          memberCode: '',
          dataEditOrg: '',
          dataEditDept: '',
          billtypeCode: '',
          dataBillstate: '',
          dataAudit: '',
          dataAuditPerson: '',
          dataAuditRemark: '',
          dataAuditNremark: '',
          billtypeCheckmode: '',
          targetBillcode: '',
          targetDate: '',
          targetType: '',
          targetRemark: '',
          employeeCode: ''
        },
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '单据号', prop: 'targetBillcode', width: '150px'},
            {lbl: '制单日期', prop: 'targetDate', width: '90px', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM-dd')
            }},                             
            {lbl: '指标类型', prop: 'targetType', width: '130px'},
            {lbl: '业务机构', prop: 'orgName', width: '120px'},
            {lbl: '业务部门', prop: 'deptName', width: '120px'},
            {lbl: '业务员', prop: 'employeeName', width: '100px'},
            {lbl: '制单人', prop: 'operatorName', width: '100px'},
            {lbl: '备注', prop: 'targetRemark'},
            {type: 'action', width: '100px', fixed: 'right', actionBtns: [
                {lbl: '修改', type: 'edit'}, 
                {lbl: '删除', type: 'del'}
              ]
            }
          ],
          tableData: []
        },
        tableBottomValue: {   
          showRowIndex: true,
          showSummary: true,
          tableHead: [
            {lbl: '业务机构', prop: 'targetOrgName', width: '100px', align: 'center'},
            {lbl: '业务部门', prop: 'targetDeptName', width: '100px', align: 'center'},
            {lbl: '年月', prop: 'targetMonth', width: '80px', align: 'center', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM')
            }},            
            {lbl: '指标量', prop: 'targetNum', width: '80px', g_type:'weight', summary: true},
            {lbl: '指标金额', prop: 'targetMoney', width: '100px', g_type:'price', summary: true}
          ],
          tableData: []
        },
        currentPage: 1,
        totalCount: 0,
        queryObject: {          
          page: this.currentPage,
          start: 0,
          limit: this.pageSize
        },
        loading: false,
        dialogShow: false,
        copyEditForm: {},
        tableSelect: []
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,
        auditCombo: state => state.auditCombo
      })
    },
    created () {
      this.editForm.targetDate = this.toDateString(new Date(), 'yyyy-MM-dd HH:mm')
      this.searchFormItems[0].val = this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm')
      this.searchFormItems[1].val= this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm')      
      this.copyEditForm = this.extend(true, this.editForm)
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          page: this.currentPage,
          queryBean: {
            likeCol: ['targetBillcode', 'targetRemark'],
            dataChangeflag: 1,
            startDate: this.searchFormItems[0].val,
            endDate: this.searchFormItems[1].val
          },
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize
        }
        this.loadData()
      })
    },
    methods: {
      editSave() {
        this.editForm = this.extend(true, this.copyEditForm)
        this.dialogShow = false
        this.loadData()
      },
      editCancel () {
        this.editForm = this.extend(true, this.copyEditForm)
        this.dialogShow = false
      },
      searchForm (values) {
        const params = this.paramsFormat('queryBean', values)
        for (const key in params) {
          this.queryObject[key] = params[key]
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }
        this.queryObject.queryBean = params
        this.queryObject.queryBean.likeCol = ['targetBillcode', 'targetRemark']
        this.queryObject.queryBean.dataChangeflag = 1
        this.currentPage = 1
        this.queryObject.page = this.currentPage
        this.queryObject.start = 0
        this.loadData()
      },
      rowSelectionFun (row) {
        if (row.length > 0) {
          this.tableSelect = row
          const params = {
            targetBillcode: row[0].targetBillcode ? row[0].targetBillcode : null,
            billtypeCode: row[0].billtypeCode ? row[0].billtypeCode : null,
            feeOptcode:  row[0].targetBillcode ? row[0].targetBillcode : null,
            feeBilltype: row[0].billtypeCode ? row[0].billtypeCode : null,
            page: 1,
            start: 0,
            limit: 25
          }
          console.log(params)
          this.getDetail(params) 
        }
        // this.tableSelect = row
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
            this.dialogShow = true
            break
          case 'edit':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要编辑的数据')
              return false
            }
            this.rowEdit()
            break
          case 'del':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要删除的数据')
              return false
            }
            this.rowDel() 
            break
          default:            
            this.loadData()
            break
        }
      },
      rowEdit (row) {
        const rowData = row ? this.extend(true, row) : this.extend(true, this.tableSelect[0])
        this.editForm.dataFlag = 1
        this.editForm.targetBillcode = rowData.targetBillcode
        this.editForm.billtypeCode = rowData.billtypeCode
        this.editForm.feeOptcode = rowData.targetBillcode
        this.editForm.feeBilltype = rowData.billtypeCode
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            targetBillcode: list[0].targetBillcode,
            billtypeCode: list[0].billtypeCode,
            feeOptcode: list[0].targetBillcode,
            feeBilltype: list[0].billtypeCode
          }
          this.delete(params)
        })
      },
      async loadData () {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/saleTargetAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.mainList.length > 0) {
            this.tableValue.tableData = data.mainList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async delete (params) {
        try {          
          const { data } = await this.proxy(this, 'scscm/app/saleTargetAjax!delete.do', 'post', params)
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
      },
      async getDetail (params) {
        try {
          const { data } = await this.proxy(this, 'scscm/app/saleTargetAjax!queryDetail.do', 'post', params)
          console.log('*-----', data)
          this.tableBottomValue.tableData = []
          if (data.detailList) {
            this.tableBottomValue.tableData = data.detailList
          }        
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
</script>