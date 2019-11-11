<template lang="pug">
.content
  detail-win(    
    :config="config", 
    :likeCol="likeCol",
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
        urlApi: 'scscm/app/purchaseContractEnrollAjax!queryReport.do'
      },
      likeCol: ['planBillcode', 'planDetailRemark'], 
      searchForm: [],  
      tableValue: {
        selection: true,
        pageination: true,
        tableHeight: '100%',
        tableHead: [
          {lbl: '日期', prop: 'contractDate', formatter: ({cellValue}) => {
            return this.toDateString(cellValue, 'yyyy-MM-dd')
          }},
          {lbl: '结算单位', prop: 'datasBalcorpname', width: '150'},
          {lbl: '品名', prop: 'partsnameName'},
          {lbl: '规格', prop: 'goodsSpec'},
          {lbl: '材质', prop: 'goodsMaterial'},              
          {lbl: '产地', prop: 'productareaName'},
          {lbl: '长度', prop: 'goodsProperty1'},
          {lbl: '米重', prop: 'goodsProperty2'},
          {lbl: '重量范围', prop: 'goodsProperty4'},
          {lbl: '公差范围', prop: 'goodsProperty5'},
          {lbl: '未执行数量', prop: 'noDetailNum'},
          {lbl: '未执行重量', prop: 'noDetailWeight'},
          {lbl: '数量', prop: 'goodsNum', summary: true, g_type: 'num'},
          {lbl: '重量', prop: 'goodsWeight', summary: true, g_type: 'weight'},
          {lbl: '含税单价', prop: 'goodsInprice', g_type: 'price'},
          {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money'},
          {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
          {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
          {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},            
          {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money'},   
          {lbl: '供货单位', prop: 'datasSuppliername', width: '130px'}, 
          {lbl: '合同月份', prop: 'contractMonth', formatter: ({cellValue}) => {
            return this.toDateString(cellValue, 'yyyy-MM')
          }}, 
          {lbl: '合同批次', prop: 'contractOtherbatch'}, 
          {lbl: '类型', prop: 'contractClass', width: '120px', formatter: ({cellValue}) => {
            const obj = { '0': '甲', '1': '乙', '2': '丙' }
            return obj[cellValue]
          }},
          {lbl: '数量单位', prop: 'partsnameNumunit'},
          {lbl: '重量单位', prop: 'partsnameWeightunit'},
          {lbl: '费用单价', prop: 'goodsInfeeprice', summary: true, g_type: 'num'},
          {lbl: '费用金额', prop: 'goodsInfeemoney', summary: true, g_type: 'weight'},
          {lbl: '计价方式', prop: 'partsnamePriceun', formatter: ({cellValue}) => {
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
          {lbl: '起运港/地', prop: 'ddTypeStartarea'},
          {lbl: '到站港/地', prop: 'ddTypeDestination'},
          {lbl: '专用线', prop: 'ddTypeSpecialline'},
          {lbl: '中专港', prop: 'ddTypeTransferport'},
          {lbl: '业务机构', prop: 'orgName'},
          {lbl: '业务部门', prop: 'deptName'},
          {lbl: '业务员', prop: 'employeeName'},
          {lbl: '制单人', prop: 'operatorName'},
          {lbl: '备注', prop: 'planDetailRemark'},
          {lbl: '销售合同号', prop: 'scontractBillcode'}
        ],
        tableData: []
      },
      copyForm: {}
    }
  },
  created() {
    this.copyForm = this.extend(true, this.mainForm)
    const datasBalcorpDisabled = this.copyForm.datasSupplier !== ''
    this.searchForm = [
      {lbl: '起始日期', prop: 'startDate', val: this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
      {lbl: '结束日期', prop: 'endDate', val: this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
      {lbl: '合同号', prop: 'goodsContract', val: ''},
      {lbl: '结算单位', prop: 'datasBalcorp', typeStr: 'GYS', val: this.copyForm.datasSupplier, type:"company", disabled: datasBalcorpDisabled},
      {lbl: '供货单位', prop: 'datasSupplier', typeStr: 'GYS', val: this.copyForm.datasSupplier, type:"company", disabled: datasBalcorpDisabled},
      {lbl: '业务机构', prop: 'orgCode', val: this.copyForm.orgCode, type:"org", disabled: true},
      {lbl: '业务部门', prop: 'deptCode', val: this.copyForm.deptCode, type:"dept", disabled: true},
      {lbl: '品名', prop: 'scontractDetailPartsname', val: '', type:"goods"},
      {lbl: '材质', prop: 'scontractDetailMaterial', val: '', type:"material"},
      {lbl: '规格', prop: 'scontractDetailSpec', val: '', type:"spec"},
      {lbl: '产地', prop: 'productareaName', val: '', type:"area"},
      {lbl: '备注', prop: 'planRemark', val: ''},
      {lbl: '未执行量', prop: 'noCompleteflag', val: 1, type: 'select', 
        list: [
          {label: '全部', value: ''},
          {label: '小于等于0', value: 0},
          {label: '大于0', value: 1}
          ]
        }
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