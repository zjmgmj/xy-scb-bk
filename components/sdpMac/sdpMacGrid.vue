<template lang="pug">
.content
  .flex.flex-center    
    button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
    el-checkbox.ml-15(v-model="showAll", @change="showAllChange", :true-label="1", :false-label="0") 显示全部   
  edit-table(
    ref="sdpMacTable", 
    :id="'sdpmac'", 
    :loading="loading", 
    :tableValue="tableValue", 
    @rowSelection="handleSelectionChange", @editActive="editActive")
</template>
<script>
import { mapState } from 'vuex'
import editTable from '@/components/editTable'
import buttonGroup from '@/components/buttonGroup.vue'
export default {
  components: {
    buttonGroup,
    editTable
  },  
  props: {
    thisDialog: {
      type: Object,
      default: () => {
        return {}
      }
    },
    detailRef: {
      type: Object,
      default: () => {
        return {}
      }
    },
    config: {
      type: Object,
      default: () => {
        return {}
      }
    },
    detailSelect: {
      type: Object,
      default: undefined
    },
    codeSelect: {
      type: Object,
      default: () => {
        return {}
      }
    },
    sdpMacShow: {
      type: String,
      default: ''
    },
    model: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      loading: false,
      showAll: 0,
      buttonGroupInfo: [
        {lbl: '增加', type: 'add', icon: 'el-icon-plus'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
      ],
      tableValue: {         
        showRowIndex: true,
        showSummary: true,
        // priceMoneyComputerColumn:{computertype:'fee',goodsNum:'goodsNum',goodsWeight:'feeBweight',goodsPiecenum:'goodsPiecenum',goodsSingernum:'goodsSingernum',goodsAssistweight:'goodsAssistweight', partsnamePriceun:'partsnamePriceun',goodsInprice:'goodsInprice',goodsInmoney:'goodsInmoney',goodsExprice:'goodsExprice',goodsExmoney:'goodsExmoney',goodsTaxrate:'goodsTaxrate',goodsTaxmoney:'goodsTaxmoney'},
        tableHead: [
          {lbl: '类别', prop: 'mtaskDetailsClass', width: '80px', align: 'center', formatter: ({cellValue}) => {
            const obj = {'0': '基料', '1': '半成品', '2': '成品', '3': '余料', '4': '废料'}
            return obj[cellValue]
          }, type: 'select', list: [{label: '基料', value: 0}, {label: '半成品', value: 1}, {label: '成品', value: 2}, {label: '余料', value: 3}, {label: '废料', value: 3}]},
          {lbl: '工序', prop: 'mtaskDetailsProcess', minWidth: '100px', type: 'basic', props: {mtaskDetailsProcess: 'ddName'}, ddtypeClass:'mtaskDetailsProcess'},
          {lbl: '品名', prop: 'partsnameName', minWidth: '200px', type: 'goods',
            props: {pntreeName:'pntreeName', partsnameName: 'partsnameName', industryCode:'industryCode',goodsPriceun:'goodsPriceun',goodsPiecemode:'goodsPiecemode',goodsWeightmode:'goodsWeightmode',goodsMetering:'goodsMetering',goodsProperty:'goodsProperty'}
          },
          {lbl: '规格', prop: 'goodsSpec', props: {goodsSpec: 'goodsSpec'}, width: '150px', type: 'spec'},            
          {lbl: '材质', prop: 'goodsMaterial', props: {goodsMaterial: 'goodsMaterial'}, width: '150px', type: 'material'},          
          {lbl: '产地', prop: 'productareaName', props: {productareaName: 'productareaName'}, useName: true, width: '150px', type: 'area'},
          {lbl: '件支数', prop: 'goodsPartsbranch', g_type:'num'},
          {lbl: '数量', prop: 'goodsNum', summary: true, g_type: 'num', minValue:0},
          {lbl: '重量', prop: 'goodsWeight', summary: true, g_type: 'weight', minValue:0},
          {lbl: '数量单位', prop: 'partsnameNumunit', type: 'basic', ddtypeClass: 'partsnameNumunit', props: {partsnameNumunit: 'ddName'}},
          {lbl: '重量单位', prop: 'partsnameWeightunit', type: 'basic', ddtypeClass: 'partsnameWeightunit', props: {partsnameWeightunit: 'ddName'}},
          {lbl: '计量方式', prop: 'goodsMetering', width: '150px', type: 'basic',  ddtypeClass: 'goodsMetering', props: {goodsMetering: 'ddName'}},
          {lbl: '备注', prop: 'mtaskDetailsRemark'},
          {lbl: '车皮号', prop: 'goodsContractstr2', noedit: true},
          {lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true},
          {lbl: '库位', prop: 'wareplaceName'}
        ],
        tableData: []
      },
      table: null,
      tableList: [],
      rowDetail: null,
      rowCode: null,
      // model: ['dataFlag','scontractMtaskId','scontractBillcode','scontractMtaskBillbatch','scontractBillbatch','scontractCodeBatch','scontractMtaskFilterbatch','scontractMtaskDate','memberCode','scontractMtaskMac','mtaskDetailsClass','mtaskDetailsProcess','mtaskDetailsMtime','mtaskDetailsMstae','equsettingCode','datasCustomer','datasCustomername','machineDetailState','mtaskDetailsRemark','orgCode','deptCode','dataVernum','warehouseCode','goodstreeCode','pntreeName','productareaName','partsnameName','goodsMaterial','goodsSpec','goodsSpec1','goodsSpec2','goodsSpec3','goodsSpec4','goodsProperty1','goodsProperty2','goodsProperty3','goodsProperty4','goodsProperty5','goodsNumproperty1','goodsNumproperty2','goodsContract','goodsContractbatch','goodsContractstr1','goodsContractstr2','goodsContractstr3','goodsContractstr4','goodsContractstr5','goodsEntrybatch','goodsEntrybatchold','goodsEntrystr1','goodsEntrystr2','goodsEntrystr3','goodsEntrystr4','goodsEntrystr5','goodsCodebill','goodsWmscodebill','goodsCodebillold','goodsCodestr1','goodsCodestr2','goodsCodestr3','goodsCodestr4','goodsCodestr5','goodsCodestr6','goodsCodestr7','goodsCodestr8','goodsCodestr9','goodsCodestr10','goodsCodenum1','goodsCodenum2','goodsCodenum3','partsnameSplit','goodsProperty','goodsPartsbranch','goodsWetpercentage','goodsOrg','goodsDept','goodsCurrency','goodsExrate','companyCode','companyName','partsnameNumunit','partsnameWeightunit','goodsMetering','goodsPriceun','goodsPiecemode','goodsWeightmode','goodsCustomscode','goodsEnname','goodsEndescribe','goodsBatch','goodsIndustry','goodsNum','goodsPiecenum','goodsSingernum','goodsWeight','goodsAssistweight','mtaskDetailsOnum','mtaskDetailsOweight','mtaskDetailsOassistweight','mtaskDetailsOknum','mtaskDetailsOkweight','mtaskDetailsOkassistweight','mtaskDetailsNum','mtaskDetailsWeight','mtaskDetailsAssistweight','mtaskDetailsBnum','mtaskDetailsBweight','mtaskDetailsBassistweight']
      // model: ["companyCode", "companyName", "dataFlag", "scontractMtaskId", "scontractBillcode", "scontractMtaskBillbatch", "scontractBillbatch", "scontractCodeBatch", "scontractMtaskFilterbatch", "scontractMtaskDate", "memberCode", "scontractMtaskMac", "mtaskDetailsClass", "mtaskDetailsProcess", "mtaskDetailsMtime", "mtaskDetailsMstae", "equsettingCode", "datasCustomer", "datasCustomername", "machineDetailState", "mtaskDetailsRemark", "orgCode", "deptCode", "dataVernum", "warehouseCode", "goodstreeCode", "pntreeName", "productareaName", "partsnameName", "goodsMaterial", "goodsSpec", "goodsSpec1", "goodsSpec2", "goodsSpec3", "goodsSpec4", "goodsProperty1", "goodsProperty2", "goodsProperty3", "goodsProperty4", "goodsProperty5", "goodsNumproperty1", "goodsNumproperty2", "goodsContract", "goodsContractbatch", "goodsContractstr1", "goodsContractstr2", "goodsContractstr3", "goodsContractstr4", "goodsContractstr5", "goodsEntrybatch", "goodsEntrybatchold", "goodsEntrystr1", "goodsEntrystr2", "goodsEntrystr3", "goodsEntrystr4", "goodsEntrystr5", "goodsCodebill", "goodsWmscodebill", "goodsCodebillold", "goodsCodestr1", "goodsCodestr2", "goodsCodestr3", "goodsCodestr4", "goodsCodestr5", "goodsCodestr6", "goodsCodestr7", "goodsCodestr8", "goodsCodestr9", "goodsCodestr10", "goodsCodenum1", "goodsCodenum2", "goodsCodenum3", "partsnameSplit", "goodsProperty", "goodsPartsbranch", "goodsWetpercentage", "goodsOrg", "goodsDept", "goodsCurrency", "goodsExrate", "companyCode", "companyName", "partsnameNumunit", "partsnameWeightunit", "goodsMetering", "goodsPriceun", "goodsPiecemode", "goodsWeightmode", "goodsEnname", "goodsEndescribe","goodsBatch","goodsIndustry", "goodsNum", "goodsPiecenum", "goodsSingernum", "goodsWeight", "goodsAssistweight", "mtaskDetailsOnum", "mtaskDetailsOweight", "mtaskDetailsOassistweight", "mtaskDetailsOknum", "mtaskDetailsOkweight", "mtaskDetailsOkassistweight", "mtaskDetailsNum", "mtaskDetailsWeight", "mtaskDetailsAssistweight", "mtaskDetailsBnum", "mtaskDetailsBweight", "mtaskDetailsBassistweight"]
    }
  },
  computed: {
    ...mapState({
      importType: state => state.importType
    })
  },
  watch: {
    detailSelect(newRow, oldRow) {
      this.rowDetail = newRow
      this.rowCode = null
      this.rowChange(newRow, oldRow, 'scontractBillbatch')    
    },
    codeSelect(newRow, oldRow) {
      this.rowCode = newRow
      this.rowChange(newRow, oldRow, 'scontractCodeBatch')
    },
    sdpMacShow () {
      this.$refs.sdpMacTable.$refs.basicEditable.refreshColumn()
    }
  },
  mounted() {    
    this.$nextTick(() => {
      this.table = this.$refs.sdpMacTable.$refs.basicEditable
      const mainVal = this.thisDialog.$refs.form.model
      if (mainVal.scontractBillcode) {
        const params = {
          scontractBillcode: mainVal.scontractBillcode,
          billtypeCode: mainVal.billtypeCode,
          feeOptcode: mainVal.scontractBillcode,
          feeBilltype: mainVal.billtypeCode,
          page: 1,
          start: 0,
          limit: 25
        }
        this.getMtask(params)
      }      
    })
  },
  methods: {
    save () {
      const tableData = this.getTableData()
      let findObj = null
      if (tableData.length > 0) {
        const scontractBatch = this.rowCode === null ? 'scontractBillbatch' : 'scontractCodeBatch'        
        findObj = this.tableList.find(item => {
          return item[scontractBatch] === tableData[0][scontractBatch]
        })
      }
      if (!findObj) {
        this.tableList.push(...tableData) 
      }
      const tabList = this.toArray(this.extend(true, this.tableList))
      const dataList = []
      debugger
      tabList.map((item) => {
        delete item._XID
        const obj = {}
        this.model.forEach(key => {
          item[key] === undefined ? obj[key] = '' : obj[key] = item[key]
        })
        dataList.push(obj)
      })
      return dataList
    },
    getHeight () {
      const thisDialog = this.thisDialog.$refs
      const heightDialog = thisDialog.dialog.$el.clientHeight
      const formHeight = thisDialog.form.$el.clientHeight      
      const head = 93
      const btnHeight = 110
      const tableHeight = heightDialog - formHeight - head - btnHeight - 20
      this.tableValue.tableHeight =  tableHeight * 0.6 + 'px'
    },
    handleSelectionChange () {},
    editActive () {},
    rowChange (newRow, oldRow, scontractBatch) {
      debugger
      if (this.showAll) return false
      // 按明细 切换显示
      this.table = this.$refs.sdpMacTable.$refs.basicEditable
      const tableData = this.getTableData()
      let findMac = true
      if (oldRow) {
        findMac = this.tableList.find(item => {
          return item[scontractBatch] === oldRow[scontractBatch] && item.dataFlag !== 2
        })
      }      
      if (!findMac) {
        this.tableList.push(...tableData)
      }
      this.showAllChange(0, 'rowChange')
    },
    showAllChange (val, type) {
      debugger
      if (type !== 'rowChange') {
        const tableData = this.getTableData()
        if (tableData.length > 0) {
          this.tableList.push(...tableData)
        }
      }
      if (val === 0) { // 不全显示时
        const fullData = this.toArray(this.extend(true, this.tableList))
        let billbatch = ''
        let scontractBatch = ''
        if (this.rowDetail) {
          billbatch = this.rowDetail.scontractBillbatch
          scontractBatch = 'scontractBillbatch'
        } else if (this.rowCode) {
          billbatch = this.rowCode.scontractCodeBatch
          scontractBatch = 'scontractCodeBatch'
        } else {
          return false
        }
        const newRowList = []
        fullData.map((item, index) => {
          if (item[scontractBatch] === billbatch && item.dataFlag !== 2) {
            delete this.tableList[index]
            newRowList.push(item)
          }
        })
        this.tableList = this.tableList.filter(item => {
          return item !== undefined
        })  
        this.table.reloadData(newRowList) 
      } else { // 全显示
        this.table.reloadData(this.toArray(this.extend(true, this.tableList)))
        this.tableList = []
      }
    },
    getTableData () {
      const sdpMacTable = this.$refs.sdpMacTable
      const macRemoveRecords = []
      if (sdpMacTable.getRemoveRecords().length > 0) {
        sdpMacTable.getRemoveRecords().map((item) => {
          if (item.dataFlag === 2) {
            macRemoveRecords.push(item)
          }
        })
      }
      const fullData = this.table.getTableData().fullData
      const macDetailList = []
      macDetailList.push(...fullData, ...macRemoveRecords)
      // macDetailList.push(...fullData)
      return macDetailList
    },
    buttonGroupClick (flag) {
      switch (flag) {
        case 'add':         
          debugger 
          const tableRef = this.detailRef.$refs[this.config.detailRef].$refs
          const detailTable = tableRef.basicEditable
          const codeTable = tableRef.basicEditable
          const detailFullData = detailTable.getTableData().fullData
          const codeFullData = codeTable.getTableData().fullData
          if (detailFullData.length <= 0 || codeFullData.length <= 0) {
            this.$message.error('请增加合同码单!')
            return false
          }
          const selectedDetailR = this.rowDetail
          const selectedCodeR = this.rowCode
          if (!selectedDetailR || !selectedCodeR) {
            this.$message.error('请选择合同码单!')
            return false
          }
          if (selectedDetailR.scontractDetailMac === 0 || selectedDetailR.scontractDetailType === '03' && selectedDetailR.scontractDetailMac === 1) {
            this.$message.error('该合同明细无需加工')
            return false
          }

          const rec = {}
          // const importColumns = []
          // importColumns.push(...this.importType.goodsType, ...this.importType.detailType)
          
          // importColumns.forEach(key => {
          //   rec[key] = selectedDetailR[key]
          // })

          // const importColumns2 = []
          // importColumns2.push(...this.importType.codeType)
          // importColumns2.forEach(key => {
          //   rec[key] = selectedCodeR[key]
          // })
          this.model.forEach(key => {
            selectedCodeR[key] === undefined ? rec[key] = '' : rec[key] = selectedCodeR[key]            
            // if (rec[key] || rec[key] === undefined || rec[key] === 0) rec[key] = selectedCodeR[key] || ''
          })
          rec.goodsNum = selectedCodeR.goodsNum
          rec.goodsWeight = selectedCodeR.goodsWeight
          rec.goodsAssistweight = selectedCodeR.goodsAssistweight
          rec.scontractBillcode = selectedCodeR.scontractBillcode
          rec.scontractBillbatch = selectedCodeR.scontractBillbatch
          rec.scontractCodeBatch = selectedCodeR.scontractCodeBatch
          rec.scontractMtaskFilterbatch = selectedCodeR.scontractCodeBatch
          rec.scontractMtaskMac = selectedDetailR.scontractDetailMac
          rec.goodsCodestr2 = selectedCodeR.goodsCodestr2
          rec.goodsCodestr6 = selectedCodeR.goodsCodestr6
          rec.mtaskDetailsRemark = selectedCodeR.scontractCodeRemark
          rec.mtaskDetailsProcess = selectedCodeR.mtaskDetailsProcess || ''
          rec.mtaskDetailsClass = 2
          rec.machineDetailState = 0
          rec.goodsCodebill = ''
          rec.goodsEntrybatch = ''
          rec.dataFlag = 0
          this.table.insertAt([rec], -1)
          // this.tableList.push(rec)
          break
        case 'del':
          // this.table.getTableData()
          const row = this.table.getCurrentRow()
          if (!row) {
            this.$message.error('请选择需要删除的数据')
            return false
          }
          this.macRemove([row])
          // if (row.dataFlag === 1) {
          //   row.dataFlag = 2
          // }
          // this.table.remove(row)
          break
      }
    },
    macRemove (list) {
      if (!list) {
        this.table.remove()  
        return false
      }
      list.map(item => {
        item.dataFlag === 1 ? item.dataFlag = 2 : this.tableList.splice(this.tableList.indexOf(item), 1)        
        this.table.remove(item)        
      })      
    },
    async getMtask (params) {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/scontractEnrollAjax!queryMtask.do', 'post', params)
        console.log(data)
        this.tableValue.tableData = []
        if (data.mtaskList) {
          this.tableValue.tableData = data.mtaskList
        }
        this.loading = false
      } catch (e) {
        this.loading = false
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