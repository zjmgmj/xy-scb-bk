<template lang="pug">
  el-dialog(ref="dialog", title="单据审核设置", :visible="true",  width="380px", @close="close")
    el-form(ref="dialogForm", :model="form", :rules="rules", label-width="80px")
      el-form-item(label="审核控制", prop="orgName")
        el-radio(v-model="form.billtypeCheck", :label="0") 停用
        el-radio(v-model="form.billtypeCheck", :label="1") 启用
      el-form-item(label="审核模式")
        el-radio(v-model="form.billtypeCheckmode", :label="0") 逐级审核
        el-radio(v-model="form.billtypeCheckmode", :label="1") 并级审核
    .dialog-footer(slot="footer")
      el-button(@click="close", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
export default {
  props: {
    billtypeCode: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      form: {
        billtypeCheck: 0,
        billtypeCheckmode: 0,
        billtypeCode: ''
      },
      rules: {}
    }
  },
  mounted() {
    this.proxy(this, 'scscm/app/wfDefineAjax!queryBillType.do', 'get', { billtypeCode: this.billtypeCode }).then(x => {
      this.form.billtypeCheck = x.data.billtype.billtypeCheck
      this.form.billtypeCheckmode = x.data.billtype.billtypeCheckmode
      this.form.billtypeCode = x.data.billtype.billtypeCode
    })
  },
  methods: {
    async asyncSave() {
      try {
        const api = 'scscm/app/wfDefineAjax!updateBillAudit.do'
        const { data } = await this.proxy(this, api, 'post', this.form)
        if (data.map.state === '2') {
          this.$message.error(data.map.msg)
          return
        }
        this.$message.success('保存成功')
        this.$refs.dialogForm.resetFields()
        this.$emit('close')
      } catch (e) {
        console.error(e)
      }
    },
    save() {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          this.asyncSave()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>

