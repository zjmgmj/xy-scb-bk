<template lang="pug">
  el-dialog(title="采购发货登记", :visible="true", top="10px", width="1600px", @close="close")
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="单据号", prop="consignBillcode")
            el-input.full-width(v-model="copyForm.consignBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="日期", prop="consignDate")
            el-date-picker.full-width(v-model="copyForm.consignDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="业务机构", prop="orgCode")
            org-select(v-model="copyForm.orgCode", @change="syncName($event, {orgName: 'orgName', orgAbbreviate: 'orgAbbreviate'})", :disabled="formDisabled")        
        el-col(:span="6")
          el-form-item(label="业务部门", prop="deptCode")
            dept-select(v-model="copyForm.deptCode", @change="syncName($event, {deptName: 'deptName'})", :disabled="formDisabled")        
      el-row      
        el-col(:span="6")
          el-form-item(label="业务员", prop="employeeCode")
            employee-select(v-model="copyForm.employeeCode", @change="syncName($event, {employeeName: 'employeeName'})")            
        el-col(:span="6")
          el-form-item(label="结算单位", prop="datasBalcorp")
            company-select(v-model="copyForm.datasBalcorp", :typeStr="'GYS'", @change="syncName($event, {datasBalcorpname: 'companyName', datasSupplier:'companyCode', datasSuppliername: 'companyName'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="供货单位", prop="datasSupplier")
            company-select(v-model="copyForm.datasSupplier", :typeStr="'GYS'", @change="syncName($event, {datasSuppliername: 'companyName'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="", prop="consignProperty", @change="(val) => {copyForm.consignPropertyStr = val === 0 ? '00' : '11'}")
            el-checkbox(v-model="copyForm.consignProperty", :true-label="'0'", :false-label="'1'") 中转
      el-row      
        el-col(:span="6")
          el-form-item(label="费用金额", prop="dataInfeemoney")
            el-input.full-width(v-model="copyForm.dataInfeemoney", clearable, size="mini", disabled)            
        el-col(:span="6")
          el-form-item(label="制单人", prop="operatorName")
            el-input.full-width(v-model="copyForm.operatorName", clearable, size="mini", disabled)
        el-col(:span="12")
          el-form-item(label="备注", prop="consignRemark")
            el-input.full-width(v-model="copyForm.consignRemark", clearable, size="mini")    
    .mt-10.edit
      el-tabs(v-model="activeTab" type="border-card" @tab-click="tabChange", size="mini")
        el-tab-pane(label="物资明细" name="1")
          .pt-10.pb-10
            button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
            edit-table(ref="editTable", :loading="loading", :tableValue="tableValue", @rowEditInfo="cellEdit", @rowSelection="handleSelectionChange")
        el-tab-pane(label="辅助信息" name="2")
          clause-win(ref="clause", :clauseMod="clauseMod")
        el-tab-pane(label="费用" name="3")
          .pt-10.pb-10(v-show="activeTab === '3'")
            sdpfee-win(:mainMod="copyForm", ref="sdpfee", :rowDetail="rowSelection[0]", :feeConfig="feeConfig", :detailTable="table")
    //- goods-win(v-if="goodsWinShow", @close="goodsWinShow = false", @sure="getGoodsWin")
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
import clauseWin from './clause'
import fileWin from '@/components/file'
import sdpfeeWin from '@/components/sdpfee'
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
import detailWin from '@/components/detailWin'
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
    sdpfeeWin,
    clauseWin,
    detailWin,
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
      feeConfig: {
        otherParams:{billcode: 'consignBillcode', mainBackMoney:'dataInfeemoney', detailBackInprice:'goodsInfeeprice', detailBackMoney:'goodsInfeemoney', feeBweight:'goodsWeight', feeOptbatch:'consignBillbatch'}
      },
      contractWinConfig: {
        title: '',
        urlApi: ''
      },
      contractTable: {},
      contractWinSearchForm: [],
      contractWinLikeCol: ['scontractBillcode', 'scontractDetailRemark'],      
      contractWinShow: false,
      activeTab: '1',
      auditGlideShow: false,
      fileWinShow: false,
      // goodsWinShow: false,
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      loading: false,
      topButtonGroupInfo: [],
      buttonGroupInfo: [        
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
          {lbl: '规格', prop: 'goodsSpec', width: '150px', type: 'spec', props: {goodsSpec: 'goodsSpec'}},
          {lbl: '材质', prop: 'goodsMaterial', width: '150px', type: 'material', props: {goodsMaterial: 'goodsMaterial'}},
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
          // contractDetailOptbatch: '',
          // contractDetailBilltype: '',
          dataGoodsflagStr: '',
          // contractDetailChweight: '',
          // contractDetailChnum: '',
          // goodsContractold: '',
          // goodsContractbatchold: '',
          previousDataVernum: '',
          memberCode: '',
          // planDetailState: ''
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
    let isTrue = true
    if (this.form.consignBillcode) isTrue = false
    if (this.form.flag === 'readyonly') {
      this.topButtonGroupInfo = [
        {lbl: '附件', type: 'file', icon: 'el-icon-files', disabled: isTrue},
        {lbl: '打印', type: 'print', icon: 'el-icon-print'},
        {lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search', disabled: isTrue}
      ]       
    } else {
      this.topButtonGroupInfo = [
        {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},      
        {lbl: '采购合同', type: 'contract', icon: 'el-icon-document'},
        {lbl: '附件', type: 'file', icon: 'el-icon-files', disabled: isTrue},
        {lbl: '打印', type: 'print', icon: 'el-icon-print'},
        {lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search', disabled: isTrue}
      ] 
    }
  },
  beforeMount () {
    this.copyForm = this.extend(true, this.form)
  },
  mounted () {
    this.$nextTick(() => {           
      if (this.form.consignBillcode) {
        this.fileMod = {
          fileBilltype: this.copyForm.billtypeCode,
          fileOpcode: this.copyForm.consignBillcode
        }        
        this.getMainMod()
        this.getDetail()
      }
      this.table = this.$refs.editTable.$refs.basicEditable
    })
  },
  methods: {
    contractCellBack(data) {
      const resData = this.toArray(data)
      const arr = []      
      const mainMod = {orgCode:'orgCode', deptCode:'deptCode',datasBalcorp:'datasBalcorp',consignClass:'contractClass', datasBalcorpname:'datasBalcorpname',datasSupplier:'datasBalcorp',datasSuppliername:'datasSuppliername'}      
      const clauseMod = {ddTypeStartarea:'ddTypeStartarea',ddTypeDestination:'ddTypeDestination',ddTypeSpecialline:'ddTypeSpecialline',ddTypeTransferport:'ddTypeTransferport', contractTransportmode:'contractTransportmode'}
      const mainForm = {}
      const clauseForm = {}
      const props = []
      this.tableValue.tableHead.map(item => {
        props.push(item.prop)
      })
      const idx = this.table.getTableData().fullData.length
      resData.map((item, index) => {
        let obj = {}
        item.consignDetailOptcode = item.goodsContract
        item.consignDetailOptbatch = item.goodsContractbatch
        item.consignDetailBilltype = item.billtypeCode
        item.billtypeCode = ''        
        item.goodsNum = item.noDetailNum
        item.goodsWeight = item.noDetailWeight
        item.goodsAssistweight = item.noDetailAssistweight
        item.previousDataVernum = item.dataVernum
        item.goodsInmoney = item.noDetailInmoney
        item.goodsExmoney = item.noDetailExmoney
        item.goodsTaxmoney = item.noDetailTaxmoney   
        // obj.consignBillbatch = 'temp8.11.16.372.0'
        item.consignBillcode = ''
        item.consignDetailId = ''
        item.consignDetailState = ''
        item.consignDetailMtccode = ''
        item.consignDetailDate = this.toDateString(new Date(), 'yyyy-MM-dd HH:mm:ss')
        item.consignBillbatch = this.getTempBatchStr(idx + index)
        obj = Object.assign({}, this.extend(true, this.tableValue.hiddenProp), item)        
        console.log('consignBillbatch', item.consignBillbatch)
        arr.push(obj)
        for (const key in mainMod) {
          mainForm[key] = item[mainMod[key]]
        }
        for (const key in clauseMod) {
          clauseForm[key] = item[clauseMod[key]]
        }
      })      
      this.fileMod = {
        fileBilltype: data[0].billtypeCode,
        fileOpcode: data[0].consignBillcode
      }
      Object.assign(this.copyForm, mainForm) // 主表赋值
      Object.assign(this.clauseMod, clauseForm) // 辅助信息赋值
      this.table.insertAt(arr, -1)
      this.formDisabled = true
      this.contractWinShow = false
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
          const sdpFeeTable = this.$refs.sdpfee
          const feeList = sdpFeeTable.sdpFeeSave()          
          if (feeList.length > 0) {
            this.setStoreFeeprice(this.copyForm, this.table.getTableData().fullData, feeList, sdpFeeTable, this.feeConfig, this.getColumnSum('goodsWeight', this.table))
          }   
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
          const consignDetailList = [...insertRecords, ...updateRecords, ...removeRecords]
          // consignDetailList.map((item) => {
          //   delete item._XID
          //   delete item.viewId
          //   delete item.dataAudit
          //   delete item.dataAuditNremark
          //   delete item.dataAuditDate
          //   delete item.dataAuditPerson
          //   delete item.dataAuditRemark
          //   delete item.dataAuditStr
          // })
          // console.log('getTableData', this.$refs.sdpfee.getTableData())
          const params = {
            consignMod: this.copyForm,
            feeList: feeList,
            clauseMod: this.$refs.clause.form,
            consignDetailList: consignDetailList
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
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }
          this.table.remove(this.rowSelection[0])
          if (this.table.getTableData().fullData.length === 0) {
            this.formDisabled = false
          }
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
      if (tab.name === '3') {
        console.log('-----------------recalculate', tab.name)
        this.$refs.sdpfee.$refs.sdpfeeTable.$refs.basicEditable.recalculate()
      }
      this.activeTab = tab.name
    },
    async getMainMod (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/purchaseConsignAjax!edit.do', 'post', this.copyForm)        
        if (data.map.state !== '3') {
          this.btnFlag = ''
          this.$message.error('操作失败')
          return false
        }
        const mainMod = JSON.parse(JSON.stringify(data.mainMod))
        
        this.clauseMod = data.clauseMod
        data.mainMod.consignDate = this.toDateString(data.mainMod.consignDate, 'yyyy-MM-dd HH:mm')
        Object.keys(this.copyForm).forEach((key) => {
          this.copyForm[key] = mainMod[key] ? mainMod[key] : this.copyForm[key]
        })
        console.log('consignClass', this.copyForm.consignClass)
      } catch (e) {
        console.error(e)
      }
    },
    async getDetail () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/purchaseConsignAjax!queryList.do', 'post', this.form)
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
        let api = 'scscm/app/purchaseConsignAjax!save.do'
        if (this.copyForm.consignBillcode) {
          api = 'scscm/app/purchaseConsignAjax!update.do'
          // delete params.consignMod.feeBilltype
          // delete params.consignMod.feeOptcode
        }
        const { data } = await this.proxy(this, api, 'post', {consignStr: JSON.stringify(params)})
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
