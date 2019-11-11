<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="120px")
  el-row
    el-col(:span="12")
      el-form-item(label="代码", prop="billtypeCode")
        el-input.full-width(v-model="form.billtypeCode", clearable, size="mini")
    el-col(:span="12")
      el-form-item(label="名称")
        el-input.full-width(v-model="form.billtypeName", clearable, size="mini")
  el-row
    el-col(:span="12")
      el-form-item(label="工作量登记方式", prop="billtypeWorktypeStr")
        el-select.full-width(v-model="form.billtypeWorktypeStr", placeholder="请选择", size="mini")
          el-option(v-for="item in billtypeWorktypeList", :key="item.ddValue", :label="item.ddShowname", :value="item.ddValue")
    el-col(:span="12")
      el-form-item(label="费用登记方式", prop="billtypeFeetypeStr")
        el-select.full-width(v-model="form.billtypeFeetypeStr", placeholder="请选择", size="mini")
          el-option(v-for="item in billtypeFeetypeList", :key="item.ddValue", :label="item.ddShowname", :value="item.ddValue")
  el-row
    el-col(:span="12")
      el-form-item(label="系数", prop="billtypeWorkcoe")
        el-input.full-width(v-model="form.billtypeWorkcoe", clearable, size="mini") 
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
        billtypeWorktypeStr: [{ required: true, message: '请选择工作量登记方式' }],
        billtypeFeetypeStr: [{ required: true, message: '请选择费用登记方式' }],
        billtypeWorkcoe: [{ required: true, message: '请输入系数' }]
      },
      billtypeWorktypeList: [],
      billtypeFeetypeList: []
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.getFeetype()
      this.getWorktype()
    }) 
  },
  methods: {
    async getFeetype () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'get', {ddtypeClass: 'billtypeFeetype'})        
        this.billtypeFeetypeList = []
        if (data.ddList.length > 0) {
          this.billtypeFeetypeList = data.ddList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getWorktype () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'get', {ddtypeClass: 'billtypeWorktype'})        
        this.billtypeWorktypeList = []
        if (data.ddList.length > 0) {
          this.billtypeWorktypeList = data.ddList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async saveAsync () {
      try {
        const api = 'scscm/app/workcoeAjax!update.do'
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('billtype', this.form))
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
