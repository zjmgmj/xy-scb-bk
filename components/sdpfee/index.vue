<template lang="pug">
.content
  .flex.flex-center    
    el-button(size="mini", type="primary", icon="el-icon-plus", @click="addTable") 增加
    el-button.ml-15(size="mini", type="primary", icon="el-icon-delete", @click="delTable") 删除
    el-radio-group(v-model="sdpFeeFlag", :disabled="btnDisabled")
      el-radio.ml-15(:label="0") 按主表
      el-radio.ml-15(:label="1") 按明细
    el-checkbox.ml-15(v-model="showAll", @change="showAllChange", :true-label="1", :false-label="0" :disabled="sdpFeeFlag !== 1") 显示全部
    .ml-15(v-show="showAll ===0 && sdpFeeFlag ===1")
      span.pl-5 品名：{{detail.partsnameName}}
      span.pl-5 规格：{{detail.goodsSpec}}
      span.pl-5 材质：{{detail.goodsMaterial}}
      span.pl-5 产地：{{detail.productareaName}}
      span.pl-5 结算量：{{detail[feeConfig.otherParams.feeBweight]}}
  edit-table(ref="sdpfeeTable", :id="'sdpfee'", :loading="loading", :tableValue="tableValue", @rowSelection="handleSelectionChange", @editActive="editActive")
