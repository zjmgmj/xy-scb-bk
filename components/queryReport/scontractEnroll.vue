<template lang="pug">
.content
  detail-win(
    ref="scontract",
    :config="config", 
    :searchFormItems="searchForm"
    :tableValue="tableValue",
    :checkMethod="checkMethod ? checkMethod : defaultCheckMethod",
    :likeCol="likeCol",
    @close="close",
    @sure="cellBack")
</template>
<script>
import detailWin from '@/components/detailWin'
export default {
  components: {
    detailWin
  },
  props: {
    parentRef: {
      type: Object,
      default: () => {
        return {}
      }
    },
    queryParam: {
      type: Object,
      default: () => {
        return {}
      }
    },
    checkMethod: {
      type: Function,
      default: undefined
    },
    title: {
      type: String,
      default: '未完成销售合同明细'
    },
    uniqueField: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      config: {
        title: this.title,        
        urlApi: 'scscm/app/scontractEnrollAjax!queryReport.do'
      },
      likeCol: ['scontractBillcode', 'scontractDetailRemark'], 
      searchForm: [
        {lbl: '起始日期', prop: 'startDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm', disabled: false},
        {lbl: '结束日期', prop: 'endDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm', disabled: false},
        {lbl: '单据号', prop: 'scontractBillcode', val: '', disabled: false},
        {lbl: '仓库', prop: 'warehouseCode', val: '', type:"warehouse", disabled: false},
        {lbl: '结算单位', prop: 'datasBalcorp', val: '', type:"company", disabled: false},
        {lbl: '品名', prop: 'scontractDetailPartsname', val: '', type:"goods", disabled: false},
        {lbl: '材质', prop: 'scontractDetailMaterial', val: '', type:"material", disabled: false},
        {lbl: '规格', prop: 'scontractDetailSpec', val: '', type:"spec", disabled: false},
        {lbl: '产地', prop: 'productareaName', val: '', type:"area", disabled: false},
        {lbl: '业务机构', prop: 'orgCode', val: '', type:"org", disabled: false},
        {lbl: '业务部门', prop: 'deptCode', val: '', type:"dept", disabled: false},
        {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee", disabled: false},
        {lbl: '制单人', prop: 'operatorCode', val: '', type:"operator", disabled: false},
        {lbl: '合同性质', prop: 'scontractDetailType', type: 'select', 
          list:[
            {value: '01', label: '现货'},
            {value: '02', label: '期货'},
            {value: '03', label: '配货'}
          ], 
          val: '配货', disabled: false},
        {lbl: '备注', prop: 'planRemark', val: '', disabled: false},
        { lbl: '', prop: 'scontractDetailMac', val: '', type: 'hidden', disabled: false },
        { lbl: '', prop: 'report', val: '', type: 'hidden', disabled: false },
        { lbl: '', prop: 'goodsFlag', val: '', type: 'hidden', disabled: false }
      ],  
      tableValue: {
        selection: true,
        pageination: true,
        tableHeight: '100%',
        tableHead: [
          {lbl: '单据号', prop: 'scontractBillcode', width: '150px'},
          {lbl: '日期', prop: 'scontractDate', formatter: ({cellValue}) => {
            return this.toDateString(cellValue, 'yyyy-MM-dd')
          }, width: '100px'},
          {lbl: '结算单位', prop: 'datasBalcorpname', width: '150px'}, 
          {lbl: '未执行数量', prop: 'scontractDetailNsbnum', g_type:'num'},
          {lbl: '未执行重量', prop: 'scontractDetailNsbweight', g_type:'weight'},
          {lbl: '合同性质', prop: 'scontractDetailTypeStr'},
          {lbl: '加工', prop: 'scontractDetailMacStr'},
          {lbl: '仓库', prop: 'warehouseName'},                            
          {lbl: '品名', prop: 'scontractDetailPartsname'},
          {lbl: '材质', prop: 'scontractDetailMaterial'},
          {lbl: '规格', prop: 'scontractDetailSpec'},
          {lbl: '产地', prop: 'scontractDetailProareaname'},
          {lbl: '数量', prop: 'goodsNum', g_type:'num'},
          {lbl: '重量', prop: 'goodsWeight', g_type:'weight'},
          {lbl: '提单执行数量', prop: 'scontractDetailSbnum', g_type:'num'},
          {lbl: '提单执行重量', prop: 'scontractDetailSbweight', g_type:'weight'},
          {lbl: '加工执行数量', prop: 'scontractDetailMnum', g_type:'num'},
          {lbl: '加工执行重量', prop: 'scontractDetailMweight', g_type:'weight'},
          {lbl: '加工未执行数量', prop: 'scontractDetailNmnum', g_type:'num'},
          {lbl: '加工未执行重量', prop: 'scontractDetailNmweight', g_type:'weight'},
          {lbl: '采购执行数量', prop: 'scontractDetailCnum', g_type:'num'},
          {lbl: '采购执行重量', prop: 'scontractDetailCweight', g_type:'weight'},
          {lbl: '实提数量', prop: 'scontractDetailOnum', g_type:'num'},
          {lbl: '实提重量', prop: 'scontractDetailOweight', g_type:'weight'},
          {lbl: '入库厂发数量', prop: 'scontractDetailEnum', g_type:'num'},
          {lbl: '入库厂发重量', prop: 'scontractDetailEweight', g_type:'weight'},
          {lbl: '变更数量', prop: 'scontractDetailChnum', g_type:'num'},
          {lbl: '变更重量', prop: 'scontractDetailChweight', g_type:'weight'},
          {lbl: '数量单位', prop: 'partsnameNumunit'},
          {lbl: '重量单位', prop: 'partsnameWeightunit'},
          {lbl: '含税单价', prop: 'goodsBinprice', g_type: 'price'},
          {lbl: '含税金额', prop: 'goodsInmoney', g_type: 'money'},
          {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
          {lbl: '无税金额', prop: 'goodsExmoney', width: '120px', g_type: 'money'},
          {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
          {lbl: '税额', prop: 'goodsTaxmoney', width: '120px', g_type: 'money'},
          {lbl: '计量方式', prop: 'goodsMetering'},
          {lbl: '货权机构', prop: 'goodsOrgName'},
          {lbl: '货权部门', prop: 'goodsDeptName'},
          {lbl: '入库批号', prop: 'goodsEntrystr1'},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4'},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5'},
          {lbl: '项目', prop: 'companyProjectName'},
          {lbl: '原始单号', prop: 'scontractOthercode'},
          {lbl: '销售类型', prop: 'scontractCtype'},
          {lbl: '类型', prop: 'scontractClassStr'},
          {lbl: '业务机构', prop: 'orgName'},
          {lbl: '业务部门', prop: 'deptName'},
          {lbl: '业务员', prop: 'employeeName'},
          {lbl: '制单人', prop: 'operatorName'},
          {lbl: '备注', prop: 'scontractDetailRemark'},
          {lbl: '业务单号', prop: 'scontractDetailOptcode'}
        ],
        tableData: []
      },
      copyForm: {}
    }
  },
  created() {
    Object.keys(this.queryParam).forEach(key => {
      this.searchForm.filter(x => x.prop === key).forEach(x => {        
        x.val = this.queryParam[key]
        x.val ? x.disabled = true : x.disabled = false        
      })
    })
  },
  methods: {
    defaultCheckMethod ({row}) {
      const fullData = this.parentRef.getTableData().fullData
      const scontractTable = this.$refs.scontract.$refs.table.$refs.basicEditable      
      const selectRow = scontractTable.getSelectRecords()
      if (fullData.length > 0) {
        const findObj = fullData.find(item => {
          return row[this.uniqueField] === item[this.uniqueField]  
        })
        if (findObj) return false 
      } else if (selectRow.length > 0) {
        if (row.scontractBillcode !== selectRow[0].scontractBillcode) {          
          return false
        }
        // if (row[this.uniqueField] !== selectRow[0][this.uniqueField]) {
        //   return false
        // }
      }
      return true
    },
    cellBack({data}) {    
      this.$emit('cellBack', {data})      
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>