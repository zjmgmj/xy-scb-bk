<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  .row
    .col
      el-form-item(label="代码", prop="currencyCode")
        el-input.full-width(v-model="form.currencyCode", clearable, size="mini")
    .col
      el-form-item(label="币别", prop="currencyName")
        el-input.full-width(v-model="form.currencyName", clearable, size="mini")       
  .row
    .col
      el-form-item(label="记账汇率", prop="currencyExrate")
        el-input.full-width(v-model="form.currencyExrate", clearable, size="mini")
    .col
      el-form-item(label="金额小数", prop="currencyDecimals")
        el-input.full-width(v-model="form.currencyDecimals", clearable, size="mini")
  el-form-item(label="折算方式", prop="currencyConvert") 
    el-radio(v-model="form.currencyConvert" :label="0") 原币×汇率=本位币
    el-radio(v-model="form.currencyConvert" :label="1") 原币÷汇率=本位币
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
      rules: {
        currencyCode: [{ required: true, message: '必填项', trigger: 'blur' }],
        currencyName: [{ required: true, message: '必填项', trigger: 'blur' }]        
      }
    }
  },
  methods: {
    async currencySave () {
      try {
        let api = 'scscm/app/currencyAjax!save.do'
        if (this.form.currencyId) {
          api = 'scscm/app/currencyAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {currency: this.form})
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
          this.currencySave()
        } else {
          console.log('error submit!!')
          return false
        }
      })       
    },
    cancel () {
      this.$refs.dialogForm.resetFields()
      this.$emit('cancel')
    }
  }
}
</script>
