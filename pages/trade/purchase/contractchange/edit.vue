<template lang="pug">
  el-dialog(title="采购合同变更登记", :visible="true", top="10px", width="1600px", @close="close")
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="合同号", prop="goodsContract")
            el-input.full-width(v-model="copyForm.goodsContract", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="日期", prop="contractDate")
            el-date-picker.full-width(v-model="copyForm.contractDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="业务类别", prop="contractType")
            basic-select(v-model="copyForm.contractType", :ddtypeClass="'contractType'", :useName="true")            
        el-col(:span="6")
          el-form-item(label="采购类型", prop="contractCtype")
            basic-select(v-model="copyForm.contractCtype", :ddtypeClass="'contractCtype'", :useName="true")            
      el-row
        el-col(:span="6")
          el-form-item(label="类型", prop="contractClass")
            el-select.full-width(v-model="copyForm.contractClass", size="mini")
              el-option(v-for="item in contractClassList", :key="item.code", :label="item.name", :value="item.code")
        el-col(:span="6")
          el-form-item(label="结算单位", prop="datasBalcorp")
            company-select(v-model="copyForm.datasBalcorp", :typeStr="'GYS'", @change="syncName($event, {datasBalcorpname: 'companyName', datasSupplier:'companyCode', datasSuppliername: 'companyName'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="供货单位", prop="datasSupplier")
            company-select(v-model="copyForm.datasSupplier", :typeStr="'GYS'", @change="syncName($event, {datasSuppliername: 'companyName'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="对方合同", prop="contractOthercode")
            el-input.full-width(v-model="copyForm.contractOthercode", clearable, size="mini")
      el-row
        el-col(:span="6")
          el-form-item(label="合同批次", prop="contractOtherbatch")
            el-input.full-width(v-model="copyForm.contractOtherbatch", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="供方代表", prop="contractOtherassist")
            el-input.full-width(v-model="copyForm.contractOtherassist", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="合同月份", prop="contractMonthStr")
            el-date-picker.full-width(v-model="copyForm.contractMonthStr", type="date", format="yyyy-MM", value-format="yyyy-MM", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="业务机构", prop="orgCode")
            org-select(v-model="copyForm.orgCode", @change="syncName($event, {orgName: 'orgName', orgAbbreviate: 'orgAbbreviate'})", :disabled="formDisabled")        
      el-row
        el-col(:span="6")
          el-form-item(label="业务部门", prop="deptCode")
            dept-select(v-model="copyForm.deptCode", @change="syncName($event, {deptName: 'deptName'})", :disabled="formDisabled")        
        el-col(:span="6")
          el-form-item(label="业务员", prop="employeeCode")
            employee-select(v-model="copyForm.employeeCode")
        el-col(:span="6")
          el-form-item(label="制单人", prop="operatorUser")
            el-input.full-width(v-model="copyForm.operatorUser", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="备注", prop="contractRemark")
            el-input.full-width(v-model="copyForm.contractRemark", clearable, size="mini")    
    .mt-10.edit
      el-tabs(v-model="activeTab" type="border-card" @tab-click="tabChange", size="mini")
        el-tab-pane(label="物资明细" name="1")
          .pt-10.pb-10
            button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
            edit-table(ref="editTable", :loading="loading", :tableValue="tableValue", @rowEditInfo="cellEdit", @rowSelection="handleSelectionChange")
        el-tab-pane(label="辅助信息" name="2")
          clause-win(ref="clause", :clauseMod="clauseMod")
        el-tab-pane(label="条款" name="3")
          .pt-10.pb-10
            terms-win(:mainMod="form", ref="terms", :termList="termDetail")
    goods-win(v-if="goodsWinShow", @close="goodsWinShow = false", @sure="getGoodsWin")
    file-win(v-if="fileWinShow", @close="fileWinShow = false", :fileMod="fileMod", :table="tableValue.tableHead")
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
    purchase-contract-win(v-if="contractWinShow", :mainForm="copyForm" @close="contractWinShow=false", @cellBack="contractCellBack")
    //- detail-win(
      v-if="contractWinShow",
      @close="contractWinShow = false", 
      :config="contractWinConfig", 
      :likeCol="contractWinLikeCol",
      :searchFormItems="contractWinSearchForm"
      :tableValue="contractTable",
      @sure="contractCellBack")
</template>
<script>
import { mapState } from 'vuex'
import termsWin from './terms'
import clauseWin from './clause'
import fileWin from '@/components/file'
import auditGlideView from '@/components/billtypeaudit'
import buttonGroup from '@/components/buttonGroup.vue'
import ddSelect from '@/components/select/ddSelect'
import basicSelect from '@/components/select/basicSelect'
import companySelect from '@/components/select/companySelect'
import orgSelect from '@/components/select/orgSelect'
import deptSelect from '@/components/select/deptSelect'
import employeeSelect from '@/components/select/employeeSelect'
import editTable from '@/components/editTable'
import goodsWin from '@/components/goodsWin'
// import detailWin from '@/components/detailWin'
import purchaseContractWin from '@/components/queryReport/purchaseContract'
export default {
  components: {
    buttonGroup,
    ddSelect,
    basicSelect,
    companySelect,
    orgSelect,
    deptSelect,
    employeeSelect,
    editTable,
    goodsWin,
    fileWin,
    auditGlideView,
    termsWin,
    clauseWin,
    // detailWin,
    purchaseContractWin
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
      contractWinShow: false,
      activeTab: '1',
      auditGlideShow: false,
      fileWinShow: false,
      goodsWinShow: false,
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      loading: false,
      topButtonGroupInfo: [],
      buttonGroupInfo: [
        {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
        {lbl: '复制', type: 'copy', icon: 'el-icon-document-copy'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
      ],
      tableValue: {        
        hasCbx: false,
        pageShow: false,
        showRowIndex: true,
        showSummary: true,
        validRules: {
          goodsWeight: [{ required: true, message: '必填项' }],
          goodsInprice: [{ required: true, message: '必填项' }],
          goodsInmoney: [{ required: true, message: '必填项' }]
        },
        // adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
				// priceMoneyComputerColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
        tableHead: [
          {lbl: '收货机构', prop: 'datasInorgName', width: '150px', type: 'org', props: {datasInorgName: 'orgAbbreviate', datasInorgCode: 'orgCode'}},
          {lbl: '品名', prop: 'partsnameName', width: '150px', type: 'partsname', props: {partsnameName: 'partsnameName', partsnameCode: 'partsnameCode'}},
          {lbl: '规格', prop: 'goodsSpec', width: '150px', type: 'spec'},
          {lbl: '材质', prop: 'goodsMaterial', width: '150px', type: 'material'},
          {lbl: '产地', prop: 'productareaName', width: '150px', type: 'area', props: {productareaName: 'productareaName'}},
          {lbl: '长度', prop: 'goodsProperty1'},
          {lbl: '米重', prop: 'goodsProperty2'},
          {lbl: '重量范围', prop: 'goodsProperty4'},
          {lbl: '公差范围', prop: 'goodsProperty5'},
          {lbl: '数量', prop: 'goodsNum', summary: true, g_type: 'num'},
          {lbl: '重量', prop: 'goodsWeight', summary: true, g_type: 'weight'},
          {lbl: '含税单价', prop: 'goodsInprice', g_type: 'price'},
          {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money'},
          {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
          {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
          {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
          {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money', noedit: true},
          {lbl: '费用单价', prop: 'goodsInfeeprice', g_type: 'price'},
          {lbl: '费用金额', prop: 'goodsInfeemoney', summary: true, g_type: 'money'},
          {lbl: '数量单位', prop: 'partsnameNumunit', type: 'basic', ddtypeClass: 'partsnameNumunit', props: {partsnameNumunit: 'ddName'}},
          {lbl: '重量单位', prop: 'partsnameWeightunit', type: 'basic', ddtypeClass: 'partsnameWeightunit', props: {partsnameWeightunit: 'ddName'}},
          {lbl: '订货单位', prop: 'datasOrdercorpname', type: 'company', typeStr: 'HZ', props: {goodsOrdercorpname: 'companyName'}},
          {lbl: '收货单位', prop: 'datasAcceptcorpname', width: '150px', type: 'company', typeStr: 'HZ', props: {datasAcceptcorpname: 'companyName'}},
          {lbl: '收货部门', prop: 'datasIndeptName', width: '150px', type: 'dept', props: {datasIndeptName: 'deptName'}},
          {lbl: '计量方式', prop: 'goodsMetering', width: '150px', type: 'basic',  ddtypeClass: 'goodsMetering', props: {goodsMetering: 'ddName'}},
          {lbl: '车皮号', prop: 'goodsContractstr2'},
          {lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true},
          {lbl: '件支数', prop: 'goodsPartsbranch'},          
          {lbl: '备注', prop: 'contractDetailRemark'},
          {lbl: '销售合同号', prop: 'scontractBillcode', noedit: true},
          {lbl: '销售合同号', prop: 'contractDetailOptcode', noedit: true},
        ],
        hiddenProp: {
          // 新增tableValue.tableData时使用
          goodsContractbatch: '', // 批号等重新赋值
          contractDetailState: 0,
          dataGoodsflag: 0,
          dataFundflag: 0,
          dataInvoiceflag: 0,
          dataVernum: 0,
          dataFlag: 0, // 操作标记
          scontractBillcode: 0,
          scontractBillbatch: '',
          contractDetailOptbatch: '',
          contractDetailBilltype: '',
          dataGoodsflagStr: '',
          contractDetailChweight: '',
          contractDetailChnum: '',
          goodsContractold: '',
          goodsContractbatchold: '',
          previousDataVernum: '',
          memberCode: '',
          planDetailState: ''
        },
        tableData: []
      },
      rowSelection: [],      
      delRow: [],
      rules: {
        contractDate: [{ required: true }],
        datasSupplier: [{ required: true }],
        contractMonthStr: [{ required: true }],
        datasBalcorp: [{ required: true }],
        orgCode: [{ required: true }],
        deptCode: [{ required: true }],
        employeeCode: [{ required: true }]
      },
      warehouseList: [],
      employeeComboList: [],
      worktypeList: [],
      orgList: [],
      contractClassList: [
        {code: 0, name: '甲'},
        {code: 1, name: '乙'},
        {code: 2, name: '丙'},
      ],
      copyForm: {},
      clauseMod: {},
      termDetail: [],
      formDisabled: false,
      table: '',
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
      g_format: state => state.g_format,
      auditCombo: state => state.auditCombo
    })
  },
  created () {
    let isTrue = true
    if (this.form.goodsContract) isTrue = false
    this.topButtonGroupInfo = [
      {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},      
      {lbl: '原合同', type: 'contract', icon: 'el-icon-document'},
      {lbl: '附件', type: 'file', icon: 'el-icon-files', disabled: isTrue},
      {lbl: '打印', type: 'print', icon: 'el-icon-print'},
      {lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search', disabled: isTrue}
    ]     
  },
  beforeMount () {
    this.copyForm = this.extend(true, this.form)
  },
  mounted () {
    this.$nextTick(() => {           
      if (this.form.goodsContract) {
        this.fileMod = {
          fileBilltype: this.copyForm.billtypeCode,
          fileOpcode: this.copyForm.goodsContract
        }        
        this.getMainMod()
        this.getDetail()
        const params = {
          termlistOptcode: this.copyForm.goodsContract,
          billtypeCode: 'P002',
          page: 1,
          start: 0,
          limit: 25
        }
        this.getTermDetail(params)
      }
      this.table = this.$refs.editTable.$refs.basicEditable
    })
  },
  methods: {
    contractCellBack(data) {
      const arr = []
      const resData = this.toArray(data)
      resData.map((item) => {
        let obj = {}
        // goodsContractold
        item.changeCode= item.goodsContract
        item.changeBatch= item.goodsContractbatch
        item.contractDetailOptcode = item.goodsContract
        item.contractDetailOptbatch = item.goodsContractbatch
        item.contractDetailBilltype = item.billtypeCode
        item.goodsNum = item.noDetailNum
        item.goodsWeight = item.noDetailWeight
        item.goodsAssistweight = item.noDetailAssistweight
        item.previousDataVernum = item.dataVernum        
        item.goodsInmoney = item.noDetailInmoney
        item.goodsExmoney = item.noDetailExmoney
        item.goodsTaxmoney = item.noDetailTaxmoney        
        item.consignDetailDateStr = this.toDateString(new Date(), 'yyyy-MM-dd')
        item.goodsContractold = item.goodsContract
        item.goodsContractbatchold = item.goodsContractbatch
        obj = Object.assign({}, this.extend(true, this.tableValue.hiddenProp), item)
        arr.push(obj)
      })      
      this.fileMod = {
        fileBilltype: data[0].billtypeCode,
        fileOpcode: data[0].goodsContract
      }
      this.copyForm.billtypeCode = data[0].billtypeCode
      this.copyForm.goodsContract = data[0].goodsContract
      this.mainMod = {contractMonthStr:'contractMonthStr',orgName:'orgName',deptName:'deptName',employeeName:'employeeName',operatorUser:'operatorName',memberCode:'memberCode',contractMonth:'contractMonth',goodsBatch:'goodsBatch',contractOthercode:'contractOthercode',contractOtherbatch:'contractOtherbatch',contractOtherassist:'contractOtherassist',contractType:'contractType',contractCtype:'contractCtype',contractClass:'contractClass',datasSupplier:'datasSupplier',datasSuppliername:'datasSuppliername',datasBalcorp:'datasBalcorp',datasBalcorpname:'datasBalcorpname',feeEdittype:'feeEdittype',contractRemark:'contractRemark',orgCode:'orgCode',deptCode:'deptCode',employeeCode:'employeeCode',dataEditOrg:'dataEditOrg',dataEditDept:'dataEditDept',operatorCode:'operatorCode',billtypeCode:'billtypeCode',ddTypeCurrency:'ddTypeCurrency',datasExrate:'datasExrate',goodsNum:'goodsNum',goodsPiecenum:'goodsPiecenum',goodsSingernum:'goodsSingernum',goodsWeight:'goodsWeight',goodsAssistweight:'goodsAssistweight',goodsContractold:'goodsContract'}      
      this.btnFlag = 'contract'
      this.getMainMod()
      this.table.insert(arr)
      this.formDisabled = true
      this.contractWinShow = false      
    },    
    syncName(e, obj) {      
      Object.keys(obj).forEach((key) => {
        this.copyForm[key] = e[obj[key]]
      })
    },
    getGoodsWin (data) {
      if (data.length > 0) {
        this.goodsWinShow = false
        const arr = []
        data.map((item) => {
          let obj = {}
          item.datasInorgName = this.copyForm.orgAbbreviate
          item.datasInorgCode = this.copyForm.orgCode
          item.partsnameCode = item.goodscodeCode
          item.datasIndeptName = this.copyForm.deptName
          item.datasIndeptCode = this.copyForm.deptCode
          obj = Object.assign({}, this.extend(true, this.tableValue.hiddenProp), item)
          arr.push(obj)
        })        
        this.table.insert(arr)
        this.formDisabled = true
      }      
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
        case 'contract':
          this.contractWinShow = true
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
          const form = {
            goodsNum: this.getColumnSum('goodsNum', this.table),
            goodsPiecenum: this.getColumnSum('goodsPiecenum', this.table),
            goodsSingernum: this.getColumnSum('goodsSingernum', this.table),
            goodsWeight: this.getColumnSum('goodsWeight', this.table),
            goodsAssistweight: this.getColumnSum('goodsAssistweight', this.table),
            dataInmoney: this.getColumnSum('goodsInmoney', this.table)
            
          }
          Object.assign(this.copyForm, form)
          const removeRecords = []
          if (this.table.getRemoveRecords().length> 0) {            
            this.table.getRemoveRecords().map((item) => {
              item.dataFlag = 2
              removeRecords.push(item)
            })
          }          
          const updateRecords = this.table.getUpdateRecords()
          const insertRecords = this.table.getInsertRecords()          
          const contractDetailList = [...insertRecords, ...updateRecords, ...removeRecords]
          const params = {
            contractMod: this.copyForm,
            termlist: this.$refs.terms.$refs.termsTable.$refs.basicEditable.getTableData().fullData,
            clauseMod: this.$refs.clause.form,
            contractDetailList: contractDetailList
          }
          debugger
          console.log(JSON.stringify(params))
          this.saveAsync({contractStr: JSON.stringify(params)})
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
        case 'copy':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要复制的数据')
            return false
          }          
          const copyData = this.extend(true, this.rowSelection[0])
          copyData.dataFlag = ''
          delete copyData._XID
          this.table.insert([copyData])
          break
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
      console.log(tab, event)
    },
    async getMainMod (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/purchaseContractEnrollAjax!edit.do', 'post', this.copyForm)        
        if (data.map.state !== '3') {
          this.btnFlag = ''
          this.$message.error('操作失败')
          return false
        }
        const mainMod = JSON.parse(JSON.stringify(data.mainMod))
        this.clauseMod = data.clauseMod
        if (this.btnFlag === 'contract') { // 原合同回写主表          
          const obj = {}
          for (const key in this.mainMod) {
            obj[key] = mainMod[this.mainMod[key]]
          } 
          Object.assign(this.copyForm, obj)
          if (!this.copyForm.contractCtype) this.copyForm.contractCtype = ''
          if (!this.copyForm.contractType) this.copyForm.contractType = ''
          this.copyForm.goodsContract = ''          
          this.btnFlag = ''
          return false
        }
        data.mainMod.contractDate = this.toDateString(data.mainMod.contractDate, 'yyyy-MM-dd HH:mm')
        Object.keys(this.copyForm).forEach((key) => {
          this.copyForm[key] = mainMod[key] ? mainMod[key] : this.copyForm[key]
        })        
        if (!this.copyForm.contractCtype) this.copyForm.contractCtype = ''
        if (!this.copyForm.contractType) this.copyForm.contractType = ''
      } catch (e) {
        console.error(e)
      }
    },
    async getDetail () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/purchaseContractEnrollAjax!queryList.do', 'post', this.form)
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
    async getTermDetail (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/termsettingAjax!queryOpDetail.do', 'post', params)
        this.termDetail = []        
        if (data.termList) {
          this.termDetail = data.termList
        }
      } catch (e) {
        console.error('error', e)
      }
    },
    async saveAsync (params) {
      // 保存
      const loading = this.loadShow()
      try {
        let api = 'scscm/app/purchaseContractEnrollAjax!save.do'
        if (this.copyForm.goodsContract) {
          api = 'scscm/app/purchaseContractEnrollAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', params)
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
