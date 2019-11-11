<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    .row
      .col
        el-form-item(label="名称", prop="billtypePrintName")
          el-input.full-width(v-model="form.billtypePrintName", clearable, size="mini")
      .col
        el-form-item(label="默认", prop="billtypePrintDefault")
          el-radio(v-model="form.billtypePrintDefault", :label="0") 否
          el-radio(v-model="form.billtypePrintDefault", :label="1") 是
    el-form-item(label="格式路径", prop="billtypePrintJsppath")
      el-input.full-width(v-model="form.billtypePrintJsppath", clearable, size="mini")
    el-form-item(label="备注", prop="billtypePrintRemark")
      el-input.full-width(v-model="form.billtypePrintRemark", clearable, size="mini")
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
          return {
            isNew: true,

            billtypePrintName: '',
            billtypePrintDefault: 0,
            billtypePrintJsppath: '',
            billtypePrintRemark: ''
          }
        }
      },
      permissionCode: {
        type: String,
        default: ''
      },
      billtypeCode: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        rules: {
          billtypePrintName: [
            { required: true, message: '请输入名称', trigger: 'blur' }
          ],
          billtypePrintJsppath: [
            { required: true, message: '请输入格式路径', trigger: 'blur' }
          ],
        }
      }
    },
    methods: {
      async asyncSave() {
        try {
          let api = 'scscm/app/billtypePrintAjax!save.do'
          if (this.form.billtypePrintId) {
            api = 'scscm/app/billtypePrintAjax!update.do'
          }
          if (this.form.isNew){
            this.form.permissionCode = this.permissionCode
            this.form.billtypeCode = this.billtypeCode
          }
          const { data } = await this.proxy(this, api, 'post', { billtypePrint: this.form })
          if (data.map.state === '2') {
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
      cancel() {
        this.$refs.dialogForm.resetFields()
        this.$emit('cancel')
      }
    }
  }
</script>
