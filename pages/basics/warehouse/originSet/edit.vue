<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  .row
    .col
      el-form-item(label="产地", prop="productareaName")
        el-input.full-width(v-model="form.productareaName", clearable, size="mini")
    .col
      el-form-item(label="助记码")
        el-input.full-width(v-model="form.productareaMnemcode", clearable, size="mini")
  el-form-item(label="备注")
    el-input.full-width(v-model="form.productareaRemark", clearable, size="mini")
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
        productareaName: [{ required: true, message: '请输入产地名称' }]
      }
    }
  },
  mounted () {},
  methods: {
    async warehouseSave () {
      try {
        let api = 'scscm/app/productareaAjax!save.do'
        if (this.form.productareaCode) {
          api = 'scscm/app/productareaAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('productarea', this.form))
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
          this.warehouseSave()
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
