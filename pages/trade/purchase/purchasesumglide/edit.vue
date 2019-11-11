<template lang="pug">
  el-dialog(title="采购补差登记", :visible="true", top="10px", width="1600px", @close="close")
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="单据号", prop="sumglideBillcode")
            el-input.full-width(v-model="copyForm.sumglideBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="日期", prop="sumglideDate")
            el-date-picker.full-width(v-model="copyForm.sumglideDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="业务机构", prop="orgCode")
            org-select(v-model="copyForm.orgCode", @change="syncName($event, {orgName: 'orgName', orgAbbreviate: 'orgAbbreviate'})", :disabled="formDisabled")            
        el-col(:span="6")
          el-form-item(label="业务部门", prop="deptCode")
            dept-select(v-model="copyForm.deptCode", @change="syncName($event, {deptName: 'deptName'})", :disabled="formDisabled")                
        el-col(:span="6")
          el-form-item(label="制单人", prop="operatorName")
            el-input.full-width(v-model="copyForm.operatorName", clearable, size="mini", disabled)        
        el-col(:span="12")
          el-form-item(label="结算单位", prop="datasBalcorp")
            company-select(v-model="copyForm.datasBalcorp", :typeStr="'GYS'", @change="syncName($event, {datasBalcorpname: 'companyName', datasSupplier:'companyCode', datasSuppliername: 'companyName'})", :disabled="formDisabled")
    .mt-10.edit
      button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
      edit-table(ref="editTable", :loading="loading", :tableValue="tableValue", @rowEditInfo="cellEdit", @rowSelection="handleSelectionChange")      
    file-win(v-if="fileWinShow", @close="fileWinShow = false", :fileMod="fileMod", :table="tableValue.tableHead")
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
    diff-query-import-win(v-if="diffWinShow", :mainForm="copyForm" @close="diffWinShow=false", @cellBack="diffCellBack")    
</template>
<script>
import { mapState } from 'vuex'
import sdpfeeWin from '@/components/sdpfee'
import fileWin from '@/components/file'
import auditGlideView from '@/components/billtypeaudit'
import buttonGroup from '@/components/buttonGroup.vue'
import editTable from '@/components/editTable'
import diffQueryImportWin from '@/components/queryReport/diffQueryImport'

export default {
  components: {
    buttonGroup,
    editTable,
    fileWin,
    auditGlideView,
    sdpfeeWin,
    diffQueryImportWin
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
      diffWinShow: false,
      feeConfig: {
        otherParams:{billcode: 'sumglideBillcode', mainBackMoney:'dataInfeemoney', detailBackInprice:'goodsBinfeeprice', detailBackMoney:'goodsInfeemoney',feeBweight:'goodsWeight', feeOptbatch:'goodsEntrybatch'}        
      },   
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
          sumglideGinmoney: [{ required: true, message: '必填项' }]
        },
        // adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
				priceMoneyComputerColumn: {goodsNum:'sumglideGnum',goodsWeight:'sumglideGweight',goodsAssistweight:'sumglideGassistweight',goodsInprice:'sumglideGinprice',goodsInmoney:'sumglideGinmoney',goodsTaxrate:'sumglideGtaxrate'},
        tableHead: [
          {lbl: '品名', prop: 'partsnameName', width: '150px', noedit: true},
          {lbl: '规格', prop: 'goodsSpec', width: '150px', noedit: true},
          {lbl: '材质', prop: 'goodsMaterial', width: '150px', noedit: true},
          {lbl: '产地', prop: 'productareaName', width: '150px', noedit: true},
          {lbl: '数量', prop: 'sumglideGnum', summary: true, g_type: 'num'},
          {lbl: '重量', prop: 'sumglideGweight', summary: true, g_type: 'weight'},
          {lbl: '补差类型', prop: 'sumglideType', type: 'select', list: [{label: '金额补差', value: '0'}, {label: '单价补差', value: '1'}], 
            formatter: ({cellValue}) => {
              return cellValue === '0' ? '金额补差' : '单价补差'
            }
          },
          {lbl: '补差单价', prop: 'sumglideGinprice', g_type: 'price'},
          {lbl: '补差金额', prop: 'sumglideGinmoney', summary: true, g_type: 'money'},          
          {lbl: '税率', prop: 'sumglideGtaxrate', g_type:'taxrate'},
          {lbl: '数量单位', prop: 'partsnameNumunit'},
          {lbl: '重量单位', prop: 'partsnameWeightunit'},
          {lbl: '计量方式', prop: 'goodsMetering', width: '150px', noedit: true},          
          {lbl: '业务单号', prop: 'sumglideOptcode'},
          {lbl: '备注', prop: 'entryinfDetailRemark'}
        ],
        hiddenProp: {
          // 新增tableValue.tableData时使用
          dataInvoiceflagStr: '',
          goodsContractbatch: '', // 批号等重新赋值
          contractDetailState: 0,
          dataGoodsflag: 0,
          dataFundflag: 0,
          dataInvoiceflag: 0,
          dataVernum: 0,
          dataFlag: 0, // 操作标记
          scontractBillcode: 0,
          scontractBillbatch: '',
          dataGoodsflagStr: '',
          previousDataVernum: '',
          memberCode: '',
          billtypeCode: ''
        },
        tableData: []
      },
      rowSelection: [],      
      delRow: [],
      rules: {
        entryinfType: [{ required: true }],
        dataTally: [{ required: true }],
        warehouseName: [{ required: true }],
        entryinfDate: [{ required: true }],
        datasSupplier: [{ required: true }],
        datasBalcorp: [{ required: true }],
        orgCode: [{ required: true }],
        deptCode: [{ required: true }],
        employeeCode: [{ required: true }]
      },
      warehouseList: [],
      employeeComboList: [],
      worktypeList: [],
      orgList: [],
      entryinfClassList: [
        {code: 0, name: '甲'},
        {code: 1, name: '乙'},
        {code: 2, name: '丙'},
      ],
      // entryinfTypeList: [
      //   {code: 'P001', name: '市场散购'},
      //   {code: 'P002', name: '合同入库'},
      //   {code: 'P003', name: '发货入库'},
      //   {code: 'P004', name: '装运入库'}
      // ],
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
      btnFlag: ''
    }
  },
  computed: {
    ...mapState({
      g_format: state => state.g_format
    })
  },
  created () {
    let isTrue = false
    if (!this.form.sumglideBillcode) isTrue = true
    this.topButtonGroupInfo = [
      {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},      
      {lbl: '待补差', type: 'diff', icon: 'el-icon-document'},
      {lbl: '附件', type: 'file', icon: 'el-icon-files', disabled: isTrue},
      {lbl: '打印', type: 'print', icon: 'el-icon-print'},
      {lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search', disabled: isTrue}
    ]
    this.buttonGroupInfo = [
      {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
    ]
  },
  beforeMount () {
    this.copyForm = this.extend(true, this.form)
  },
  mounted () {
    this.$nextTick(() => {           
      if (this.form.sumglideBillcode) {
        this.fileMod = {
          fileBilltype: this.copyForm.billtypeCode,
          fileOpcode: this.copyForm.sumglideBillcode
        }        
        this.getMainMod()
        this.getDetail()        
      }
      this.table = this.$refs.editTable.$refs.basicEditable
    })
  },
  methods: {
    syncName(e, obj) {     
      Object.keys(obj).forEach((key) => {
        this.copyForm[key] = e[obj[key]]
      })
    },
    insertTableData ({data, mainMod, tableMod, itemFun}) {
      const mainForm = {}
      const tableDetail = []       
      const resData = this.toArray(data)
      resData.map((item, index) => {        
        let obj = {}
        Object.keys(tableMod).forEach(key => {
          if (item[tableMod[key]] && item[tableMod[key]] !== null) {
            item[key] = item[tableMod[key]]
          }          
        })        
        itemFun(item) // 自定义        
        item.goodsBinfeeprice = 0
			  item.goodsInfeemoney = 0
        obj = Object.assign({}, this.extend(true, this.tableValue.hiddenProp), item)                
        tableDetail.push(obj)
        for (const key in mainMod) {
          if (item[mainMod[key]] && item[mainMod[key]] !== null) {
            mainForm[key] = item[mainMod[key]]
          }
        }
      })      
      this.fileMod = {
        fileBilltype: data[0].billtypeCode,
        fileOpcode: data[0].sumglideBillcode
      }
      Object.assign(this.copyForm, mainForm) // 主表赋值
      // Object.assign(this.clauseMod, clauseForm) // 辅助信息赋值
      this.table.insertAt(tableDetail, -1)
      this.table.updateFooter()
      this.formDisabled = true
    },
    diffCellBack (data) {
      // 汇总物资
      const mainMod = {orgCode:'orgCode', datasBalcorp:'datasBalcorp', datasBalcorpname:'datasBalcorpname'}
      const tableMod = {sumglideOptcode:'opBillcode', sumglideOptbatch:'opBillbatch', sumglideBilltype:'billtypeCode', sumglideGnum:'goodsNum', sumglideGweight:'goodsWeight', sumglideGassistweight:'goodsAssistweight', previousDataVernum:'dataVernum', sumglideGtaxrate:'goodsTaxrate', orgCod:'orgCode', deptCo:'deptCode', employeeCo:'employeeCode', goodsO:'goodsOrg', goodsDe:'goodsDept', datasBalco:'datasBalcorp', datasBalcorpna:'datasBalcorpname', datasCustom:'datasCustomer', datasCustomerna:'datasCustomername', ddTypeTranspo:'ddTypeTransport', ddTypeDelive:'ddTypeDelivery', ddTypeSettleme:'ddTypeSettlement'}      
      // 成本相关
      this.insertTableData({data, mainMod, tableMod, itemFun: (item) => {
        item.sumglideType = '0'        
      }})
      this.diffWinShow = false
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
        case 'diff':
          this.diffWinShow = true
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
          // console.log()
          const fullData = this.table.getTableData().fullData
          if (fullData.length === 0) {
            this.$message.error('请增加明细！')
            return false
          }
          // if () {}
          // fullData.map((item) => {
          //   if (item.sumglideGinmoney === null || item.sumglideGinmoney === '') {
          //     this.$message.error('补差金额为空')
          //     return false
          //   }
          // })
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
          const params = {
            mainMod: this.copyForm,
            detailList: detailList
          }
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
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }          
          this.table.remove(this.rowSelection[0])          
          if (this.table.getTableData().fullData.length === 0) {
            this.formDisabled = false
          }
          this.table.updateFooter()
          this.rowSelection = []
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
      this.activeTab = tab.name
    },
    async getMainMod (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/diffAjax!edit.do', 'post', this.copyForm)        
        if (data.map !== null) {          
          this.$message.error(data.map.msg ? data.map.msg : '操作失败')
          return false
        }
        const mainMod = JSON.parse(JSON.stringify(data.mainMod))
        
        // this.clauseMod = data.clauseMod
        data.mainMod.sumglideDate = this.toDateString(data.mainMod.sumglideDate, 'yyyy-MM-dd HH:mm')
        Object.keys(this.copyForm).forEach((key) => {
          this.copyForm[key] = mainMod[key] ? mainMod[key] : this.copyForm[key]
        })
        // console.log('consignClass', this.copyForm.consignClass)
        // console.log('this.copyForm.entryinfType', this.copyForm.entryinfType)
        // this.entryinfTypeChange(this.copyForm.entryinfType)
      } catch (e) {
        console.error(e)
      }
    },
    async getDetail () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/diffAjax!queryList.do', 'post', this.form)
        console.log(data)
        this.tableValue.tableData = []
        if (data.detailList.length > 0) {
          this.tableValue.tableData = data.detailList
          this.formDisabled = true
        }
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
        let api = 'scscm/app/diffAjax!save.do'
        if (this.copyForm.sumglideBillcode) {
          api = 'scscm/app/diffAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {sumglideStr: JSON.stringify(params)})
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
<style lang="stylus" scoped>
/deep/.el-dialog{
  margin: 10px auto 24px!important;
}
</style>
