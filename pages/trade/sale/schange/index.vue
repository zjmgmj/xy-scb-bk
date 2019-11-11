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
    edit-box(:form="editForm", :flag="editFlag", @save="editSave", @close="editCancel", v-if="dialogShow")    
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")    
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
        editFlag: 0,
        fileMod: {
          fileBilltype: '',
          fileOpcode: ''
        },
        auditGlideShow: false,
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '起始日期', prop: 'startDate', val: '20', type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
          {lbl: '结束日期', prop: 'endDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
          {lbl: '单据号', prop: 'scontractBillcode', val: ''},
          {lbl: '原合同号', prop: 'scontractBillcodeold', val: ''},          
          {lbl: '结算单位', prop: 'datasBalcorp', val: '', type:"company"},          
          {lbl: '业务机构', prop: 'orgCode', val: '', type:"org"},
          {lbl: '业务部门', prop: 'deptCode', val: '', type:"dept"},
          {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee"},          
          {lbl: '备注', prop: 'scontractRemark', val: ''},
          {lbl: '', prop: 'dataChangeflag', type: 'hidden', val: 1}          
          // dataChangeflag
        ],
        buttonGroupInfo: [
          {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
          {lbl: '修改', type: 'edit', icon: 'el-icon-edit'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '打印', type: 'print', icon: 'el-icon-printer'},
          {lbl: '审核', type: 'audit', icon: 'el-icon-document-checked'},
          {lbl: '查看审核流水', type: 'auditView', icon: 'el-icon-view'}
        ],
        editForm: { scontractBillcodeold: '', memberCode: '', dataChangeflag: 1, employeeCode: '', employeeName: '', dataEditOrg: '', dataEditDept: '', billtypeCode: 'WLP015', dataBillstate: '', scontractInfeemoney: '', billtypeCheckmode: '', dataAudit: '', dataAuditPerson: '', dataAuditRemark: '', dataAuditNremark: '', scontractInmoney: '', deptCode: '000003', deptName: '财务部', orgCode: '000000', orgName: '测试A公司', orgAbbreviate: 'A公司', operatorName: '系统管理员', operatorCode: '0000', goodsNum: '', goodsPiecenum: '', goodsSingernum: '', goodsWeight: '', goodsAssistweight: '', companyProjectCode: '', scontractBillcode: '', scontractDate: '', scontractOthercode: '', scontractCtype: '', scontractClass: '', datasBalcorpname: '', datasBalcorp: '', datasCustomername: '', datasCustomer: '', companyProjectName: '', scontractRemark: '' },
        tableValue: {
          hasCbx: false,
          pageination: true,
          showRowIndex: true,
          tableHead: [
            // header:'合同号',dataIndex:'goodsContract',align:'left',width:150,g_hidden:true}，
            {lbl: '单据号', prop: 'scontractBillcode', width: '150px'},                     
            {lbl: '日期', prop: 'scontractDate', width: '90px', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM-dd')
            }},
            {lbl: '原始单号', prop: 'scontractOthercode', width: '150px'},  
            {lbl: '原合同号', prop: 'scontractBillcodeold', width: '150px'},  
            {lbl: '销售类型', prop: 'scontractCtype', width: '70px'},  
            {lbl: '类型', prop: 'scontractClassStr', width: '50px', align: 'center'},
            {lbl: '结算单位', prop: 'datasBalcorpname', width: '130px'},                     
            {lbl: '购货单位', prop: 'datasCustomername', width: '130px'}, 
            {lbl: '数量', prop: 'goodsNum', width: '50px', g_type:'num', align:'right'}, 
            {lbl: '重量', prop: 'goodsWeight', width: '100px', g_type:'weight', align:'right'}, 
            {lbl: '含税金额', prop: 'scontractInmoney', width: '120px', g_type:'money', align:'right'}, 
            {lbl: '项目', prop: 'companyProjectName'}, 
            {lbl: '审核', prop: 'dataAudit', g_type:'dataAudit'},
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
            {lbl: '备注', prop: 'scontractRemark'},
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
            {lbl: '合同性质', prop: 'scontractDetailTypeStr', align: 'left'},
            {lbl: '加工', prop: 'scontractDetailMacStr', align: 'left'},
            {lbl: '品名', prop: 'scontractDetailPartsname', width: '150px'},
            {lbl: '规格', prop: 'scontractDetailSpec', width: '150px'},
            {lbl: '材质', prop: 'scontractDetailMaterial'},
            {lbl: '产地', prop: 'scontractDetailProareaname'},
            {lbl: '数量', prop: 'goodsNum', summary: true, g_type: 'num'},
            {lbl: '重量', prop: 'goodsWeight', summary: true, g_type: 'weight'},
            {lbl: '提单执行数量', prop: 'scontractDetailSbnum', summary: true, g_type: 'num'},
            {lbl: '提单执行重量', prop: 'scontractDetailSbweight', summary: true, g_type: 'weight'},
            {lbl: '提单未执行数量', prop: 'scontractDetailNsbnum', summary: true, g_type: 'num'},
            {lbl: '提单未执行重量', prop: 'scontractDetailNsbweight', summary: true, g_type: 'weight'},
            {lbl: '加工执行数量', prop: 'scontractDetailMnum', summary: true, g_type: 'num'},
            {lbl: '加工执行重量', prop: 'scontractDetailMweight', summary: true, g_type: 'weight'},
            {lbl: '加工未执行数量', prop: 'scontractDetailNmnum', summary: true, g_type: 'num'},
            {lbl: '加工未执行重量', prop: 'scontractDetailNmweight', summary: true, g_type: 'weight'},
            {lbl: '实提数量', prop: 'scontractDetailOnum', summary: true, g_type: 'num'},
            {lbl: '实提重量', prop: 'scontractDetailOweight', summary: true, g_type: 'weight'},
            {lbl: '入库厂发数量', prop: 'scontractDetailEnum', summary: true, g_type: 'num'},
            {lbl: '入库厂发重量', prop: 'scontractDetailEweight', summary: true, g_type: 'weight'},
            {lbl: '采购执行数量', prop: 'scontractDetailCnum', summary: true, g_type: 'num'},
            {lbl: '采购执行重量', prop: 'scontractDetailCweight', summary: true, g_type: 'weight'},
            {lbl: '数量单位', prop: 'partsnameNumunit'},
            {lbl: '重量单位', prop: 'partsnameWeightunit'},
            {lbl: '含税单价', prop: 'goodsBinprice', g_type: 'price'},
            {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money'},
            {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
            {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
            {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},            
            {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money'},            
            {lbl: '计量方式', prop: 'goodsMetering'},
            {lbl: '仓库名称', prop: 'warehouseName'},
            {lbl: '货权机构', prop: 'goodsOrgName'},
            {lbl: '货权部门', prop: 'goodsDeptName'},
            {lbl: '件支数', prop: 'goodsPartsbranch'},
            {lbl: '车皮号', prop: 'goodsContractstr2'},
            {lbl: '入库批号', prop: 'goodsEntrystr1'},
            {lbl: '期货原货主代码', prop: 'goodsEntrystr4'},
            {lbl: '期货原货主名称', prop: 'goodsEntrystr5'},
            {lbl: '备注', prop: 'scontractDetailRemark'},
            {lbl: '业务单号', prop: 'scontractDetailOptcode'}
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
      this.editForm.scontractDate = this.toDateString(new Date(), 'yyyy-MM-dd HH:mm')
      // this.editForm.contractMonthStr = this.toDateString(new Date(), 'yyyy-MM')
      this.searchFormItems[0].val = this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm')
      this.searchFormItems[1].val= this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm')      
      this.searchFormItems[4].list = this.auditCombo
      this.copyEditForm = this.extend(true, this.editForm)
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          page: this.currentPage,
          queryBean: {
            likeCol: ['scontractBillcode', 'scontractBillcodeold', 'scontractRemark'],
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
        // const params = this.paramsFormat('queryBean', values)
        for (const key in values) {
          this.queryObject[key] = key
          if (!this.queryObject[key]) {
            delete this.queryObject[key]
          }
        }
        // this.queryObject.queryBean = params
        this.queryObject.queryBean.likeCol = ['scontractBillcode', 'scontractBillcodeold', 'scontractRemark']
        this.queryObject.queryBean.dataChangeflag = 1
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
            fileOpcode: row[0].scontractBillcode
          }      
          const params = {
            scontractBillcode: row[0].scontractBillcode ? row[0].scontractBillcode : null,
            billtypeCode: row[0].billtypeCode ? row[0].billtypeCode : null,
            feeOptcode:  row[0].scontractBillcode ? row[0].scontractBillcode : null,
            feeBilltype: row[0].billtypeCode ? row[0].billtypeCode : null,
            page: 1,
            start: 0,
            limit: 25,
            sort: '[{"property":"goodsInfeemoney","direction":"ASC"}]'
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
            this.editFlag = 0
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
        this.editForm.scontractBillcode = rowData.scontractBillcode
        this.editForm.billtypeCode = rowData.billtypeCode
        this.editForm.feeOptcode = rowData.scontractBillcode
        this.editForm.feeBilltype = rowData.billtypeCode
        this.editFlag = 1
        this.dialogShow = true
      },
      rowDel (row) {
        this.confirmDialog(this, '您确认要删掉记录吗？').then(() => {
          const list = row ? [row] : this.tableSelect
          const params = {
            scontractBillcode: list[0].scontractBillcode,
            billtypeCode: list[0].billtypeCode,
            feeOptcode: list[0].scontractBillcode,
            feeBilltype: list[0].billtypeCode
          }
          this.delete(params)
        })
      },
      async showAudit () {
        const loading = this.loadShow()
        try {
          const { data } = await this.proxy(this, 'scscm/app/schangeEnrollAjax!showAudit.do', 'post', this.tableSelect[0])
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
          const { data } = await this.proxy(this, 'scscm/app/schangeEnrollAjax.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          console.log('----', data)
          this.tableSelect = []
          this.totalCount = 0
          if (data.mainList) {
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
          const { data } = await this.proxy(this, 'scscm/app/schangeEnrollAjax!delete.do', 'post', params)
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
          const { data } = await this.proxy(this, 'scscm/app/schangeEnrollAjax!queryDetail.do', 'post', params)
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