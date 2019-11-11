<template lang="pug">
.content
  el-form(ref="dialogForm", :model="form", label-width="90px")
    el-form-item(label="将往来单位")
      .row
        .mr-10(style='width: 200px')   
          el-input(v-model="form.companyCode", clearable, size="mini")
        .col
          el-input.full-width(v-model="form.companyName", clearable, size="mini")
    el-form-item(label="合并到")
      .row
        .mr-10(style='width: 200px')
          el-input(v-model="form.newCompanyCode", clearable, size="mini")
        .col
          el-input.full-width(v-model="form.newCompanyName", clearable, size="mini")
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
export default {
  data () {
    return {
      form: {
        companyCode: '',
        companyName: '',
        newCompanyCode: '',
        newCompanyName: ''
      }
    }
  },
  methods: {
    save () {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {          
          this.$emit('save', this.form)
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
<style lang="stylus" scoped>
.row
  align-items: baseline;
</style>
