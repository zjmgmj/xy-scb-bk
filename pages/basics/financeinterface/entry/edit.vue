<template lang="pug">
el-form(ref="dialogForm", :model="form", label-width="70px")
  el-row
    el-col(:span="18")
      el-form-item(label="凭证科目")
        el-input.full-width(v-model="form.financeSubjectCode", clearable, size="mini")
    el-col(:span="6")
      el-form-item(label="排序", label-width="60px")
        el-input.full-width(v-model="form.financeEntrySort", clearable, size="mini")    
  el-row
    el-col(:span="12")
      el-form-item(label="借/贷")
        el-radio(v-model="form.financeEntryDirection", :label="0") 借方
        el-radio(v-model="form.financeEntryDirection", :label="1") 贷方
    el-col(:span="12")
      el-form-item(label-width="0px")
        el-checkbox(v-model="form.financeEntryConvert", :true-label="1", :false-label="0") 负转借贷
        el-checkbox(v-model="form.financeEntrySum", :true-label="1", :false-label="0") 求和汇总
  el-form-item(label="备注")
    el-input.full-width(v-model="form.financeEntryRemark", clearable, size="mini")
  el-form-item.text-right
    el-button(@click="cancel", size="mini") 取消
    el-button(@click="save", type="primary", size="mini") 确定
</template>
<script>
export default {
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
      rules: {
        billtypeCode: [{ required: true, message: '请选择单据类型' }]
      }
    }
  },
  methods: {
    async saveAsync () {
      try {
        let api = 'scscm/app/financeEntryAjax!save.do'
        if (this.form.financeEntryId) {
          api = 'scscm/app/financeEntryAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {financeEntry: this.form})
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
