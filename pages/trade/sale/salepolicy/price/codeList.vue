<template lang="pug">
.content
  button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
  edit-table(ref="editTable", :loading="loading", :tableValue="tableValue", @rowSelection="handleSelectionChange")
  sdp-goods-detail-win(
    v-if="sdpGoodsWinShow", 
    :queryParam="goodsParam", 
    :parentRef="$refs.editTable.$refs.basicEditable", 
    :uniqueField="'goodsCodebill'",
    @close="sdpGoodsWinShow=false", 
    @sure="sdpGoodsCellBack"
  )
</template>
<script>
import buttonGroup from '@/components/buttonGroup.vue'
import editTable from '@/components/editTable'
import sdpGoodsDetailWin from '@/components/queryReport/sdpGoodsDetail'
export default {
  components: {
    sdpGoodsDetailWin,
    editTable,
    buttonGroup
  },
  props: {
    mainForm: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      goodsParam: {},
      loading: false,
      sdpGoodsWinShow: false,
      buttonGroupInfo: [
        {lbl: '现货码单', type: 'goods', icon: 'el-icon-document'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
      ],
      tableValue: {        
        hasCbx: false,
        pageShow: false,
        showRowIndex: true,
        showSummary: true,
        tableHeight: '650px',
        validRules: {
          pricesetCodeMakeprice: [{ required: true, message: '必填项' }],
          pricesetCodeAsprice: [{ required: true, message: '必填项' }],
          pricesetCodePrefprice: [{ required: true, message: '必填项' }],
          pricesetCodeInsideprice: [{ required: true, message: '必填项' }],
          pricesetCodeHangprice: [{ required: true, message: '必填项' }]
        },
        // adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
				// priceMoneyComputerColumn: {goodsInprice:'goodsBinprice'},
        tableHead: [
          {lbl: '品名', prop: 'partsnameName', width: '150px', noedit: true},
          {lbl: '规格', prop: 'goodsSpec', width: '150px', noedit: true},
          {lbl: '材质', prop: 'goodsMaterial', width: '150px', noedit: true},
          {lbl: '产地', prop: 'productareaName', width: '150px', noedit: true},
          {lbl: '仓库', prop: 'warehouseName', width: '150px', noedit: true},
          {lbl: '货权机构', prop: 'goodsOrgName', width: '150px', noedit: true},
          {lbl: '数量', prop: 'goodsNum', summary: true, g_type: 'num', noedit: true},
          {lbl: '重量', prop: 'goodsWeight', summary: true, g_type: 'weight', noedit: true},
          {lbl: '可供数量', prop: 'goodsSupplynum', summary: true, g_type: 'num', noedit: true},
          {lbl: '可供重量', prop: 'goodsSupplyweight', summary: true, g_type: 'weight', noedit: true},
          {lbl: '销售定价', prop: 'pricesetCodeMakeprice', g_type: 'price', editChange: this.priceChange},
          {lbl: '销售底价', prop: 'pricesetCodeBaseprice', g_type: 'price', noedit: true},
          {lbl: '考核价', prop: 'pricesetCodeAsprice', g_type: 'price'},
          {lbl: '可让价', prop: 'pricesetCodePrefprice', g_type: 'price', editChange: this.priceChange},
          {lbl: '内部价', prop: 'pricesetCodeInsideprice', g_type: 'price'},
          {lbl: '挂牌价', prop: 'pricesetCodeHangprice', g_type: 'price'},
          {lbl: '车皮号', prop: 'goodsContractstr2', noedit: true},
          {lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true},
          {lbl: '长度', prop: 'goodsProperty1', noedit: true},
          {lbl: '米重', prop: 'goodsProperty2', noedit: true},
          {lbl: '重量范围', prop: 'goodsProperty4', noedit: true},
          {lbl: '公差范围', prop: 'goodsProperty5', noedit: true},   
          {lbl: '件支数', prop: 'goodsPartsbranch', noedit: true}
        ],
        hiddenProp: {
          // 新增tableValue.tableData时使用
        },
        tableData: []
      },
      rowSelection: [],
      codeTable: null
    }
  },
  mounted () {    
    this.$nextTick(() => {
      this.codeTable = this.$refs.editTable.$refs.basicEditable      
      this.queryParams = {
        pricesetBillcode: this.mainForm.pricesetBillcode,
        billtypeCode: this.mainForm.billtypeCode,
        feeOptcode: this.mainForm.pricesetBillcode,
        feeBilltype: this.mainForm.billtypeCode,
        page:1,
        start:0,
        limit:25
      } 
      this.getCode()
    })
  },
  methods: {
    priceChange ({row}) {
      if (row.pricesetCodeMakeprice >= row.pricesetCodePrefprice) {
        row.pricesetCodeBaseprice = row.pricesetCodeMakeprice - row.pricesetCodePrefprice
      }
    },
    sdpGoodsCellBack ({data}) {
      const goodsList = []
      Array.from(data).map(item => {
        item.dataFlag = 0
        item.pricesetCodeMakeprice = item.pricesetMakeprice
        item.pricesetCodeBaseprice = item.pricesetBaseprice
        item.pricesetCodeAsprice = item.pricesetAsprice
        item.pricesetCodePrefprice = item.pricesetPrefprice
        item.pricesetCodeInsideprice = item.pricesetInsideprice
        item.pricesetCodeHangprice = item.pricesetHangprice
        goodsList.push(item)
      })
      this.codeTable.insertAt(goodsList, -1)
      this.codeTable.updateFooter()
      this.sdpGoodsWinShow = false
      this.$emit('codeAdd', {codeTable: this.codeTable, fullData: this.codeTable.getTableData().fullData})
    },
    buttonGroupClick (type) {
      switch(type) {
        case 'goods':
          if (!this.mainForm.pntreeName) {
            this.$message.error('请选择品名大类')
            return false
          }
          this.goodsParam.pntreeName = this.mainForm.pntreeName
          this.sdpGoodsWinShow = true
          break
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }          
          this.codeTable.remove(this.rowSelection[0])
          if (this.codeTable.getTableData().fullData.length === 0) {
            this.formDisabled = false
          }
          this.codeTable.updateFooter()
          this.rowSelection = []
          this.$emit('codeDel', {codeTable: this.codeTable, fullData: this.codeTable.getTableData().fullData})
          break
        default:
          break
      }      
    },
    handleSelectionChange (row) {
      this.rowSelection = [row]
    },
    async getCode () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/salePriceplanAjax!queryCode.do', 'post', this.queryParams)
        console.log(data)
        this.tableValue.tableData = data.codeList
        // this.formDisabled = true
        this.loading = false
      } catch (e) {
        this.loading = false
        console.error('error', e)
      }
    },
    save () {
      const partsnameNamesList = []
      this.codeTable.getTableData().fullData.map(item => {
        partsnameNamesList.push(item.partsnameName)        
      })

      const removeRecords = []      
      if (this.codeTable.getRemoveRecords().length> 0) {            
        this.codeTable.getRemoveRecords().map((item) => {
          item.dataFlag = 2
          removeRecords.push(item)
        })
      }          
      const updateRecords = this.codeTable.getUpdateRecords()
      const insertRecords = this.codeTable.getInsertRecords()
      const codeList = [...insertRecords, ...updateRecords, ...removeRecords]
      return {codeList: codeList, partsnameNamesList: partsnameNamesList}
    }
  }
}
</script>