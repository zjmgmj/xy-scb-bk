<template lang="pug">
  el-form(ref="dialogForm", :model="form", label-width="85px")
    .row
      .col
        el-form-item(label="名称", prop="applicationName")
          el-input.full-width(v-model="form.applicationName", clearable, size="mini")
    .row
      .col
        el-form-item(label="是否启用", prop="applicationState")
          el-radio(v-model="form.applicationState", :label="0") 启用
          el-radio(v-model="form.applicationState", :label="1") 停用
      .col
        el-form-item(label="顺序", prop="applicationOrder")
          el-input.full-width(v-model="form.applicationOrder", clearable, size="mini")
    el-form-item.text-right.mt-15
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
            applicationName: '',
            applicationState: '',
            applicationOrder: ''
          }
        }
      }
    },
    data() {
      return {
        rules: {
          applicationName: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
        }
      }
    },
    methods: {
      async asyncSave() {
        try {
          const api = 'scscm/app/applicationAjax!update.do'
          const { data } = await this.proxy(this, api, 'post', { mod: this.form })
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
