<template lang="pug">
.content
  detail-win(    
    :config="config", 
    :searchFormItems="searchForm"
    :tableValue="tableValue",
    :checkMethod="checkMethod ? checkMethod : defaultCheckMethod",
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
    queryParam: {
      type: Object,
      default: () => {
        return {}
      }
    },
    parentRef: {
      type: Object,
      default: () => {
        return {}
      }
    },  
    title: {
      type: String,
      default: '现货物资汇总'
    },
    checkMethod: {
      type: Function,
      default: undefined
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
        listProp: 'reportSumList',
        queryBean: 'querySumBean',
        urlApi: 'scscm/app/sdpGoodsReportAjax!querySumImportlist.do'
      },
      // likeCol: ['consignBillcode', 'consignDetailRemark'], 
      searchForm: [
        {lbl: '品名', prop: 'partsnameName', val: '', type:"goods", disabled: false},
        {lbl: '材质', prop: 'goodsMaterial', val: '', type:"material", disabled: false},
        {lbl: '规格', prop: 'goodsSpec', val: '', type:"spec", disabled: false},
        {lbl: '产地', prop: 'productareaName', val: '', type:"area", disabled: false},
        {lbl: '货权机构', prop: 'goodsOrg', val: '', type:"org", disabled: false},
        {lbl: '货权部门', prop: 'goodsDept', val: '', type:"dept", disabled: false},
        {lbl: '仓库', prop: 'warehouseCode', val: '', type:"warehouse", disabled: false},
        {lbl: '', prop: 'pntreeName', val: '', type: 'hidden', disabled: false}
      ],  
      tableValue: {
        selection: true,
        pageination: true,
        tableHeight: '100%',
        tableHead: [
          {lbl: '品名', prop: 'partsnameName'},
          {lbl: '材质', prop: 'goodsMaterial'},     
          {lbl: '规格', prop: 'goodsSpec'},                   
          {lbl: '产地', prop: 'productareaName'},
          {lbl: '仓库', prop: 'warehouseName'},
          {lbl: '货权机构', prop: 'goodsOrgName'},
          {lbl: '货权部门', prop: 'goodsDeptName'},
          {lbl: '可卖数量', prop: 'goodsSupplynum'},
          {lbl: '可卖重量', prop: 'goodsSupplyweight'},          
          {lbl: '实物数量', prop: 'goodsNum', summary: true, g_type: 'num'},
          {lbl: '实物重量', prop: 'goodsWeight', summary: true, g_type: 'weight'},
          {lbl: '总锁定数量', prop: 'goodsSlocknum', summary: true, g_type: 'num'},
          {lbl: '总锁定重量', prop: 'goodsSlockweight', summary: true, g_type: 'weight'},
          {lbl: '数量单位', prop: 'partsnameNumunit'},
          {lbl: '重量单位', prop: 'partsnameWeightunit'},
          {lbl: '订货数量', prop: 'goodsOrdnum', summary: true, g_type: 'num'},
          {lbl: '订货重量', prop: 'goodsOrdweight', summary: true, g_type: 'weight'},
          {lbl: '提单数量', prop: 'goodsBillnum', summary: true, g_type: 'num'},
          {lbl: '提单重量', prop: 'goodsBillweight', summary: true, g_type: 'weight'},
          {lbl: '加工数量', prop: 'goodsMacnum', summary: true, g_type: 'num'},
          {lbl: '加工重量', prop: 'goodsMacweight', summary: true, g_type: 'weight'},
          {lbl: '调出数量', prop: 'goodsMonum', summary: true, g_type: 'num'},
          {lbl: '调出重量', prop: 'goodsMoweight', summary: true, g_type: 'weight'},
          {lbl: '挂牌数量', prop: 'goodsHangnum', summary: true, g_type: 'num'},
          {lbl: '挂牌重量', prop: 'goodsHangweight', summary: true, g_type: 'weight'},
          {lbl: '计量方式', prop: 'goodsMetering'},          
          {lbl: '销售定价', prop: 'pricesetMakeprice', summary: true, g_type: 'price'},
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
    defaultCheckMethod ({row}) {
      if (this.uniqueField) {
        const fullData = this.parentRef.getTableData().fullData
        if (fullData.length > 0) {
          const findObj = fullData.find(item => {
            return row[this.uniqueField] === item[this.uniqueField]  
          })
          if (findObj) return false          
        }
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