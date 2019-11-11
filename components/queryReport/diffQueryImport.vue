<template lang="pug">
.content
  detail-win(    
    :config="config", 
    :searchFormItems="searchForm"
    :tableValue="tableValue",
    :likeCol="likeCol",
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
    title: {
      type: String,
      default: '未完成业务明细'
    }
  },
  data () {
    return {
      config: {
        title: this.title,
        listProp: 'importList',
        queryBean: 'detailBean',
        urlApi: 'scscm/app/diffAjax!queryImport.do'
      },
      likeCol: ['opBillcode', 'opDetailRemark'], 
      searchForm: [],  
      tableValue: {
        selection: true,
        pageination: true,
        tableHeight: '100%',
        tableHead: [
          {lbl: '单据号', prop: 'opBillcode', width: '150px'},
          {lbl: '日期', prop: 'opDate', formatter: ({cellValue}) => {
            return this.toDateString(cellValue, 'yyyy-MM-dd')
          }},
          {lbl: '结算单位', prop: 'datasBalcorpname', width: '150'},
          {lbl: '品名', prop: 'partsnameName'},
          {lbl: '材质', prop: 'goodsMaterial'},     
          {lbl: '规格', prop: 'goodsSpec'},                   
          {lbl: '产地', prop: 'productareaName'},
          {lbl: '长度', prop: 'goodsProperty1'},
          {lbl: '米重', prop: 'goodsProperty2'},
          {lbl: '重量范围', prop: 'goodsProperty4'},
          {lbl: '公差范围', prop: 'goodsProperty5'},
          {lbl: '数量', prop: 'goodsNum', summary: true, g_type: 'num'},
          {lbl: '重量', prop: 'goodsWeight', summary: true, g_type: 'weight'},
          {lbl: '数量单位', prop: 'partsnameNumunit'},
          {lbl: '重量单位', prop: 'partsnameWeightunit'},
          {lbl: '含税单价', prop: 'goodsInprice', g_type: 'price'},
          {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money'},
          {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
          {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
          {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},            
          {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money'},   
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
          {lbl: '备注', prop: 'planDetailRemark'},
          {lbl: '业务单号', prop: 'scontractBillcode'}
        ],
        tableData: []
      },
      copyForm: {}
    }
  },
  created() {
    this.copyForm = this.extend(true, this.mainForm)
    // const datasBalcorpDisabled = 
    this.searchForm = [      
      {lbl: '起始日期', prop: 'startDate', val: this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
      {lbl: '结束日期', prop: 'endDate', val: this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
      {lbl: '单据号', prop: 'opBillcode', val: ''},
      {lbl: '单据类型', prop: 'billtypeCode', val: '', type: 'billtype', typeStr: 'P003,W002,W034,W021'},
      {lbl: '结算单位', prop: 'datasBalcorp', typeStr: 'GYS', val: this.copyForm.datasBalcorp, type:"company"},
      {lbl: '品名', prop: 'scontractDetailPartsname', val: '', type:"goods"},
      {lbl: '材质', prop: 'scontractDetailMaterial', val: '', type:"material"},
      {lbl: '规格', prop: 'scontractDetailSpec', val: '', type:"spec"},
      {lbl: '产地', prop: 'productareaName', val: '', type:"area"},      
      {lbl: '业务机构', prop: 'orgCode', val: this.copyForm.orgCode, type:"org", disabled: true},
      {lbl: '业务部门', prop: 'deptCode', val: this.copyForm.deptCode, type:"dept", disabled: true},
      {lbl: '备注', prop: 'opDetailRemark', val: ''}
    ]
  },
  methods: {
    cellBack({data}) {    
      this.$emit('cellBack', data)      
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>