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
      basic-elx-table(
        :id="'table-down'",
        :tableValue="tableBottomValue") 
    edit-box(:form="editForm", @save="editSave", @close="editCancel", v-if="dialogShow")    
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
    //- audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :mainMod="tableSelect[0]")
</template>

<script>  
  import { mapState } from 'vuex'
  import editBox from './edit'
  import buttonGroup from '@/components/buttonGroup.vue'  
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftTree from '@/components/leftTree'
  import leftSearch from '@/components/leftSearch'  
  import auditGlideView from '@/components/billtypeaudit'
  export default {
    layout: 'backend',
    components: {      
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftTree,
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
          {lbl: '单据号', prop: 'planBillcode', val: ''},
          {lbl: '供货单位', prop: 'datasBalcorp', val: '', type:"company"},
          {lbl: '业务机构', prop: 'orgCode', val: '', type:"org"},
          {lbl: '业务部门', prop: 'deptCode', val: '', type:"dept"},
          {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee"},
          {lbl: '制单人', prop: 'operatorCode', val: '', type:"operator"},
          {lbl: '备注', prop: 'planRemark', val: ''}
        ],
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '打印', type: 'print', icon: 'el-icon-printer'},
          {lbl: '审核', type: 'audit', icon: 'el-icon-document-checked'},
          {lbl: '查看审核流水', type: 'auditView', icon: 'el-icon-view'}
        ],
        editForm: {
          planBillcode: '',
          planDate: '',
          planType: '02',
          contractCtype: '',
          planOthercode: '',
          datasBalcorp: '',
          datasBalcorpname: '',
          ddTypeSettlement: '',
          ddTypePayment: '',
          planMonthStr: '',
          orgCode: '000000',
          orgName: '测试A公司',
          orgAbbreviate: 'A公司',
          deptCode: '000003',
          deptName: '财务部',
          employeeCode: '',
          planRemark: '',
          operatorUser: '系统管理员',
          operatorCode: '',
          memberCode: '',
          dataEditOrg: '',
          dataEditDept: '',
          billtypeCode: '',
          dataBillstate: '',
          goodsNum: '',
          goodsPiecenum: '',
          goodsSingernum: '',
          goodsWeight: '',
          goodsAssistweight: '',
          dataInmoney: ''
        },
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            {lbl: '单据号', prop: 'planBillcode', width: '150px'},
            {lbl: '日期', prop: 'planDate', width: '90px', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM-dd')
            }},
            {lbl: '供货单位', prop: 'datasBalcorpname', width: '130px'}, 
            {lbl: '业务类别', prop: 'planType', formatter: ({cellValue}) => {
              const obj = { '01': '销售配货', '02': '钢厂订货', '03': '散购订货' }
              return obj[cellValue]
            }}, 
            {lbl: '采购类型', prop: 'contractCtype'}, 
            {lbl: '结算方式', prop: 'ddTypeSettlement', width: '120px'},
            {lbl: '付款方式', prop: 'ddTypePayment', width: '120px'},
            {lbl: '数量', prop: 'goodsNum', g_type:'num'},
            {lbl: '重量', prop: 'goodsWeight', g_type:'weight'},
            {lbl: '含税金额', prop: 'dataInmoney', g_type:'money'},
            {lbl: '原始单号', prop: 'planOthercode'},
            {lbl: '月份', prop: 'planMonth', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM')
            }},
            {lbl: '审核', prop: 'dataAudit', formatter: ({cellValue}) => {
              const obj = { '0': '未审', '1': '已审', '2': '在审', '-1': '弃审' }
              return obj[cellValue]
            }},
            {lbl: '审核人', prop: 'dataAuditPerson'},
            {lbl: '审核日期', prop: 'dataAuditDate', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM-dd')
            }},
            {lbl: '审核备注', prop: 'dataAuditRemark'},
            {lbl: '弃审备注', prop: 'dataAuditNremark'},
            {lbl: '业务机构', prop: 'orgName', width: '120px'},
            {lbl: '业务部门', prop: 'deptName', width: '120px'},
            {lbl: '业务员', prop: 'employeeName', width: '100px'},
            {lbl: '制单人', prop: 'operatorName', width: '100px'},
            {lbl: '备注', prop: 'planRemark'},
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
            {lbl: '货齐', prop: 'dataGoodsflagStr', width: '50px', align: 'center'},
            {lbl: '品名', prop: 'partsnameName', width: '150px'},
            {lbl: '规格', prop: 'goodsSpec', width: '150px'},
            {lbl: '材质', prop: 'goodsMaterial'},
            {lbl: '产地', prop: 'productareaName'},
            {lbl: '长度', prop: 'goodsProperty1'},
            {lbl: '米重', prop: 'goodsProperty2'},
            {lbl: '重量范围', prop: 'goodsProperty4'},
            {lbl: '公差范围', prop: 'goodsProperty5'},
            {lbl: '申请数量', prop: 'planDetailAnum', summary: true, g_type: 'num'},
            {lbl: '申请重量', prop: 'planDetailAweight', summary: true, g_type: 'weight'},
            {lbl: '批准数量', prop: 'goodsNum', summary: true, g_type: 'num'},
            {lbl: '批准重量', prop: 'goodsWeight', summary: true, g_type: 'weight'},
            {lbl: '合同执行数量', prop: 'planDetailNum', summary: true, g_type: 'num'},
            {lbl: '合同执行重量', prop: 'planDetailWeight', summary: true, g_type: 'weight'},
            {lbl: '含税单价', prop: 'goodsInprice', g_type: 'price'},
            {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money'},
            {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
            {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
            {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
            {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money'},
            {lbl: '数量单位', prop: 'partsnameNumunit'},
            {lbl: '重量单位', prop: 'partsnameWeightunit'},
            {lbl: '计价方式', prop: 'partsnamePriceun', formatter: ({cellValue}) => {
              return cellValue === '0' ? '重量' : '数量'
            }},
            {lbl: '计量方式', prop: 'goodsMetering'},
            {lbl: '车皮号', prop: 'goodsContractstr2'},
            {lbl: '入库批号', prop: 'goodsEntrystr1'},
            {lbl: '期货原货主代码', prop: 'goodsEntrystr4'},
            {lbl: '期货原货主名称', prop: 'goodsEntrystr5'},
            {lbl: '件支数', prop: 'goodsPartsbranch'},
            {lbl: '起运港/地', prop: 'ddTypeStartarea'},
            {lbl: '到站港/地', prop: 'ddTypeDestination'},
            {lbl: '专用线', prop: 'ddTypeSpecialline'},
            {lbl: '订货单位', prop: 'goodsOrdercorpname'},
            {lbl: '收货机构', prop: 'datasInorgName'},
            {lbl: '备注', prop: 'planDetailRemark'},
            {lbl: '销售合同号', prop: 'scontractBillcode'},
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
        currentUser: state => state.user.currentUser
      })
    },
    created () {
      this.editForm.planDate = this.toDateString(new Date(), 'yyyy-MM-dd HH:mm')
      this.editForm.planMonthStr = this.toDateString(new Date(), 'yyyy-MM')
      this.searchFormItems[0].val = this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm')
      this.searchFormItems[1].val= this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm')
      this.copyEditForm = this.extend(true, this.editForm)
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          page: this.currentPage,
          queryBean: {
            likeCol: ['planBillcode', 'planRemark'],
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
        this.queryObject.queryBean.likeCol = ['planBillcode', 'planRemark']        
        this.currentPage = 1
        this.queryObject.page = this.currentPage
        this.queryObject.start = 0
        this.loadData()
      },
      rowSelectionFun (row) {
        if (row.length > 0) {
          this.tableSelect = row   
          this.fileMod = {
            fileBilltype: row[0].billtypeCode,
            fileOpcode: row[0].planBillcode
          }     
          const params = {
            planBillcode: row[0].planBillcode ? row[0].planBillcode : null,
            billtypeCode: row[0].billtypeCode ? row[0].billtypeCode : null,
            feeOptcode: row[0].feeOptcode ? row[0].feeOptcode : null,
            feeBilltype: row[0].feeBilltype ? row[0].feeBilltype : null,
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
            // this.editForm = JSON.parse(JSON.stringify(this.tableSelect[0]))
            this.rowEdit()
            break
          case 'del':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要删除的数据')
              return false
            }
            this.rowDel() 
            break
          case 'auditView':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要查看的记录')
              return false
            }
            this.auditGlideShow = true
            break
          case 'audit':
            if (this.tableSelect.length < 1) {
              this.$message.error('请选择需要审核的记录')
              return false
            }
            this.showAudit()
            break
          default:            
            this.loadData()
            break
        }
      },
      rowEdit (row) {
        const rowData = row ? this.extend(true, row) : this.extend(true, this.tableSelect[0])
        this.editForm.dataFlag = 1
        this.editForm.planBillcode = rowData.planBillcode
        this.editForm.billtypeCode = rowData.billtypeCode
        this.editForm.feeOptcode = rowData.planBillcode
        this.editForm.feeBilltype = rowData.billtypeCode        
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            planBillcode: list[0].planBillcode,
            billtypeCode: list[0].billtypeCode,
            feeOptcode: list[0].planBillcode,
            feeBilltype: list[0].billtypeCode
          }
          this.delete(params)
        })
      },
      async showAudit () {
        const loading = this.loadShow()
        try {
          const { data } = await this.proxy(this, 'scscm/app/planEnrollAjax!showAudit.do', 'post', this.tableSelect[0])
          if (!data.needAudit) {
            this.$message.success('该单据无审核操作!')
            loading.close()
            return false
          }
        } catch (e) {
          console.error(e)
          loading.close()
        }
      },
      async loadData () {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/planEnrollAjax.do', 'post', this.queryObject)
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
          const { data } = await this.proxy(this, 'scscm/app/planEnrollAjax!delete.do', 'post', params)
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
          const { data } = await this.proxy(this, 'scscm/app/planEnrollAjax!queryDetail.do', 'post', params)
          this.tableBottomValue.tableData = []
          if (data.detailList.length > 0) {
            this.tableBottomValue.tableData = data.detailList
          }        
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
</script>