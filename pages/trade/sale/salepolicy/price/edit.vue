<template lang="pug">
  el-dialog(title="销售定价方案登记", :visible="true", width="1600px", fullscreen, @close="close")
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="单据号", prop="pricesetBillcode")
            el-input.full-width(v-model="copyForm.pricesetBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="日期", prop="pricesetDate")
            el-date-picker.full-width(v-model="copyForm.pricesetDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="品名大类", prop="pntreeName")
            pntree-partsname-select(v-model="copyForm.pntreeName", :disabled="formDisabled")                              
        el-col(:span="6")
          el-form-item(label="业务机构", prop="orgCode")
            org-select(v-model="copyForm.orgCode", @change="syncName($event, {orgName: 'orgName', orgAbbreviate: 'orgAbbreviate'})", :disabled="formDisabled")            
        el-col(:span="6")
          el-form-item(label="业务部门", prop="deptCode")
            dept-select(v-model="copyForm.deptCode", @change="syncName($event, {deptName: 'deptName'})", :disabled="formDisabled")        
        el-col(:span="6")
          el-form-item(label="业务员", prop="employeeCode")
            employee-select(v-model="copyForm.employeeCode", @change="syncName($event, {employeeName: 'employeeName'})")            
        el-col(:span="6")
          el-form-item(label="制单人", prop="operatorName")
            el-input.full-width(v-model="copyForm.operatorName", clearable, size="mini", disabled)        
        el-col(:span="6")
          el-form-item(label="备注", prop="priceplanRemark")
            el-input.full-width(v-model="copyForm.priceplanRemark", clearable, size="mini")    
    .mt-10.edit
      el-tabs(v-model="activeTab" type="border-card" @tab-click="tabChange", size="mini")
        el-tab-pane(label="定价明细" name="1")
          .pt-10.pb-10
            button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
            edit-table(ref="editTable", :loading="loading", :tableValue="tableValue", @rowEditInfo="cellEdit", @rowSelection="handleSelectionChange")
        //- el-tab-pane(label="辅助信息" name="2")
          clause-win(ref="clause", :clauseMod="clauseMod")
        el-tab-pane(label="码单明细" name="2")
          .pt-10.pb-10
            code-list(ref="codeTable", :mainForm="copyForm", @codeAdd="codeAdd", @codeDel="codeDel")          
    goods-win(v-if="goodsWinShow", :pntreeName="copyForm.pntreeName", @close="goodsWinShow = false", @sure="getGoodsWin")
    file-win(v-if="fileWinShow", @close="fileWinShow = false", :fileMod="fileMod", :table="tableValue.tableHead")
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod") 
    sdp-goods-win(v-if="sdpGoodsWinShow", :queryParam="goodsQueryParam", @close="sdpGoodsWinShow = false", @cellBack="goodsCellBack")
</template>
<script>
import { mapState } from 'vuex'
import codeList from './codeList'
import goodsWin from '@/components/goodsWin'
// import sdpfeeWin from '@/components/sdpfee'
import fileWin from '@/components/file'
import auditGlideView from '@/components/billtypeaudit'
import buttonGroup from '@/components/buttonGroup.vue'
import editTable from '@/components/editTable'
import sdpGoodsWin from '@/components/queryReport/sdpGoodsReport'

export default {
  components: {
    buttonGroup,
    editTable,
    fileWin,
    auditGlideView,
    // sdpfeeWin,
    sdpGoodsWin,
    goodsWin,
    codeList
  },
  props: {
    form: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      goodsQueryParam: {},
      sdpGoodsWinShow: false,
      // feeConfig: {
      //   otherParams:{billcode: 'pricesetBillcode', mainBackMoney:'dataInfeemoney', detailBackInprice:'goodsBinfeeprice', detailBackMoney:'goodsInfeemoney',feeBweight:'goodsWeight', feeOptbatch:'goodsEntrybatch'}        
      // },   
      activeTab: '1',
      auditGlideShow: false,
      fileWinShow: false,
      goodsWinShow: false,
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      loading: false,
      topButtonGroupInfo: [],
      buttonGroupInfo: [],
      tableValue: {        
        hasCbx: false,
        pageShow: false,
        showRowIndex: true,
        showSummary: true,
        tableHeight: '650px',
        validRules: {
          pricesetMakeprice: [{ required: true, message: '必填项' }],
          pricesetAsprice: [{ required: true, message: '必填项' }],
          pricesetPrefprice: [{ required: true, message: '必填项' }],
          pricesetInsideprice: [{ required: true, message: '必填项' }],
          pricesetHangprice: [{ required: true, message: '必填项' }]
        },
        // adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
				// priceMoneyComputerColumn: {goodsInprice:'goodsBinprice'},
        tableHead: [
          {lbl: '品名', prop: 'partsnameName', width: '150px', type: 'goods', props:{partsnameCode: 'partsnameCode', partsnameName: 'partsnameName', pntreeName:'pntreeName',industryCode:'industryCode',goodsPriceun:'goodsPriceun',goodsPiecemode:'goodsPiecemode',goodsWeightmode:'goodsWeightmode',goodsMetering:'goodsMetering',goodsProperty:'goodsProperty'}},
          {lbl: '规格', prop: 'goodsSpec', width: '150px', type: 'spec', props: {goodsSpec: 'goodsSpec'}},
          {lbl: '材质', prop: 'goodsMaterial', width: '150px', type: 'material', props: {goodsMaterial: 'goodsMaterial'}},
          {lbl: '产地', prop: 'productareaName', width: '150px', type: 'area', props: {productareaName: 'productareaName'}},
          {lbl: '仓库', prop: 'warehouseName', width: '150px', type: 'warehouse', props: {warehouseName: 'warehouseName', warehouseCode: 'warehouseCode'}},
          {lbl: '货权机构', prop: 'goodsOrgName', width: '150px', type: 'org', props: {goodsOrgName: 'orgAbbreviate', goodsOrg: 'orgCode'}},
          {lbl: '数量', prop: 'goodsNum', summary: true, g_type: 'num', noedit: true},
          {lbl: '重量', prop: 'goodsWeight', summary: true, g_type: 'weight', noedit: true},
          {lbl: '可供数量', prop: 'goodsSupplynum', summary: true, g_type: 'num', noedit: true},
          {lbl: '可供重量', prop: 'goodsSupplyweight', summary: true, g_type: 'weight', noedit: true},
          {lbl: '销售定价', prop: 'pricesetMakeprice', g_type: 'price', editChange: this.priceChange},
          {lbl: '销售底价', prop: 'pricesetBaseprice', g_type: 'price', noedit: true},
          {lbl: '考核价', prop: 'pricesetAsprice', g_type: 'price'},
          {lbl: '可让价', prop: 'pricesetPrefprice', g_type: 'price', editChange: this.priceChange},
          {lbl: '内部价', prop: 'pricesetInsideprice', g_type: 'price'},
          {lbl: '挂牌价', prop: 'pricesetHangprice', g_type: 'price'},
          {lbl: '车皮号', prop: 'goodsContractstr2', noedit: true},
          {lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true},
          {lbl: '长度', prop: 'goodsProperty1', noedit: true},
          {lbl: '米重', prop: 'goodsProperty2', noedit: true},
          {lbl: '重量范围', prop: 'goodsProperty4', noedit: true},
          {lbl: '公差范围', prop: 'goodsProperty5', noedit: true},   
          {lbl: '备注', prop: 'priceplanDetailRemark'}
        ],
        hiddenProp: {
          // 新增tableValue.tableData时使用
        },
        tableData: []
      },
      rowSelection: [],      
      delRow: [],
      rules: {
        pntreeName: [{ required: true }],
        pricesetDate: [{ required: true }],
        orgCode: [{ required: true }],
        deptCode: [{ required: true }],
        employeeCode: [{ required: true }]
      },
      copyForm: {},
      clauseMod: {},
      sdpfeeList: [],
      formDisabled: false,
      table: {},
      fileMod: {
        fileBilltype: '',
        fileOpcode: ''
      },
      mainMod: {},
      btnFlag: '',
      queryParams: {}
    }
  },  
  computed: {
    ...mapState({
      g_format: state => state.g_format
    })
  },
  created () {
    let isTrue = false
    if (!this.form.pricesetBillcode) isTrue = true
    this.topButtonGroupInfo = [
      {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},      
      {lbl: '现货汇总', type: 'sumGoods', icon: 'el-icon-document'},
      {lbl: '附件', type: 'file', icon: 'el-icon-files', disabled: isTrue},
      // {lbl: '打印', type: 'print', icon: 'el-icon-print'},
      {lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search', disabled: isTrue}
    ]
    this.buttonGroupInfo = [
      {lbl: '增加', type: 'add', icon: 'el-icon-plus'},
      {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
    ]    
  },
  beforeMount () {
    this.copyForm = this.extend(true, this.form)
  },
  mounted () {
    this.$nextTick(() => {           
      if (this.form.pricesetBillcode) {
        this.fileMod = {
          fileBilltype: this.copyForm.billtypeCode,
          fileOpcode: this.copyForm.pricesetBillcode
        }
        this.queryParams = {
          pricesetBillcode: this.copyForm.pricesetBillcode,
          billtypeCode: this.copyForm.billtypeCode,
          feeOptcode: this.copyForm.pricesetBillcode,
          feeBilltype: this.copyForm.billtypeCode,
          page:1,
          start:0,
          limit:25
        }     
        this.getMainMod()
        this.getDetail()        
      }
      this.table = this.$refs.editTable.$refs.basicEditable
    })
  },
  methods: {
    // priceEditChange (scope) {      
    //   const row = scope.row
    //   if (row.pricesetCodeMakeprice >= row.pricesetCodePrefprice) {
    //     row.pricesetCodeBaseprice = this.toNumber(row.pricesetCodeMakeprice) - this.toNumber(row.pricesetCodePrefprice)      
    //   }      
    // },
    goodsCellBack ({data}) {
      console.log(data)
      this.goodsWinShow = false
      const arr = []
      debugger
      this.toArray(data).map(item => {
        item.warehouseName = item.warehouseName || ''
        item.warehouseCode = item.warehouseCode || ''
        item.goodsOrgName = item.goodsOrgName || ''
        item.goodsOrg = item.goodsOrg || ''
        item.pricesetType = 0
        item.dataFlag = 0
        arr.push(item)
      })
      this.table.insertAt(arr, -1)
      this.sdpGoodsWinShow = false
      this.table.updateFooter()
      this.formDisabled = true   
    },
    codeAdd ({codeTable, fullData}) {
      if (fullData.length > 0) this.formDisabled = true
    },
    codeDel ({codeTable, fullData}) {
      const detailFullData = this.table.getTableData().fullData
      if (fullData.length === 0 && detailFullData.length === 0) this.formDisabled = false
    },
    priceChange ({row}) {
      if (row.pricesetMakeprice >= row.pricesetPrefprice) {
        row.pricesetBaseprice = row.pricesetMakeprice - row.pricesetPrefprice
      }
    },
    getGoodsWin (data) {
      // 定价明细新增
      if (data.length > 0) {
        this.goodsWinShow = false
        const arr = []
        data.map((item) => {
          item.pricesetType = 1
          item.warehouseName = item.warehouseName || ''
          item.warehouseCode = item.warehouseCode || ''
          item.goodsOrgName = item.goodsOrgName || ''
          item.goodsOrg = item.goodsOrg || ''
          item.dataFlag = 0
          arr.push(item)
        })
        this.table.insertAt(arr, -1)
        this.table.updateFooter()
        this.formDisabled = true
      }      
    },
    syncName(e, obj) {     
      Object.keys(obj).forEach((key) => {
        this.copyForm[key] = e[obj[key]]
      })
    },
    topButtonGroupClick (type) {
      switch (type) {
        case 'save':
          if (this.table.getTableData().fullData.length === 0) {
            this.$message.error('请增加明细！')
            return false
          }
          this.save()         
          break
        case 'sumGoods':
          if (!this.copyForm.pntreeName) {
            this.$message.error('请先选择品名大类')
            return false
          }
          this.goodsQueryParam = {
            pntreeName: this.copyForm.pntreeName
          }
          this.sdpGoodsWinShow = true
          break
        case 'file':
          this.fileWinShow = true
          console.log('------file')
          break
        case 'auditGlide':
          this.auditGlideShow = true
          console.log('------file')
          break
        default:
          break
      }
    },
    save () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          debugger
          const sameGoods = ['partsnameName', 'goodsMaterial', 'goodsSpec', 'productareaName', 'warehouseCode', 'goodsOrg', 'goodsRemark']
          const priceFullData = this.table.getTableData().fullData
          const priceGoods = []
          const partsnameNamesList = []
          // 定价明细
          const priceSameGoods = this.toArray(priceFullData).find(item => {
            const goods = []
            partsnameNamesList.push(item.partsnameName)
            sameGoods.forEach(key => {
              goods.push(item[key])
            })
            const goodsStr = goods.toString()
            if (priceGoods.indexOf(goodsStr) === -1) {
              priceGoods.push(goodsStr)
            } else {
              return priceGoods.indexOf(goodsStr) !== -1
            }            
          })
          if (priceSameGoods) {
            this.$message.error('定价明细存在相同的物资')
            return false
          }
          // this.copyForm.partsnameNames = partsnameNamesList.toString()

          const removeRecords = []
          if (this.table.getRemoveRecords().length> 0) {            
            this.table.getRemoveRecords().map((item) => {
              item.dataFlag = 2
              removeRecords.push(item)
            })
          }          
          const updateRecords = this.table.getUpdateRecords()
          const insertRecords = this.table.getInsertRecords()
          const detailList = [...insertRecords, ...updateRecords, ...removeRecords]

          // 码单明细
          const codeRec = this.$refs.codeTable.save()
          partsnameNamesList.push(...codeRec.partsnameNamesList)
          debugger
          const partsnameNamesStr = Array.from(new Set(partsnameNamesList)).toString()
          this.copyForm.partsnameNames = partsnameNamesStr
          const params = {
            mainMod: this.copyForm,
            detailList: detailList,
            codeList: codeRec.codeList
          }
          console.log(JSON.stringify(params))
          this.saveAsync(params)
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    close() {
      this.$refs.form.resetFields()
      this.$emit('close')
    },
    buttonGroupClick(flag) {
      switch(flag) {
        case 'add':
          this.$refs.form.validate((valid) => {
            if (valid) {              
              this.goodsWinShow = true
            } else {
              console.log('error submit!!')
              return false
            }
          })
          break
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }          
          this.table.remove(this.rowSelection[0])
          const codeTable = this.$refs.codeTable.$refs.editTable.$refs.basicEditable
          if (this.table.getTableData().fullData.length === 0 && codeTable.getTableData().fullData.length === 0) {
            this.formDisabled = false
          }
          this.table.updateFooter()
          this.rowSelection = []
          // 删除对应费用
          // const sdpfeeTable = this.$refs.sdpfee.$refs.sdpfeeTable.$refs.basicEditable
          // debugger
          // sdpfeeTable.remove(sdpfeeTable.getTableData().fullData)
          break        
        default:
          console.error('error')
          break
      }
    },
    handleSelectionChange (row) {            
      this.rowSelection = [row]
    },
    cellEdit({row, $rowIndex, column}) {},
    tabChange (tab, event) {
      this.$refs.codeTable.$refs.editTable.$refs.basicEditable.refreshColumn()
      this.activeTab = tab.name
    },
    async getMainMod (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/salePriceplanAjax!edit.do', 'post', this.queryParams)        
        if (data.map.state !== '3') {
          this.btnFlag = ''
          this.$message.error('操作失败')
          return false
        }
        const mainMod = JSON.parse(JSON.stringify(data.mainMod))
        
        this.clauseMod = data.clauseMod
        Object.keys(this.copyForm).forEach((key) => {
          this.copyForm[key] = mainMod[key] ? mainMod[key] : this.copyForm[key]
        })
        this.copyForm.pricesetDate = this.toDateString(data.mainMod.pricesetDate, 'yyyy-MM-dd HH:mm')
      } catch (e) {
        console.error(e)
      }
    },
    async getDetail () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/salePriceplanAjax!queryDetail.do', 'post', this.queryParams)
        this.tableValue.tableData = data.detailList
        this.formDisabled = true
        this.loading = false
      } catch (e) {
        this.loading = false
        console.error('error', e)
      }
    },    
    async saveAsync (params) {
      // 保存
      const loading = this.loadShow()
      try {
        let api = 'scscm/app/salePriceplanAjax!save.do'
        if (this.copyForm.pricesetBillcode) {
          api = 'scscm/app/salePriceplanAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {salePriceplanStr: JSON.stringify(params)})
        loading.close() 
        console.log(data)       
        if (data.map.state !== '3') {
          this.$message.error(data.map.msg ? data.map.msg : '保存失败')
          return
        }
        this.$message.success('保存成功')
        this.$emit('save')
        this.loading = false
      } catch (e) {
        this.loading = false
        loading.close()
        console.error(e)
      }
      loading.close()
    }
  }
}
</script>
