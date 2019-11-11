<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  el-row
    el-col(:span="12")
      el-form-item(label="类别名称", prop="feeclassName")
        el-input.full-width(v-model="form.feeclassName", clearable, size="mini")
    el-col(:span="12")
      el-form-item(label="统计类型")
        el-input.full-width(v-model="form.feeclassStatclass", clearable, size="mini")
  el-row
    el-col(:span="12")
      el-form-item(label="税率")
        el-input.full-width(v-model="form.feeclassTaxrate", clearable, size="mini")
    el-col(:span="12")
      el-form-item(label="业务机构", prop="orgCode")
        el-select.full-width(v-model="form.orgCode", placeholder="请选择", size="mini")
          el-option(v-for="item in orgList", :key="item.orgCode", :label="item.orgAbbreviate", :value="item.orgCode")
  el-form-item(label="备注")
    el-input.full-width(v-model="form.feeclassRemark", clearable, size="mini")
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
      goodsMeteringList: [
        {code: 0, name: '重量'},
        {code: 1, name: '数量'},
        {code: 2, name: '次数'},
      ],
      orgList: [],
      rules: {
        feeclassName: [{ required: true, message: '请输入显示名称' }],
        orgCode: [{ required: true, message: '请输入名称' }]
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.getOrg()
    }) 
  },
  methods: {
    async getOrg () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/orgAjax!queryCombo.do', 'get', {ddtypeClass: 'goodsMetering'})        
        this.orgList = []
        if (data.orgComboList.length > 0) {
          this.orgList = data.orgComboList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async saveAsync () {
      try {
        let api = 'scscm/app/feeclassAjax!save.do'
        if (this.form.feeclassCode) {
          api = 'scscm/app/feeclassAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('feeclassMod', this.form))
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
