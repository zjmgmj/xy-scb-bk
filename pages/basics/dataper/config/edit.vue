<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    el-form-item(label="代码", prop="dataperCode")
      el-input.full-width(v-model="form.dataperCode", clearable, size="mini")
    el-form-item(label="名称", prop="dataperName")
      el-input.full-width(v-model="form.dataperName", clearable, size="mini")
    el-form-item(label="状态", prop="dataperShow")
      el-radio(v-model="form.dataperShow", :label="0") 显示
      el-radio(v-model="form.dataperShow", :label="1") 不显示
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
            dataperCode: '',
            dataperName: '',
            dataperShow: 0
          }
        }
      }
    },
    data() {
      return {
        rules: {
          dataperCode: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
          dataperName: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
          dataperShow: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
        }
      }
    },
    methods: {
      async asyncSave() {
        try {
          let api = 'scscm/app/configAjax!save.do'
          if (this.form.dataperId) {
            api = 'scscm/app/configAjax!update.do'
          }
          const { data } = await this.proxy(this, api, 'post', { config: this.form })
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