</template>
<script>
import editTable from '@/components/editTable'
export default {
  components: {
    editTable
  },
  props: {
    mainForm: {
      type: Object,
      default: () => {
        return {}
      }
    },
    detailTable: {
      type: Object,
      default: () => {
        return {}
      }
    },
    rowDetail: {
      type: Object,
      default: () => {
        return null
      }
    },
    feeConfig: {
      type: Object,
      default: () => {
        return {}
      }
    },
    termList: {
      type: Array,
      default: () => {
        return []
      }
    },
    sdpfeeShow: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      btnDisabled: false,
      loading: false,
      termsettingName: '',
      termsettingCode: '',
      termsettingList: [],
      tableValue: {         
        showRowIndex: true,
        showSummary: true,
        priceMoneyComputerColumn:{computertype:'fee',goodsNum:'goodsNum',goodsWeight:'feeBweight',goodsPiecenum:'goodsPiecenum',goodsSingernum:'goodsSingernum',goodsAssistweight:'goodsAssistweight', partsnamePriceun:'partsnamePriceun',goodsInprice:'goodsInprice',goodsInmoney:'goodsInmoney',goodsExprice:'goodsExprice',goodsExmoney:'goodsExmoney',goodsTaxrate:'goodsTaxrate',goodsTaxmoney:'goodsTaxmoney'},
        tableHead: [
          {lbl: '方向', prop: 'feeDirection', width: '80px', align: 'center', noedit: true, formatter: ({cellValue}) => {
            return cellValue === 0 ? '应付' : '应收'
          }},
          {lbl: '日期', prop: 'feeDate', minWidth: '100px', type: 'date', formatter: ({cellValue}) => {
            return this.toDateString(new Date(cellValue), 'yyyy-MM-dd')
          }},
          {lbl: '费用名称', prop: 'feeitemName', minWidth: '200px', type: 'feeitem', valProp: 'feeitemCode',
            props: {feeitemName: 'feeitemName', feeitemCode: 'feeitemCode', goodsTaxrate:'goodsTaxrate',feeitemCalmethod:'feeitemCalmethod',feeclassName:'feeclassName',feeitemWhrent:'feeitemWhrent',feeitemMoneymt:'feeitemMoneymt', goodsInprice:'feeitemInprice',ddTypeSettlement:'ddTypeSettlement',ddTypeTransport:'ddTypeTransport',feeitemMetering:'feeitemMetering',feeitemPriceunitStr:'feeitemPriceunitStr',feeitemPriceunit:'feeitemPriceunit'}
          },
          {lbl: '结算单位', prop: 'datasBalcorpname', valProp: 'datasBalcorp', minWidth: '150px', type: 'company', typeStr: 'GYS', props: {datasBalcorpname: 'companyName', datasBalcorp:'companyCode', companyCode:'companyCode', companyProjectName:'companyProjectName', companyProjectCode:'companyProjectCode'}},
          {lbl: '结算方式', prop: 'ddTypeSettlement', minWidth: '100px', type: 'basic', ddtypeClass: 'ddTypeSettlement',  useName: true, props: {ddTypeSettlement: 'ddName'}},
          {lbl: '结算量', prop: 'feeBweight', minWidth: '100px'},
          {lbl: '含税单价', prop: 'goodsInprice', g_type: 'price', change: this.tableChange},
          {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money', change: this.tableChange},
          {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
          {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
          {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},            
          {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money'},   
          {lbl: '进成本', prop: 'feeIncost', align:"center", minWidth: '100px', type: 'checkBox', trueLabel: 0, falseLabel: 1, formatter: ({cellValue}) => {
            return cellValue === 0 ? '进成本' : '不进成本'
          }},
          {lbl: '进往来', prop: 'feeCurrent', align:"center", minWidth: '100px', type: 'checkBox', trueLabel: 0, falseLabel: 1, formatter: ({cellValue}) => {
            return cellValue === 0 ? '进往来' : '不进往来'
          }},
          {lbl: '项目', prop: 'companyProjectName', minWidth: '100px', useName: true, type: 'companyProject'},          
          {lbl: '起运港/地', prop: 'ddTypeStartarea', type: 'basic', useName: true,  ddtypeClass: 'ddTypeStartarea', props: {ddTypeStartarea: 'ddName'}},
          {lbl: '到站港/地', prop: 'ddTypeDestination', type: 'basic', useName: true, ddtypeClass: 'ddTypeDestination', props: {ddTypeDestination: 'ddName'}},
          {lbl: '运输方式', prop: 'ddTypeTransport', type: 'basic', useName: true,  ddtypeClass: 'ddTypeTransport', props: {ddTypeTransport: 'ddName'}},
          {lbl: '业务机构', prop: 'orgAbbreviate', type: 'org', useName: true, props: {orgName: 'orgName', orgCode: 'orgCode'}},       
          {lbl: '业务部门', prop: 'deptName', type: 'dept', useName: true, props: {deptName: 'deptName', deptCode: 'deptCode'}},       
          {lbl: '业务员', prop: 'employeeName', width: '150px', useName: true, type: 'employee', props: {employeeName: 'employeeName', employeeCode: 'employeeCode'}},
          {lbl: '备注', prop: 'feeRemark', minWidth: '100px'},
          {lbl: '品名', prop: 'partsnameName', minWidth: '100px', noedit: true},
          {lbl: '规格', prop: 'goodsSpec', minWidth: '100px', noedit: true},
          {lbl: '材质', prop: 'goodsMaterial', minWidth: '100px', noedit: true},
          {lbl: '产地', prop: 'productareaName', minWidth: '100px', noedit: true},
        ],
        tableData: []
      },
      billtypeCode: '',
      queryObject: {
        page: 1,
        start: 0,
        limit: 25
      },
      rowSelection: [],
      showAll: 1,
      sdpFeeFlag: 0,
      copyDetailList: [],
      table: '',
      sdpfeeList: [],
      detail: {}
    }
  },
  watch: {
    rowDetail (newRow, oldRow) {  
      if (!this.sdpFeeFlag || this.showAll) {
        return false
      }      
      debugger
      // 按明细 切换显示
      this.table = this.$refs.sdpfeeTable.$refs.basicEditable
      const tableData = this.getTableData()
      
      const findFee = this.sdpfeeList.find(item => {
        return item.feeTempOptbatch === oldRow[this.feeConfig.otherParams.feeOptbatch] && item.dataFlag !== 2
      })
      if (!findFee) {
        this.sdpfeeList.push(...tableData)
      }      
      this.showAllChange(0, 'rowChange')
    },
    sdpfeeShow () {
      this.$refs.sdpfeeTable.$refs.basicEditable.refreshColumn()
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.table = this.$refs.sdpfeeTable.$refs.basicEditable
      const otherParams = this.feeConfig.otherParams
      if (this.mainForm.billtypeCode) {
        this.billtypeCode = this.mainForm.billtypeCode
        this.queryObject = {
          billtypeCode: this.mainForm.billtypeCode,
          feeOptcode:  this.mainForm[otherParams.billcode],
          feeBilltype: this.mainForm.billtypeCode,
          page: 1,
          start: 0,
          limit: 25,
          sort: '[{"property":"feeDirection","direction":"ASC"}]'
        }
        this.queryObject[otherParams.billcode] = this.mainForm[otherParams.billcode]
        this.getSdpFeeDetail()
      }      
    })
  },
  methods: {
    tableChange (scope) {
      // const goodsInmoneySum = 0
      // if (column.property === 'goodsInmoney') {
      //   goodsInmoneySum = this.table.footerData[0][columnIndex]
        
      // }
      scope.table = this.table
      scope.sdpFeeFlag = this.sdpFeeFlag
      this.$emit('change', scope)
      // console.log('sumValue', sumValue)
    },
    showAllChange (val, type) {
      const newRow = this.rowDetail
      if (val === 0 && newRow === null) {
        this.$message.error('请选择明细')
        return false
      }
      if (type !== 'rowChange') {
        const tableData = this.getTableData()
        if (tableData.length > 0) {
          this.sdpfeeList.push(...tableData)
        }
      }      
      if (val === 0) { // 不全显示时
        
        const fullData = this.toArray(this.extend(true, this.sdpfeeList))      
        const newRowList = []
        fullData.map((item, index) => {
          if (item.feeTempOptbatch === newRow[this.feeConfig.otherParams.feeOptbatch] && item.dataFlag !== 2) {          
            delete this.sdpfeeList[index]
            newRowList.push(item)
          }
        })
        this.sdpfeeList = this.sdpfeeList.filter(item => {
          return item !== undefined
        })  
        this.table.reloadData(newRowList)
        this.detail = {
          partsnameName: newRow.partsnameName,
          goodsSpec: newRow.goodsSpec,
          goodsMaterial: newRow.goodsMaterial,
          productareaName: newRow.productareaName        
        }
        this.detail[this.feeConfig.otherParams.feeBweight] = newRow[this.feeConfig.otherParams.feeBweight]   
      } else { // 全显示
        this.table.reloadData(this.toArray(this.extend(true, this.sdpfeeList)))
        this.sdpfeeList = []
      }
    },
    editActive ({row}) {
      const priceMoneyComputercolumn = this.$refs.sdpfeeTable.priceMoneyComputercolumn
      priceMoneyComputercolumn.goodsWeight = 'feeBweight'      
      if (row.feeitemCalmethod === 1 && this.feeConfig.settlementFeeEdit) {
        if(this.billtype === 'S004' || this.billtype === 'S002' || this.billtype === 'S006'){
          priceMoneyComputercolumn.goodsWeight = 'feeOkweight'
        } else if (this.mainForm.allGoodsFlag === 1) {
          priceMoneyComputercolumn.goodsWeight = 'feeOkweight'
        }
      }
    },
    delTable () {
      if (this.rowSelection.length === 0) {
        this.$message.error('请选择需要删除的数据')
        return false
      }
      this.table.remove(this.rowSelection[0])
      if (this.table.getTableData().fullData.length === 0 && this.sdpfeeList.length === 0) {
        this.btnDisabled = false
      }      
    },
    addTable () {      
      // 判断是否允许增加      
      this.copyDetailList = this.detailTable.getTableData().fullData
      if (this.copyDetailList.length < 1) {
        this.$message.error('请增加明细信息!')
        return false
      }
      const otherParams = this.feeConfig.otherParams
      const _formValue = this.mainForm
      let goodsWeightCol = 'goodsWeight'
      let okWeightCol = ''
			if(otherParams.feeBweight){
				goodsWeightCol = otherParams.feeBweight
			}
			if(otherParams.feeOkweight){
				okWeightCol = otherParams.feeOkweight
      }
      let goodsWeight = 0
      let okWeight = 0
      const rec = {}
      if(this.sdpFeeFlag){ // 按明细
        // const records = this.detailTable.getCurrentRow()
        const records = this.rowDetail
        if(records === null){
          this.$message.error('请选择要增加费用的明细!')
          return false;
        }
        // var detailR = records
        goodsWeight = records[goodsWeightCol]
        if(okWeightCol){
          okWeight = records[okWeightCol]
        }
        rec.partsnameName = records.partsnameName
        rec.goodsSpec = records.goodsSpec
        rec.goodsMaterial = records.goodsMaterial
        rec.productareaName = records.productareaName
        rec.feeTempOptbatch = records[otherParams.feeOptbatch]
      } else {
        // 按主表
        goodsWeight = this.getColumnSum(goodsWeightCol, this.detailTable)
        if(okWeightCol){
					okWeight = this.getColumnSum(okWeightCol, this.detailTable)
        }
        rec.feeTempOptbatch = ''
      }      
      if(!goodsWeight || goodsWeight === '' || isNaN(goodsWeight)){
        goodsWeight = 0
      }
      if(!okWeight || okWeight === '' || isNaN(okWeight)){
        okWeight = 0
      }
      rec.ddTypeStartarea = ''
      rec.ddTypeDestination = ''
      rec.ddTypeTransport = ''
      rec.companyProjectName = ''
      rec.feeitemName = ''
      rec.datasBalcorpname = ''
      rec.dataFlag = 0
      rec.feeBweight = Math.abs(goodsWeight)
      rec.feeOkweight = Math.abs(okWeight)
      rec.companyName= _formValue.companyName
      rec.companyCode = _formValue.companyCode
      rec.feeitemCalmethod = 0
      rec.feeDirection = 0
      rec.feeCurrent = 0
      rec.feeCurrentStr = true
      rec.feeIncost = 0
      rec.feeIncostStr = true
      rec.ddTypeSettlement = '现结'
      rec.employeeName = _formValue.employeeName
      rec.employeeCode = _formValue.employeeCode
      rec.orgAbbreviate = _formValue.orgAbbreviate
      rec.orgName = _formValue.orgName
      rec.orgCode = _formValue.orgCode
      rec.deptName = _formValue.deptName
      rec.deptCode = _formValue.deptCode
      rec.feeDate = this.toDateString(new Date(), 'yyyy-MM-dd HH:mm:ss')
      // this.sdpfeeList.push(rec)
      this.btnDisabled = true
      this.$refs.sdpfeeTable.$refs.basicEditable.insertAt([rec], -1)
    },
    getTableData () {
      // const feeList = this.extend(true, this.termDetail)
      debugger
      const sdpfeeTable = this.$refs.sdpfeeTable
      const feeRemoveRecords = []
      if (sdpfeeTable.getRemoveRecords().length > 0) {
        sdpfeeTable.getRemoveRecords().map((item) => {
          if (item.dataFlag === 1) {
            item.dataFlag = 2
            feeRemoveRecords.push(item)
          }          
        })
      }                
      
      let feeDetailList = []
      if (this.sdpFeeFlag === 0) {
        const feeUpdateRecords = sdpfeeTable.getUpdateRecords()
        const feeInsertRecords = sdpfeeTable.getInsertRecords()        
        feeDetailList = [...feeUpdateRecords, ...feeInsertRecords, ...feeRemoveRecords]
      } else {
        debugger
        const fullData = this.table.getTableData().fullData
        feeDetailList = [...fullData, ...feeRemoveRecords]
      }
      return feeDetailList
    },
    handleSelectionChange (row) {            
      this.rowSelection = [row]
    },
    sdpFeeSave () {
      debugger
      const tableData = this.getTableData()
      let findFee = null
      if (tableData.length > 0) {
        findFee = this.sdpfeeList.find(item => {
          return item.feeTempOptbatch === tableData[0].feeTempOptbatch
        })
      }
      if (!findFee) {
        this.sdpfeeList.push(...tableData) 
      }   
      // this.sdpfeeList.push(...this.getTableData()) 
      return this.sdpfeeList
      // if (this.sdpFeeFlag === 0 || this.showAll) { // 按主表 || 按明细全部显示
      //   return this.getTableData()
      // } else { // 按明细
      //   const tableData = this.getTableData()
      //   const findFee = this.sdpfeeList.find(item => {
      //     return item.feeTempOptbatch === tableData[0].feeTempOptbatch
      //   })
      //   if (!findFee) {
      //     this.sdpfeeList.push(...this.getTableData()) 
      //   }   
      //   // this.sdpfeeList.push(...this.getTableData()) 
      //   return this.sdpfeeList
      // }      
    },
    removeFee () {
      // 删除明细时同步删除费用
      this.table.remove(this.table.getTableData().fullData)
    },
    async getSdpFeeDetail () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/sdpFeeAjax!queryDetailByOpt.do', 'post', this.queryObject)
        this.tableValue.tableData = []
        if (data.detailList) {
          if (data.detailList[0].feeTempOptbatch) {
            // this.sdpfeeList = data.detailList
            this.sdpFeeFlag = 1            
          }
          this.tableValue.tableData = data.detailList
          if (this.tableValue.tableData.length > 0) this.btnDisabled = true          
        }
      } catch (e) {
        console.error('error', e)
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
/deep/.el-radio{
 margin-right 0
}
/deep/.el-checkbox{
  margin-right 0
}
/deep/.vxe-table.show--foot.scroll--x .vxe-table--body-wrapper{
  overflow-x: hidden;
}
</style>