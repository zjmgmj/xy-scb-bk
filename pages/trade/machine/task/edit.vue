<template lang="pug">
  el-dialog(title="加工任务登记", :visible="true", top="10px", width="1400px", @close="close")
    button-group(:btns="buttons", @groupBtnClick="buttonsHandler")
    el-form.mt-10(ref="form", :model="form", :rules="rules", label-width="100px")
      el-row
        el-col(:span="5")
          el-form-item(label="单据号", prop="mtaskBillcode")
            el-input.full-width(v-model="form.mtaskBillcode", clearable, size="mini", readonly)
        el-col(:span="5")
          el-form-item(label="日期", prop="mtaskDate")
            el-date-picker.full-width(v-model="form.mtaskDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="5")
          el-form-item(label="仓库", prop="warehouseCode")
            warehouse-select(v-model="form.warehouseCode", :disabled="formFieldDisabled",)
        el-col(:span="5")
          el-form-item(label="业务类别", prop="mtaskType")
            general-select(
              v-model="form.mtaskType",
              url="scscm/app/ddAjax!queryCombo.do",
              list-prop="ddList",
              code-prop="ddValue",
              name-prop="ddShowname",
              :extraParam="{ddtypeClass: 'sdpMtaskType'}"
              :disabled="formFieldDisabled",
              size="mini",
              @change="changeMtaskType")
        el-col(:span="4")
          el-form-item(label="原始单号", prop="mtaskOthercode")
            el-input.full-width(v-model="form.mtaskOthercode", clearable, size="mini")
      el-row
        el-col(:span="5")
          el-form-item(label="包装类型", prop="ddTypePacktype")
            basic-select(v-model="form.ddTypePacktype", ddtypeClass="ddTypePacktype", :useName="true")
        el-col(:span="5")
          el-form-item(label="单据流程", prop="datasBillflow")
            general-select(
              v-model="form.datasBillflow",
              url="scscm/app/ddAjax!queryCombo.do",
              list-prop="ddList",
              code-prop="ddValue",
              name-prop="ddShowname",
              :extraParam="{ddtypeClass: 'mtaskdatasBillflow'}"
              size="mini")
        el-col(:span="5")
          el-form-item(label="加工标准", prop="mtaskMsta")
            basic-select(v-model="form.mtaskMsta", ddtypeClass="mtaskMsta")
        el-col(:span="5")
          el-form-item(label="加工工艺", prop="ddTypeCraft")
            basic-select(v-model="form.ddTypeCraft", ddtypeClass="mtaskddTypeCraft")
        el-col(:span="4")
          el-form-item(label="刀厚(mm)", prop="mtaskMply")
            el-input.full-width(v-model="form.mtaskMply", clearable, size="mini")
      el-row
        el-col(:span="5")
          el-form-item(label="对应关系", prop="datasMto")
            el-select.full-width(v-model="form.datasMto", :disabled="formFieldDisabled",, size="mini")
              el-option(label="一对多", :value="0")
              el-option(label="多对多", :value="1")
        el-col(:span="5")
          el-form-item(label="业务机构", prop="orgCode")
            org-select(v-model="form.orgCode", :disabled="formFieldDisabled",, @change="syncName($event, {orgName: 'orgAbbreviate'})")
        el-col(:span="5")
          el-form-item(label="业务部门", prop="deptCode")
            dept-select(v-model="form.deptCode", :disabled="formFieldDisabled",, @change="syncName($event, {deptName:'deptName'})")
        el-col(:span="5")
          el-form-item(label="业务员", prop="employeeCode")
            employee-select(v-model="form.employeeCode", @change="syncName($event, {employeeName:'employeeName'})")
        el-col(:span="4")
          el-form-item(label-width="auto", prop="mtaskProperty")
            el-radio(v-model="form.mtaskProperty", label="0") 自加工
            el-radio(v-model="form.mtaskProperty", label="1") 委外加工
      el-row
        el-col(:span="15")
          el-form-item(label="备注", prop="mtaskRemark")
            el-input.full-width(v-model="form.mtaskRemark", clearable, size="mini")
        el-col(:span="5")
          el-form-item(label="费用金额", prop="dataInfeemoney")
            el-input.full-width(v-model="form.dataInfeemoney", clearable, readonly, size="mini")
        el-col(:span="4")
          el-form-item(label="制单人", prop="operatorName")
            el-input.full-width(v-model="form.operatorName", clearable, readonly, size="mini")
    .mt-10
      el-tabs(v-model="activeTab", type="border-card", size="mini")
        el-tab-pane(label="物资明细" name="1")
          panel1(ref="panel1")
        el-tab-pane(label="费用" name="2")
          .pt-10.pb-10
            sdp-fee(:mainForm="form", ref="sdpfee", :rowDetail="rowSelection[0]", :feeConfig="feeConfig", :detailTable="table")
    sdp-goods-detail(v-if="detailWinShow", :queryParam="detailWinQueryParam", :checkMethod="detailWinFilter", @close="detailWinShow = false", @sure="confirmGoodsCode")
    scontract-mtask(v-if="detailWin2Show", :queryParam="detailWin2QueryParam", :checkMethod="detailWinFilter", @close="detailWin2Show = false", @sure="confirmGoodsMachine")
    file-win(v-if="fileWinShow", @close="fileWinShow = false", :fileMod="fileMod", :table="$refs.panel1.tableValue1.tableHead")
    audit-glide-view(v-if="auditGlideShow", @close="auditGlideShow = false", :fileMod="fileMod")
</template>

<script>
  import { toDateString } from 'xe-utils'
  import panel1 from './pane1'
  import buttonGroup from '@/components/buttonGroup.vue'
  import detailWin from '@/components/detailWin'
  import sdpGoodsDetail from '@/components/queryReport/sdpGoodsDetail'
  import scontractMtask from '@/components/queryReport/scontractMtask'
  import sdpFee from '@/components/sdpfee'
  import fileWin from '@/components/file'
  import auditGlideView from '@/components/billtypeaudit'

  /** 防止值为null导致组件prop报错 */
  function null2undefined(obj){
    Object.keys(obj).forEach(x=>{
      if (obj[x]===null) obj[x] = undefined
    })
  }

  export default {
    name: 'TradeMachineTaskEdit',
    components: {
      sdpGoodsDetail,
      scontractMtask,
      buttonGroup,
      detailWin,
      panel1,
      sdpFee,
      fileWin,
      auditGlideView
    },
    provide() {
      return {
        edit: this
      };
    },
    props: {
      originForm: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        buttons: [
          // { lbl: '新单', type: 'new', icon: 'el-icon-plus' },
          { lbl: '保存', type: 'save', icon: 'el-icon-folder-checked', disabled: false },
          { lbl: '现货物资', type: 'goodsCode', icon: 'el-icon-document', disabled: false },
          { lbl: '现货销售加工', type: 'goodsMachine', icon: 'el-icon-document', disabled: false },
          { lbl: '附件', type: 'file', icon: 'el-icon-files', disabled: true },
          { lbl: '打印', type: 'print', icon: 'el-icon-printer', disabled: false },
          { lbl: '查看审核流水', type: 'auditGlide', icon: 'el-icon-search', disabled: true }
        ],
        rules: {
          mtaskDate: [{ required: true }],
          warehouseCode: [{ required: true }],
          ddTypePacktype: [{ required: true }],
          datasBillflow: [{ required: true }],
          datasMto: [{ required: true }],
          orgCode: [{ required: true }],
          deptCode: [{ required: true }],
          employeeCode: [{ required: true }],
          operatorName: [{ required: true }],
        },
        form: {
          mtaskDate: toDateString(new Date(), 'yyyy-MM-dd HH:mm'),
          mtaskType: '03',
          mtaskProperty: '0',
          datasBillflow: '0',
          datasMto: 0,
          orgCode: '000000',
          deptCode: '',
          employeeCode: '',
          operatorCode: '',
          operatorName: 'aaa',
          warehouseCode: '000024'
        },
        activeTab: '1',
        detailWinShow: false,
        detailWinQueryParam: {},
        detailWin2Show: false,
        detailWin2QueryParam: {},
        fileWinShow: false,
        fileMod: {},
        auditGlideShow: false,
        formFieldDisabled: false,
        feeConfig: {
          otherParams: {
            mainBackMoney: 'dataInfeemoney',
            detailBackInprice: 'goodsBinfeeprice',
            detailBackMoney: 'goodsInfeemoney',
            feeBweight: 'goodsWeight',
            feeOptbatch: 'mtaskBillbatch',
            billcode: 'mtaskBillcode'
          }
        },
        table: {},
        rowSelection: []
      }
    },
    computed: {
    },
    created() {
      if (this.originForm.mtaskBillcode) {
        this.form.billtypeCode = this.originForm.billtypeCode
        this.form.mtaskBillcode = this.originForm.mtaskBillcode
        this.fileMod.fileBilltype = this.originForm.billtypeCode
        this.fileMod.fileOpcode = this.originForm.mtaskBillcode

        this.buttons.filter(x => x.type === 'file').forEach(x => x.disabled = false)
        this.buttons.filter(x => x.type === 'audit').forEach(x => x.disabled = false)
        this.buttons.filter(x => x.type === 'auditGlide').forEach(x => x.disabled = false)
        this.initData()
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.changeMtaskType()
        this.table = this.$refs.panel1.detailTable
      })
    },
    methods: {
      syncName(e, obj) {
        Object.keys(obj).forEach((key) => this.form[key] = e[obj[key]])
      },
      changeMtaskType() {
        const type = this.form.mtaskType
        console.log(type)
        if (type === '01') {
          this.buttons.filter(x => x.type === 'goodsMachine').forEach(x => x.disabled = false)
          this.$refs.panel1.buttons2.filter(x => x.type === 'sale').forEach(x => x.disabled = false)
        } else if (type === '03') {
          this.buttons.filter(x => x.type === 'goodsMachine').forEach(x => x.disabled = true)
          this.$refs.panel1.buttons2.filter(x => x.type === 'sale').forEach(x => x.disabled = true)
        }
      },
      detailWinFilter({ row, rowIndex }) {
        const { insertRecords, updateRecords } = this.$refs.panel1.detailTable.getRecordset()
        let n = 0
        n += insertRecords.filter(x => x.goodsCodebill === row.goodsCodebill).length
        n += updateRecords.filter(x => x.goodsCodebill === row.goodsCodebill).length
        return n === 0
      },
      confirmGoodsCode({ data }) {
        console.log(data)
        this.setFieldReadonly(true)

        const importColumn = ['goodstreeCode', 'goodsIndustry', 'pntreeName', 'productareaName', 'partsnameName', 'goodsMaterial', 'goodsSpec', 'goodsSpec1', 'goodsSpec2', 'goodsSpec3', 'goodsSpec4', 'goodsProperty', 'goodsProperty1', 'goodsProperty2', 'goodsProperty3', 'goodsProperty4', 'goodsProperty5', 'goodsNumproperty1', 'goodsNumproperty2', 'goodsPartsbranch', 'goodsWetpercentage', 'partsnameNumunit', 'partsnameWeightunit', 'goodsWeightmode', 'goodsPiecemode', 'partsnamePriceun', 'goodsMetering', 'warehouseCode', 'goodsOrg', 'goodsDept', 'companyCode', 'companyName', 'goodsCurrency', 'goodsExrate', 'goodsBatch', 'goodsDate', 'sumgoodsBatch', 'goodsCustomscode', 'goodsEnname', 'goodsEndescribe', 'goodsContractbatch', 'goodsContract', 'goodsContractstr1', 'goodsContractstr2', 'goodsContractstr3', 'goodsContractstr4', 'goodsContractstr5', 'goodsEntrybatch', 'goodsEntrystr1', 'goodsEntrystr2', 'goodsEntrystr3', 'goodsEntrystr4', 'goodsEntrystr5', 'goodsEntrybatchold', 'goodsContractold', 'goodsContractoldDate', 'datasInorgCode', 'datasIndeptCode', 'datasOrdercorp', 'datasOrdercorpname', 'goodsProperty', 'goodsCodebill', 'goodsWmscodebill', 'goodsCodebillold', 'goodsCodestr1', 'goodsCodestr2', 'goodsCodestr3', 'goodsCodestr4', 'goodsCodestr5', 'goodsCodestr6', 'goodsCodestr7', 'goodsCodestr8', 'goodsCodestr9', 'goodsCodestr10', 'goodsCodenum1', 'goodsCodenum2', 'goodsCodenum3']

        const table = this.$refs.panel1.detailTable
        data.forEach((row, index) => {
          // 给主表单赋值
          this.form.companyCode = row.companyCode
          this.form.companyName = row.companyName

          const rec = {}
          importColumn.forEach(x => rec[x] = row[x])
          // rec.orgCode = this.form.orgCode
          rec.dataFlag = 0 // 操作标记
          rec.warehouseCode = this.form.warehouseCode
          rec.goodsNum = row.goodsSupplynum
          rec.goodsWeight = row.goodsSupplyweight
          rec.goodsAssistweight = row.goodsSupplyassistweight
          rec.previousDataVernum = row.dataVernum
          rec.warehouseDataVernum = row.dataVernum
          rec.mtaskDetailsRemark = row.goodsRemark
          rec.datasBalcorp = row.datasBalcorp // 库存供应商
          rec.datasBalcorpname = row.datasBalcorpname
          rec.mtaskBillbatch = this.getTempBatchStr(index + 1)
          rec.mtaskDetailsPerbatch = rec.mtaskBillbatch
          rec.mtaskDetailsPerbatchall = rec.mtaskBillbatch
          rec.mtaskDetailsBindersbatchall = rec.mtaskBillbatch
          rec.goodsInprice = row.goodsNewinprice
          rec.goodsInfeeprice = row.goodsNewinfeeprice
          rec.goodsNewinprice = row.goodsNewinprice
          rec.goodsNewinfeeprice = row.goodsNewinfeeprice
          rec.goodsCosttaxrate = row.goodsTaxrate
          rec.goodsTaxrate = row.goodsTaxrate
          if (this.form.datasMto === 0) {
            // 一对多
            rec.batchForFilter = rec.mtaskBillbatch
          } else {
            rec.batchForFilter = 'FILTER'
          }
          rec.mtaskDetailsClass = 0
          rec.mtaskDetailsProcessno = 0
          rec.mtaskDetailsProcess = ''

          table.insertAt(rec, -1)
        })
        this.$refs.panel1.refresh()
        this.detailWinShow = false
      },
      async confirmGoodsMachine({ data }) {
        console.log(data)
        this.setFieldReadonly(true)
        const importColumn = ['goodstreeCode', 'goodsIndustry', 'pntreeName', 'productareaName', 'partsnameName', 'goodsMaterial', 'goodsSpec', 'goodsSpec1', 'goodsSpec2', 'goodsSpec3', 'goodsSpec4', 'goodsProperty', 'goodsProperty1', 'goodsProperty2', 'goodsProperty3', 'goodsProperty4', 'goodsProperty5', 'goodsNumproperty1', 'goodsNumproperty2', 'goodsPartsbranch', 'goodsWetpercentage', 'partsnameNumunit', 'partsnameWeightunit', 'goodsWeightmode', 'goodsPiecemode', 'partsnamePriceun', 'goodsMetering', 'warehouseCode', 'goodsOrg', 'goodsDept', 'companyCode', 'companyName', 'goodsCurrency', 'goodsExrate', 'goodsBatch', 'goodsDate', 'sumgoodsBatch', 'goodsCustomscode', 'goodsEnname', 'goodsEndescribe', 'goodsContractbatch', 'goodsContract', 'goodsContractstr1', 'goodsContractstr2', 'goodsContractstr3', 'goodsContractstr4', 'goodsContractstr5', 'goodsEntrybatch', 'goodsEntrystr1', 'goodsEntrystr2', 'goodsEntrystr3', 'goodsEntrystr4', 'goodsEntrystr5', 'goodsEntrybatchold', 'goodsContractold', 'goodsContractoldDate', 'datasInorgCode', 'datasIndeptCode', 'datasOrdercorp', 'datasOrdercorpname', 'goodsProperty', 'goodsCodebill', 'goodsWmscodebill', 'goodsCodebillold', 'goodsCodestr1', 'goodsCodestr2', 'goodsCodestr3', 'goodsCodestr4', 'goodsCodestr5', 'goodsCodestr6', 'goodsCodestr7', 'goodsCodestr8', 'goodsCodestr9', 'goodsCodestr10', 'goodsCodenum1', 'goodsCodenum2', 'goodsCodenum3']

        const detailTable = this.$refs.panel1.detailTable
        data.forEach((row, index) => {
          // 给主表单赋值
          this.form.companyCode = row.companyCode
          this.form.companyName = row.companyName

          const rec = {}
          importColumn.forEach(x => rec[x] = row[x])
          // rec.orgCode = this.form.orgCode
          rec.dataFlag = 0 // 操作标记
          rec.warehouseCode = this.form.warehouseCode
          rec.mtaskDetailsProcess = row.mtaskDetailsProcess
          rec.goodsNum = row.mtaskDetailsNnum
          rec.goodsWeight = row.mtaskDetailsNweight
          rec.goodsAssistweight = row.mtaskDetailsNassistweight
          rec.previousDataVernum = row.dataVernum
          rec.mtaskDetailsRemark = row.mtaskDetailsRemark
          rec.mtaskBillbatch = row.scontractCodeBatch
          rec.mtaskDetailsPerbatch = rec.mtaskBillbatch
          rec.mtaskDetailsPerbatchall = rec.mtaskBillbatch
          rec.mtaskDetailsBindersbatchall = rec.mtaskBillbatch
          rec.scontractBillcode = row.scontractBillcode
          rec.scontractBillbatch = row.scontractBillbatch
          rec.scontractDetailMac = row.scontractMtaskMac
          rec.scontractCodeBatch = row.scontractCodeBatch
          rec.mtaskDetailsClass = row.mtaskDetailsClass
          rec.goodsInprice = row.goodsNewinprice
          rec.goodsInfeeprice = row.goodsNewinfeeprice
          rec.goodsNewinprice = row.goodsNewinprice
          rec.goodsNewinfeeprice = row.goodsNewinfeeprice
          rec.goodsCosttaxrate = row.goodsCosttaxrate
          rec.goodsTaxrate = row.goodsCosttaxrate
          rec.scontractMtaskBillbatch = ''
          rec.mtaskDetailsProcessno = 0
          if (this.form.datasMto === 0) {
            // 一对多
            rec.batchForFilter = rec.mtaskBillbatch
          } else {
            rec.batchForFilter = 'FILTER'
          }

          detailTable.insertAt(rec, -1)
        })

        // 拼接参数
        const params = {
          scontractBillcodeStr: data.map(row => row.scontractBillcode).join(','),
          scontractBillbatchStr: data.map(row => row.scontractBillbatch).join(','),
          scontractCodeBatchStr: data.map(row => row.scontractCodeBatch).join(','),
          scontractMtaskMac: 1,
          scontractDetailType: '01',
          mtaskDetailsClassFlag: 1
        }
        const { data: resp } = await this.proxy(this, 'scscm/app/scontractEnrollAjax!queryMtaskReport.do', 'post', { codeBean: params })
        if (resp.mtaskReportList && resp.mtaskReportList.length !== 0) {
          const panel1 = this.$refs.panel1
          resp.mtaskReportList.forEach(row => {
            const rec = {}
            importColumn.forEach(x => rec[x] = row[x])
            rec.mtaskDetailsProcess = row.mtaskDetailsProcess
            rec.goodsNum = row.mtaskDetailsNnum
            rec.goodsWeight = row.mtaskDetailsNweight
            rec.goodsAssistweight = row.mtaskDetailsNassistweight
            rec.previousDataVernum = row.dataVernum
            rec.mtaskDetailsRemark = row.mtaskDetailsRemark
            rec.mtaskBillbatch = row.scontractCodeBatch
            rec.mtaskDetailsPerbatch = rec.mtaskBillbatch
            rec.mtaskDetailsPerbatchall = rec.mtaskBillbatch
            rec.mtaskDetailsBindersbatchall = rec.mtaskBillbatch
            rec.scontractBillcode = row.scontractBillcode
            rec.scontractBillbatch = row.scontractBillbatch
            rec.scontractDetailMac = row.scontractMtaskMac
            rec.scontractCodeBatch = row.scontractCodeBatch
            rec.mtaskDetailsClass = row.mtaskDetailsClass
            rec.scontractMtaskBillbatch = row.scontractMtaskBillbatch
            rec.mtaskDetailsProcessno = 1
            rec.goodsInprice = row.goodsNewinprice
            rec.goodsInfeeprice = row.goodsNewinfeeprice
            rec.goodsNewinprice = row.goodsNewinprice
            rec.goodsNewinfeeprice = row.goodsNewinfeeprice
            rec.goodsCosttaxrate = row.goodsCosttaxrate
            rec.goodsTxrate = row.goodsCosttaxrate
            if (this.form.datasMto === 0) {
              // 一对多
              rec.batchForFilter = rec.mtaskBillbatch
            } else {
              rec.batchForFilter = 'FILTER'
            }
            panel1.addCodeTableByParent(rec)
          })
          detailTable.setCurrentRow(detailTable.getInsertRecords()[0])
        }

        this.$refs.panel1.refresh()
        this.detailWin2Show = false
      },
      buttonsHandler(type) {
        let warehouseCode
        switch (type) {
          case 'save':
            this.save()
            break
          case 'goodsCode': // 现货物资
            warehouseCode = this.form.warehouseCode
            if (!warehouseCode) {
              this.$message.error('请先输入仓库')
              return false
            }
            const orgCode = this.form.orgCode
            if (!orgCode) {
              this.$message.error('请先输入业务机构')
              return false
            }
            this.detailWinQueryParam = { warehouseCode, goodsOrg: orgCode }
            this.detailWinShow = true
            break
          case 'goodsMachine':
            warehouseCode = this.form.warehouseCode
            if (!warehouseCode) {
              this.$message.error('请先输入仓库')
              return false
            }
            this.detailWin2QueryParam = { warehouseCode }
            this.detailWin2Show = true
            break
          case 'file':
            this.fileWinShow = true
            break
          case 'print':
            break
          case 'auditGlide':
            this.auditGlideShow = true
            break
        }
      },
      close() {
        this.$emit('close')
      },
      async save() {
        // 校验顶部表单
        try {
          await this.$refs.form.validate()
        } catch (e) {
          this.$message.error('请完善表单')
          return
        }

        const panel1 = this.$refs.panel1
        const detailTable = this.$refs.panel1.detailTable
        const codeTable = this.$refs.panel1.codeTable

        if (!panel1 || !detailTable || !codeTable) {
          this.$message.error('出错了，请刷新后重试')
          return
        }

        // 校验物资明细
        const { detailData, codeData } = panel1.getRecordSet()
        if (detailData.length === 0) {
          this.$message.error('请增加基料')
          return
        }
        if (codeData.length === 0) {
          this.$message.error('请增加成品')
          return
        }
        if (this.form.datasMto === 0) {
          for (let i = 0; i < detailData.length; i++) {
            const batchForFilter = detailData[i].batchForFilter
            if (codeData.filter(x => x.batchForFilter === batchForFilter).length === 0) {
              this.$message.error('第' + (i + 1) + '行物资没有成品，请先增加后再保存')
              return
            }
          }
        } else if (this.form.datasMto === 1) {
        } else {
          this.$message.error('请选择对应关系')
          return
        }

        // 校验基料和成品重量
        const detailWeight = detailData.map(x => x.goodsWeight ? x.goodsWeight : 0).reduce((a, b) => a + b, 0.0)
        const codeWeight = codeData.map(x => x.goodsWeight ? x.goodsWeight : 0).reduce((a, b) => a + b, 0.0)
        if (detailWeight > codeWeight) {
          try {
            await this.confirmDialog(this, '加工前量小于加工后量,是否保存?')
          } catch (e) {
            return
          }
        }

        // 费用计算，费用单价等
        const sdpFeeTable = this.$refs.sdpfee
        const feeList = sdpFeeTable.sdpFeeSave()
        if (feeList.length > 0) {
          this.setStoreFeeprice(this.form, detailData, feeList, sdpFeeTable, this.feeConfig, this.getColumnSum('goodsWeight', detailTable))
        }
        this.form.goodsNum = this.getColumnSum('goodsNum', detailTable)
        this.form.goodsWeight = this.getColumnSum('goodsWeight', detailTable)
        this.form.goodsPiecenum = this.getColumnSum('goodsPiecenum', detailTable)
        this.form.goodsSingernum = this.getColumnSum('goodsSingernum', detailTable)
        this.form.goodsAssistweight = this.getColumnSum('goodsAssistweight', detailTable)

        // 封装请求参数
        const params = {}
        params.mtaskMod = this.form
        params.detailList = [...detailData, ...codeData]
        params.feeList = feeList

        console.log(params)
        let api = 'scscm/app/sdpMtaskEnrollAjax!save.do'
        if (this.form.mtaskBillcode) {
          api = 'scscm/app/sdpMtaskEnrollAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', { mtaskStr: JSON.stringify(params) })
        if (data.map.state === '2') {
          this.$message.error(data.map.msg)
          return
        }
        this.$emit('save')
      },
      async initData() {
        this.setFieldReadonly(true)
        await Promise.all([
          this.loadMain(),
          this.loadDetail(),
          this.loadCode(),
          // this.loadFee(),
        ])
        const panel1 = this.$refs.panel1
        panel1.detailTable.setCurrentRow(panel1.detailTable.getData(0))
        panel1.refresh()
      },
      async loadMain() {
        try {
          const api = 'scscm/app/sdpMtaskEnrollAjax!edit.do'
          const params = {
            mtaskBillcode: this.originForm.mtaskBillcode,
            billtypeCode: this.originForm.billtypeCode,
            feeOptcode: this.originForm.mtaskBillcode,
            feeBilltype: this.originForm.billtypeCode
          }
          const { data } = await this.proxy(this, api, 'post', params)
          if ('mainMod' in data) {
            data.mainMod.ddTypeCraft = data.mainMod.ddTypeCraft !== null ? Number(data.mainMod.ddTypeCraft) : null
            data.mainMod.mtaskMsta = data.mainMod.mtaskMsta !== null ? Number(data.mainMod.mtaskMsta) : null
            null2undefined(data.mainMod)
            this.form = this.extend(true, this.form, data.mainMod)
          } else {
            this.$message.error('载入数据出错')
          }
        } catch (e) {
          console.error(e)
          this.$message.error('载入数据出错')
        }
      },
      async loadDetail() {
        try {
          const api = 'scscm/app/sdpMtaskEnrollAjax!queryDetailByProcessno.do'
          const params = {
            mtaskDetailsProcessno: 0,
            mtaskBillcode: this.originForm.mtaskBillcode,
            billtypeCode: this.originForm.billtypeCode,
            feeOptcode: this.originForm.mtaskBillcode,
            feeBilltype: this.originForm.billtypeCode
          }
          const { data } = await this.proxy(this, api, 'post', params)
          if ('detailList' in data) {
            data.detailList.forEach(null2undefined)
            // this.$refs.panel1.detailTable.loadData(data.detailList)
            this.$refs.panel1.tableValue1.tableData = data.detailList
          } else {
            this.$message.error('载入数据出错')
          }
        } catch (e) {
          console.error(e)
          this.$message.error('载入数据出错')
        }
      },
      async loadCode() {
        try {
          const api = 'scscm/app/sdpMtaskEnrollAjax!queryDetailByProcessno.do'
          const params = {
            mtaskDetailsProcessno: 1,
            mtaskBillcode: this.originForm.mtaskBillcode,
            billtypeCode: this.originForm.billtypeCode,
            feeOptcode: this.originForm.mtaskBillcode,
            feeBilltype: this.originForm.billtypeCode
          }
          const { data } = await this.proxy(this, api, 'post', params)
          if ('detailList' in data) {
            const panel1 = this.$refs.panel1
            data.detailList.forEach(x => {
              null2undefined(x)
              panel1.addCodeTableByParent(x)
            })
          } else {
            this.$message.error('载入数据出错')
          }
        } catch (e) {
          console.error(e)
          this.$message.error('载入数据出错')
        }
      },
      async loadFee() {
        try {
          const api = 'scscm/app/sdpFeeAjax!queryDetailByOpt.do'
          const params = {
            mtaskBillcode: this.originForm.mtaskBillcode,
            billtypeCode: this.originForm.billtypeCode,
            feeOptcode: this.originForm.mtaskBillcode,
            feeBilltype: this.originForm.billtypeCode,
            sort: '[{"property":"feeDirection","direction":"ASC"}]'
          }
          const { data } = await this.proxy(this, api, 'post', params)
          if ('detailList' in data) {
            console.log(data.detailList)
          }
        } catch (e) {
          console.error(e)
          this.$message.error('载入数据出错')
        }
      },

      /** 该方法允许子组件调用 */
      setFieldReadonly(flag) {
        this.formFieldDisabled = flag
      }
    }
  }
</script>

<style scoped>

</style>
