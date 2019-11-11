<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
  .row
    .col
      el-form-item(label="单据类型", props="billtypeCode")
        billtype-select(v-model="form.billtypeCode")        
    el-form-item(label-width="20px")
      el-checkbox(v-model="form.financeBilltypeIsuser", :true-label="1", :false-label="0") 启用
  el-form-item(label="备注")
    el-input.full-width(v-model="form.financeBilltypeRemark", clearable, size="mini")
  el-form-item.text-right
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
import billtypeSelect from '@/components/select/billtypeSelect'
export default {
  components: {
    billtypeSelect
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
      rules: {
        billtypeCode: [{ required: true, message: '请选择单据类型' }]
      }
    }
  },
  methods: {
    async saveAsync () {
      try {
        let api = 'scscm/app/financeLedgerAjax!save.do'
        if (this.form.financeBilltypeId) {
          api = 'scscm/app/financeLedgerAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('ledgerBilltype', this.form))        
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
