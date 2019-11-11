<template lang="pug">
  el-dialog(title="采购合同登记", :visible="true", top="10px", width="1600px", @close="close")
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
    detail-win(
      v-if="planWinShow", 
      @close="planWinShow = false", 
      :config="planWinConfig", 
      :likeCol="planWinLikeCol",
      :searchFormItems="planWinSearchForm"
      :tableValue="planTable",
      @sure="planCellBack")
    detail-win(
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
import detailWin from '@/components/detailWin'

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
    detailWin
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
      contractWinConfig: {
        title: '',
        urlApi: ''
      },
      contractTable: {},
      contractWinSearchForm: [],
      contractWinLikeCol: ['scontractBillcode', 'scontractDetailRemark'],      
      contractWinShow: false,
      planWinConfig: {
        title: '',
        urlApi: ''
      },
      planTable: {},
      planWinSearchForm: [],
      planWinLikeCol: ['planBillcode', 'planDetailRemark'],      
      planWinShow: false,
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
      }
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
      {lbl: '采购计划', type: 'plan', icon: 'el-icon-document'},
      {lbl: '销售合同', type: 'contract', icon: 'el-icon-document'},
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
    contractCellBack({data}) {
      console.log('--------contractCellBack')
      // 销售合同
      const arr = []
      const resData = this.toArray(data)
      resData.map((item) => {
        let obj = {}
        item.contractDetailOptcode = item.scontractBillcode
        item.contractDetailOptbatch = item.scontractBillbatch
        item.contractDetailBilltype = item.billtypeCode
        // item.scontractBillcode = item.scontractBillcode
        // item.scontractBillbatch = item.scontractBillbatch
        item.datasOrdercorp = item.datasBalcorp
        item.datasOrdercorpname = item.datasBalcorpname
        item.datasInorgName = item.orgName
        item.datasInorgCode = item.orgCode
        item.datasIndeptName = item.deptName
        item.datasIndeptCode = item.deptCode
        // item.goodsTaxrate = item.goodsTaxrate
        item.goodsNum = item.scontractDetailNsbnum
        item.goodsWeight = item.scontractDetailNsbweight
        obj = Object.assign({}, this.extend(true, this.tableValue.hiddenProp), item)
        arr.push(obj)        
      })
      this.table.insertAt(arr, -1)
      this.formDisabled = true
      this.contractWinShow = false
    },
    planCellBack ({data}) {
      // 采购计划新增
      const arr = []
      const resData = this.toArray(data)
      resData.map((item) => {
        let obj = {}
        item.datasOrdercorp = item.goodsOrdercorpcode
        item.datasOrdercorpname = item.goodsOrdercorpname
        item.contractDetailOptcode = item.planBillcode
        item.contractDetailOptbatch = item.planBillbatch
        item.contractDetailBilltype = item.billtypeCode
        item.goodsNum = item.noDetailNum
        item.goodsWeight = item.noDetailWeight
        item.goodsAssistweight = item.noDetailAssistweight
        item.previousDataVernum = item.dataVernum
        item.goodsInmoney = item.noDetailInmoney
        item.goodsExmoney = item.noDetailExmoney
        item.goodsTaxmoney = item.noDetailTaxmoney
        item.datasOrdercorp = item.goodsOrdercorpcode
        item.datasOrdercorpname = item.goodsOrdercorpname
        item.datasAcceptcorp = item.goodsOrdercorpcode
        item.datasAcceptcorpname = item.goodsOrdercorpname
        obj = Object.assign({}, this.extend(true, this.tableValue.hiddenProp), item)
        arr.push(obj)
      })
      this.table.insertAt(arr, -1)
      this.formDisabled = true
      this.planWinShow = false
    },    
    syncName(e, obj) {      
      Object.keys(obj).forEach((key) => {
        this.copyForm[key] = e[obj[key]]
      })
      console.log('this.copyForm', this.copyForm)
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
        this.table.insertAt(arr, -1)
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
        case 'plan':
          this.planWinConfig = {
            title: '未完成业务明细',
            urlApi: 'scscm/app/planEnrollAjax!queryReport.do'
          }
          this.planTable = {
            selection: true,
            pageination: true,
            tableHeight: '100%',
            tableHead: [
              {lbl: '单据号', prop: 'planBillcode', width: '150'},
              {lbl: '日期', prop: 'planDate', formatter: ({cellValue}) => {
                return this.toDateString(cellValue, 'yyyy-MM-dd')
              }},
              {lbl: '供货单位', prop: 'datasBalcorpname', width: '150'},
              {lbl: '品名', prop: 'partsnameName'},
              {lbl: '材质', prop: 'goodsMaterial'},
              {lbl: '规格', prop: 'goodsSpec'},
              {lbl: '产地', prop: 'productareaName'},
              {lbl: '未执行数量', prop: 'noDetailNum'},
              {lbl: '未执行重量', prop: 'noDetailWeight'},
              {lbl: '业务类别', prop: 'planTypeStr'},
              {lbl: '采购类型', prop: 'contractCtype'},
              {lbl: '结算方式', prop: 'ddTypeSettlement'},
              {lbl: '付款方式', prop: 'ddTypePayment'},
              {lbl: '长度', prop: 'goodsProperty1'},
              {lbl: '米重', prop: 'goodsProperty2'},
              {lbl: '重量范围', prop: 'goodsProperty4'},
              {lbl: '公差范围', prop: 'goodsProperty5'},
              {lbl: '申请数量', prop: 'planDetailAnum', g_type: 'num'},
              {lbl: '申请重量', prop: 'planDetailAweight', g_type: 'weight'},
              {lbl: '批准数量', prop: 'goodsNum', g_type: 'num'},
              {lbl: '批准重量', prop: 'goodsWeight', g_type: 'weight'},
              {lbl: '含税单价', prop: 'goodsInprice', g_type: 'price'},
              {lbl: '含税金额', prop: 'goodsInmoney', g_type: 'money'},
              {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
              {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
              {lbl: '无税金额', prop: 'goodsExmoney', width: '120px', g_type: 'money'},
              {lbl: '税额', prop: 'goodsTaxmoney', width: '120px', g_type: 'money'},
              {lbl: '数量单位', prop: 'partsnameNumunit'},
              {lbl: '重量单位', prop: 'partsnameWeightunit'},
              {lbl: '计量方式', prop: 'goodsMetering'},
              {lbl: '车皮号', prop: 'goodsContractstr2'},
              {lbl: '入库批号', prop: 'goodsEntrystr1'},
              {lbl: '期货原货主代码', prop: 'goodsEntrystr4'},
              {lbl: '期货原货主名称', prop: 'goodsEntrystr5'},
              {lbl: '件支数', prop: 'goodsPartsbranch'},
              {lbl: '起运港/地', prop: 'ddTypeStartarea'},
              {lbl: '到站港/地', prop: 'ddTypeDestination'},
              {lbl: '专用线', prop: 'ddTypeSpecialline'},
              {lbl: '订货单位', prop: 'goodsOrdercorpname'},
              {lbl: '收货机构', prop: 'datasInorgName'},
              {lbl: '收货部门', prop: 'datasIndeptName'},
              {lbl: '业务机构', prop: 'orgName'},
              {lbl: '业务部门', prop: 'deptName'},
              {lbl: '业务员', prop: 'employeeName'},
              {lbl: '制单人', prop: 'operatorName'},
              {lbl: '备注', prop: 'planDetailRemark'},
              {lbl: '销售合同号', prop: 'scontractBillcode'},
            ],
            tableData: []
          }
          const datasBalcorpDisabled = this.copyForm.datasSupplier !== ''
          this.planWinSearchForm = [
            {lbl: '起始日期', prop: 'startDate', val: this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
            {lbl: '结束日期', prop: 'endDate', val: this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
            {lbl: '单据号', prop: 'planBillcode', val: ''},
            {lbl: '供货单位', prop: 'datasBalcorp', val: this.copyForm.datasSupplier, type:"company", disabled: datasBalcorpDisabled},
            {lbl: '业务机构', prop: 'orgCode', val: this.copyForm.orgCode, type:"org", disabled: true},
            {lbl: '业务部门', prop: 'deptCode', val: this.copyForm.deptCode, type:"dept", disabled: true},
            {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee"},
            {lbl: '制单人', prop: 'operatorCode', val: '', type:"operator"},
            {lbl: '备注', prop: 'planRemark', val: ''}
          ]
          this.planWinLikeCol = ['planBillcode', 'planDetailRemark']
          this.planWinShow = true
          break
        case 'contract':
          this.contractWinConfig = {
            title: '未完成销售合同明细',
            urlApi: 'scscm/app/scontractEnrollAjax!queryReport.do'
          }
          this.contractTable = {
            selection: true,
            pageination: true,
            tableHeight: '100%',
            tableHead: [
              {lbl: '单据号', prop: 'scontractBillcode'},
              {lbl: '日期', prop: 'scontractDate', formatter: ({cellValue}) => {
                return this.toDateString(cellValue, 'yyyy-MM-dd')
              }},
              {lbl: '结算单位', prop: 'datasBalcorpname'}, 
              {lbl: '未执行数量', prop: 'scontractDetailNsbnum', g_type:'num'},
              {lbl: '未执行重量', prop: 'scontractDetailNsbweight', g_type:'weight'},
              {lbl: '合同性质', prop: 'scontractDetailTypeStr'},
              {lbl: '加工', prop: 'scontractDetailMacStr'},
              {lbl: '仓库', prop: 'warehouseName'},                            
              {lbl: '品名', prop: 'scontractDetailPartsname'},
              {lbl: '材质', prop: 'scontractDetailMaterial'},
              {lbl: '规格', prop: 'scontractDetailSpec'},
              {lbl: '产地', prop: 'scontractDetailProareaname'},
              {lbl: '数量', prop: 'goodsNum', g_type:'num'},
              {lbl: '重量', prop: 'goodsWeight', g_type:'weight'},
              {lbl: '提单执行数量', prop: 'scontractDetailSbnum', g_type:'num'},
              {lbl: '提单执行重量', prop: 'scontractDetailSbweight', g_type:'weight'},
              {lbl: '加工执行数量', prop: 'scontractDetailMnum', g_type:'num'},
              {lbl: '加工执行重量', prop: 'scontractDetailMweight', g_type:'weight'},
              {lbl: '加工未执行数量', prop: 'scontractDetailNmnum', g_type:'num'},
              {lbl: '加工未执行重量', prop: 'scontractDetailNmweight', g_type:'weight'},
              {lbl: '采购执行数量', prop: 'scontractDetailCnum', g_type:'num'},
              {lbl: '采购执行重量', prop: 'scontractDetailCweight', g_type:'weight'},
              {lbl: '实提数量', prop: 'scontractDetailOnum', g_type:'num'},
              {lbl: '实提重量', prop: 'scontractDetailOweight', g_type:'weight'},
              {lbl: '入库厂发数量', prop: 'scontractDetailEnum', g_type:'num'},
              {lbl: '入库厂发重量', prop: 'scontractDetailEweight', g_type:'weight'},
              {lbl: '变更数量', prop: 'scontractDetailChnum', g_type:'num'},
              {lbl: '变更重量', prop: 'scontractDetailChweight', g_type:'weight'},
              {lbl: '数量单位', prop: 'partsnameNumunit'},
              {lbl: '重量单位', prop: 'partsnameWeightunit'},
              {lbl: '含税单价', prop: 'goodsBinprice', g_type: 'price'},
              {lbl: '含税金额', prop: 'goodsInmoney', g_type: 'money'},
              {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
              {lbl: '无税金额', prop: 'goodsExmoney', width: '120px', g_type: 'money'},
              {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
              {lbl: '税额', prop: 'goodsTaxmoney', width: '120px', g_type: 'money'},
              {lbl: '计量方式', prop: 'goodsMetering'},
              {lbl: '货权机构', prop: 'goodsOrgName'},
              {lbl: '货权部门', prop: 'goodsDeptName'},
              {lbl: '入库批号', prop: 'goodsEntrystr1'},
              {lbl: '期货原货主代码', prop: 'goodsEntrystr4'},
              {lbl: '期货原货主名称', prop: 'goodsEntrystr5'},
              {lbl: '项目', prop: 'companyProjectName'},
              {lbl: '原始单号', prop: 'scontractOthercode'},
              {lbl: '销售类型', prop: 'scontractCtype'},
              {lbl: '类型', prop: 'scontractClassStr'},
              {lbl: '业务机构', prop: 'orgName'},
              {lbl: '业务部门', prop: 'deptName'},
              {lbl: '业务员', prop: 'employeeName'},
              {lbl: '制单人', prop: 'operatorName'},
              {lbl: '备注', prop: 'scontractDetailRemark'},
              {lbl: '业务单号', prop: 'scontractDetailOptcode'}
            ],
            tableData: []
          }
          this.contractWinSearchForm = [
            {lbl: '起始日期', prop: 'startDate', val: this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
            {lbl: '结束日期', prop: 'endDate', val: this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm'), type: 'datetime', format: 'yyyy-MM-dd HH:mm'},
            {lbl: '单据号', prop: 'scontractBillcode', val: ''},
            {lbl: '仓库', prop: 'warehouseCode', val: '', type:"warehouse"},
            {lbl: '结算单位', prop: 'datasBalcorp', val: this.copyForm.datasBalcorp, type:"company"},
            {lbl: '品名', prop: 'scontractDetailPartsname', val: '', type:"goods"},
            {lbl: '材质', prop: 'scontractDetailMaterial', val: '', type:"material"},
            {lbl: '规格', prop: 'scontractDetailSpec', val: '', type:"spec"},
            {lbl: '产地', prop: 'productareaName', val: '', type:"area"},
            {lbl: '业务机构', prop: 'orgCode', val: '', type:"org"},
            {lbl: '业务部门', prop: 'deptCode', val: '', type:"dept"},
            {lbl: '业务员', prop: 'employeeCode', val: '', type:"employee"},
            {lbl: '制单人', prop: 'operatorCode', val: '', type:"operator"},
            {lbl: '合同性质', prop: 'scontractDetailType', val: '配货', disabled: true},
            {lbl: '备注', prop: 'planRemark', val: ''}
          ]
          this.contractWinLikeCol = ['scontractBillcode', 'scontractDetailRemark']
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
          this.table.insertAt([copyData], -1)
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
    cellEdit({row, $rowIndex, column}) {
      // const this.table.getData($rowIndex)
      // this.tableValue.tableData[$rowIndex] = this.extend(true, row)
    },
    tabChange (tab, event) {
      console.log(tab, event)
    },
    async getMainMod (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/purchaseContractEnrollAjax!edit.do', 'post', this.form)
        data.mainMod.contractDate = this.toDateString(data.mainMod.contractDate, 'yyyy-MM-dd HH:mm')
        console.log(typeof(data.mainMod))
        const mainMod = data.mainMod
        Object.keys(this.copyForm).forEach((key) => {
          this.copyForm[key] = mainMod[key] ? mainMod[key] : this.copyForm[key]
        })
        this.clauseMod = data.clauseMod
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
