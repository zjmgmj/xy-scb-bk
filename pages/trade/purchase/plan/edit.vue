<template lang="pug">
  el-dialog(title="采购计划登记", :visible="true", top="10px", width="1600px", @close="close")
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="单据号", prop="planBillcode")
            el-input.full-width(v-model="copyForm.planBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="日期", prop="planDate")
            el-date-picker.full-width(v-model="copyForm.planDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="业务类别", prop="planType")
            dd-select(v-model="copyForm.planType", :ddtypeClass="'planType'", :disabled="formDisabled", @change="planTypeChange($event)")
        el-col(:span="6")
          el-form-item(label="采购类型", prop="contractCtype", label-width="90px")
            basic-select(v-model="copyForm.contractCtype", :ddtypeClass="'contractCtype'", :useName="true")            
      el-row
        el-col(:span="6")
          el-form-item(label="原始单号", prop="planOthercode")
            el-input.full-width(v-model="copyForm.planOthercode", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="供货单位", prop="datasBalcorp")
            company-select(v-model="copyForm.datasBalcorp", :typeStr="'GYS'", @change="syncName($event, {datasBalcorpname: 'companyName'})")
        el-col(:span="6")
          el-form-item(label="结算方式", prop="ddTypeSettlement")
            basic-select(v-model="copyForm.ddTypeSettlement", :ddtypeClass="'ddTypeSettlementSdp'", :useName="true")
        el-col(:span="6")
          el-form-item(label="付款方式", prop="ddTypePayment")
            basic-select(v-model="copyForm.ddTypePayment", :ddtypeClass="'ddTypePayment'", :useName="true")
      el-row
        el-col(:span="6")
          el-form-item(label="月份", prop="planMonthStr")
            el-date-picker.full-width(v-model="copyForm.planMonthStr", type="date", format="yyyy-MM", value-format="yyyy-MM", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="业务机构", prop="orgCode")
            org-select(v-model="copyForm.orgCode", @change="syncName($event, {orgName: 'orgName', orgAbbreviate: 'orgAbbreviate'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="业务部门", prop="deptCode")
            dept-select(v-model="copyForm.deptCode", @change="syncName($event, {deptName: 'deptName'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="业务员", prop="employeeCode")
            employee-select(v-model="copyForm.employeeCode")
      el-row
        el-col(:span="6")
          el-form-item(label="制单人", prop="operatorUser")
            el-input.full-width(v-model="copyForm.operatorUser", clearable, size="mini", readonly)
        el-col(:span="18")
          el-form-item(label="备注", prop="planRemark")
            el-input.full-width(v-model="copyForm.planRemark", clearable, size="mini")    
    .mt-0
      button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
      edit-table(ref="editTable", :loading="loading", :tableValue="tableValue", @rowEditInfo="cellEdit", @rowSelection="handleSelectionChange")
    goods-win(v-if="goodsWinShow", @close="goodsWinShow = false", @sure="getGoodsWin")
    file-win(v-if="fileWinShow", @close="fileWinShow = false", @sure="sureFileWin", :fileMod="fileMod", :table="tableValue.tableHead")
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
    scontract-enroll-Win(v-if="scontractWinShow",  :queryParam="scontractQueryParam", @close="scontractWinShow=false", @cellBack="scontractCellBack")
</template>
<script>
import { mapState } from 'vuex'
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
import scontractEnrollWin from '@/components/queryReport/scontractEnroll'

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
    scontractEnrollWin
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
      scontractQueryParam: {},
      scontractWinShow: false,
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
          planDetailAnum: [{ required: true, message: '必填项' }],
          planDetailAweight: [{ required: true, message: '必填项' }]
        },
        adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
				priceMoneyComputerColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
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
          {lbl: '申请数量', prop: 'planDetailAnum', summary: true, g_type: 'num'},
          {lbl: '申请重量', prop: 'planDetailAweight', summary: true, g_type: 'weight'},
          {lbl: '含税单价', prop: 'goodsInprice', g_type: 'price'},
          {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money'},
          {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
          {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
          {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
          {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money', noedit: true},
          {lbl: '数量单位', prop: 'partsnameNumunit', type: 'basic', ddtypeClass: 'partsnameNumunit', props: {partsnameNumunit: 'ddName'}},
          {lbl: '重量单位', prop: 'partsnameWeightunit', type: 'basic', ddtypeClass: 'partsnameWeightunit', props: {partsnameWeightunit: 'ddName'}},
          {lbl: '收货部门', prop: 'datasIndeptName', width: '150px', type: 'dept', props: {datasIndeptName: 'deptName'}},
          {lbl: '计量方式', prop: 'goodsMetering', width: '150px', type: 'basic',  ddtypeClass: 'goodsMetering', props: {goodsMetering: 'ddName'}},
          {lbl: '车皮号', prop: 'goodsContractstr2'},
          {lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true},
          {lbl: '件支数', prop: 'goodsPartsbranch'},
          {lbl: '起运港/地', prop: 'ddTypeStartarea', type: 'basic',  ddtypeClass: 'ddTypeStartarea', props: {ddTypeStartarea: 'ddName'}},
          {lbl: '到站港/地', prop: 'ddTypeDestination', type: 'basic',  ddtypeClass: 'ddTypeDestination', props: {ddTypeDestination: 'ddName'}},
          {lbl: '专用线', prop: 'ddTypeSpecialline', type: 'basic',  ddtypeClass: 'ddTypeSpecialline', props: {ddTypeSpecialline: 'ddName'}},
          {lbl: '订货单位', prop: 'goodsOrdercorpname', type: 'company', typeStr: 'HZ', props: {goodsOrdercorpname: 'companyName'}},
          {lbl: '备注', prop: 'planDetailRemark'},
          {lbl: '销售合同号', prop: 'scontractBillcode', noedit: true}
        ],
        hiddenProp: {
          dataGoodsflagStr: '',
          dataGoodsflag: '',
          dataFlag: '',
          previousDataVernum: '',
          goodsTaxamount: '',
          planDetailId: '',
          planBillcode: '',
          planBillbatch: '',
          memberCode: '',
          scontractBillcode: '',
          scontractBillbatch: '',
          planDetailState: ''
        },
        tableData: []
      },
      rowSelection: [],
      delRow: [],
      rules: {
        planDate: [{ required: true }],
        planType: [{ required: true }],
        datasBalcorp: [{ required: true }],
        orgCode: [{ required: true }],
        deptCode: [{ required: true }],
        employeeCode: [{ required: true }]
      },
      warehouseList: [],
      employeeComboList: [],
      worktypeList: [],
      orgList: [],
      workgroupClassList: [
        {code: 0, name: '内部'},
        {code: 1, name: '外部'},
      ],
      copyForm: {},
      formDisabled: false,
      table: '',
      fileMod: {}
    }
  },  
  computed: {
    ...mapState({
      g_format: state => state.g_format
    })
  },
  created () {
    let isTrue = true
    if (this.form.planBillcode) isTrue = false
    this.topButtonGroupInfo = [
      {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},
      {lbl: '销售合同', type: 'contract', icon: 'el-icon-document', disabled: true},
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
      if (this.form.planBillcode) {
        this.getMainMod()
        this.getDetail()
        this.fileMod = {
          fileBilltype: this.copyForm.billtypeCode,
          fileOpcode: this.copyForm.planBillcode
        } 
      }
      this.table = this.$refs.editTable.$refs.basicEditable
    })
  },
  methods: {    
    scontractCellBack (data) {
      // 汇总物资
      const mainMod = {}
      const tableMod = {scontractBillcode: 'scontractBillcode', scontractBillbatch: 'scontractBillbatch', goodsOrdercorpcode: 'datasBalcorp', goodsOrdercorpname: 'datasBalcorpname', PreviousDataVernum: 'dataVernum', planDetailAnum: 'goodsNum', planDetailAweight: 'goodsWeight', datasInorgCode: 'orgCode', datasInorgName: 'orgName', datasIndeptCode: 'deptCode', datasIndeptName: 'deptName', goodsTaxrate: 'goodsTaxrate'}
      // 成本相关
      this.insertTableData({data, mainMod, tableMod})
      this.scontractWinShow = false
    },
    planTypeChange (e) {
      // console.log('planTypeChange', e)
      this.topButtonGroupInfo[1].disabled = true
      if (e.ddValue === '01') {
        this.topButtonGroupInfo[1].disabled = false
      }
    },
    sureFileWin () {},
    syncName(e, obj) {
      // console.log('syncName', e)
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
          item.datasInorgName = this.copyForm.orgName
          item.datasInorgCode = this.copyForm.orgCode
          item.partsnameCode = item.goodscodeCode
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
          console.log('---------s')
          if (this.table.getTableData().fullData.length === 0) {
            this.$message.error('请增加明细！')
            return false
          }
          this.save()         
          break
        case 'contract':
          this.scontractQueryParam = {
            startDate: this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm'),
            endDate: this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm'),
            datasBalcorp: this.copyForm.datasBalcorp,
            scontractDetailType: '03'
          }
          this.scontractWinShow = true
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
    getColumnSum(prop) {
      // const table = this.$refs.editTable.$refs.basicEditable
      const column = this.table.getColumnByField(prop)
      const idx = this.table.getColumnIndex(column)
      return this.table.footerData[0][idx]
    },
    save () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const form = {
            goodsNum: this.getColumnSum('planDetailAnum', this.table),
            goodsPiecenum: this.getColumnSum('planDetailPiecenum', this.table),
            goodsSingernum: this.getColumnSum('planDetailSingernum', this.table),
            goodsWeight: this.getColumnSum('planDetailAweight', this.table),
            goodsAssistweight: this.getColumnSum('planDetailAassistweight', this.table),
            dataInmoney: this.getColumnSum('goodsInmoney', this.table)
          }
          Object.assign(this.copyForm, form)
          const removeRecords = []
          this.table.getRemoveRecords().map((item) => {
            item.dataFlag = 2
            removeRecords.push(item)
          })
          const updateRecords = this.table.getUpdateRecords()
          const insertRecords = this.table.getInsertRecords()
          const planDetailList = [...insertRecords, ...updateRecords, ...removeRecords]
          const params = {
            planMod: this.copyForm,
            planDetailList: planDetailList
          }
          this.saveAsync({planStr: JSON.stringify(params)})
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
          // this.goodsWinShow = true
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
          console.log('---copy', this.rowSelection[0])
          const copyData = this.extend(true, this.rowSelection[0])
          copyData.dataFlag = ''
          delete copyData._XID
          // console.log('------copyData', copyData)
          this.table.insertAt([copyData], -1)
          break
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }          
          this.table.remove(this.rowSelection[0])
          console.log('del', this.table.getTableData())
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
      console.log('---', row)
    },
    cellEdit({row, $rowIndex, column}) {
      // const this.table.getData($rowIndex)
      // this.tableValue.tableData[$rowIndex] = this.extend(true, row)
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
    async getMainMod (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/planEnrollAjax!edit.do', 'post', this.form)
        data.mainMod.planDate = this.toDateString(data.mainMod.planDate, 'yyyy-MM-dd HH:mm')
        this.copyForm = data.mainMod
        if (!this.copyForm.contractCtype) this.copyForm.contractCtype = ''
        if (!this.copyForm.ddTypeSettlement) this.copyForm.ddTypeSettlement = ''
        if (!this.copyForm.ddTypePayment) this.copyForm.ddTypePayment = ''
      } catch (e) {
        console.error(e)
      }
    },
    async getDetail () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/planEnrollAjax!queryDetail.do', 'post', this.form)
        this.tableValue.tableData = []
        if (data.detailList.length > 0) {
          this.tableValue.tableData = data.detailList
          this.formDisabled = true
        }
        this.loading = false    
      } catch (e) {
        this.loading = false
        console.error(e)
      }
    },
    async saveAsync (params) {
      const loading = this.loadShow()
      // debugger
      try {
        let api = 'scscm/app/planEnrollAjax!save.do'
        if (this.copyForm.planBillcode) {
          api = 'scscm/app/planEnrollAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', params)
        loading.close()
        if (data.map.state !== '3') {
          this.$message.error(data.map.msg ? data.map.msg : '保存失败')
          return
        }
        this.$message.success('保存成功')
        this.$emit('save')
        // this.loading = false
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
