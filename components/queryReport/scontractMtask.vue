<template lang="pug">
  detail-win(:config="config", :searchFormItems="searchForm", :likeCol="likeCol", :tableValue="tableValue", :checkMethod="checkMethod", @close="close", @sure="sure")
</template>

<script>
  import detailWin from '@/components/detailWin'

  export default {
    name: 'ScontractMtask',
    componentName: 'ScontractMtask',
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
      title: {
        type: String,
        default: '现货销售加工列表'
      },
      checkMethod: {
        type: Function,
        default: undefined
      }
    },
    data() {
      return {
        likeCol: ['scontractBillcode', 'mtaskDetailsRemark'],
        searchForm: [
          { lbl: '起始日期', prop: 'startDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm' },
          { lbl: '结束日期', prop: 'endDate', val: '', type: 'datetime', format: 'yyyy-MM-dd HH:mm' },
          { lbl: '单据号', prop: 'scontractBillcode', val: '', disabled: false },
          { lbl: '仓库', prop: 'warehouseCode', val: '', type: 'warehouse', disabled: false },
          { lbl: '货权机构', prop: 'goodsOrg', val: '', type: 'org', disabled: false },
          { lbl: '结算单位', prop: 'datasCustomername', val: '', type: 'company', typeStr: 'KH', disabled: false },
          { lbl: '品名', prop: 'partsnameName', val: '', type: 'goods', useName: true, disabled: false },
          { lbl: '材质', prop: 'goodsMaterial', val: '', type: 'material', disabled: false },
          { lbl: '规格', prop: 'goodsSpec', val: '', type: 'spec', disabled: false },
          { lbl: '产地', prop: 'productareaName', val: '', type: 'area', useName: true, disabled: false },
          { lbl: '备注', prop: 'mtaskDetailsRemark', val: '', disabled: false },
          { lbl: '', prop: 'scontractMtaskMac', val: 1, type: 'hidden', disabled: false },
          { lbl: '', prop: 'scontractDetailType', val: '01', type: 'hidden', disabled: false },
          { lbl: '', prop: 'mtaskDetailsClassFlag', val: 0, type: 'hidden', disabled: false }
        ],
        tableValue: {
          selection: true,
          pageination: true,
          tableHeight: '100%',
          tableHead: [
            { lbl: '单据号', prop: 'scontractBillcode', width: '160px' },
            {
              lbl: '日期', prop: 'scontractMtaskDate', width: '90px', formatter: ({ cellValue }) => {
                return this.toDateString(cellValue, 'yyyy-MM-dd')
              }
            },
            { lbl: '仓库', prop: 'warehouseName', width: '110px' },
            { lbl: '货权机构', prop: 'goodsOrgStr', width: '110px' },
            { lbl: '品名', prop: 'partsnameName', width: '100px' },
            { lbl: '材质', prop: 'goodsMaterial', width: '100px' },
            { lbl: '规格', prop: 'goodsSpec', width: '140px' },
            { lbl: '产地', prop: 'productareaName', width: '90px' },
            { lbl: '数量', prop: 'goodsNum', width: '60px', g_type: 'num' },
            { lbl: '重量', prop: 'goodsWeight', width: '100px', g_type: 'weight' },
            { lbl: '加工数量', prop: 'mtaskDetailsNum', width: '70px', g_type: 'num' },
            { lbl: '加工重量', prop: 'mtaskDetailsWeight', width: '100px', g_type: 'weight' },
            { lbl: '未加工数量', prop: 'mtaskDetailsNnum', width: '80px', g_type: 'num' },
            { lbl: '未加工重量', prop: 'mtaskDetailsNweight', width: '100px', g_type: 'weight' },
            { lbl: '数量单位', prop: 'partsnameNumunit', width: '70px' },
            { lbl: '重量单位', prop: 'partsnameWeightunit', width: '70px' },
            { lbl: '计量方式', prop: 'goodsMetering', width: '80px' },
            { lbl: '件支数', prop: 'goodsPartsbranch' },
            { lbl: '车皮号', prop: 'goodsContractstr2' },
            { lbl: '入库批号', prop: 'goodsEntrystr1' },
            { lbl: '期货原货主代码', prop: 'goodsEntrystr4' },
            { lbl: '期货原货主名称', prop: 'goodsEntrystr5' },
            { lbl: '购货单位', prop: 'datasCustomername', width: '160px' },
            { lbl: '加工业务', prop: 'scontractMtaskMacStr', width: '80px' },
            { lbl: '备注', prop: 'mtaskDetailsRemark', width: '160px' }
          ],
          tableData: []
        }
      }
    },
    computed: {
      config() {
        return {
          queryBean: 'codeBean',
          listProp: 'mtaskReportList',
          title: this.title,
          urlApi: 'scscm/app/scontractEnrollAjax!queryMtaskReport.do',
          extraParam: {
            'detailBean.report': false,
            'detailBean.goodsFlag': false,
            sort: '[{"property":"scontractBillcode","direction":"ASC"}]'
          }
        }
      }
    },
    created() {
      this.searchForm[0].val = this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm')
      this.searchForm[1].val = this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm')
      Object.keys(this.queryParam).forEach(key => {
        this.searchForm.filter(x => x.prop === key).forEach(x => {
          x.val = this.queryParam[key]
          x.disabled = true
        })
      })
    },
    methods: {
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
