<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="60px")
    .row
      .col
        el-form-item(label="名称", prop="settingsName")
          el-input.full-width(v-model="form.settingsName", clearable, readonly, size="mini")
      .col
        el-form-item(label="值", prop="settingsValue")
          el-select.full-width(v-model="form.settingsValue", placeholder="请选择", size="mini")
            el-option(v-for="item in options", :key="item.value", :label="item.text", :value="item.value")
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  export default {
    props: {
      form: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        rules: {
          settingsValue: [
            { required: true, message: '请选择', trigger: 'blur' }
          ]
        },
        options: []
      }
    },
    mounted() {
      this.$nextTick(() => {
        const params = {
          settingsCode: this.form.settingsCode,
          memberCode: this.form.memberCode
        }
        this.proxy(this, 'scscm/app/settingsAjax!queryCombo.do', 'get', params).then(x => this.options = x.data.comboList)
      })
    },
    methods: {
      async asyncSave() {
        try {
          const api = 'scscm/app/settingsAjax!updateValue.do'
          const { data } = await this.proxy(this, api, 'post', { settings: this.form })
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
