<template lang="pug">
  el-dialog(title="销售合同登记", ref="dialog", :visible="true", fullscreen, @close="close")
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="单据号", prop="scontractBillcode")
            el-input.full-width(v-model="copyForm.scontractBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="日期", prop="scontractDate")
            el-date-picker.full-width(v-model="copyForm.scontractDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="原始单号", prop="scontractOthercode")
            el-input.full-width(v-model="copyForm.scontractOthercode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="销售类型", prop="scontractCtype")
            basic-select(v-model="copyForm.scontractCtype", :ddtypeClass="'scontractCtype'", :useName="true")                      
        el-col(:span="6")
          el-form-item(label="类型", prop="scontractClass")
            el-select.full-width(v-model="copyForm.scontractClass", size="mini")
              el-option(v-for="item in contractClassList", :key="item.code", :label="item.name", :value="item.code")
        el-col(:span="6")
          el-form-item(label="结算单位", prop="datasBalcorp")
            company-select(v-model="copyForm.datasBalcorp", :typeStr="'KH'", @change="syncName($event, {datasBalcorpname: 'companyName', datasCustomer:'companyCode', datasCustomername: 'companyName'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="购货单位", prop="datasCustomer")
            company-select(v-model="copyForm.datasCustomer", :typeStr="'KH'", @change="syncName($event, {datasCustomername: 'companyName'})", :disabled="formDisabled")                    
        el-col(:span="6")
          el-form-item(label="项目", prop="companyProjectName")
            company-project-select(v-model="copyForm.companyProjectName", :companyCode="copyForm.datasBalcorp || ''", @change="syncName($event, {companyProjectName: 'projectName', companyProjectCode: 'projectCode'})")            
        el-col(:span="6")
          el-form-item(label="业务机构", prop="orgCode")
            org-select(v-model="copyForm.orgCode", @change="syncName($event, {orgName: 'orgName', orgAbbreviate: 'orgAbbreviate'})", :disabled="formDisabled")              
        el-col(:span="6")
          el-form-item(label="业务部门", prop="deptCode")
            dept-select(v-model="copyForm.deptCode", @change="syncName($event, {deptName: 'deptName'})", :disabled="formDisabled")        
        el-col(:span="6")
          el-form-item(label="业务员", prop="employeeCode")
            employee-select(v-model="copyForm.employeeCode")
        el-col(:span="6")
          el-form-item(label="制单人", prop="operatorName")
            el-input.full-width(v-model="copyForm.operatorName", clearable, size="mini", readonly)
        el-col(:span="24")
          el-form-item(label="备注", prop="scontractRemark")
            el-input.full-width(v-model="copyForm.scontractRemark", clearable, size="mini")    
    .mt-10.edit
      el-tabs(v-model="activeTab" type="border-card" @tab-click="tabChange", size="mini")
        el-tab-pane(label="物资明细" name="1")
          .pt-10.pb-10.edit(style="height: 100%")            
            db-edit-table(
              :thisDialog="this",
              :elTable="true",
              ref="dbEditTable",
              @detailRowSelection="detailRowSelection",
              @codeRowSelection="codeRowSelection",
              :detailConfig="detailConfig",
              :codeConfig="codeConfig",
              :beforeDetailEdit="beforeDetailEdit",
              @detailBtnClick="detailBtnClick",
              @codeBtnClick="codeBtnClick")    
        el-tab-pane(label="加工信息" name="2")
          .pt-10.pb-10
            sdp-mac-grid(
              ref="sdpMac", 
              :sdpMacShow="activeTab", 
              :detailSelect="rowSelection[0]",
              :codeSelect="codeSelection[0]", 
              :model="sdpMacModel",
              :thisDialog="this",
              :config="sdpMacConfig", 
              :mainRef="$refs.form", 
              :detailRef="table")
        el-tab-pane(label="辅助信息" name="3")
          clause-win(ref="clause", :clauseMod="clauseMod")
        el-tab-pane(label="条款" name="4")
          .pt-10.pb-10
            terms-win(:mainMod="form", ref="terms", :termList="termDetail")
    goods-win(v-if="goodsWinShow", @close="goodsWinShow = false", @sure="getGoodsWin")
    file-win(v-if="fileWinShow", @close="fileWinShow = false", :fileMod="fileMod", :table="detailConfig.tableValue.tableHead")
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
    //- 期货物资
    scontractEnroll-futures-win(v-if="futuresWinShow", :queryParam="futuresQueryParam", :mainForm="copyForm" @close="futuresWinShow=false", @cellBack="futuresCellBack")
    //- 现货物资
    sdp-goods-detail-win(v-if="sdpGoodsWinShow", :uniqueField="'goodsCodebill'", :parentRef="goodsDetailRef", :queryParam="sdpGoodsQueryParam", @close="sdpGoodsWinShow=false", @sure="sdpGoodsCellBack")
    //- 汇总物资
    sdp-goods-report-win(v-if="sumGoodsWinShow", :uniqueField="'sumgoodsBatch'", :parentRef="table.$refs.detailTable.$refs.basicEditable", :queryParam="sumGoodsQueryParam", @close="sumGoodsWinShow = false", @cellBack="sumGoodsCellBack")
    //- 特权密码
    password-win(v-if="passwordShow", :config="pWConfig", @cellback="pwCellBack", @close="passwordShow = false")
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
import dbEditTable from '@/components/dbEditTable'
import goodsWin from '@/components/goodsWin'
import scontractEnrollFuturesWin from '@/components/queryReport/scontractEnrollFutures'
import sdpGoodsDetailWin from '@/components/queryReport/sdpGoodsDetail'
import sdpGoodsReportWin from '@/components/queryReport/sdpGoodsReport'
import sdpMacGrid from '@/components/sdpMac/sdpMacGrid'
import passwordWin from '@/components/passwordWin'

export default {
  components: {
    buttonGroup,
    ddSelect,
    basicSelect,
    companySelect,
    orgSelect,
    deptSelect,
    employeeSelect,
    dbEditTable,
    goodsWin,
    fileWin,
    auditGlideView,
    termsWin,
    clauseWin,
    sdpGoodsDetailWin,
    scontractEnrollFuturesWin,
    sdpGoodsReportWin,
    sdpMacGrid,
    passwordWin
  },
  props: {
    form: {
      type: Object,
      default: () => {
        return {}
      }
    },
    flag: {
      type: Number,
      default: 0 //  0 新增 1 修改 2 审核
    }
  },
  data () {
    return {
      sdpMacModel: ['dataFlag','scontractMtaskId','scontractBillcode','scontractMtaskBillbatch','scontractBillbatch','scontractCodeBatch','scontractMtaskFilterbatch','scontractMtaskDate','memberCode','scontractMtaskMac','mtaskDetailsClass','mtaskDetailsProcess','mtaskDetailsMtime','mtaskDetailsMstae','equsettingCode','datasCustomer','datasCustomername','machineDetailState','mtaskDetailsRemark','orgCode','deptCode','dataVernum','warehouseCode','goodstreeCode','pntreeName','productareaName','partsnameName','goodsMaterial','goodsSpec','goodsSpec1','goodsSpec2','goodsSpec3','goodsSpec4','goodsProperty1','goodsProperty2','goodsProperty3','goodsProperty4','goodsProperty5','goodsNumproperty1','goodsNumproperty2','goodsContract','goodsContractbatch','goodsContractstr1','goodsContractstr2','goodsContractstr3','goodsContractstr4','goodsContractstr5','goodsEntrybatch','goodsEntrybatchold','goodsEntrystr1','goodsEntrystr2','goodsEntrystr3','goodsEntrystr4','goodsEntrystr5','goodsCodebill','goodsWmscodebill','goodsCodebillold','goodsCodestr1','goodsCodestr2','goodsCodestr3','goodsCodestr4','goodsCodestr5','goodsCodestr6','goodsCodestr7','goodsCodestr8','goodsCodestr9','goodsCodestr10','goodsCodenum1','goodsCodenum2','goodsCodenum3','partsnameSplit','goodsProperty','goodsPartsbranch','goodsWetpercentage','goodsOrg','goodsDept','goodsCurrency','goodsExrate','companyCode','companyName','partsnameNumunit','partsnameWeightunit','goodsMetering','goodsPriceun','goodsPiecemode','goodsWeightmode','goodsCustomscode','goodsEnname','goodsEndescribe','goodsBatch','goodsIndustry','goodsNum','goodsPiecenum','goodsSingernum','goodsWeight','goodsAssistweight','mtaskDetailsOnum','mtaskDetailsOweight','mtaskDetailsOassistweight','mtaskDetailsOknum','mtaskDetailsOkweight','mtaskDetailsOkassistweight','mtaskDetailsNum','mtaskDetailsWeight','mtaskDetailsAssistweight','mtaskDetailsBnum','mtaskDetailsBweight','mtaskDetailsBassistweight'],
      passwordShow: false,
      pWConfig: {},
      sdpMacConfig: {
        detailRef: 'detailTable',
        codeRef: 'codeTable'
      },
      goodsDetailRef: null,
      futuresWinShow: false,
      sdpGoodsWinShow: false,
      sumGoodsWinShow: false,
      sumGoodsQueryParam: {},
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
        // {lbl: '复制', type: 'copy', icon: 'el-icon-document-copy'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
      ],      
      detailConfig: {
        id: 'scontractUp',
        ref: 'detailTable',
        relationBatch: 'scontractBillbatch', // TODO 过滤明细和码单
        loading: false,
        buttonGroupInfo: [
          {lbl: '增加', type: 'add', icon: 'el-icon-plus'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
        ],
        tableValue: {        
          hasCbx: false,
          pageShow: false,
          showRowIndex: true,
          showSummary: true,
          validRules: {
            goodsBinprice: [{ required: true, message: '必填项' }],
            warehouseName: [{ required: true, message: '必填项' }],
            goodsWeight: [{ required: true, message: '必填项' }]
          },
          adjustColumn: {partsnameName:'scontractDetailPartsname',goodsMaterial:'scontractDetailMaterial',goodsSpec:'scontractDetailSpec',productareaName:'scontractDetailProareaname', goodsSpec1:'scontractDetailSpec1',goodsSpec2:'scontractDetailSpec2',goodsSpec3:'scontractDetailSpec3',goodsSpec4:'scontractDetailSpec4', goodsProperty1:'scontractDetailProperty1',goodsProperty2:'scontractDetailProperty2',goodsProperty3:'scontractDetailProperty3',goodsProperty4:'scontractDetailProperty4', goodsProperty5:'scontractDetailProperty5',goodsNumproperty1:'scontractDetailNumproperty1',goodsNumproperty2:'scontractDetailNumproperty2'},
          priceMoneyComputerColumn: {goodsInprice:'goodsBinprice'},
          tableHead: [
            {lbl: '合同性质', prop: 'scontractDetailTypeStr', width: '150px', noedit: true},
            {lbl: '加工', prop: 'scontractDetailMac', width: '150px', formatter: ({cellValue}) => {
              const obj = {'0': '不加工', '1': '订货加工', '2': '销售代加工'}
              return obj[cellValue]
            }, type: 'select', list: [{label: '不加工', value: 0}, {label: '订货加工', value: 1}, {label: '销售代加工', value: 2}]},
            {lbl: '仓库', prop: 'warehouseName', width: '150px', type: 'warehouse', props: {warehouseName: 'warehouseName', warehouseCode: 'warehouseCode'}},
            {lbl: '品名', prop: 'scontractDetailPartsname', width: '150px', type: 'goods', props: {scontractDetailPartsname: 'partsnameName', partsnameName: 'partsnameName', pntreeName:'pntreeName', industryCode:'industryCode', goodsPriceun:'goodsPriceun', goodsPiecemode:'goodsPiecemode', goodsWeightmode:'goodsWeightmode', goodsMetering:'goodsMetering', goodsProperty:'goodsProperty'}},
            {lbl: '材质', prop: 'scontractDetailMaterial', width: '150px', type: 'material', props: {scontractDetailMaterial: 'goodsMaterial', goodsMaterial: 'goodsMaterial'}},
            {lbl: '规格', prop: 'scontractDetailSpec', width: '150px', type: 'spec', props: {scontractDetailSpec: 'goodsSpec', goodsSpec: 'goodsSpec'}},            
            {lbl: '产地', prop: 'scontractDetailProareaname', width: '150px', type: 'area', props: {scontractDetailProareaname: 'productareaName', productareaName: 'productareaName'}},
            {lbl: '数量1', prop: 'goodsNum', summary: true, g_type: 'num', minValue:0},
            {lbl: '重量1', prop: 'goodsWeight', summary: true, g_type: 'weight', minValue:0},
            {lbl: '数量单位', prop: 'partsnameNumunit', type: 'basic', ddtypeClass: 'partsnameNumunit', props: {partsnameNumunit: 'ddName'}},
            {lbl: '重量单位', prop: 'partsnameWeightunit', type: 'basic', ddtypeClass: 'partsnameWeightunit', props: {partsnameWeightunit: 'ddName'}},
            {lbl: '含税单价', prop: 'goodsBinprice', g_type: 'price'},
            {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money'},            
            {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
            {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money'},
            {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
            {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money', noedit: true},
            {lbl: '计量方式', prop: 'goodsMetering', width: '150px', type: 'basic',  ddtypeClass: 'goodsMetering', props: {goodsMetering: 'ddName'}},
            {lbl: '货权机构', prop: 'goodsOrgName', noedit: true},
            {lbl: '货权部门', prop: 'goodsDeptName', noedit: true},
            {lbl: '件支数', prop: 'goodsPartsbranch', noedit: true},
            {lbl: '车皮号', prop: 'goodsContractstr2', noedit: true},
            {lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true},
            {lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true},
            {lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true},
            {lbl: '备注', prop: 'scontractDetailRemark'},
            {lbl: '业务单号', prop: 'scontractDetailOptcode', noedit: true},
          ],
          hiddenProp: {            
            // 新增tableValue.tableData时使用
          },
          tableData: []
        }
      },
      codeConfig: {      
        id: 'scontractDown',
        ref: 'codeTable',
        loading: false,
        buttonGroupInfo: [
          {lbl: '配码', type: 'futures', icon: 'el-icon-document'},
          {lbl: '删除', type: 'del', icon: 'el-icon-delete'},
          {lbl: '预加工', type: 'mac', icon: 'el-icon-document'},
        ],
        backColParam: {goodsNum:'goodsNum',goodsWeight:'goodsWeight',goodsAssistweight:'goodsAssistweight'},
        tableValue: {
          hasCbx: false,
          pageShow: false,
          showRowIndex: true,
          showSummary: true,
          validRules: {
            sumglideGinmoney: [{ required: true, message: '必填项' }]
          },          
          tableHead: [            
            {lbl: '规格', prop: 'goodsSpec', width: '150px', noedit: true},
            {lbl: '计量方式', prop: 'goodsMetering', width: '150px', type: 'basic',  ddtypeClass: 'goodsMetering', props: {goodsMetering: 'ddName'}},          
            {lbl: '数量', prop: 'goodsNum', summary: true, g_type: 'num'},
            {lbl: '重量', prop: 'goodsWeight', summary: true, g_type: 'weight'},
            {lbl: '数量单位', prop: 'partsnameNumunit', type: 'basic', ddtypeClass: 'partsnameNumunit', props: {partsnameNumunit: 'ddName'}},
            {lbl: '重量单位', prop: 'partsnameWeightunit', type: 'basic', ddtypeClass: 'partsnameWeightunit', props: {partsnameWeightunit: 'ddName'}},
            {lbl: '备注', prop: 'scontractCodeRemark'},
            {lbl: '库位', prop: 'goodsCodestr1', noedit: true},
            {lbl: '捆包号', prop: 'goodsCodestr2', noedit: true},
            {lbl: '炉批号', prop: 'goodsCodestr3', noedit: true},
            {lbl: '仓储号', prop: 'goodsCodestr4', noedit: true},
            {lbl: '件编号', prop: 'goodsCodestr5', noedit: true},
            {lbl: '库区', prop: 'goodsCodestr10', noedit: true}
          ],
          hiddenProp: {
            // 新增tableValue.tableData时使用
          },
          tableData: []
        }        
      },
      rowSelection: [],
      codeSelection: [],  
      delRow: [],
      rules: {
        scontractDate: [{ required: true }],
        // datasSupplier: [{ required: true }],
        datasCustomer: [{ required: true }],
        datasBalcorp: [{ required: true }],
        orgCode: [{ required: true }],
        deptCode: [{ required: true }],
        employeeCode: [{ required: true }]
      },
      contractClassList: [
        {code: 0, name: '甲'},
        {code: 1, name: '乙'},
        {code: 2, name: '丙'},
      ],
      copyForm: {},
      clauseMod: {},
      termDetail: [],
      formDisabled: false,
      table: null,
      detailTable: null,
      codeTable: null,
      fileMod: {
        fileBilltype: '',
        fileOpcode: ''
      },
      mainMod: {},
      btnFlag: '',
      futuresQueryParam: {},
      sdpGoodsQueryParam: {},
      codeFutures: false
    }
  },  
  computed: {
    ...mapState({
      g_format: state => state.g_format
    })
  },
  created () {
    switch (this.flag) {
      case 0:
        this.topButtonGroupInfo = [
          {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},      
          {lbl: '期货物资', type: 'futures', icon: 'el-icon-document'},
          {lbl: '现货物资', type: 'goods', icon: 'el-icon-document'},
          {lbl: '汇总物资', type: 'sumgoods', icon: 'el-icon-document'},          
          {lbl: '打印', type: 'print', icon: 'el-icon-print'}          
        ]
        break
      case 1:
        this.topButtonGroupInfo = [
          {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},      
          {lbl: '期货物资', type: 'futures', icon: 'el-icon-document'},
          {lbl: '现货物资', type: 'goods', icon: 'el-icon-document'},
          {lbl: '汇总物资', type: 'sumgoods', icon: 'el-icon-document'},
          {lbl: '附件', type: 'file', icon: 'el-icon-files'},
          {lbl: '打印', type: 'print', icon: 'el-icon-print'},
          {lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search'}
        ]
        break
      default:  
        console.log('缺少flag')
        break
    }    
  },
  beforeMount () {
    this.copyForm = this.extend(true, this.form)
    if (this.form.scontractBillcode) {
      this.fileMod = {
        fileBilltype: this.copyForm.billtypeCode,
        fileOpcode: this.copyForm.scontractBillcode
      }
      const mainParams = {
        scontractBillcode: this.copyForm.scontractBillcode,
        billtypeCode:this.copyForm.billtypeCode,
        feeOptcode: this.copyForm.scontractBillcode,
        feeBilltype:this.copyForm.billtypeCode,
      }
      this.queryParams = {        
        page:1,
        start:0,
        limit:25
      }
      const termParams = {
        termlistOptcode: this.copyForm.scontractBillcode,
        billtypeCode: this.copyForm.billtypeCode,
        page: 1,
        start: 0,
        limit:25
      }
      Object.assign(this.queryParams, mainParams)
      this.getMainMod(mainParams)
      this.getDetail()
      this.getTermDetail(termParams)
      this.getCodeList()
    }
  },
  mounted () {
    this.$nextTick(() => {      
      this.table = this.$refs.dbEditTable
    })
  },
  methods: {    
    beforeDetailEdit ({row, rowIndex, column, columnIndex}) {
      if (column.property === 'scontractDetailMac') return row.scontractDetailTypeStr !== '期货'
      if (column.property === 'goodsWeight' || column.property === 'goodsNum') return row.scontractDetailType !== '01'
      return true
    },
    detailRowSelection (row) {
      this.rowSelection = row ? [row] : [] 
    },
    codeRowSelection (row) {
      this.codeSelection = row ? [row] : []
    },
    detailBtnClick(flag) {
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
          this.table.detailRemove(this.rowSelection[0])
          const fullData = this.table.$refs.detailTable.$refs.basicEditable.getTableData().fullData
          // debugger
          this.$refs.sdpMac.macRemove()
          if (fullData.length === 0) this.formDisabled = false
          break
        default:
          break
      }
    },
    codeBtnClick(flag) {
      switch(flag) {
        case 'futures':
          // 配码
          const detailTable = this.table.$refs.detailTable.$refs.basicEditable
          const fullData = detailTable.getTableData().fullData
          if (fullData.length === 0) {
            this.$message.error('请增加明细!')
            return false
          }
          if (this.rowSelection.length === 0) {
            this.$message.error('请先选择明细!')
            return false
          }
          const rowSelection = this.rowSelection[0]
          if(rowSelection.scontractDetailType !== '01'){
            this.$message.error('期货或配货不允许配码!')
            return false;
          }
          this.sdpGoodsQueryParam = {
            sumgoodsBatch: rowSelection.sumgoodsBatch,
            warehouseCode: rowSelection.warehouseCode,
            goodsOrg: rowSelection.goodsOrg,
            goodsDept: rowSelection.goodsDept,
            partsnameName: rowSelection.partsnameName,
            goodsSpec: rowSelection.goodsSpec,
            goodsMaterial: rowSelection.goodsMaterial,
            productareaName: rowSelection.productareaName
          }
          this.codeFutures = true
          this.goodsDetailRef = this.table.$refs.codeTable.$refs.basicEditable
          this.sdpGoodsWinShow = true          
          break
        case 'del': 
          // 删除      
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }
          this.table.codeRemove(this.codeSelection[0])          
          break
        case 'mac':
          // 预加工
          const detailTab = this.table.$refs.detailTable.$refs.basicEditable          
          const codeTab = this.table.$refs.codeTable.$refs.basicEditable
          const detailFullData = detailTab.getTableData().fullData
          const codeFullData = codeTab.getTableData().fullData
          if (detailFullData.length <= 0 || codeFullData.length <= 0) {
            this.$message.error('请增加合同码单!')
            return false
          }
          const selectedDetailR = this.rowSelection[0]
          const selectedCodeR = this.codeSelection[0]
          if (!selectedDetailR || !selectedCodeR) {
            this.$message.error('请选择合同码单!')
            return false
          }
          if (selectedDetailR.scontractDetailMac === 0 || selectedDetailR.scontractDetailType === '03' && selectedDetailR.scontractDetailMac === 1) {
            this.$message.error('该合同明细无需加工')
            return false
          }
          this.activeTab = '2'
          break
        default:
          console.error('error')
          break
      }
    },    
    sumGoodsCellBack ({data}) {
      console.log('data', data)
      // 物资汇总
      const mainMod = {orgCode:'orgCode',companyProjectCode:'companyProjectCode',companyProjectName:'companyProjectName'}
      const tableMod = {scontractDetailPartsname: 'partsnameName', scontractDetailMaterial: 'goodsMaterial', scontractDetailSpec: 'goodsSpec', scontractDetailProareaname: 'productareaName', scontractDetailSpec1: 'goodsSpec1', scontractDetailSpec2: 'goodsSpec2', scontractDetailSpec3: 'goodsSpec3', scontractDetailSpec4: 'goodsSpec4', scontractDetailProperty1: 'goodsProperty1', scontractDetailProperty2: 'goodsProperty2', scontractDetailProperty3: 'goodsProperty3', scontractDetailProperty4: 'goodsProperty4', scontractDetailProperty5: 'goodsProperty5', scontractDetailNumproperty1: 'goodsNumproperty1', goodsNum: 'goodsSupplynum', goodsWeight: 'goodsSupplyweight', goodsAssistweight: 'goodsSupplyassistwieght', goodsInprice: 'goodsNewinprice', goodsInfeeprice: 'goodsNewinfeeprice', goodsCosttaxrate: 'goodsTaxrate', goodsBinprice: 'pricesetMakeprice', goodsInmoney: 'goodsSupplyInMoney', goodsExprice: 'pricesetMakeExprice', goodsExmoney: 'goodsSupplyExMoney', goodsTaxmoney: 'goodsSupplyTrMoney'}      
      this.insertTableData({data, mainMod, tableMod, itemFun: (item) => {        
        item.scontractDetailTypeStr = '现货'
        item.scontractDetailType = '01'
        item.scontractDetailMac = 0   
        item.goodsBinfeeprice = 0
        item.goodsInfeemoney = 0
        item.goodsExfeeprice = 0
        item.goodsExfeemoney = 0
        item.dataFlag = 0
      }})
      this.sumGoodsWinShow = false
    },
    sdpGoodsCellBack ({data}) {    
      const resData = this.toArray(data)  
      const detailTable = this.table.$refs.detailTable.$refs.basicEditable
      const fullData = detailTable.getTableData().fullData
      const idx = fullData.length
      const codeTable = this.table.$refs.codeTable.$refs.basicEditable     
      if (this.codeFutures) {
        // 配码
        const recList = []
        const rowSelection = this.rowSelection[0]
        resData.map((item, index) => {          
          item.goodsNum = item.goodsSupplynum
          item.goodsWeight = item.goodsSupplyweight
          item.previousDataVernum = item.dataVernum
          item.warehouseDataVernum = item.dataVernum
          item.scontractCodeRemark = item.goodsRemark          
          item.scontractBillcode = rowSelection.scontractBillcode
          item.scontractBillbatch = rowSelection.scontractBillbatch
          item.scontractCodeBatch = this.getTempBatchStr(idx + index)
          item.goodsInprice = item.goodsNewinprice
          item.goodsInfeeprice = item.goodsNewinfeeprice          
          item.goodsCosttaxrate = item.goodsTaxrate
          item.dataFlag = 0
          recList.push(item)
        })
        this.table.codeInsertAt(recList, true) // 插入码单                 
        this.codeFutures = false
      } else {
        // 现货物资
        const mainMod = {orgCode:'orgCode',companyProjectCode:'companyProjectCode',companyProjectName:'companyProjectName'}
        const tableMod = {scontractDetailPartsname: 'partsnameName', scontractDetailMaterial: 'goodsMaterial', scontractDetailSpec: 'goodsSpec', scontractDetailProareaname: 'productareaName', scontractDetailSpec1: 'goodsSpec1', scontractDetailSpec2: 'goodsSpec2', scontractDetailSpec3: 'goodsSpec3', scontractDetailSpec4: 'goodsSpec4', scontractDetailProperty1: 'goodsProperty1', scontractDetailProperty2: 'goodsProperty2', scontractDetailProperty3: 'goodsProperty3', scontractDetailProperty4: 'goodsProperty4', scontractDetailProperty5: 'goodsProperty5', scontractDetailNumproperty1: 'goodsNumproperty1', goodsNum: 'goodsSupplynum', goodsWeight: 'goodsSupplyweight', goodsAssistweight: 'goodsSupplyassistwieght', goodsInprice: 'goodsNewinprice', goodsInfeeprice: 'goodsNewinfeeprice', goodsBinprice: 'pricesetMakeprice', goodsInmoney: 'goodsSupplyInMoney', goodsExprice: 'pricesetMakeExprice', goodsExmoney: 'goodsSupplyExMoney', goodsCosttaxrate: 'goodsTaxrate', goodsTaxmoney: 'goodsSupplyTrMoney', scontractCodeRemark: 'goodsRemark'}
        const mainForm = {}
        const tableDetail = []
        const tableCode = []                   
        // let rowSelection = null
        resData.map((item, index) => {
          debugger
          let findData = null
          item.scontractBillbatch = this.getTempBatchStr(idx + index)
          if (item.sumgoodsBatch) {
            findData = fullData.find(row => {
              return row.sumgoodsBatch === item.sumgoodsBatch
            })          
          }
          if (findData) {
            item.scontractBillbatch = findData.scontractBillbatch
            item.goodsNum = item.goodsSupplynum
            item.goodsWeight = item.goodsSupplyweight
            item.goodsAssistweight = item.goodsSupplyassistwieght
            // rowSelection = findData
          } else {
            let obj = {}
            Object.keys(tableMod).forEach(key => {
              item[key] = item[tableMod[key]]
            })
            item.scontractDetailTypeStr = '现货'
            item.scontractDetailType = '01'
            item.scontractDetailCode = 1
            item.scontractDetailMac = 0
            item.goodsBinfeeprice = 0
            item.goodsInfeemoney = 0
            item.goodsExfeeprice = 0
            item.goodsExfeemoney = 0
            item.dataFlag = 0               
            obj = Object.assign({}, this.extend(true, this.detailConfig.tableValue.hiddenProp), item)                
            tableDetail.push(obj)
            for (const key in mainMod) {
              if (item[mainMod[key]]) mainForm[key] = item[mainMod[key]]            
            }
          }          
          item.scontractCodeBatch = this.getTempBatchStr(idx + index)
          item.warehouseDataVernum = item.dataVernum
          const itemCode = this.extend(true, item)
          delete itemCode.dataVernum  
          delete itemCode.goodsPiecenum
          delete itemCode.goodsPriceun
          delete itemCode.goodsSingernum
          delete itemCode.mtaskDetailsRemark
          delete itemCode.partsnameSplit
          delete itemCode.scontractBillcode
          delete itemCode.scontractMtaskDate
          // scontractBillcode
          tableCode.push(itemCode)
        })
        Object.assign(this.copyForm, mainForm) // 主表赋值
        if (tableDetail.length > 0) {
          this.table.detailInsertAt(tableDetail)
          // detailTable.insertAt(tableDetail, -1) // 插入明细表        
          // detailTable.updateFooter()
          // // 选取最后一个
          // const newfullData = detailTable.getTableData().fullData
          // rowSelection = newfullData[newfullData.length - 1]        
        }      
        
        // detailTable.setCurrentRow(rowSelection)
        // this.table.detailSelection(rowSelection)  
        this.table.codeInsertAt(tableCode, true) // 插入码单                     
      }
      codeTable.updateFooter()
      this.formDisabled = true
      this.sdpGoodsWinShow = false
    },
    insertTableData ({data, mainMod, tableMod, itemFun}) {
      const mainForm = {}
      const tableDetail = []
      const detailTable = this.table.$refs.detailTable.$refs.basicEditable
      const fullData = detailTable.getTableData().fullData
      const idx = fullData.length
      const resData = this.toArray(data)
      resData.map((item, index) => {
        let obj = {}
        Object.keys(tableMod).forEach(key => {
          item[key] = item[tableMod[key]]
        })
        itemFun(item) // 自定义
        debugger
        if (!item.scontractBillbatch) {
          item.scontractBillbatch = this.getTempBatchStr(idx + index)
        }        
        obj = Object.assign({}, this.extend(true, this.detailConfig.tableValue.hiddenProp), item)
        tableDetail.push(obj)
        for (const key in mainMod) {
          if (item[mainMod[key]]) mainForm[key] = item[mainMod[key]]
        }
      })
      Object.assign(this.copyForm, mainForm) // 主表赋值
      detailTable.insertAt(tableDetail, -1)
      detailTable.updateFooter()
      this.formDisabled = true
    },
    futuresCellBack ({data}) {
      // 期货物资
      const mainMod = {datasSuppliername:'datasSuppliername',datasSupplier:'datasSupplier',companyProjectCode:'companyProjectCode',companyProjectName:'companyProjectName'}
      const tableMod = {scontractDetailOptcode: 'optBillcode', scontractDetailOptbatch: 'optBillbatch', scontractDetailBilltype: 'billtypeCode', scontractDetailPartsname: 'partsnameName', scontractDetailMaterial: 'goodsMaterial', scontractDetailSpec: 'goodsSpec', scontractDetailProareaname: 'productareaName', scontractDetailSpec1: 'goodsSpec1', scontractDetailSpec2: 'goodsSpec2', scontractDetailSpec3: 'goodsSpec3', scontractDetailSpec4: 'goodsSpec4', scontractDetailProperty1: 'goodsProperty1', scontractDetailProperty2: 'goodsProperty2', scontractDetailProperty3: 'goodsProperty3', scontractDetailProperty4: 'goodsProperty4', scontractDetailProperty5: 'goodsProperty5', scontractDetailNumproperty1: 'goodsNumproperty1', scontractDetailNumproperty2: 'goodsNumproperty2', goodsOrg: 'orgCode', goodsOrgName: 'orgName', goodsDept: 'deptCode', goodsDeptName: 'deptName', goodsNum: 'goodsNoknum', goodsWeight: 'goodsNokweight', goodsAssistweight: 'goodsNokassistwieght', goodsBinprice: 'pricesetMakeprice', previousDataVernum: 'dataVernum'}
      this.insertTableData({data, mainMod, tableMod, itemFun: (item) => {
        item.goodsInmoney = this.toNumber(item.goodsBinprice) * this.toNumber(item.goodsWeight)
        item.goodsExprice = this.toNumber(item.pricesetMakeExprice)        
        item.goodsExmoney = this.toNumber(item.goodsExprice) * this.toNumber(item.goodsWeight)        
        item.goodsTaxmoney = this.toNumber(item.goodsInmoney) - this.toNumber(item.goodsExmoney)                
        item.scontractDetailTypeStr = '期货'
        item.scontractDetailType = '02'
        item.scontractDetailMac = 0
        item.dataFlag = 0  
      }})
      this.futuresWinShow = false
    },  
    syncName(e, obj) {      
      Object.keys(obj).forEach((key) => {
        this.copyForm[key] = e[obj[key]]
      })
    },
    getGoodsWin (data) {
      // 增加
      debugger
      if (data.length > 0) {
        this.goodsWinShow = false
        const arr = []
        data.map((item) => {
          let obj = {}
          item.goodsOrg = this.copyForm.orgCode
          item.goodsOrgName = this.copyForm.orgName
          item.goodsDept = this.copyForm.deptCode
          item.goodsDeptName = this.copyForm.deptName
          
          item.scontractDetailPartsname = item.partsnameName
          item.scontractDetailMaterial = item.goodsMaterial
          item.scontractDetailSpec = item.goodsSpec
          item.scontractDetailProareaname = item.productareaName
          item.scontractDetailSpec1 = item.goodsSpec1
          item.scontractDetailSpec2 = item.goodsSpec2
          item.scontractDetailSpec3 = item.goodsSpec3
          item.scontractDetailSpec4 = item.goodsSpec4
          item.scontractDetailProperty1 = item.goodsProperty1
          item.scontractDetailProperty2 = item.goodsProperty2
          item.scontractDetailProperty3 = item.goodsProperty3
          item.scontractDetailProperty4 = item.goodsProperty4
          item.scontractDetailProperty5 = item.goodsProperty5
          item.scontractDetailNumproperty1 = item.goodsNumproperty1
          item.scontractDetailNumproperty2 = item.goodsNumproperty2
          
          item.scontractDetailType = "03"
          item.scontractDetailTypeStr = "配货"
          item.scontractDetailMac = 0
          item.dataFlag = 0
          obj = Object.assign({}, this.extend(true, this.detailConfig.tableValue.hiddenProp), item)
          arr.push(obj)
        })       
        const detailTable = this.table.$refs.detailTable.$refs.basicEditable 
        detailTable.insertAt(arr, -1)
        this.formDisabled = true
      }      
    },
    topBtnVail () {
      const msgArr = []
      if (!this.copyForm.datasBalcorp) msgArr.push('结算单位')
      if (!this.copyForm.datasCustomer) msgArr.push('购货单位')
      if (!this.copyForm.orgCode) msgArr.push('业务机构')
      if (!this.copyForm.deptCode) msgArr.push('业务部门')
      if (msgArr.length > 0) {
        this.$message.error('请先输入' + msgArr.join())
        return false
      }
      return true
    },
    topButtonGroupClick (type) {
      switch (type) {
        case 'save':
          // 保存
          const detailTab = this.table.$refs.detailTable.$refs.basicEditable 
          if (detailTab.getTableData().fullData.length === 0) {
            this.$message.error('请增加明细！')
            return false
          }
          this.save()    
          break
        case 'futures':
          if (this.topBtnVail()) {
            this.futuresQueryParam = {
              startDate: this.toDateString(this.getStatDate(), 'yyyy-MM-dd HH:mm'),
              endDate: this.toDateString(this.getEndDate(), 'yyyy-MM-dd HH:mm')
            }
            this.futuresWinShow = true
          }          
          break
        case 'goods': 
          // 现货物资
          if (this.topBtnVail()) {
            this.sdpGoodsQueryParam = {}
            this.goodsDetailRef = this.table.$refs.detailTable.$refs.basicEditable
            this.sdpGoodsWinShow = true
          }          
          break
        case 'sumgoods':
          // 汇总物资
          if (this.topBtnVail()) {
            this.sumGoodsQueryParam = {}
            this.sumGoodsWinShow = true
          }          
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
          const detailTab = this.table.$refs.detailTable.$refs.basicEditable 
          debugger
          const form = {
            goodsNum: this.getColumnSum('goodsNum', detailTab),
            goodsPiecenum: this.getColumnSum('goodsPiecenum', detailTab),
            goodsSingernum: this.getColumnSum('goodsSingernum', detailTab),
            goodsWeight: this.getColumnSum('goodsWeight', detailTab),
            goodsAssistweight: this.getColumnSum('goodsAssistweight', detailTab),
            scontractInmoney: this.getColumnSum('goodsInmoney', detailTab)
          }
          Object.assign(this.copyForm, form)
          const fullData = detailTab.getTableData().fullData
          
          const isValid = fullData.find((item, index) => {
            if(!item.goodsWeight) {
              this.$message.error('合同明细中第'+(index+1)+'行重量为空或为0,请输入!')
              return item
            }
            if (!item.goodsBinprice) {
              this.$message.error('合同明细中第'+(index+1)+'行含税单价为空或为0,请输入!')
              return item
            }
            const codeBillbatchList = this.table.codeObj[item.scontractBillbatch]
            item.scontractDetailCode = 0
            if (item.scontractDetailType === '0' || item.scontractDetailMac === 1) {
              if (!codeBillbatchList || codeBillbatchList.length === 0) {
                this.$message.error('合同明细中第'+(index+1)+'行现货订货加工物资没有配码,请配码!')
                return item
              }
              if (codeBillbatchList.length > 0) {
                item.scontractDetailCode = 1
              }
            }
            item.countIndex = index + 1
            // 现货订货加工、销售代加工
            if (item.scontractDetailType === '01' && (item.scontractDetailMac === 1 || item.scontractDetailMac === 2)) {
              // let flag = false
              const macList = []
              codeBillbatchList.map(item => {                
                const findMac = this.$refs.sdpMac.tableList.find((mac) => {
                  return mac.scontractCodeBatch === item.scontractCodeBatch
                })
                macList.push(findMac)
              })
              if (macList.length === 0) {
                this.$message.error('合同明细第'+(index+1)+'行现货订货加工物资没有配码,请配码!')
                // flag = true
                return item
              }              
            }
          })
          if (isValid) return false
          // 获取明细
          const removeRecords = []
          detailTab.getRemoveRecords().map((item) => {
            item.dataFlag = 2
            removeRecords.push(item)
          })         
          // const updateRecords = detailTab.getUpdateRecords()
          // const insertRecords = detailTab.getInsertRecords()    
          const detailFullData = detailTab.getTableData().fullData
          const detailList = [...detailFullData, ...removeRecords]
          // 获取码单
          const codeList = []
          Object.keys(this.table.codeObj).forEach(key => {
            codeList.push(...this.table.codeObj[key])
          })
          // 获取加工明细
          const mtaskList = this.$refs.sdpMac.save()

          const params = {
            contractMod: this.copyForm,
            detailList: detailList,
            codeList: codeList,
            mtaskList: mtaskList,
            termlist: this.$refs.terms.$refs.termsTable.$refs.basicEditable.getTableData().fullData,
            clauseMod: this.$refs.clause.form,
            saleConBean: ''
          }
         
          this.checkSaleNum(params)
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
    handleSelectionChange (row) {            
      this.rowSelection = [row]
    },
    cellEdit({row, $rowIndex, column}) {},
    tabChange (tab, event) {
      console.log(tab, event)
    },
    async getMainMod (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/scontractEnrollAjax!edit.do', 'post', params)        
        if (data.map.state !== '3') {
          // this.btnFlag = ''
          this.$message.error('操作失败')
          return false
        }
        console.log(data)
        const mainMod = data.mainMod
        this.clauseMod = data.clauseMod
        if (!this.copyForm.scontractCtype) this.copyForm.scontractCtype = ''
        Object.keys(this.copyForm).forEach((key) => {
          this.copyForm[key] = mainMod[key] || mainMod[key] === 0 ? mainMod[key] : this.copyForm[key]
        })  
        this.copyForm.scontractDate = this.toDateString(data.mainMod.scontractDate, 'yyyy-MM-dd HH:mm')      
        // if (!this.copyForm.contractCtype) this.copyForm.contractCtype = ''
        // if (!this.copyForm.contractType) this.copyForm.contractType = ''
      } catch (e) {
        console.error(e)
      }
    },
    async getDetail () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/scontractEnrollAjax!queryDetail.do', 'post', this.queryParams)
        console.log(data)
        this.detailConfig.tableValue.tableData = []
        if (data.detailList) {
          // this.tableValue.tableData = data.detailList
          this.detailConfig.tableValue.tableData = data.detailList
          this.formDisabled = true
        }
        this.loading = false
      } catch (e) {
        this.loading = false
        console.error('error', e)
      }
    },
    async getCodeList () {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/scontractEnrollAjax!queryCode.do', 'post', this.queryParams)
        console.log(data)
        this.codeConfig.tableValue.tableData = []
        if (data.codeList) {
          this.codeConfig.tableValue.tableData = data.codeList
          // this.initCode(data.codeList)
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
    pwCellBack (res) {
      const loading = this.loadShow()
      debugger
      this.saveFun(res.paramsP, res.conObj, loading)
    },
    async checkSaleNum (params) {      
      const loading = this.loadShow()
      try {
        const api = 'scscm/app/scontractEnrollAjax!checkSaleNum.do'
        const { data } = await this.proxy(this, api, 'post', {scontractStr: JSON.stringify(params)})        
        console.log(data)         
        let conObj = ''      
        if(data.contractBean) conObj = data.contractBean.saleConBean
        // const _msg = data.map.msg
        switch (data.map.state) {
          case '6':
            console.log('特权密码')
            this.pWConfig = {
              privpassCode: '002',
              paramsP: params,
              paramsMsg: data.map.msg,
              conObj: conObj
            }            
            loading.close()
            this.passwordShow = true
            break
          case '7':
            console.log('提示控制')
            break
          case '8': // 不控制
            this.saveFun(params, conObj, loading)
            break
          case '9':
            console.log('取消交易')
            break
          default:  
            this.$message.error(data.map.msg || '操作失败')
            break
        }        
      } catch (e) {        
        loading.close()
        console.error(e)
      }
    },
    saveFun (params, conObj, loading) {
      // if (this.pageType === 'audit') { //判断是否为审核
        // return false
      // }
      if(conObj) params.saleConBean = conObj
      this.saveAsync(params, loading)
    },
    async saveAsync (params, loading) {
      // 保存      
      try {
        let api = 'scscm/app/scontractEnrollAjax!insert.do'
        if (this.flag === 1) {
          api = 'scscm/app/scontractEnrollAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {scontractStr: JSON.stringify(params)})
        loading.close()          
        if (data.map.state !== '3') {
          this.$message.error(data.map.msg ? data.map.msg : '保存失败')
          return
        }        
        this.$message.success('保存成功')
        this.$emit('save')
        this.passwordShow = false
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
<style lang="stylus" scoped></style>
