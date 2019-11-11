<template lang="pug">
  el-dialog(title="入库通知登记", :visible="true", top="10px", width="1600px", @close="close")
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="入库单号", prop="entryinfBillcode")
            el-input.full-width(v-model="copyForm.entryinfBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="日期", prop="entryinfDate")
            el-date-picker.full-width(v-model="copyForm.entryinfDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="仓库", prop="warehouseName")
            warehouse-select(v-model="copyForm.warehouseName", @change="syncName($event, {warehouseName: 'warehouseName', warehouseCode: 'warehouseCode'})", :disabled="formDisabled")            
        el-col(:span="6")
          el-form-item(label="业务类别", prop="entryinfType")
            el-select.full-width(size="mini", v-model="copyForm.entryinfType", :disabled="formDisabled", @change="entryinfTypeChange")
              el-option(v-for="item in entryinfTypeList" :key="item.code" :label="item.name" :value="item.code")
        el-col(:span="6")
          el-form-item(label="类型", prop="entryinfClass")
            el-select.full-width(size="mini", v-model="copyForm.entryinfClass")
              el-option(v-for="item in entryinfClassList" :key="item.code" :label="item.name" :value="item.code")
        el-col(:span="6")
          el-form-item(label="结算单位", prop="datasBalcorp")
            company-select(v-model="copyForm.datasBalcorp", :typeStr="'GYS'", @change="syncName($event, {datasBalcorpname: 'companyName', datasSupplier:'companyCode', datasSuppliername: 'companyName'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="供货单位", prop="datasSupplier")
            company-select(v-model="copyForm.datasSupplier", :typeStr="'GYS'", @change="syncName($event, {datasSuppliername: 'companyName'})", :disabled="formDisabled")
        el-col(:span="6")  
          el-form-item(label="运输方式", prop="contractTransportmode")
            basic-select(v-model="form.contractTransportmode", :ddtypeClass="'ddTypeTransport'", :useName="true")
        el-col(:span="6")  
          el-form-item(label="结算方式", prop="ddTypeSettlement")
            basic-select(v-model="form.ddTypeSettlement", :ddtypeClass="'ddTypeSettlementSdp'", :useName="true")
        el-col(:span="6")  
          el-form-item(label="采购类型", prop="contractCtype")
            basic-select(v-model="form.contractCtype", :ddtypeClass="'contractCtype'", :useName="true")
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
          el-form-item(label="仓管员", prop="dataTally")            
            employee-select(v-model="copyForm.dataTally")        
        el-col(:span="6")
          el-form-item(label="费用金额", prop="dataInfeemoney")
            el-input.full-width(v-model="copyForm.dataInfeemoney", clearable, size="mini", disabled)            
        el-col(:span="6")
          el-form-item(label="制单人", prop="operatorName")
            el-input.full-width(v-model="copyForm.operatorName", clearable, size="mini", disabled)        
        el-col(:span="24")
          el-form-item(label="备注", prop="entryinfRemark")
            el-input.full-width(v-model="copyForm.entryinfRemark", clearable, size="mini")    
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
            sdpfee-win(:mainForm="copyForm", :sdpfeeShow="activeTab", ref="sdpfee", :rowDetail="rowSelection[0]", :feeConfig="feeConfig", :detailTable="table")
            //- sdpfee-win(:mainForm="copyForm", ref="sdpfee", :rowDetail="rowSelection[0]", :feeConfig="feeConfig", :detailTable="table")
    goods-win(v-if="goodsWinShow", @close="goodsWinShow = false", @sure="getGoodsWin")
    file-win(v-if="fileWinShow", @close="fileWinShow = false", :fileMod="fileMod", :table="tableValue.tableHead")
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
    purchase-contract-win(v-if="contractWinShow", :mainForm="copyForm" @close="contractWinShow=false", @cellBack="contractCellBack")
    purchase-consign-win(v-if="consignWinShow", :mainForm="copyForm" @close="consignWinShow=false", @cellBack="consignCellBack")
    shipment-win(v-if="shipmentWinShow", :mainForm="copyForm" @close="shipmentWinShow=false", @cellBack="shipmentCellBack")
</template>
<script>
import { mapState } from 'vuex'
import clauseWin from './clause'
import sdpfeeWin from '@/components/sdpfee'
import fileWin from '@/components/file'
import auditGlideView from '@/components/billtypeaudit'
import buttonGroup from '@/components/buttonGroup.vue'
import editTable from '@/components/editTable'
import goodsWin from '@/components/goodsWin'
import purchaseContractWin from '@/components/queryReport/purchaseContract' 
import purchaseConsignWin from '@/components/queryReport/purchaseConsign'
import shipmentWin from '@/components/queryReport/shipment'

export default {
  components: {
    buttonGroup,
    editTable,
    goodsWin,
    fileWin,
    auditGlideView,
    sdpfeeWin,
    clauseWin,
    purchaseContractWin,
    purchaseConsignWin,
    shipmentWin
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
      shipmentWinShow: false,
      consignWinShow: false,
      feeConfig: {
        otherParams:{billcode: 'entryinfBillcode', mainBackMoney:'dataInfeemoney', detailBackInprice:'goodsBinfeeprice', detailBackMoney:'goodsInfeemoney', feeBweight:'goodsWeight', feeOptbatch:'goodsEntrybatch'}
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
        validRules: {
          // goodsWeight: [{ required: true, message: '必填项' }],
          // goodsInprice: [{ required: true, message: '必填项' }],
          // goodsInmoney: [{ required: true, message: '必填项' }]
        },
        // adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
				priceMoneyComputerColumn: {goodsNum:'entryinfDetailPnum',goodsWeight:'entryinfDetailPweight',goodsAssistweight:'entryinfDetailPaassistweight',goodsInprice:'goodsBinprice'},
        tableHead: [
          {lbl: '收货机构', prop: 'datasInorgName', width: '150px', type: 'org', props: {datasInorgName: 'orgAbbreviate', datasInorgCode: 'orgCode'}},          
          {lbl: '货权转移', prop: 'entryinfDetailPermute', align:"center", minWidth: '100px', type: 'checkBox', trueLabel: 0, falseLabel: 1, formatter: ({cellValue}) => {
            return cellValue === 0 ? '不转移' : '转移'
          }},
          {lbl: '品名', prop: 'partsnameName', width: '150px', noedit: true},
          {lbl: '规格', prop: 'goodsSpec', width: '150px', noedit: true},
          {lbl: '材质', prop: 'goodsMaterial', width: '150px', noedit: true},
          {lbl: '产地', prop: 'productareaName', width: '150px', noedit: true},
          {lbl: '长度', prop: 'goodsProperty1'},
          {lbl: '米重', prop: 'goodsProperty2'},
          {lbl: '重量范围', prop: 'goodsProperty4'},
          {lbl: '公差范围', prop: 'goodsProperty5'},          
          {lbl: '入库数量', prop: 'goodsNum', summary: true, g_type: 'num'},
          {lbl: '入库重量', prop: 'goodsWeight', summary: true, g_type: 'weight'},
          {lbl: '厂发数量', prop: 'entryinfDetailPnum', summary: true, g_type: 'num'},
          {lbl: '厂发重量', prop: 'entryinfDetailPweight', summary: true, g_type: 'weight'},          
          {lbl: '验收数量', prop: 'entryinfDetailOknum', summary: true, g_type: 'num', noedit: true},
          {lbl: '验收重量', prop: 'entryinfDetailOkweight', summary: true, g_type: 'weight', noedit: true},
          {lbl: '数量单位', prop: 'partsnameNumunit'},
          {lbl: '重量单位', prop: 'partsnameWeightunit'},
          {lbl: '含税单价', prop: 'goodsBinprice', g_type: 'price'},
          {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money'},
          {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
          {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
          {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
          {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money', noedit: true},
          {lbl: '费用单价', prop: 'goodsInfeeprice', g_type: 'price', noedit: true},
          {lbl: '费用金额', prop: 'goodsInfeemoney', summary: true, g_type: 'money', noedit: true},
          {lbl: '发货日期', prop: 'consignDetailDate', noedit: true},         
          {lbl: '计量方式', prop: 'goodsMetering', width: '150px', type: 'basic',  ddtypeClass: 'goodsMetering', props: {goodsMetering: 'ddName'}},
          {lbl: '车皮号', prop: 'goodsContractstr2'},
          {lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true},
          {lbl: '件支数', prop: 'goodsPartsbranch'},          
          {lbl: '备注', prop: 'contractDetailRemark'},
          {lbl: '销售合同号', prop: 'scontractBillcode', noedit: true},
          {lbl: '业务单号', prop: 'contractDetailOptcode', noedit: true},
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
          consignDetailDate: this.toDateString(new Date(), 'yyyy-MM-dd')
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
      entryinfTypeList: [
        {code: 'P001', name: '市场散购'},
        {code: 'P002', name: '合同入库'},
        {code: 'P003', name: '发货入库'},
        {code: 'P004', name: '装运入库'}
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
    let isTrue = false
    if (!this.form.entryinfBillcode) isTrue = true
    if (this.form.flag === 'readyonly') {
      this.topButtonGroupInfo = [
        {lbl: '附件', type: 'file', icon: 'el-icon-files', disabled: false},
        {lbl: '打印', type: 'print', icon: 'el-icon-print'},
        {lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search', disabled: false}
      ]
      this.buttonGroupInfo = [
        {lbl: '新增', type: 'add', icon: 'el-icon-plus', disabled: true},
        {lbl: '复制', type: 'copy', icon: 'el-icon-document-copy', disabled: true},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete', disabled: true}
      ] 
    } else {
      this.topButtonGroupInfo = [
        {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},      
        {lbl: '采购合同', type: 'contract', icon: 'el-icon-document', disabled: isTrue},
        {lbl: '采购发货', type: 'consign', icon: 'el-icon-document', disabled: isTrue},
        {lbl: '采购装运', type: 'shipment', icon: 'el-icon-document', disabled: isTrue},
        {lbl: '附件', type: 'file', icon: 'el-icon-files', disabled: isTrue},
        {lbl: '打印', type: 'print', icon: 'el-icon-print'},
        {lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search', disabled: isTrue}
      ]
      this.buttonGroupInfo = [
        {lbl: '新增', type: 'add', icon: 'el-icon-plus', disabled: false},
        {lbl: '复制', type: 'copy', icon: 'el-icon-document-copy', disabled: false},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
      ]  
    }   
      
  },
  beforeMount () {
    this.copyForm = this.extend(true, this.form)
  },
  mounted () {
    this.$nextTick(() => {           
      if (this.form.entryinfBillcode) {
        this.fileMod = {
          fileBilltype: this.copyForm.billtypeCode,
          fileOpcode: this.copyForm.entryinfBillcode
        }        
        this.getMainMod()
        this.getDetail()        
      }
      this.table = this.$refs.editTable.$refs.basicEditable
    })
  },
  methods: {
    entryinfTypeChange (val) {
      if (this.form.flag === 'readyonly') {
        return false
      }
      this.buttonGroupInfo[0].disabled = true
      this.buttonGroupInfo[1].disabled = true
      this.topButtonGroupInfo[1].disabled = true
      this.topButtonGroupInfo[2].disabled = true
      this.topButtonGroupInfo[3].disabled = true
      switch (val) {
        case 'P001':
          this.buttonGroupInfo[0].disabled = false
          this.buttonGroupInfo[1].disabled = false
          break
        case 'P002':
          this.topButtonGroupInfo[1].disabled = false
          break
        case 'P003':
          this.topButtonGroupInfo[2].disabled = false
          break
        case 'P004':
          this.topButtonGroupInfo[3].disabled = false
          break
      }            
      console.log('---entryinfTypeChange', val)
    },
    insertTableData ({data, mainMod, clauseMod, tableMod, itemFun}) {
      const mainForm = {}
      const clauseForm = {}
      const tableDetail = [] 
      const idx = this.table.getTableData().fullData.length
      const resData = this.toArray(data)
      resData.map((item, index) => {
        let obj = {}
        Object.keys(tableMod).forEach(key => {
          item[key] = item[tableMod[key]]
        })        
        itemFun(item) // 自定义
        item.goodsEntrybatch = this.getTempBatchStr(idx + index)        
        item.goodsBinfeeprice = 0
			  item.goodsInfeemoney = 0
        obj = Object.assign({}, this.extend(true, this.tableValue.hiddenProp), item)                
        tableDetail.push(obj)
        for (const key in mainMod) {
          mainForm[key] = item[mainMod[key]]
        }
        for (const key in clauseMod) {
          clauseForm[key] = item[clauseMod[key]]
        }
      })      
      this.fileMod = {
        fileBilltype: data[0].billtypeCode,
        fileOpcode: data[0].entryinfBillcode
      }
      Object.assign(this.copyForm, mainForm) // 主表赋值
      Object.assign(this.clauseMod, clauseForm) // 辅助信息赋值
      this.table.insertAt(tableDetail, -1)
      this.table.updateFooter()
      this.formDisabled = true
    },
    shipmentCellBack (data) {
      // 采购装运
      const mainMod = {orgCode:'orgCode',deptCode:'deptCode',datasBalcorp:'datasBalcorp',entryinfClass:'shipmentClass',entryinfType:'entryinfType', datasBalcorpname:'datasBalcorpname',datasSupplier:'datasBalcorp',datasSuppliername:'datasBalcorpname'}
      const clauseMod = {ddTypeStartarea:'ddTypeStartarea',ddTypeDestination:'ddTypeDestination',ddTypeSpecialline:'ddTypeSpecialline',ddTypeTransferport:'ddTypeTransferport', entryinfTransportmode:'shipmentTransportmode'}
      const tableMod = {entryinfDetailOptcode: 'shipmentBillcode', entryinfDetailOptbatch: 'shipmentBillbatch', goodsEntrybatch: 'shipmentBillbatch', entryinfDetailBilltype: 'billtypeCode', consignBillcode: 'consignBillcode', consignBillbatch: 'consignBillbatch', musterBillcode: 'musterBillcode', musterBillbatch: 'musterBillbatch', shipmentBillcode: 'shipmentBillcode', shipmentBillbatch: 'shipmentBillbatch', scontractBillcode: 'scontractBillcode', scontractBillbatch: 'scontractBillbatch', goodsNum: 'noDetailNum', goodsWeight: 'noDetailWeight', goodsAssistweight: 'noDetailAssistweight', entryinfDetailPnum: 'noDetailNum', entryinfDetailPweight: 'noDetailWeight', entryinfDetailPassistweight: 'noDetailAssistweight', previousDataVernum: 'dataVernum', goodsBinprice: 'goodsInprice', goodsNewbinprice: 'goodsInprice',goodsInprice: 'goodsInprice', goodsExprice: 'goodsExprice', goodsTaxrate: 'goodsTaxrate', goodsInmoney: 'noDetailInmoney', goodsExmoney: 'noDetailExmoney', goodsTaxmoney: 'noDetailTaxmoney', datasInorgName: 'datasInorgName', datasInorgCode: 'datasInorgCode', ddTypeStartarea: 'ddTypeStartarea', ddTypeDestination: 'ddTypeDestination', ddTypeSpecialline: 'ddTypeSpecialline', ddTypeTransferport: 'ddTypeTransferport', datasOrdercorp: 'datasOrdercorp', datasOrdercorpname: 'datasOrdercorpname', datasAcceptcorp: 'datasAcceptcorp', datasAcceptcorpname: 'datasAcceptcorpname', companyCode: 'companyCode', companyName: 'companyName', consignDetailDate: 'shipmentDetailDate'}      
      this.insertTableData({data, mainMod, clauseMod, tableMod, itemFun: (item) => {
        item.goodsPreinfeeprice = this.toNumber(item.goodsInfeeprice) + this.toNumber(item.goodsPreinfeeprice)
      }})
      this.shipmentWinShow = false
    },
    consignCellBack (data) {
      // 采购发货
      const mainMod = {orgCode:'orgCode',deptCode:'deptCode',datasBalcorp:'datasBalcorp',entryinfClass:'consignClass',entryinfTypeentryinfType:'entryinfType', datasBalcorpname:'datasBalcorpname',datasSupplier:'datasBalcorp',datasSuppliername:'datasBalcorpname'}
      const clauseMod = {ddTypeStartarea:'ddTypeStartarea',ddTypeDestination:'ddTypeDestination',ddTypeSpecialline:'ddTypeSpecialline',ddTypeTransferport:'ddTypeTransferport',entryinfTransportmode:'contractTransportmode'}      
      const tableMod = {entryinfDetailOptcode: 'consignBillcode', entryinfDetailOptbatch: 'consignBillbatch', goodsEntrybatch: 'consignBillbatch', entryinfDetailBilltype: 'billtypeCode', consignBillcode: 'consignBillcode', consignBillbatch: 'consignBillbatch', scontractBillcode: 'scontractBillcode', scontractBillbatch: 'scontractBillbatch', goodsNum: 'noDetailNum', goodsWeight: 'noDetailWeight', goodsAssistweight: 'noDetailAssistweight', entryinfDetailPnum: 'noDetailNum', entryinfDetailPweight: 'noDetailWeight', entryinfDetailPassistweight: 'noDetailAssistweight', previousDataVernum: 'dataVernum', goodsBinprice: 'goodsInprice', goodsNewbinprice: 'goodsInprice', goodsInprice: 'goodsInprice', goodsExprice: 'goodsExprice', goodsTaxrate: 'goodsTaxrate', goodsInmoney: 'noDetailInmoney', goodsExmoney: 'noDetailExmoney', goodsTaxmoney: 'noDetailTaxmoney', datasInorgName: 'datasInorgName', datasInorgCode: 'datasInorgCode', datasOrdercorp: 'datasOrdercorp', datasOrdercorpname: 'datasOrdercorpname', datasAcceptcorp: 'datasAcceptcorp', datasAcceptcorpname: 'datasAcceptcorpname', companyCode: 'companyCode', companyName: 'companyName', consignDetailDate: 'consignDetailDate'}          
      
      this.insertTableData({data, mainMod, clauseMod, tableMod, itemFun: (item) => {
        item.goodsPreinfeeprice = this.toNumber(item.goodsInfeeprice)
      }})
      this.consignWinShow = false
    },
    contractCellBack(data) {    
      // 采购合同  
      const mainMod = {orgCode:'orgCode',deptCode:'deptCode',datasBalcorp:'datasBalcorp',entryinfClass:'contractClass',datasBalcorpname:'datasBalcorpname',datasSupplier:'datasBalcorp',datasSuppliername:'datasBalcorpname'}
      const clauseMod = {ddTypeStartarea:'ddTypeStartarea',ddTypeDestination:'ddTypeDestination',ddTypeSpecialline:'ddTypeSpecialline',ddTypeTransferport:'ddTypeTransferport',entryinfTransportmode:'contractTransportmode'}      
      const tableMod = {entryinfDetailOptcode: 'goodsContract', entryinfDetailOptbatch: 'goodsContractbatch', goodsEntrybatch: 'goodsContractbatch', entryinfDetailBilltype: 'billtypeCode', scontractBillcode: 'scontractBillcode', scontractBillbatch: 'scontractBillbatch', goodsNum: 'noDetailNum', goodsWeight: 'noDetailWeight', goodsAssistweight: 'noDetailAssistweight', entryinfDetailPnum: 'noDetailNum', entryinfDetailPweight: 'noDetailWeight', entryinfDetailPassistweight: 'noDetailAssistweight', previousDataVernum: 'dataVernum', goodsBinprice: 'goodsInprice', goodsNewbinprice: 'goodsInprice', goodsInprice: 'goodsInprice', goodsExprice: 'goodsExprice', goodsTaxrate: 'goodsTaxrate', goodsInmoney: 'noDetailInmoney', goodsExmoney: 'noDetailExmoney', goodsTaxmoney: 'noDetailTaxmoney', datasInorgName: 'datasInorgName',	datasInorgCode: 'datasInorgCode', datasOrdercorp: 'datasOrdercorp', datasOrdercorpname: 'datasOrdercorpname', datasAcceptcorp: 'datasAcceptcorp', datasAcceptcorpname: 'datasAcceptcorpname', companyCode: 'companyCode', companyName: 'companyName'}
      this.insertTableData({data, mainMod, clauseMod, tableMod, itemFun: (item) => {
        item.goodsPreinfeeprice = this.toNumber(item.goodsInfeeprice)
      }})
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
          item.datasInorgName = this.copyForm.orgName
          item.datasInorgCode = this.copyForm.orgCode
          // item.partsnameCode = item.goodscodeCode
          // item.datasIndeptName = this.copyForm.deptName
          // item.datasIndeptCode = this.copyForm.deptCode
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
          if (!this.copyForm.warehouseCode) {
            this.$message.error('请先输入仓库')
            return false
          }
          this.contractWinShow = true
          break 
        case 'consign':
          if (!this.copyForm.warehouseCode) {
            this.$message.error('请先输入仓库')
            return false
          }
          this.consignWinShow = true
          break
        case 'shipment':
          if (!this.copyForm.warehouseCode) {
            this.$message.error('请先输入仓库')
            return false
          }
          this.shipmentWinShow = true
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
          // debugger
          const params = {
            mainMod: this.copyForm,
            feeList: feeList,
            clauseMod: this.$refs.clause.form,
            detailList: consignDetailList,
            codeList: []
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
        case 'copy':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要复制的数据')
            return false
          }          
          const copyData = this.extend(true, this.rowSelection[0])          
          copyData.goodsEntrybatch=''
          copyData.entryinfDetailState=0
          copyData.dataGoodsflag=0
          copyData.dataFundflag=0
          copyData.entryinfDetailOknum=0
          copyData.entryinfDetailOkweight=0
          copyData.goodsBinfeeprice=0
          copyData.goodsInfeemoney=0
          copyData.goodsInfeeprice=0
          copyData.goodsNewinfeeprice=0
          copyData.dataInvoiceflag=0
          copyData.dataSubnum=0
          copyData.dataVernum=0
          copyData.dataFlag=0
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
          // 删除对应费用
          const sdpfeeTable = this.$refs.sdpfee.$refs.sdpfeeTable.$refs.basicEditable
          // debugger
          sdpfeeTable.remove(sdpfeeTable.getTableData().fullData)
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
        const { data } = await this.proxy(this, 'scscm/app/entryinfAjax!edit.do', 'post', this.copyForm)        
        if (data.map.state !== '3') {
          this.btnFlag = ''
          this.$message.error('操作失败')
          return false
        }
        const mainMod = JSON.parse(JSON.stringify(data.mainMod))
        
        this.clauseMod = data.clauseMod
        data.mainMod.entryinfDate = this.toDateString(data.mainMod.entryinfDate, 'yyyy-MM-dd HH:mm')
        Object.keys(this.copyForm).forEach((key) => {
          this.copyForm[key] = mainMod[key] ? mainMod[key] : this.copyForm[key]
        })
        console.log('consignClass', this.copyForm.consignClass)
        console.log('this.copyForm.entryinfType', this.copyForm.entryinfType)
        this.entryinfTypeChange(this.copyForm.entryinfType)
      } catch (e) {
        console.error(e)
      }
    },
    async getDetail () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/entryinfAjax!queryList.do', 'post', this.form)
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
        let api = 'scscm/app/entryinfAjax!save.do'
        if (this.copyForm.entryinfBillcode) {
          api = 'scscm/app/entryinfAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {entryinfStr: JSON.stringify(params)})
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
