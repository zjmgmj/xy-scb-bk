<template lang="pug">
el-form(ref="dialogForm", :model="form", label-width="90px")
  .row
    .col
      el-form-item(label="类型代码")
        el-input.full-width(v-model="form.financeVoutypeCode", clearable, size="mini")
    .col
      el-form-item(label="类型名称")
        el-input.full-width(v-model="form.financeVoutypeName", clearable, size="mini")    
  el-form-item(label="备注")
    el-input.full-width(v-model="form.financeVoutypeRemark", clearable, size="mini")
  el-form-item.text-right
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
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
      dialogShow: true      
    }
  },
  methods: {
    async saveAsync () {
      try {
        let api = 'scscm/app/voucherTypeAjax!save.do'
        if (this.form.financeVoutypeId) {
          api = 'scscm/app/voucherTypeAjax!update.do'
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
