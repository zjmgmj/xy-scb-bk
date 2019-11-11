<template lang="pug">  
  detail-win(:config="config", :searchFormItems="searchForm", :likeCol="likeCol", :tableValue="tableValue", :checkMethod="checkMethod ? checkMethod : defaultCheckMethod", @close="close", @sure="sure")
</template>

<script>
  import detailWin from '@/components/detailWin'

  export default {
    name: 'SdpGoodsDetail',
    componentName: 'SdpGoodsDetail',
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
      parentRef: {
        type: Object,
        default: () => {
          return {}
        }
      },
      title: {
        type: String,
        default: '现货物资明细'
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
    data() {
      return {
        likeCol: ['partsnameName', 'goodsMaterial', 'goodsSpec', 'productareaName', 'goodsRemark'],
        searchForm: [
          { lbl: '品名', prop: 'partsnameName', val: '', type: 'goods', useName: true, disabled: false },
          { lbl: '材质', prop: 'goodsMaterial', val: '', type: 'material', disabled: false },
          { lbl: '规格', prop: 'goodsSpec', val: '', type: 'spec', disabled: false },
          { lbl: '产地', prop: 'productareaName', val: '', type: 'area', useName: true, disabled: false },
          { lbl: '货权机构', prop: 'goodsOrg', val: '', type: 'org', disabled: false },
          { lbl: '货权部门', prop: 'goodsDept', val: '', type: 'dept', disabled: false },
          { lbl: '仓库', prop: 'warehouseCode', val: '', type: 'warehouse', disabled: false },
          { lbl: '供货单位', prop: 'datasBalcorp', val: '', type: 'company', disabled: false },
          { lbl: '备注', prop: 'goodsRemark', val: '', disabled: false },
          { lbl: '汇总批号', prop: 'sumgoodsBatch', val: '', type: 'hidden', disabled: false },
          { lbl: '', prop: 'pntreeName', val: '', type: 'hidden', disabled: false }
        ],
        tableValue: {
          selection: true,
          pageination: true,
          tableHeight: '100%',
          tableHead: [
            { lbl: '品名', prop: 'partsnameName', width: '100px' },
            { lbl: '材质', prop: 'goodsMaterial', width: '100px' },
            { lbl: '规格', prop: 'goodsSpec', width: '140px' },
            { lbl: '产地', prop: 'productareaName', width: '90px' },
            { lbl: '仓库', prop: 'warehouseName', width: '110px' },
            { lbl: '货权机构', prop: 'goodsOrgName', width: '110px' },
            { lbl: '货权部门', prop: 'goodsDeptName', width: '110px' },
            { lbl: '可卖数量', prop: 'goodsSupplynum', width: '70px', g_type: 'num' },
            { lbl: '可卖重量', prop: 'goodsSupplyweight', width: '100px', g_type: 'weight' },
            { lbl: '实物数量', prop: 'goodsNum', width: '70px', g_type: 'num' },
            { lbl: '实物重量', prop: 'goodsWeight', width: '100px', g_type: 'weight' },
            { lbl: '总锁定数量', prop: 'goodsSlocknum', width: '80px', g_type: 'num' },
            { lbl: '总锁定重量', prop: 'goodsSlockweight', width: '100px', g_type: 'weight' },
            { lbl: '数量单位', prop: 'partsnameNumunit', width: '70px' },
            { lbl: '重量单位', prop: 'partsnameWeightunit', width: '70px' },
            { lbl: '订货数量', prop: 'goodsOrdnum', width: '70px', g_type: 'num' },
            { lbl: '订货重量', prop: 'goodsOrdweight', width: '100px', g_type: 'weight' },
            { lbl: '提单数量', prop: 'goodsBillnum', width: '70px', g_type: 'num' },
            { lbl: '提单重量', prop: 'goodsBillweight', width: '100px', g_type: 'weight' },
            { lbl: '加工数量', prop: 'goodsMacnum', width: '70px', g_type: 'num' },
            { lbl: '加工重量', prop: 'goodsMacweight', width: '100px', g_type: 'weight' },
            { lbl: '调出数量', prop: 'goodsMonum', width: '70px', g_type: 'num' },
            { lbl: '调出重量', prop: 'goodsMoweight', width: '100px', g_type: 'weight' },
            { lbl: '挂牌数量', prop: 'goodsHangnum', width: '70px', g_type: 'num' },
            { lbl: '挂牌重量', prop: 'goodsHangweight', width: '100px', g_type: 'weight' },
            { lbl: '供货单位', prop: 'datasBalcorpname', width: '210px' },
            {
              lbl: '进货日期', prop: 'goodsDate', width: '90px', formatter: ({ cellValue }) => {
                return this.toDateString(cellValue, 'yyyy-MM-dd')
              }
            },
            { lbl: '计量方式', prop: 'goodsMetering', width: '80px' },
            { lbl: '销售定价', prop: 'pricesetMakeprice', width: '80px', g_type: 'price' },
            { lbl: '内部价', prop: 'pricesetInsideprice', width: '80px', g_type: 'price' },
            { lbl: '件支数', prop: 'goodsPartsbranch' },
            { lbl: '车皮号', prop: 'goodsContractstr2' },
            { lbl: '入库批号', prop: 'goodsEntrystr1' },
            { lbl: '期货原货主代码', prop: 'goodsEntrystr4' },
            { lbl: '期货原货主名称', prop: 'goodsEntrystr5' },
            { lbl: '库位', prop: 'goodsCodestr1' },
            { lbl: '捆包号', prop: 'goodsCodestr2' },
            { lbl: '炉批号', prop: 'goodsCodestr3' },
            { lbl: '仓储号', prop: 'goodsCodestr4' },
            { lbl: '件编号', prop: 'goodsCodestr5' },
            { lbl: '库区', prop: 'goodsCodestr10' },
            { lbl: '备注', prop: 'goodsRemark', width: '160px' }
          ],
          tableData: []
        }
      }
    },
    computed: {
      config() {
        return {
          queryBean: 'queryBean',
          title: this.title,
          urlApi: 'scscm/app/sdpGoodsReportAjax.do'
        }
      }
    },
    created() {
      Object.keys(this.queryParam).forEach(key => {
        this.searchForm.filter(x => x.prop === key).forEach(x => {
          debugger
          x.val = this.queryParam[key]
          x.disabled = true
        })
      })
    },
    methods: {
      defaultCheckMethod ({row}) {
        const fullData = this.parentRef.getTableData().fullData
        if (fullData.length > 0) {
          const findObj = fullData.find(item => {
            return row[this.uniqueField] === item[this.uniqueField]  
          })
          if (findObj) return false          
        }
        return true  
      },
      close() {
        this.$emit('close')
      },
      sure(obj) {
        this.$emit('sure', obj)
      }
    }
  }
</script>

<style scoped>

</style>
