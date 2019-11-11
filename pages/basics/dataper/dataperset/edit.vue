<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="60px")
    .row
      .col
        el-form-item(label="代码", prop="dataperCode")
          el-input.full-width(v-model="form.dataperCode", clearable, size="mini")
    .row
      .col
        el-form-item(label="机构", prop="dataperName")
          el-input.full-width(v-model="form.dataperName", clearable, size="mini")
    .row
      .col
        el-form-item(label="状态", prop="dataperIsuser")
          el-radio(v-model="form.dataperIsuser", :label="0") 不启用
          el-radio(v-model="form.dataperIsuser", :label="1") 启用
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
            dataperCode: '',
            dataperName: '',
            dataperIsuser: 0
          }
        }
      }
    },
    data() {
      return {
        rules: {}
      }
    },
    methods: {
      async asyncSave() {
        try {
          let api = 'scscm/app/dataperSetAjax!save.do'
          if (this.form.dataperCode) {
            api = 'scscm/app/dataperSetAjax!update.do'
          }
          const { data } = await this.proxy(this, api, 'post', { dataper: this.form })
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
