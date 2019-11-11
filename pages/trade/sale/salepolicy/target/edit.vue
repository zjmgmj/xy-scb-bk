<template lang="pug">
  el-dialog(title="指标管理", :visible="true", top="10px", width="1600px", @close="close")
    button-group(:btns="topButtonGroupInfo", @groupBtnClick="topButtonGroupClick")
    el-form.mt-10(ref="form", :model="copyForm", :rules="rules", label-width="100px")
      el-row
        el-col(:span="6")
          el-form-item(label="单据号", prop="targetBillcode")
            el-input.full-width(v-model="copyForm.targetBillcode", clearable, size="mini", readonly)
        el-col(:span="6")
          el-form-item(label="制单日期", prop="targetDate")
            el-date-picker.full-width(v-model="copyForm.targetDate", type="datetime", format="yyyy-MM-dd HH:mm", value-format="yyyy-MM-dd HH:mm", clearable, size="mini")
        el-col(:span="6")
          el-form-item(label="指标类型", prop="targetType")
            basic-select(v-model="copyForm.targetType",  ddtypeClass="targetType", :useName="true")
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
          el-form-item(label="制单人", prop="operatorName")
            el-input.full-width(v-model="copyForm.operatorName", clearable, size="mini", disabled)        
        el-col(:span="6")
          el-form-item(label="备注", prop="entryinfRemark")
            el-input.full-width(v-model="copyForm.entryinfRemark", clearable, size="mini")    
    .mt-10.edit
      button-group(:btns="buttonGroupInfo", @groupBtnClick="buttonGroupClick")
      edit-table(ref="editTable", :loading="loading", :tableValue="tableValue", @rowSelection="handleSelectionChange")
</template>
<script>
import { mapState } from 'vuex'
import buttonGroup from '@/components/buttonGroup.vue'
import editTable from '@/components/editTable'

export default {
  components: {
    buttonGroup,
    editTable  
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
      activeTab: '1',
      auditGlideShow: false,
      fileWinShow: false,
      goodsWinShow: false,
      currentPage: 1,
      pageSize: 10,
      totalCount: 1,
      loading: false,
      topButtonGroupInfo: [{lbl: '保存', type: 'save', icon: 'el-icon-folder-checked'}],
      buttonGroupInfo: [
        {lbl: '新增', type: 'add', icon: 'el-icon-plus'},
        {lbl: '删除', type: 'del', icon: 'el-icon-delete'}
      ],
      tableValue: {        
        hasCbx: false,
        pageShow: false,
        showRowIndex: true,
        showSummary: true,
        validRules: {
          targetMoney: [{ required: true, message: '必填项' }]
        },
        // adjustColumn: { goodsNum: 'planDetailAnum', goodsWeight: 'planDetailAweight', goodsAssistweight: 'planDetailAassistweight' },
				// priceMoneyComputerColumn: {goodsInprice:'goodsBinprice'},
        tableHead: [          
          {lbl: '业务机构', prop: 'targetOrgName', width: '100px', type: 'org', useName: true, props: {targetOrgName: 'orgAbbreviate', targetOrg: 'orgCode'}},
          {lbl: '业务部门', prop: 'targetDeptName', width: '100px', type: 'dept', useName: true, props: {targetDeptName: 'deptName', targetDept: 'deptCode'}},
          {lbl: '年月', prop: 'targetMonth', width: '120px', type: 'date', formatter: ({cellValue}) => {
            return this.toDateString(cellValue, 'yyyy-MM')
          }},
          {lbl: '指标量', prop: 'targetNum', width: '120px', g_type:'weight', minValue: 0, summary: true},
          {lbl: '指标金额', prop: 'targetMoney', g_type:'price', width: '120px', minValue: 0, summary: true}
        ],
        hiddenProp: {
          // 新增tableValue.tableData时使用
          targetId: '',
          targetBillcode: '',
          targetBillbatch: '',
          memberCode: '',
          targetNum: '',
          targetMoney: '',
          targetDetailRemark: '',
          targetProperty1: '',
          targetProperty2: '',
          targetProperty3: '',
          targetProperty4: '',
          targetProperty5: '',
          dataFlag: ''
        },
        tableData: []
      },
      rowSelection: [],      
      delRow: [],
      rules: {
        targetDate: [{ required: true }],
        orgCode: [{ required: true }],
        deptCode: [{ required: true }],
        targetType: [{ required: true }],
        employeeCode: [{ required: true }]
      },
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
  beforeMount () {
    this.copyForm = this.extend(true, this.form)
  },
  mounted () {
    this.$nextTick(() => {
      if (this.form.targetBillcode) {
        this.fileMod = {
          fileBilltype: this.copyForm.billtypeCode,
          fileOpcode: this.copyForm.targetBillcode
        }        
        debugger
        this.getMainMod()
        const params = Object.assign({page:1, start:0,limit:25}, this.form)
        this.getDetail(params)
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
    topButtonGroupClick (type) {
      switch (type) {
        case 'save':
          if (this.table.getTableData().fullData.length === 0) {
            this.$message.error('请增加明细！')
            return false
          }
          this.save()         
          break
        default:
          break
      }
    },
    save () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const removeRecords = []
          if (this.table.getRemoveRecords().length> 0) {            
            this.table.getRemoveRecords().map((item) => {
              item.dataFlag = 2
              removeRecords.push(item)
            })
          }          
          const updateRecords = this.table.getUpdateRecords()
          const insertRecords = this.table.getInsertRecords()
          this.table.getTableData().fullData.map(item => {
            delete item._XID            
            // const obj = Object.assign({}, this.extend(true, this.tableValue.hiddenProp), item)
            // debugger
            item.targetMonth = this.toDateString(new Date(item.targetMonth), 'yyyy-MM-dd HH:mm:ss')
            delete item.targetMonthStr
          })
          const detailList = [...insertRecords, ...updateRecords, ...removeRecords]
          debugger
          const params = {
            mainMod: this.copyForm,
            detailList: detailList
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
          if (!this.copyForm.targetType) {
            this.$message.error('请选择指标类型')
            return false
          }
          const row = {
            targetOrgName: this.form.orgAbbreviate,
            targetDeptName: this.form.deptName,
            targetMonth: new Date(),
            targetOrg: this.form.orgCode,
            targetDept: this.form.deptCode
          }
          const rowObj = Object.assign({}, this.extend(true, this.tableValue.hiddenProp), row)
          this.table.insertAt(rowObj, -1)
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
        const { data } = await this.proxy(this, 'scscm/app/saleTargetAjax!edit.do', 'post', this.copyForm)        
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
    async getDetail (params) {
      try {
        this.loading = true
        const { data } = await this.proxy(this, 'scscm/app/saleTargetAjax!queryDetail.do', 'post', params)
        console.log(data)
        this.tableValue.tableData = []
        debugger
        if (data.detailList) {
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
        let api = 'scscm/app/saleTargetAjax!save.do'
        if (this.copyForm.targetId) {
          api = 'scscm/app/saleTargetAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {saleTargetStr: JSON.stringify(params)})
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
