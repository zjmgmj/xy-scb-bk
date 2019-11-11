<template lang="pug">
  el-dialog(title="采购退货登记", :visible="true", top="10px", width="1600px", @close="close")
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="单据号", prop="entryinfBillcode")
            el-input.full-width(v-model="copyForm.entryinfBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="日期", prop="entryinfDate")
            el-date-picker.full-width(v-model="copyForm.entryinfDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="仓库", prop="warehouseName")
            warehouse-select(v-model="copyForm.warehouseName", @change="syncName($event, {warehouseName: 'warehouseName', warehouseCode: 'warehouseCode'})", :disabled="formDisabled")            
        el-col(:span="6")  
          el-form-item(label="采购类型", prop="contractCtype")
            basic-select(v-model="form.contractCtype", :ddtypeClass="'contractCtype'", :useName="true")
        el-col(:span="6")
          el-form-item(label="类型", prop="entryinfClass")
            el-select.full-width(size="mini", v-model="copyForm.entryinfClass")
              el-option(v-for="item in entryinfClassList" :key="item.code" :label="item.name" :value="item.code")
        el-col(:span="6")
          el-form-item(label="结算单位", prop="datasBalcorp")
            company-select(v-model="copyForm.datasBalcorp", :typeStr="'GYS'", @change="syncName($event, {datasBalcorpname: 'companyName', datasSupplier:'companyCode', datasSuppliername: 'companyName'})", :disabled="formDisabled")
        el-col(:span="6")  
          el-form-item(label="结算方式", prop="ddTypeSettlement")
            basic-select(v-model="form.ddTypeSettlement", :ddtypeClass="'ddTypeSettlementSdp'", :useName="true")
        el-col(:span="6")  
          el-form-item(label="运输方式", prop="contractTransportmode")
            basic-select(v-model="form.contractTransportmode", :ddtypeClass="'ddTypeTransport'", :useName="true")
        el-col(:span="6")
          el-form-item(label="仓管员", prop="dataTally")            
            employee-select(v-model="copyForm.dataTally") 
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
          el-form-item(label="费用金额", prop="dataInfeemoney")
            el-input.full-width(v-model="copyForm.dataInfeemoney", clearable, size="mini", disabled)            
        el-col(:span="6")
          el-form-item(label="制单人", prop="operatorName")
            el-input.full-width(v-model="copyForm.operatorName", clearable, size="mini", disabled)        
        el-col(:span="12")
          el-form-item(label="备注", prop="entryinfRemark")
            el-input.full-width(v-model="copyForm.entryinfRemark", clearable, size="mini")    
    .mt-10.edit
      el-tabs(v-model="activeTab" type="border-card" @tab-click="tabChange", size="mini")
        el-tab-pane(label="物资明细" name="1")
          .pt-10.pb-10
            button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
            edit-table(ref="editTable", :loading="loading", :tableValue="tableValue", @rowEditInfo="cellEdit", @rowSelection="handleSelectionChange")
        //- el-tab-pane(label="辅助信息" name="2")
          clause-win(ref="clause", :clauseMod="clauseMod")
        el-tab-pane(label="费用" name="3")
          .pt-10.pb-10(v-show="activeTab === '3'")
            sdpfee-win(
              :mainForm="copyForm",  
              :sdpfeeShow="activeTab", 
              ref="sdpfee", 
              :rowDetail="rowSelection[0]", 
              :feeConfig="feeConfig", 
              @change="sdpFeeChange",
              :detailTable="table")    
    file-win(v-if="fileWinShow", @close="fileWinShow = false", :fileMod="fileMod", :table="tableValue.tableHead")
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
    sdp-goods-win(v-if="sdpGoodsWinShow", :queryParam="goodsQueryParam", @close="sdpGoodsWinShow=false", @cellBack="sdpGoodsCellBack")    
</template>
<script>
import { mapState } from 'vuex'
import sdpfeeWin from '@/components/sdpfee'
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
    sdpfeeWin,
    sdpGoodsWin
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
      sdpGoodsWinShow: false,
      feeConfig: {
        otherParams:{billcode: 'entryinfBillcode', mainBackMoney:'dataInfeemoney', detailBackInprice:'goodsBinfeeprice', detailBackMoney:'goodsInfeemoney',feeBweight:'goodsWeight', feeOptbatch:'goodsEntrybatch'}        
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
        validRules: {
          goodsNum: [{ required: true, message: '必填项' }],
          goodsWeight: [{ required: true, message: '必填项' }],
          goodsBinprice: [{ required: true, message: '必填项' }],
          goodsInmoney: [{ required: true, message: '必填项' }]
        },
        // adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
				priceMoneyComputerColumn: {goodsInprice:'goodsBinprice'},
        tableHead: [
          {lbl: '品名', prop: 'partsnameName', width: '150px', noedit: true},
          {lbl: '规格', prop: 'goodsSpec', width: '150px', noedit: true},
          {lbl: '材质', prop: 'goodsMaterial', width: '150px', noedit: true},
          {lbl: '产地', prop: 'productareaName', width: '150px', noedit: true},
          {lbl: '长度', prop: 'goodsProperty1'},
          {lbl: '米重', prop: 'goodsProperty2'},
          {lbl: '重量范围', prop: 'goodsProperty4'},
          {lbl: '公差范围', prop: 'goodsProperty5'},          
          {lbl: '退货数量', prop: 'goodsNum', summary: true, g_type: 'num', maxValue:0},
          {lbl: '退货重量', prop: 'goodsWeight', summary: true, g_type: 'weight', maxValue:0},
          {lbl: '退货实提数量', prop: 'entryinfDetailOknum', summary: true, g_type: 'num', noedit: true},
          {lbl: '退货实提重量', prop: 'entryinfDetailOkweight', summary: true, g_type: 'weight', noedit: true},                    
          {lbl: '数量单位', prop: 'partsnameNumunit'},
          {lbl: '重量单位', prop: 'partsnameWeightunit'},
          {lbl: '含税单价', prop: 'goodsBinprice', g_type: 'price'},
          {lbl: '含税金额', prop: 'goodsInmoney', summary: true, g_type: 'money', maxValue: 0},
          {lbl: '税率', prop: 'goodsTaxrate', g_type:'taxrate'},
          {lbl: '无税单价', prop: 'goodsExprice', g_type:'exprice'},
          {lbl: '无税金额', prop: 'goodsExmoney', summary: true, width: '120px', g_type: 'money', maxValue: 0},
          {lbl: '税额', prop: 'goodsTaxmoney', summary: true, width: '120px', g_type: 'money', noedit: true},
          {lbl: '费用单价', prop: 'goodsInfeeprice', g_type: 'price', noedit: true},
          {lbl: '费用金额', prop: 'goodsInfeemoney', summary: true, g_type: 'money', noedit: true},                  
          {lbl: '计量方式', prop: 'goodsMetering', width: '150px', noedit: true},
          {lbl: '货权机构', prop: 'datasInorgName', noedit: true},     
          {lbl: '车皮号', prop: 'goodsContractstr2', noedit: true},
          {lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true},
          {lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true},
          {lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true},
          {lbl: '件支数', prop: 'goodsPartsbranch', noedit: true},          
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
    if (!this.form.entryinfBillcode) isTrue = true
    this.topButtonGroupInfo = [
      {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},      
      {lbl: '汇总物资', type: 'sumGoods', icon: 'el-icon-document'},
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
    sdpFeeChange ({cellValue, row, rowIndex, column, columnIndex, table, sdpFeeFlag}) {    
      if ((column.property === 'goodsInprice' || column.property === 'goodsInmoney') && sdpFeeFlag === 1) {      
        const detailTable = this.$refs.editTable.$refs.basicEditable
        let goodsInpriceSum = 0
        let goodsInmoneySum = 0
        const feeFullData = table.getTableData().fullData
        const detailFindData = detailTable.getTableData().fullData.find(item => {
          return item.goodsEntrybatch === row.feeTempOptbatch
        })
        feeFullData.map(item => {
          if (item.feeTempOptbatch === detailFindData.goodsEntrybatch) {
            goodsInpriceSum += this.toNumber(item.goodsInprice)
            goodsInmoneySum += this.toNumber(item.goodsInmoney)
          }          
        })
        detailFindData.goodsInfeeprice = 0 - goodsInpriceSum
        detailFindData.goodsInfeemoney = goodsInmoneySum
      }
    },
    syncName(e, obj) {     
      Object.keys(obj).forEach((key) => {
        this.copyForm[key] = e[obj[key]]
      })
    },
    insertTableData ({data, mainMod, tableMod, itemFun}) {
      const mainForm = {}
      // const clauseForm = {}
      const tableDetail = [] 
      // const idx = this.table.getTableData().fullData.length
      const resData = this.toArray(data)
      resData.map((item, index) => {        
        let obj = {}
        Object.keys(tableMod).forEach(key => {
          if (item[tableMod[key]] && item[tableMod[key]] !== null) {
            item[key] = item[tableMod[key]]
          }          
        })        
        itemFun(item) // 自定义
        // item.goodsEntrybatch = this.getTempBatchStr(idx + index)
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
        fileOpcode: data[0].entryinfBillcode
      }
      Object.assign(this.copyForm, mainForm) // 主表赋值
      // Object.assign(this.clauseMod, clauseForm) // 辅助信息赋值
      this.table.insertAt(tableDetail, -1)
      this.table.updateFooter()
      this.formDisabled = true
    },
    sdpGoodsCellBack ({data}) {
      // 汇总物资
      const mainMod = {orgCode:'goodsOrg',deptCode:'goodsDept', warehouseCode:'warehouseCode',entryinfType:'entryinfType',datasBalcorpname:'datasBalcorpname',datasSupplier:'datasBalcorp',datasSuppliername:'datasBalcorpname'}      
      const tableMod = {scontractBillcode: 'scontractBillcode', scontractBillbatch: 'scontractBillbatch', previousDataVernum: 'dataVernum', goodsOrg: 'goodsOrg', goodsOrgName: 'goodsOrgName', datasInorgCode: 'goodsOrg', datasIndeptCode: 'goodsDept', goodsDept: 'goodsDept', goodsDeptName: 'goodsDeptName', companyCode: 'companyCode', companyName: 'companyName', datasInorgName: 'goodsOrgName', goodsTaxrate: 'goodsTaxrate'}      
      // 成本相关
      
      this.insertTableData({data, mainMod, tableMod, itemFun: (item) => {
        item.goodsNum = -1* this.toNumber(item.goodsSupplynum)
        item.goodsWeight = -1* this.toNumber(item.goodsSupplyweight)
        item.goodsAssistweight = -1* this.toNumber(item.goodsSupplyassistwieght)
        item.goodsNewinprice = this.toNumber(item.goodsNewinprice)
        item.goodsNewinfeeprice = this.toNumber(item.goodsNewinfeeprice)
        item.goodsInprice = this.toNumber(item.goodsNewinprice)
        item.goodsInfeeprice = this.toNumber(item.goodsNewinfeeprice)
        // item.goodsPreinfeeprice = this.toNumber(item.goodsInfeeprice) + this.toNumber(item.goodsPreinfeeprice)
      }})
      this.sdpGoodsWinShow = false
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
          if (!this.copyForm.warehouseCode || !this.copyForm.datasBalcorp) {
            this.$message.error('请先输入仓库，结算单位')
            return false
          }
          this.sdpGoodsWinShow = true
          this.goodsQueryParam = {
            warehouseCode: this.copyForm.warehouseCode,
            goodsOrg: this.copyForm.orgCode
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
          const sdpFeeTable = this.$refs.sdpfee
          const feeList = sdpFeeTable.sdpFeeSave()          
          if (feeList.length > 0) {
            this.setStoreFeeprice(this.copyForm, this.table.getTableData().fullData, feeList, sdpFeeTable, this.feeConfig, this.getColumnSum('goodsWeight', this.table))
          }   
          const form = {
            goodsNum: this.getColumnSum('goodsNum', this.table),
            goodsWeight: this.getColumnSum('goodsWeight', this.table),
            goodsPiecenum: this.getColumnSum('goodsPiecenum', this.table),
            goodsSingernum: this.getColumnSum('goodsSingernum', this.table),
            goodsAssistweight: this.getColumnSum('goodsAssistweight', this.table),
            dataInmoney: this.getColumnSum('goodsInmoney', this.table),
            entryactNum: this.getColumnSum('entryinfDetailOknum', this.table),
            entryactWeight: this.getColumnSum('entryinfDetailOkweight', this.table),
            entryactAssistweight: this.getColumnSum('entryinfDetailOkassistweight', this.table)
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
          const detailList = [...insertRecords, ...updateRecords, ...removeRecords]
          debugger
          const params = {
            mainMod: this.copyForm,
            feeList: feeList,
            detailList: detailList,
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
        case 'del':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }          
          this.table.remove(this.rowSelection[0])
          if (this.table.getTableData().fullData.length === 0) {
            this.formDisabled = false
          }
          // 删除对应费用
          this.$refs.sdpfee.removeFee()
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
        // this.entryinfTypeChange(this.copyForm.entryinfType)
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
        let api = 'scscm/app/entryinfReturnAjax!save.do'
        if (this.copyForm.entryinfBillcode) {
          api = 'scscm/app/entryinfReturnAjax!update.do'
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
