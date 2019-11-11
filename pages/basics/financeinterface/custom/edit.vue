<template lang="pug">
el-form(ref="dialogForm", :model="form", label-width="85px")  
  el-row
    el-col(:span="8")
      el-form-item(label="项目类型")
        el-select.full-width(v-model="form.financeItemType", size="mini")
          el-option(v-for="item in financeItemTypelist", :key="item.value", :label="item.lbl", :value="item.value")
    el-col(:span="8")  
      el-form-item(label="项目名称")
        el-input.full-width(v-model="form.financeItemName", clearable, size="mini")
    el-col(:span="8")
      el-form-item(label="是否启用")
        el-radio(v-model="form.financeItemIsuser", :label="0") 启用
        el-radio(v-model="form.financeItemIsuser", :label="1") 不启用  
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
        return {}
      }
    }
  },
  data () {
    return {
      dialogShow: true,
      financeItemTypelist: [
        {value: '字符', lbl: '字符'},
        {value: '数字', lbl: '数字'},
        {value: '日期', lbl: '日期'}
      ]
    }
  },
  methods: {
    async saveAsync () {
      try {
        let api = 'scscm/app/accountingProjectAjax!save.do'
        if (this.form.financeItemCode) {
          api = 'scscm/app/accountingProjectAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {mod: this.form})
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
          this.saveAsync()
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
