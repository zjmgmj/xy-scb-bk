<template lang="pug">
.content
  detail-win(    
    :config="config", 
    :searchFormItems="searchForm"
    :tableValue="tableValue",
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
    queryParam: {
      type: Object,
      default: () => {
        return {}
      }
    },
    mainForm: {
      type: Object,
      default: () => {
        return {}
      }
    },
    title: {
      type: String,
      default: '期货物资明细'
    }
  },
  data () {
    return {
      config: {
        title: this.title,
        queryBean: 'futuresBean',
        listProp: 'futuresList',
        urlApi: 'scscm/app/scontractEnrollAjax!queryFutures.do'
      },
      likeCol: ['optBillcode'], 
      searchForm: [
        {lbl: '起始日期', prop: 'startDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
        {lbl: '结束日期', prop: 'endDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
        {lbl: '单据号', prop: 'optBillcode', val: ''},
        {lbl: '单据类型', prop: 'billtypeCode', val: '', type:"billtype", typeStr:'P002,P003,P004'},
        {lbl: '结算单位', prop: 'datasBalcorp', val: '', type:"company"},
        {lbl: '品名', prop: 'partsnameName', val: '', type:"goods"},
        {lbl: '材质', prop: 'goodsMaterial', val: '', type:"material"},
        {lbl: '规格', prop: 'goodsSpec', val: '', type:"spec"},
        {lbl: '产地', prop: 'productareaName', val: '', type:"area"},
        {lbl: '业务机构', prop: 'orgCode', val: '', type:"org"},
        {lbl: '业务部门', prop: 'deptCode', val: '', type:"dept"},
        {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee"},
        {lbl: '制单人', prop: 'operatorCode', val: '', type:"operator"}
      ],  
      tableValue: {
        selection: true,
        pageination: true,
        tableHeight: '100%',
        tableHead: [
          {lbl: '单据类型', prop: 'optType'},
          {lbl: '单据号', prop: 'optBillcode', width: '150px'},
          {lbl: '日期', prop: 'optDate', formatter: ({cellValue}) => {
            return this.toDateString(cellValue, 'yyyy-MM-dd')
          }},
          {lbl: '结算单位', prop: 'datasBalcorpname', width: '150px'}, 
          {lbl: '未执行数量', prop: 'goodsNoknum', g_type:'num'},
          {lbl: '未执行重量', prop: 'goodsNokweight', g_type:'weight'},                  
          {lbl: '品名', prop: 'partsnameName'},
          {lbl: '规格', prop: 'goodsSpec'},
          {lbl: '材质', prop: 'goodsMaterial'},          
          {lbl: '产地', prop: 'productareaName'},
          {lbl: '长度', prop: 'goodsProperty1'},
          {lbl: '米重', prop: 'goodsProperty2'},
          {lbl: '重量范围', prop: 'goodsProperty4'},
          {lbl: '公差范围', prop: 'goodsProperty5'},
          {lbl: '数量', prop: 'goodsNum', g_type:'num'},
          {lbl: '重量', prop: 'goodsWeight', g_type:'weight'},
          {lbl: '执行数量', prop: 'goodsOknum', g_type:'num'},
          {lbl: '执行重量', prop: 'goodsOkweight', g_type:'weight'},
          {lbl: '数量单位', prop: 'partsnameNumunit'},
          {lbl: '重量单位', prop: 'partsnameWeightunit'},
          {lbl: '供货单位', prop: 'datasSuppliername'},
          {lbl: '业务机构', prop: 'orgName'},
          {lbl: '业务部门', prop: 'deptName'},
          {lbl: '业务员', prop: 'employeeName'},
          {lbl: '计量方式', prop: 'goodsMetering'},
          {lbl: '件支数', prop: 'goodsPartsbranch'},
          {lbl: '车皮号', prop: 'goodsContractstr2'},
          {lbl: '入库批号', prop: 'goodsEntrystr1'},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4'},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5'},
          {lbl: '备注', prop: 'optDetailRemark'},
          {lbl: '单据批号', prop: 'optBillbatch'},
          {lbl: '业务单号', prop: 'optOpbillcode'}
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
        x.disabled = true
      })
    })
  },
  methods: {
    cellBack({data}) {    
      this.$emit('cellBack', {data})      
    },
    close () {
      this.$emit('close')
    }
  }
}
</script>