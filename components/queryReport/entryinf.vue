<template lang="pug">
.content
  detail-win(
    ref="entryinf",
    :config="config", 
    :searchFormItems="searchForm"
    :tableValue="tableValue",
    :checkMethod="checkMethod",
    @cellClick="cellClick",
    @rowSelection="rowSelection",
    @close="close"
    @sure="cellBack")
</template>
<script>
import detailWin from '@/components/detailWin'
export default {
  components: {
    detailWin
  },
  props: {
    mainForm: {
      type: Object,
      default: () => {
        return {}
      }
    },
    uniqueField: { // 判断是否重复
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: '未完成业务明细'
    },
    // checkMethod: {
    //   type: Function,
    //   default: undefined
    // },
    parentRef: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      config: {
        title: this.title,        
        urlApi: 'scscm/app/entryinfAjax!queryReport.do'
      },
      likeCol: ['entryinfBillcode', 'entryinfDetailRemark'], 
      searchForm: [],  
      tableValue: {
        selection: true,
        pageination: true,
        tableHeight: '100%',
        tableHead: [
          {lbl: '单据号', prop: 'entryinfBillcode', width: '130px'},
          {lbl: '日期', prop: 'entryinfDate', formatter: ({cellValue}) => {
            return this.toDateString(cellValue, 'yyyy-MM-dd')
          }},
          {lbl: '仓库', prop: 'warehouseName'},
          {lbl: '结算单位', prop: 'datasBalcorpname', width: '130px'},        
          {lbl: '品名', prop: 'partsnameName'},
          {lbl: '材质', prop: 'goodsMaterial'},
          {lbl: '规格', prop: 'goodsSpec'},
          {lbl: '产地', prop: 'productareaName'},
          {lbl: '未执行数量', prop: 'noDetailNum', g_type:'num'},
          {lbl: '未执行重量', prop: 'noDetailWeight', g_type:'weight'},
          {lbl: '业务类别', prop: 'entryinfTypeStr'},
          {lbl: '类型', prop: 'entryinfClassStr'},
          {lbl: '采购类型', prop: 'contractCtype'},
          {lbl: '结算方式', prop: 'ddTypeSettlement'},
          {lbl: '供货单位', prop: 'datasSuppliername'},
          {lbl: '收货机构', prop: 'datasInorgName'},
          {lbl: '长度', prop: 'goodsProperty1', noedit: true},
          {lbl: '米重', prop: 'goodsProperty2', noedit: true},
          {lbl: '重量范围', prop: 'goodsProperty4', noedit: true},
          {lbl: '公差范围', prop: 'goodsProperty5', noedit: true},
          {lbl: '厂发数量', prop: 'entryinfDetailPnum', g_type:'num'},
          {lbl: '厂发重量', prop: 'entryinfDetailPweight', g_type:'weight'},
          {lbl: '入库数量', prop: 'goodsNum', g_type:'num'},
          {lbl: '入库重量', prop: 'goodsWeight', g_type:'weight'},
          {lbl: '数量单位', prop: 'partsnameNumunit'},
          {lbl: '重量单位', prop: 'partsnameWeightunit'},
          {lbl: '含税单价', prop: 'goodsBinprice', g_type: 'price'},
          {lbl: '含税金额', prop: 'goodsInmoney', g_type: 'money'},
          {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
          {lbl: '无税金额', prop: 'goodsExmoney', width: '120px', g_type: 'money'},
          {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
          {lbl: '税额', prop: 'goodsTaxmoney', width: '120px', g_type: 'money'},
          {lbl: '费用单价', prop: 'goodsBinfeeprice', g_type: 'price'},
          {lbl: '费用金额', prop: 'goodsInfeemoney', g_type: 'money'},
          {lbl: '计价方式', prop: 'partsnamePriceunStr'},
          {lbl: '计量方式', prop: 'goodsMetering'},
          {lbl: '车皮号', prop: 'goodsContractstr2'},
          {lbl: '入库批号', prop: 'goodsEntrystr1'},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4'},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5'},
          {lbl: '件支数', prop: 'goodsPartsbranch'},
          {lbl: '业务机构', prop: 'orgName'},
          {lbl: '业务部门', prop: 'deptName'},
          {lbl: '业务员', prop: 'employeeName'},
          {lbl: '制单人', prop: 'operatorName'},
          {lbl: '备注', prop: 'entryinfDetailRemark'},
          {lbl: '销售合同号', prop: 'scontractBillcode'},
          {lbl: '业务单号', prop: 'entryinfDetailOptcode'},
          {lbl: '仓储上传', prop: 'interfaceWmsscmFlagStr'},
          {lbl: '仓储入库', prop: 'interfaceWmsscmEflagStr'}
        ],
        tableData: []
      },
      copyForm: {},
      parentFullData: [],
      parentTable: {}
    }
  },
  created() {
    this.copyForm = this.extend(true, this.mainForm)
    // this.parentFullData = this.parentRef.dbEditTable.$refs.detailTable.$refs.basicEditable.getTableData().fullData
    this.parentTable = this.parentRef.$refs.basicEditable
    this.parentFullData = this.parentRef.$refs.basicEditable.getTableData().fullData
    const entryinfBillcode = this.parentFullData[0] ? this.parentFullData[0].entryinfBillcode : ''
    debugger
    // console.log(this.parentRef)
    this.searchForm = [      
      {lbl: '起始日期', prop: 'startDate', val: this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
      {lbl: '结束日期', prop: 'endDate', val: this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
      {lbl: '单据号', prop: 'entryinfBillcode', val: entryinfBillcode, disabled: entryinfBillcode !== ''},
      {lbl: '仓库', prop: 'warehouseCode', val: this.copyForm.warehouseCode, disabled: this.copyForm.warehouseCode !== '', type:"warehouse"},
      {lbl: '结算单位', prop: 'datasBalcorp', val: this.copyForm.datasBalcorp, disabled: this.copyForm.datasBalcorp !== '', type:"company"},
      {lbl: '品名', prop: 'scontractDetailPartsname', val: '', type:"goods"},
      {lbl: '材质', prop: 'scontractDetailMaterial', val: '', type:"material"},
      {lbl: '规格', prop: 'scontractDetailSpec', val: '', type:"spec"},
      {lbl: '产地', prop: 'productareaName', val: '', type:"area"},
      {lbl: '业务机构', prop: 'orgCode', val: this.copyForm.orgCode, type:"org", disabled: true},
      {lbl: '业务部门', prop: 'deptCode', val: this.copyForm.deptCode, type:"dept", disabled: true},
      {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee"},
      {lbl: '制单人', prop: 'operatorCode', val: '', type:"operator"},
      {lbl: '备注', prop: 'entryinfDetailRemark', val: ''} 
    ]
  },
  methods: {
    checkMethod ({row, rowIndex}) {
      console.log('----s-')
      // debugger
      // const detailTable = this.parentRef.$refs.basicEditable
      const entryinfTable = this.$refs.entryinf.$refs.table.$refs.basicEditable
      // const fullData = detailTable.getTableData().fullData
      const selectRow = entryinfTable.getSelectRecords()
      if (this.parentFullData.length > 0) {
        if (row[this.uniqueField] === this.parentFullData[0][this.uniqueField]) {
          return false
        }
      } else if (selectRow.length > 0) {
        if (row.entryinfBillcode !== selectRow[0].entryinfBillcode) {
          return false
        }
      }
      return true  
    },
    rowSelection (row) {   
      console.log('-------entryinf', row)
      this.$emit('rowSelection', row)
    },
    cellClick({ row, rowIndex, column, columnIndex, event }) {
      this.$emit('cellClick', { row, rowIndex, column, columnIndex, event })
    },
    cellBack({data}) {
      this.$emit('cellBack', data)
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>