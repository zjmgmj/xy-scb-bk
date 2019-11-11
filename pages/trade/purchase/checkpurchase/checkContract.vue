<template lang="pug">
erplr-panel(:right-padding="false")
  div(slot="left")
    el-collapse(v-model="collapseName")
      el-collapse-item.slot-left(title="查询", name="1")
        left-search(:formItem="searchFormItems", :searchEvent="searchForm", ref="search", :labelWidth="'100px'")
  .erp-content(slot="right")
    .up(style="height: 100%")
      .flex
        button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
        el-checkbox.ml-15(v-model="tableValue.sameOrder", :true-label="1", :false-label="0") 同单选择
      .table-content
        basic-elx-table(
          :tableValue="tableValue",
          :total="totalCount",
          :currentPage="currentPage",
          :pageSize="pageSize",
          :id="'table-up'",
          @paginateChange="tableChange",
          @rowSelection="rowSelectionFun")        
</template>

<script>  
  import { mapState } from 'vuex'
  import buttonGroup from '@/components/buttonGroup.vue'  
  import erplrPanel from '@/components/erplrPanel'
  import basicElxTable from '@/components/basicElxTable'
  import leftSearch from '@/components/leftSearch'  
  export default {
    layout: 'backend',
    components: {      
      basicElxTable,
      erplrPanel,
      buttonGroup,
      leftSearch      
    },
    data () {
      return {
        collapseName: ['1'],
        searchFormItems: [
          {lbl: '起始日期', prop: 'startDate', val: '20', type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
          {lbl: '结束日期', prop: 'endDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
          {lbl: '合同号', prop: 'sumglideBillcode', val: ''},
          // {lbl: '业务单号', prop: 'sumglideOptcode', val: ''},
          // {lbl: '仓库', prop: 'warehouseCode', val: '', type: 'warehouse'},
          {lbl: '结算单位', prop: 'datasBalcorp', val: '', type:"company"},
          {lbl: '品名', prop: 'partsnameName', val: '', type:"goods"},
          {lbl: '材质', prop: 'goodsMaterial', val: '', type:"material"},
          {lbl: '规格', prop: 'goodsSpec', val: '', type:"spec"},
          {lbl: '产地', prop: 'productareaName', val: '', type:"area"},
          {lbl: '显示完成', prop: 'dataGoodsflag', val: '', type:"select", list: [{'value':'','label':'全部'},{'value':0,'label':'未完成'},{'value':1,'label':'已完成'}]},
          {lbl: '业务机构', prop: 'orgCode', val: '', type:"org"},
          {lbl: '业务部门', prop: 'deptCode', val: '', type:"dept"},
          {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee"},
          {lbl: '制单人', prop: 'operatorCode', val: '', type:"operator"},
          {lbl: '备注', prop: 'contractDetailRemark', val: ''}
        ],
        buttonGroupInfo: [
          {lbl: '货齐确认', type: 'dataGoodsflag', icon: 'el-icon-plus'}          
        ],        
        tableValue: {   
          selection: true, 
          sameOrder: 1,
          pageination: true,
          showRowIndex: true,
          showSummary: true,
          checkFilter: {goodsContract: ''},
          tableHead: [
            {lbl: '货齐', prop: 'dataGoodsflagStr', width: '50px'},
            {lbl: '合同月份', prop: 'contractMonthStr', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM')
            }}, 
            {lbl: '日期', prop: 'contractDate', width: '90px', formatter: ({cellValue}) => {
              return this.toDateString(cellValue, 'yyyy-MM-dd')
            }},            
            {lbl: '结算单位', prop: 'datasBalcorpname', width: '140px'},                        
            {lbl: '品名', prop: 'partsnameName'},
            {lbl: '规格', prop: 'goodsSpec', width: '140px'},
            {lbl: '材质', prop: 'goodsMaterial'},              
            {lbl: '产地', prop: 'productareaName'},
            {lbl: '长度', prop: 'goodsProperty1'},
            {lbl: '米重', prop: 'goodsProperty2'},
            {lbl: '重量范围', prop: 'goodsProperty4'},
            {lbl: '公差范围', prop: 'goodsProperty5'}, 
            {lbl: '数量', prop: 'goodsNum', summary: true, g_type: 'num'},
            {lbl: '重量', prop: 'goodsWeight', summary: true, g_type: 'weight'},            
            {lbl: '执行数量', prop: 'detailNum', summary: true, g_type: 'num'},
            {lbl: '执行重量', prop: 'detailWeight', summary: true, g_type: 'weight'},
            {lbl: '未执行数量', prop: 'noDetailNum', summary: true, g_type: 'num'},
            {lbl: '未执行重量', prop: 'noDetailWeight', summary: true, g_type: 'weight'},
            {lbl: '含税单价', prop: 'goodsInprice', g_type: 'price'},
            {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money'},
            {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
            {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
            {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},            
            {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money'},   
            {lbl: '供货单位', prop: 'datasSuppliername', width: '130px'}, 
            {lbl: '业务类别', prop: 'contractType'}, 
            {lbl: '采购类型', prop: 'contractCtype'}, 
            {lbl: '对方合同', prop: 'contractOthercode'}, 
            {lbl: '合同批次', prop: 'contractOtherbatch'}, 
            {lbl: '类型', prop: 'contractClassStr', width: '120px', formatter: ({cellValue}) => {
              const obj = { '0': '甲', '1': '乙', '2': '丙' }
              return obj[cellValue]
            }},
            {lbl: '发货数量', prop: 'contractDetailCnum', summary: true, g_type: 'num'},
            {lbl: '发货重量', prop: 'contractDetailCweight', summary: true, g_type: 'weight'},
            {lbl: '装运数量', prop: 'contractDetailShnum', summary: true, g_type: 'num'},
            {lbl: '装运重量', prop: 'contractDetailShweight', summary: true, g_type: 'weight'},  
            {lbl: '入库数量', prop: 'entryinfNum', summary: true, g_type: 'num'},
            {lbl: '入库重量', prop: 'entryinfWeight', summary: true, g_type: 'weight'},  
            {lbl: '验收数量', prop: 'contractDetailOknum', summary: true, g_type: 'num'},
            {lbl: '验收重量', prop: 'contractDetailOkweight', summary: true, g_type: 'weight'},  
            {lbl: '数量单位', prop: 'partsnameNumunit'},
            {lbl: '重量单位', prop: 'partsnameWeightunit'},
            {lbl: '费用单价', prop: 'goodsInfeeprice', summary: true, g_type: 'num'},
            {lbl: '费用金额', prop: 'goodsInfeemoney', summary: true, g_type: 'weight'},
            {lbl: '计价方式', prop: 'partsnamePriceunStr', formatter: ({cellValue}) => {
              return cellValue === '0' ? '重量' : '数量'
            }},
            {lbl: '计量方式', prop: 'goodsMetering'},            
            {lbl: '车皮号', prop: 'goodsContractstr2'},
            {lbl: '入库批号', prop: 'goodsEntrystr1'},
            {lbl: '期货原货主代码', prop: 'goodsEntrystr4'},
            {lbl: '期货原货主名称', prop: 'goodsEntrystr5'},
            {lbl: '件支数', prop: 'goodsPartsbranch'},
            {lbl: '订货单位', prop: 'goodsOrdercorpname'},
            {lbl: '收货单位', prop: 'datasInorgName'},
            {lbl: '收货机构', prop: 'datasInorgName'},
            {lbl: '专用线', prop: 'ddTypeSpecialline'},
            {lbl: '起运港/地', prop: 'ddTypeStartarea'},
            {lbl: '到站港/地', prop: 'ddTypeDestination'},          
            {lbl: '中专港', prop: 'ddTypeTransferport'},
            {lbl: '业务单据号', prop: 'contractDetailOptcode'},    
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
            {lbl: '备注', prop: 'contractDetailRemark'},
            {lbl: '销售合同号', prop: 'scontractBillcode'},
            {lbl: '业务单号', prop: 'contractDetailOptcode'}
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
        tableSelect: []
      }
    },
    computed: {
      ...mapState({
        pageSize: state => state.pageSize,
        currentUser: state => state.user.currentUser,        
      })
    },
    created () {      
      this.searchFormItems[0].val = this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm')
      this.searchFormItems[1].val= this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm')      
    },
    mounted () {
      this.$nextTick(()=>{
        this.queryObject = {
          page: this.currentPage,
          detailBean: {
            likeCol: ['goodsContract', 'contractDetailRemark'],
            startDate: this.searchFormItems[0].val,
            endDate: this.searchFormItems[1].val,
            goodsFlag: true,
            report: false        
          },
          otherlikeCol:0,
          start: 0,
          limit: this.pageSize
        }
        this.loadData()
      })
    },
    methods: {      
      searchForm (values) {        
        for (const key in values) {
          this.queryObject.detailBean[key] = values[key]
        }
        this.queryObject.detailBean.likeCol = ['goodsContract', 'contractDetailRemark']
        this.queryObject.detailBean.report = false
        this.queryObject.detailBean.goodsFlag = true    
        this.currentPage = 1
        this.queryObject.page = this.currentPage
        this.queryObject.start = 0
        this.loadData()
      },
      rowSelectionFun (row) {
        console.log('rowSelectionFun', row)
        if (row.length > 0) {
          this.tableSelect = row
        }
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
          case 'dataGoodsflag':
            if (this.tableSelect.length === 0) {
              this.$message.error('请选择需要确认的数据')
              return
            }
            const completeCodeArr = []
            const completeBatchArr = []
            const completeTypeCodeArr = []              
            const dataGoodsflagArr = []
            this.tableSelect.map(item => {
              dataGoodsflagArr.push(item.dataGoodsflagStr)
              completeCodeArr.push(item.goodsContract)
              completeBatchArr.push(item.goodsContractbatch)
              completeTypeCodeArr.push(item.billtypeCode)
            })            
            if (dataGoodsflagArr.indexOf('×') !== -1 && dataGoodsflagArr.indexOf('√') !== -1) {
              this.$message.error("不可以同时选中两种货齐状态")
              return false
            }
            let flag = true
            let confirmMsg = '完成货齐确认'
            if (dataGoodsflagArr.indexOf('√') !== -1) {
              flag = false
              confirmMsg = '取消完成货齐确认'
            }         
            console.log('dataGoodsflagArr', dataGoodsflagArr)
            this.confirmDialog(this, '确定要[' + confirmMsg + ']当前记录？').then(() => {
              console.log('this.rowSelection', this.tableSelect)              
              completeCodeArr.join()
              completeBatchArr.join()
              completeTypeCodeArr.join()
              const params = {
                completeCodeStrs: completeCodeArr.join(),
                completeBatchStrs: completeBatchArr.join(),
                completeTypeCodeStrs: completeTypeCodeArr.join()
              }
              console.log(params)
              this.saveAsync(params, flag)
            })            
            break
          default:    
            this.currentPage = 1
            this.queryObject.page = this.currentPage
            this.queryObject.start = 0
            this.loadData()      
            break
        }
      },
      async loadData () {
        this.loading = true
        try {
          const { data } = await this.proxy(this, 'scscm/app/purchaseContractEnrollAjax!queryReport.do', 'post', this.queryObject)
          this.tableValue.tableData = []
          this.tableSelect = []
          this.totalCount = 0
          if (data.reportList) {
            this.tableValue.tableData = data.reportList
            this.totalCount = data.totalCount
          }
        } catch (e) {
          console.error(e)
        }
        this.loading = false
      },
      async saveAsync (params, flag) {
        // 保存
        const loading = this.loadShow()
        try {
          let api = 'scscm/app/purchaseContractEnrollAjax!updateGoodsComplete.do'
          if (!flag) {
            api = 'scscm/app/purchaseContractEnrollAjax!updateGoodsUnComplete.do'
          }          
          const { data } = await this.proxy(this, api, 'post', {detailBean: params})
          loading.close() 
          console.log(data)       
          if (data.map.state !== '3') {
            this.$message.error(data.map.msg ? data.map.msg : '保存失败')
            return
          }
          this.$message.success('保存成功')
          this.currentPage = 1
          this.queryObject.page = this.currentPage
          this.queryObject.start = 0
          this.loadData()          
          // this.$emit('save')
          this.loading = false
        } catch (e) {
          this.loading = false
          loading.close()
          console.error(e)
        }
        loading.close()
      }
    }
  }
</script>