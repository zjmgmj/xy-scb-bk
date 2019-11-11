<template lang="pug">
  el-dialog(title="销售退货验收登记", ref="dialog", :visible="true", fullscreen, @close="close")
    //- el-dialog(title="入库验收登记", :visible="true", ref="dialog", top="10px", width="1600px", @close="close")  
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="单据号", prop="deliveryBillcode")
            el-input.full-width(v-model="copyForm.deliveryBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="日期", prop="deliveryDate")
            el-date-picker.full-width(v-model="copyForm.deliveryDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="仓库", prop="warehouseName")
            warehouse-select(v-model="copyForm.warehouseName", @change="syncName($event, {warehouseName: 'warehouseName', warehouseCode: 'warehouseCode'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="提单号", prop="sbillBillcode")
            el-input.full-width(v-model="copyForm.sbillBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="结算单位", prop="datasBalcorp")
            company-select(v-model="copyForm.datasBalcorp", :typeStr="'KH'", @change="syncName($event, {datasBalcorpname: 'companyName', datasSupplier:'companyCode', datasSuppliername: 'companyName'})", :disabled="formDisabled")
        el-col(:span="6")
          el-form-item(label="业务机构", prop="orgCode")
            org-select(v-model="copyForm.orgCode", @change="syncName($event, {orgName: 'orgName', orgAbbreviate: 'orgAbbreviate'})", :disabled="formDisabled")            
        el-col(:span="6")
          el-form-item(label="业务部门", prop="deptCode")
            dept-select(v-model="copyForm.deptCode", @change="syncName($event, {deptName: 'deptName'})", :disabled="formDisabled")                
        el-col(:span="6")
          el-form-item(label="业务员", prop="employeeCode")
            employee-select(v-model="copyForm.employeeCode", @change="syncName($event, {employeeName: 'employeeName'})")                           
        el-col(:span="18")
          el-form-item(label="备注", prop="entryinfRemark")
            el-input.full-width(v-model="copyForm.entryinfRemark", clearable, size="mini")    
        el-col(:span="6")
          el-form-item(label="制单人", prop="operatorName")
            el-input.full-width(v-model="copyForm.operatorName", clearable, size="mini", disabled) 
    .mt-10.edit(style="height: 100%")
      db-edit-table(
        :thisDialog="this",
        ref="dbEditTable",
        @detailRowSelection="detailRowSelection",
        @codeRowSelection="codeRowSelection",
        :detailConfig="detailTable",
        :codeConfig="codeTable",
        @detailBtnClick="detailBtnClick",
        @codeBtnClick="codeBtnClick")      
    file-win(v-if="fileWinShow", @close="fileWinShow = false", :fileMod="fileMod", :table="detailTable.tableValue.tableHead")
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
    entryinf-win(
      v-if="entryinfWinShow", 
      ref="entryinf", 
      :parentRef="$refs.dbEditTable.$refs.detailTable", 
      :uniqueField="'goodsEntrybatch'",      
      :mainForm="copyForm" 
      @close="entryinfWinShow=false", 
      @cellBack="entryinfCellBack")
</template>
<script>
import { mapState } from 'vuex'
import sdpfeeWin from '@/components/sdpfee'
import fileWin from '@/components/file'
import auditGlideView from '@/components/billtypeaudit'
import buttonGroup from '@/components/buttonGroup.vue'
import dbEditTable from '@/components/dbEditTable'
import entryinfWin from '@/components/queryReport/entryinf'

export default {
  components: {
    buttonGroup,
    dbEditTable,
    fileWin,
    auditGlideView,
    sdpfeeWin,
    entryinfWin
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
      entryinfWinShow: false, 
      activeTab: '1',
      auditGlideShow: false,
      fileWinShow: false,
      goodsWinShow: false,
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      loading: false,
      topButtonGroupInfo: [],          
      detailTable: {      
        id: 'deliveryUp',
        ref: 'detailTable',
        relationBatch: 'deliveryBillbatch', // TODO 过滤明细和码单
        loading: false,
        buttonGroupInfo: [],
        tableValue: {
          hasCbx: false,
          pageShow: false,
          showRowIndex: true,
          showSummary: true,
          // adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
          // priceMoneyComputerColumn: {goodsNum:'sumglideGnum',goodsWeight:'sumglideGweight',goodsAssistweight:'sumglideGassistweight',goodsInprice:'sumglideGinprice',goodsInmoney:'sumglideGinmoney',goodsTaxrate:'sumglideGtaxrate'},
          tableHead: [
            {lbl: '品名', prop: 'partsnameName', width: '150px', noedit: true},
            {lbl: '规格', prop: 'goodsSpec', width: '150px', noedit: true},
            {lbl: '材质', prop: 'goodsMaterial', width: '150px', noedit: true},
            {lbl: '产地', prop: 'productareaName', width: '150px', noedit: true},
            {lbl: '验收数量（负数）', prop: 'goodsNum', width: '120px', summary: true, g_type: 'num', noedit: true},
            {lbl: '验收重量（负数）', prop: 'goodsWeight', width: '120px', summary: true, g_type: 'weight', noedit: true},
            {lbl: '数量单位', prop: 'partsnameNumunit', noedit: true},
            {lbl: '重量单位', prop: 'partsnameWeightunit', noedit: true},
            {lbl: '车皮号', prop: 'goodsContractstr2', noedit: true},
            {lbl: '入库批号', prop: 'goodsEntrystr1', noedit: true},
            {lbl: '期货原货主代码', prop: 'goodsEntrystr4', noedit: true, width: '120px'},
            {lbl: '期货原货主名称', prop: 'goodsEntrystr5', noedit: true, width: '120px'},
            {lbl: '长度', prop: 'goodsProperty1', noedit: true},
            {lbl: '米重', prop: 'goodsProperty2', noedit: true},
            {lbl: '重量范围', prop: 'goodsProperty4', noedit: true},
            {lbl: '公差范围', prop: 'goodsProperty5', noedit: true},            
            {lbl: '件支数', prop: 'goodsPartsbranch', noedit: true},          
            {lbl: '计量方式', prop: 'goodsMetering', width: '150px', noedit: true},                   
            {lbl: '备注', prop: 'deliveryDetailRemark', noedit: true}
          ],
          hiddenProp: {
            // 新增tableValue.tableData时使用
          },
          tableData: []
        }
      },
      codeTable: {      
        id: 'deliveryDown',
        ref: 'codeTable',
        loading: false,
        buttonGroupInfo: [],
        tableValue: {
          hasCbx: false,
          pageShow: false,
          showRowIndex: true,
          showSummary: true,
          validRules: {
            sumglideGinmoney: [{ required: true, message: '必填项' }]
          },
          // adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
          // priceMoneyComputerColumn: {goodsNum:'sumglideGnum',goodsWeight:'sumglideGweight',goodsAssistweight:'sumglideGassistweight',goodsInprice:'sumglideGinprice',goodsInmoney:'sumglideGinmoney',goodsTaxrate:'sumglideGtaxrate'},
          tableHead: [            
            {lbl: '规格', prop: 'goodsSpec', width: '150px', noedit: true},  
            {lbl: '长度', prop: 'goodsProperty1'},
            {lbl: '米重', prop: 'goodsProperty2'},
            {lbl: '重量范围', prop: 'goodsProperty4'},
            {lbl: '公差范围', prop: 'goodsProperty5'},     
            {lbl: '件支数', prop: 'goodsPartsbranch'},
            {lbl: '验收数量（负数）', prop: 'goodsNum', width: '120px', summary: true, g_type: 'num', noedit: true},
            {lbl: '验收重量（负数）', prop: 'goodsWeight', width: '120px', summary: true, g_type: 'weight', noedit: true},
            {lbl: '数量单位', prop: 'partsnameNumunit', noedit: true},
            {lbl: '重量单位', prop: 'partsnameWeightunit', noedit: true},
            {lbl: '数量单位', prop: 'partsnameNumunit', noedit: true},
            {lbl: '成本单价', prop: 'goodsInprice', noedit: true, g_type:'price'},
            {lbl: '成本费用单价', prop: 'goodsInfeeprice', width: '150px', noedit: true, g_type:'price'},
            {lbl: '计量方式', prop: 'goodsMetering'},
            {lbl: '车皮号', prop: 'goodsContractstr2'},
            {lbl: '入库批号', prop: 'goodsEntrystr1'},
            {lbl: '期货原货主代码', prop: 'goodsEntrystr4', width: '120px'},
            {lbl: '期货原货主名称', prop: 'goodsEntrystr5', width: '120px'},
            {lbl: '库位', prop: 'goodsCodestr1'},
            {lbl: '捆包号', prop: 'goodsCodestr2'},
            {lbl: '炉批号', prop: 'goodsCodestr3'},
            {lbl: '仓储号', prop: 'goodsCodestr4'},
            {lbl: '件编号', prop: 'goodsCodestr5'},
            {lbl: '库区', prop: 'goodsCodestr10'},
            {lbl: '备注', prop: 'entryactCodeRemark'}            
          ],
          hiddenProp: {
            // 新增tableValue.tableData时使用
          },
          tableData: []
        }        
      },
      rowSelection: [],
      codeSelection: [],         
      rules: {
        deliveryDate: [{ required: true }],
        warehouseName: [{ required: true }],
        datasSupplier: [{ required: true }],
        datasBalcorp: [{ required: true }],
        orgCode: [{ required: true }],
        deptCode: [{ required: true }],
        employeeCode: [{ required: true }]
      },
      copyForm: {},
      formDisabled: false,
      detailTableRef: {},
      table: {},
      fileMod: {
        fileBilltype: '',
        fileOpcode: ''
      },
      mainMod: {},
      codeReportList: [],
      deliveryOldSelection: [],
      queryParams: {}
    }
  },
  computed: {
    ...mapState({
      g_format: state => state.g_format,
      importType: state => state.importType
    })
  },
  created () {
    let isTrue = false
    if (!this.form.deliveryBillcode) isTrue = true
    this.topButtonGroupInfo = [
      {lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'},      
      {lbl: '销售退货', type: 'delivery', icon: 'el-icon-document'},
      {lbl: '附件', type: 'file', icon: 'el-icon-files', disabled: isTrue},
      {lbl: '打印', type: 'print', icon: 'el-icon-print'},
      {lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search', disabled: isTrue}
    ]
    this.detailTable.buttonGroupInfo = [
      {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
    ]
    this.codeTable.buttonGroupInfo = [
      {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
      {lbl: '复制', type: 'copy', icon: 'el-icon-document-copy'},
      {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
    ]
  },
  beforeMount () {
    this.copyForm = this.extend(true, this.form)
    if (this.form.deliveryBillcode) {
      this.fileMod = {
        fileBilltype: this.copyForm.billtypeCode,
        fileOpcode: this.copyForm.deliveryBillcode
      }
      this.queryParams = {
        deliveryBillcode: this.copyForm.deliveryBillcode,
        billtypeCode:this.copyForm.billtypeCode,
        feeOptcode: this.copyForm.deliveryBillcode,
        feeBilltype:this.copyForm.billtypeCode,
        page:1,
        start:0,
        limit:25
      }
      this.getMainMod()
      this.getDetail()
      this.getCodeList(this.queryParams)
    }
  },
  mounted () {
    this.$nextTick(() => {            
      this.table = this.$refs.dbEditTable
    })
  },
  methods: {
    syncName(e, obj) {     
      Object.keys(obj).forEach((key) => {
        this.copyForm[key] = e[obj[key]]
      })
    },
    insertTableData ({data, mainMod, tableMod, itemFun}) {
      const detailTable = this.table.$refs[this.detailTable.ref].$refs.basicEditable
      const mainForm = {}
      const tableDetail = []       
      const resData = this.toArray(data)
      const entryinfBillcodeArr = []
      const entryinfBillbatchArr = []
      // let _flag = true
      // let _stDetailRs = {} // 生成有仓储码单的入库单
      const idx = detailTable.getTableData().fullData.length
      resData.map((item, index) => {
        delete item._XID
        // const _entryinfBatch = item['entryinfBillbatch']
        // 码单查询条件拼接
        if(item.interfaceWmsscmEflag){
          item.interfaceWmsscmEflag = 0
        }
        // 仓储接口代码代码不为空且已经入库的
        if (item.interfaceWmsscmEflag === 1 && item.interfaceWmsscmCode) {
          entryinfBillcodeArr.push(item.sbillBillcode)
          entryinfBillbatchArr.push(item.sbillBillbatch)
        }
        // ----

        let obj = {}
        Object.keys(tableMod).forEach(key => {
          if (item[tableMod[key]] && item[tableMod[key]] !== null) {
            item[key] = item[tableMod[key]]
          }          
        })        
        itemFun(item) // 自定义     
        item.entryactBillbatch = this.getTempBatchStr(idx + index)
        item.goodsBinfeeprice = 0
			  item.goodsInfeemoney = 0
        obj = Object.assign({}, this.extend(true, this.detailTable.tableValue.hiddenProp), item)                
        tableDetail.push(obj)
        for (const key in mainMod) {
          if (item[mainMod[key]] && item[mainMod[key]] !== null) {
            mainForm[key] = item[mainMod[key]]
          }
        }
      })
      // 码单 
      const queryBean = {
        entryinfBillcodeStr: entryinfBillcodeArr.join(),
        entryinfBillbatchStr: entryinfBillbatchArr.join()
      }
      this.queryImpCodeList({queryBean})

      this.fileMod = {
        fileBilltype: data[0].billtypeCode,
        fileOpcode: data[0].deliveryBillcode
      }
      Object.assign(this.copyForm, mainForm) // 主表赋值
      // Object.assign(this.clauseMod, clauseForm) // 辅助信息赋值
      detailTable.insertAt(tableDetail, -1)
      detailTable.updateFooter()
      this.formDisabled = true
    },
    entryinfCellBack (data) {     
      // 入库通知 
      const mainMod = {datasBalcorp:'datasBalcorp', warehouseName: 'warehouseName', datasBalcorpname:'datasBalcorpname',datasSupplier:'datasSupplier',datasSuppliername:'datasSuppliername',warehouseCode:'warehouseCode',ddTypeTransport:'ddTypeTransport',datasCarnum:'datasCarnum', entryinfBillcode:'entryinfBillcode',interfaceWmsscmCode:'interfaceWmsscmCode'}
      const tableMod = {entryinfBillcode:'entryinfBillcode', entryactDetailOptcode:'entryinfBillcode', entryactDetailOptbatch:'goodsEntrybatch', entryactDetailBilltype:'billtypeCode', goodsTaxrate:'goodsTaxrate', datasInorgName:'datasInorgName', datasInorgCode:'datasInorgCode', datasOrdercorp:'datasOrdercorp', datasOrdercorpname:'datasOrdercorpname', datasAcceptcorp:'datasAcceptcorp', datasAcceptcorpname:'datasAcceptcorpname', companyCode:'companyCode', companyName:'companyName', goodsNum:'noDetailNum', goodsWeight:'noDetailWeight', goodsAssistweight:'noDetailAssistweight', previousDataVernum:'dataVernum', entryactDetailRemark:'entryinfDetailRemark', consignDetailDate:'consignDetailDate', scontractBillcode:'scontractBillcode', scontractBillbatch:'scontractBillbatch'}
      // 成本相关
      this.insertTableData({data, mainMod, tableMod, itemFun: (item) => {        
        item.goodsNewinprice = this.toNumber(item.goodsNewinprice)
        item.goodsInprice =  this.toNumber(item.goodsNewinprice)
        item.goodsBinfeeprice = 0
        item.goodsPreinfeeprice = this.toNumber(item.goodsBinfeeprice) + this.toNumber(item.goodsPreinfeeprice)
        item.dataFlag = 0
      }})
      this.entryinfWinShow = false
    },
    topButtonGroupClick (type) {
      switch (type) {
        case 'save':
          this.save()         
          break
        case 'entryinf':
          this.entryinfWinShow = true
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
    detailBtnClick(flag) {
      switch(flag) {
        case 'del':
          this.table.detailRemove(this.rowSelection[0])
          this.formDisabled = false
          break
        default:
          break
      }
    },
    codeBtnClick(flag) {
      switch(flag) {        
        case 'add': // 新增码单    
          if (this.rowSelection.length < 1) {
            this.$message.error('请先选择明细！')
            return false
          }
          debugger
          const insertData = {}
          const detailSelectRow = this.rowSelection[0]
          const codeSelectRow = this.codeSelection[0]
          
          const importTypeColums = []
          importTypeColums.push(...this.importType.goodsType, ...this.importType.detailType)
          insertData.dataFlag = 0
          importTypeColums.forEach(key => {
            insertData[key] = detailSelectRow[key]
          })
          if (this.codeSelection.length === 0) {
            insertData.goodsNum = detailSelectRow.goodsNum
            insertData.goodsWeight = detailSelectRow.goodsWeight            
          } else {
            insertData.goodsNum = codeSelectRow.goodsNum
            insertData.goodsWeight = codeSelectRow.goodsWeight
          }
          insertData.goodsAssistweight = detailSelectRow.goodsAssistweight
          insertData.deliveryBillcode = detailSelectRow.deliveryBillcode
          insertData.entryactBillbatch = detailSelectRow.entryactBillbatch
          insertData.entryinfBillcode = detailSelectRow.entryinfBillcode
          insertData.goodsBatch = detailSelectRow.goodsBatch
          insertData.goodsSpec = detailSelectRow.goodsSpec
          insertData.partsnameNumunit = detailSelectRow.partsnameNumunit
          insertData.partsnameWeightunit = detailSelectRow.partsnameWeightunit
          insertData.goodsMetering = detailSelectRow.goodsMetering
          // 成本相关
          insertData.goodsNewinprice = this.toNumber(detailSelectRow.goodsNewinprice)
          insertData.goodsInprice = this.toNumber(detailSelectRow.goodsNewinprice)          
          this.table.codeInsertAt([insertData])
          break
        case 'copy':
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要复制的数据')
            return false
          }
          const copyCode = this.extend(true, this.codeSelection[0])
          copyCode.goodsCodebill = '' // 批号等重新赋值
          copyCode.goodsCodebillold = '' // 批号等重新赋值
          copyCode.entryactCodeState = 0
          copyCode.dataVernum = 0
          copyCode.dataFlag = 0 // 操作标记
          copyCode.goodsNewinfeeprice = 0
          copyCode.goodsInfeeprice = 0
          delete copyCode._XID
          this.table.codeInsertAt([copyCode])
          break
        case 'del':          
          if (this.rowSelection.length < 1) {
            this.$message.error('请选择需要删除的数据')
            return false
          }
          this.table.codeRemove(this.codeSelection[0])          
          break
        default:
          console.error('error')
          break
      }
    },
    save () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const detailTable = this.table.$refs.detailTable.$refs.basicEditable
          if (detailTable.getTableData().fullData.length === 0) {
            this.$message.error('请增加明细！')
            return false
          }
          if (this.table.codeList.length === 0) {
            this.$message.error('请增加码单！')
            return false
          }

          const fullData = detailTable.getTableData().fullData
          let flag = false
          debugger
          fullData.find((item, index) => {            
            const findList = this.table.codeList.find(codeItem => {
              return codeItem.entryactBillbatch === item.entryactBillbatch
            })
            debugger
            if (!findList) {
              flag = true
              this.$message.error('第' + (index+1) + '行物资没有配码,请先配码后再保存!')
            }
            return !findList
          })
          if (flag) return false

          const form = {
            goodsNum: this.getColumnSum('goodsNum',detailTable),
            goodsPiecenum: this.getColumnSum('goodsPiecenum', detailTable),
            goodsSingernum: this.getColumnSum('goodsSingernum', detailTable),
            goodsWeight: this.getColumnSum('goodsWeight', detailTable),
            goodsAssistweight: this.getColumnSum('goodsAssistweight', detailTable),
            dataInmoney: this.getColumnSum('goodsInmoney', detailTable)
          }
          Object.assign(this.copyForm, form)
          // 明细
          const detailRemoveRecords = []
          if (detailTable.getRemoveRecords().length> 0) {
            this.detailTable.getRemoveRecords().map((item) => {
              item.dataFlag = 2
              detailRemoveRecords.push(item)
            })
          }
          const detailUpdateRecords = detailTable.getUpdateRecords()
          const detailInsertRecords = detailTable.getInsertRecords()
          const detailList = [...detailInsertRecords, ...detailUpdateRecords, ...detailRemoveRecords]
          
          const params = {
            entryactMod: this.copyForm,
            detailList: detailList,
            codeList: this.table.codeList
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
    detailRowSelection (row) {
      this.rowSelection = row ? [row] : []
    },
    codeRowSelection (row) {
      this.codeSelection = row ? [row] : []
    },
    cellEdit({row, $rowIndex, column}) {},
    tabChange (tab, event) {      
      this.activeTab = tab.name
    },
    async getMainMod (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/entryactAjax!edit.do', 'post', this.queryParams)        
        if (data.map.state !== '3') {
          this.$message.error(data.map.msg ? data.map.msg : '操作失败')
          return false
        }
        const mainMod = JSON.parse(JSON.stringify(data.mainMod))
        debugger        
        Object.keys(this.copyForm).forEach((key) => {
          this.copyForm[key] = mainMod[key] ? mainMod[key] : this.copyForm[key]
        })
        this.copyForm.entryactDate = this.toDateString(data.mainMod.entryactDate, 'yyyy-MM-dd HH:mm')
      } catch (e) {
        console.error(e)
      }
    },
    async getDetail () {
      try {
        this.detailTable.loading = true
        const { data } = await this.proxy(this, 'scscm/app/entryactAjax!queryList.do', 'post', this.queryParams)
        console.log(data)
        this.detailTable.tableValue.tableData = []
        if (data.detailList) {
          this.detailTable.tableValue.tableData = data.detailList
          this.formDisabled = true
        }
        this.detailTable.loading = false
      } catch (e) {
        this.loading = false
        console.error('error', e)
      }
    },
    async getCodeList () {
      try {
        this.codeTable.loading = true
        const { data } = await this.proxy(this, 'scscm/app/entryactAjax!queryCodeList.do', 'post', this.queryParams)
        console.log(data)
        this.codeTable.tableValue.tableData = []
        if (data.codeList) {
          this.codeTable.tableValue.tableData = data.codeList
          this.formDisabled = true
        }
        this.codeTable.loading = false
      } catch (e) {
        this.loading = false
        console.error('error', e)
      }
    },
    async queryImpCodeList (params) {
      try {
        // this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/entryactAjax!queryImpCodeList.do', 'post', params)
        console.log(data)
        const _stDetailRs = {}
        // this.codeReportList = []
        // const codeTable = this.table.$refs[this.codeTable.ref]
        if (data.codeReportList) {
          // this.codeReportList = data.codeReportList
          data.codeReportList.map(item => {
            const _entryinfBatch= item.entryinfBillbatch
            let _detailRec = {}
            if(_stDetailRs[_entryinfBatch]){
              _detailRec = _stDetailRs[_entryinfBatch]
              _detailRec.goodsNum = this.sum([_detailRec.goodsNum, item.goodsNum])
              _detailRec.goodsWeight = this.sum([_detailRec.goodsWeight, item.goodsWeight])
              _detailRec.goodsAssistweight = this.sum([_detailRec.goodsAssistweight, item.goodsAssistweight])              
            }else{
              // 明细中不保留仓储入库号信息，是根据贸易入库通知批号来合并的，一个入库通知明细可能对应多张仓储入库单
              _detailRec.goodsNum = item.goodsNum
              _detailRec.goodsWeight = item.goodsWeight
              _detailRec.goodsAssistweight = item.goodsAssistweight
              _detailRec.entryactBillbatch = item.entryinfBillbatch // 明细与码
            }
            _stDetailRs[_entryinfBatch] = _detailRec
            
            // const _codeRec = {}
            // for(var j=0;j<importColumns.length;j++){
            //   _codeRec[importColumns[j]]=_datarec[importColumns[j]];
            // }
            item.entryactDetailOptcode = item.entryinfBillcode
            item.entryactDetailOptbatch = item.entryinfBillbatch
            item.entryactDetailBilltype = item.entryinfBilltype					        
            // item.entryinfBillcode = item.entryinfBillcode
            
            item.goodsCodebill = null
            item.goodsCodebillold = null
            item.goodsWmscodebill = item.goodsCodebill
            // item.enterBillcode = item.enterBillcode
            // item.enterBillbatch = item.enterBillbatch
            item.enterCodebatch = item.goodsCodebill
            item.enterBilltype = item.billtypeCode
            item.entryactBillbatch = item.entryinfBillbatch // 明细与码单过滤
            
            // item.partsnameNumunit = item.partsnameNumunit
            // item.partsnameWeightunit = item.partsnameWeightunit
            // item.goodsMetering = item.goodsMetering
            // item.goodsNum = item.goodsNum
            // item.goodsWeight = item.goodsWeight
            // item.goodsAssistweight = item.goodsAssistweight
            item.dataVernum = 0
          })
          // this.codeTable.tableValue.tableData = data.codeReportList
          // codeTable.insertAt(data.codeReportList, -1)
          this.table.codeInsertAt(data.codeReportList, -1)
        }
        // this.loading = false
      } catch (e) {
        this.loading = false
        console.error('error', e)
      }
    },
    async saveAsync (params) {
      // 保存
      const loading = this.loadShow()
      try {
        let api = 'scscm/app/entryactAjax!save.do'
        if (this.copyForm.deliveryBillcode) {
          api = 'scscm/app/entryactAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {entryactStr: JSON.stringify(params)})
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
// /deep/.el-dialog{
//   margin: 10px auto 0!important;
// }
</style>
