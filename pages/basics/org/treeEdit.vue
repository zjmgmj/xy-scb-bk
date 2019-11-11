<template lang="pug">
.content
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    el-form-item(label="组织名称", prop="orgName")        
      el-input.full-width(v-model="form.orgName", clearable, size="small", placeholder="请输入组织名称")
    el-form-item(label="备注")        
      el-input.full-width(v-model="form.orgRemark", clearable, size="small", placeholder="请输入备注")
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
        orgName: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  methods: {    
    async saveForm () {
      try {
        let api = 'scscm/app/orgAjax!saveTree.do'
        if (this.form.orgId) {
          api = 'scscm/app/orgAjax!updateTree.do'
        }
        const { data } = await this.proxy(this, api, 'post', {basicOrg: this.form})
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
          console.log('form', this.form)  
          this.saveForm()
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


