<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="60px")
  el-row
    el-col(:span="12")
      el-form-item(label="名称", prop="ddValue")
        el-input.full-width(v-model="form.ddValue", clearable, size="mini")
    el-col(:span="12")
      el-form-item(label="显示名称", prop="ddShowname", label-width="90px")
        el-input.full-width(v-model="form.ddShowname", clearable, size="mini")
  el-row
    el-col(:span="12")
      el-form-item(label="显示")
        el-radio-group(v-model="form.ddNotuse")
          el-radio(:label="0") 显示
          el-radio(:label="1") 不显示
    el-col(:span="12")
      el-form-item(label="共享")
        el-radio-group(v-model="form.basicShare")
          el-radio(:label="0") 否
          el-radio(:label="1") 是
  el-form-item(label="备注", prop="ddRemark")
    el-input.full-width(v-model="form.ddRemark", clearable, size="mini")       
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
        ddShowname: [{ required: true, message: '请输入显示名称' }],
        ddValue: [{ required: true, message: '请输入名称' }]
      }
    }
  },
  mounted () {},
  methods: {
    async goodscodeSave () {
      try {
        let api = 'scscm/app/ddAjax!save.do'
        if (this.form.ddId) {
          api = 'scscm/app/ddAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('dd', this.form))
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
