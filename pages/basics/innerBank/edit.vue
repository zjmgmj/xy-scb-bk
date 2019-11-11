<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")  
  el-form-item(label="开会银行", prop="innerbankName")
    el-input.full-width(v-model="form.innerbankName", clearable, size="mini")
  el-form-item(label="银行地址", prop="innerbankAddr")
    el-input.full-width(v-model="form.innerbankAddr", clearable, size="mini")
  .row
    .col
      el-form-item(label="银行电话", prop="innerbankPhone")
        el-input.full-width(v-model="form.innerbankPhone", clearable, size="mini")        
    .col
      el-form-item(label="联系人", prop="innerbankLinkman")        
        el-input.full-width(v-model="form.innerbankLinkman", clearable, size="mini")        
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
        innerbankName: [{ required: true, message: '请输入开户银行' }]        
      }
    }
  },
  mounted () {},
  methods: {
    async goodscodeSave () {
      try {
        let api = 'scscm/app/innerbankAjax!save.do'
        if (this.form.innerbankCode) {
          api = 'scscm/app/innerbankAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('innerbank', this.form))
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
          this.goodscodeSave()
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
