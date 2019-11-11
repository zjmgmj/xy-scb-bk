<template lang="pug">
el-form(ref="dialogForm", :model="form", label-width="85px")
  el-form-item(label="科目代码")        
    el-input.full-width(v-model="form.financeSubjectCode", clearable, size="mini")      
  el-row
    el-col(:span="12")
      el-form-item(label="科目类型")
        el-select.full-width(v-model="form.financeSubjectType", size="mini")
          el-option(v-for="item in financeSubjectTypelist", :key="item.code", :label="item.name", :value="item.code")
    el-col(:span="12")
      el-form-item(label="科目名称")
        el-input.full-width(v-model="form.financeSubjectName", clearable, size="mini", @change="subjectNameChange")        
  el-row
    el-col(:span="12")
      el-form-item(label="助记码")
        el-input.full-width(v-model="form.financeSubjectMnemcode", clearable, size="mini")      
    el-col(:span="12")
      el-form-item(label="外币核算")
        el-select.full-width(v-model="form.currencyCode", size="mini")
          el-option(v-for="item in currencyCodelist", :key="item.code", :label="item.name", :value="item.code")    
  el-row
    el-col(:span="12")
      el-form-item(label="余额方向")
        el-radio(v-model="form.financeSubjectDirection", :label="0") 借
        el-radio(v-model="form.financeSubjectDirection", :label="1") 贷
    el-col(:span="12")
      el-form-item(label="科目状态")
        el-radio(v-model="form.financeSubjectState", :label="0") 启用
        el-radio(v-model="form.financeSubjectState", :label="1") 停用
  el-row
    el-col(:span="12")
      el-form-item(label-width="20px")
        el-checkbox(v-model="form.financeSubjectNumber", :true-label="1", :false-label="0") 数量金额辅助核算
    el-col(:span="12")
      el-form-item(label="计量方式")
        basic-select(:disabled="form.financeSubjectNumber === 1 ? false : true", v-model="form.financeSubjectUnit", :ddtypeClass="'partsnameNumunit'", @change="syncName($event, 'ddName', 'financeSubjectUnit')")        
  el-row
    el-col(:span="8")
      el-form-item(label-width="20px")
        el-checkbox(v-model="form.financeSubjectCash", :true-label="1", :false-label="0") 现金科目
    el-col(:span="8")
      el-form-item(label-width="20px")
        el-checkbox(v-model="form.financeSubjectBank", :true-label="1", :false-label="0") 银行科目
    el-col(:span="8")
      el-form-item(label-width="20px")
        el-checkbox(v-model="form.financeSubjectCashpro", :true-label="1", :false-label="0") 现金流量科目
  .padding-sm.ft-16.border-top-line.mt-15 辅助核算设置
  el-row
    el-col(:span="8")
      el-form-item(label-width="20px")
        el-checkbox(v-model="form.financeSubjectItemSeq1", :true-label="1", :false-label="0") 往来单位
    el-col(:span="8")
      el-form-item(label-width="20px")
        el-checkbox(v-model="form.financeSubjectItemSeq2", :true-label="1", :false-label="0") 部门
    el-col(:span="8")
      el-form-item(label-width="20px")
        el-checkbox(v-model="form.financeSubjectItemSeq3", :true-label="1", :false-label="0") 业务员
  el-form-item(label="核算项目")
    accounting-project(v-model="form.financeSubjectItemSeqOthersName", :multiple="true")
  el-form-item.text-right.mt-15
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
import basicSelect from '@/components/select/basicSelect'
import accountingProject from '@/components/select/accountingProject'
export default {
  components: {
    basicSelect,
    accountingProject
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
      dialogShow: true,
      tempRoleCodelist: [],
      financeSubjectTypelist: [
        {code: '1000', name: '资产', diretion: '0'},
        {code: '2000', name: '负债', diretion: '1'},
        {code: '3000', name: '共同', diretion: '0'},
        {code: '4000', name: '权益', diretion: '1'},
        {code: '5000', name: '成本', diretion: '0'},
        {code: '6000', name: '损益', diretion: '0'},
        {code: '7000', name: '表外', diretion: '0'}
      ],
      currencyCodelist: [
        {code: '0', name: '美元'},
        {code: '1', name: '欧元'},
        {code: '2', name: '日元'},
      ]
    }
  },
  methods: {
    subjectNameChange () {
       this.form.financeSubjectMnemcode = this.publicMakePy(this.form.financeSubjectName)
    },
    syncName(e, fromKey, toKey) {
      this.form[toKey] = e[fromKey]
    },
    async saveAsync () {
      try {        
        let api = 'scscm/app/subjectSetAjax!save.do'
        if (this.form.financeSubjectId) {
          api = 'scscm/app/subjectSetAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {mod: this.form})
        if (data.map.state === "2") {
          this.$message.error(data.map.msg)
          return 
        }
        this.$message.success('保存成功')
        this.$refs.dialogForm.resetFields()
        this.$emit('save')
      } catch (e) {
        console.error(e)
      }
    },
    save () {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {          
          this.saveAsync()
          // this.$emit('save', this.form)
        } else {
          console.log('error submit!!')
          return false
        }
      })       
    },
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>
