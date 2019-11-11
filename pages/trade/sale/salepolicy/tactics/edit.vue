<template lang="pug">
el-form(ref="dialogForm", :model="form", label-width="90px") 
  el-form-item(label="分类", prop="settingsType")
    el-input.full-width(v-model="form.settingsType", clearable, size="mini", readonly)
  el-form-item(label="启用", prop="settingsValue1", v-if="settingsValue1Show")
    el-radio-group(v-model="form.settingsValue1")
      el-radio(label="0") 启用
      el-radio(label="1") 不启用

  el-form-item(label="是否控制", prop="settingsValue_1", v-if="settingsValue_1Show")
    el-radio-group(v-model="form.settingsValue_1")
      el-radio(label="0") 控制
      el-radio(label="1") 不控制

  el-form-item(label="控制时机", prop="settingsValue2", v-if="settingsValue2Show")
    el-radio-group(v-model="form.settingsValue2")
      el-radio(label="0") 新单
      el-radio(label="1") 审核

  el-form-item(label="控制强度", prop="settingsValue3", v-if="settingsValue3Show")
    el-radio-group(v-model="form.settingsValue3")
      el-radio(label="0") 提示
      el-radio(label="1") 输入特权密码
      el-radio(label="2") 取消交易

  el-form-item(label="控制方式", prop="settingsValue4", v-if="settingsValue4Show")
    el-radio-group(v-model="form.settingsValue4")
      el-radio(label="0") 控制
      el-radio(label="1") 不控制

  el-form-item(label="机构级别", prop="settingsValue4_1", v-if="settingsValue4_1Show")
    el-radio-group(v-model="form.settingsValue4_1")
      el-radio(label="0") 不启用
      el-radio(label="1") 机构各自定价
      el-radio(label="2") 机构统一定价

  el-form-item(label="控制级别", v-if="groupSettingsValue4_1Show")
    el-checkbox(v-model="form.settingsValue4_21", true-label="orgCode") 机构
    el-checkbox(v-model="form.settingsValue4_22", true-label="deptCode") 部门
    el-checkbox(v-model="form.settingsValue4_23", true-label="partsnameName") 品名
    el-checkbox(v-model="form.settingsValue4_24", true-label="warehouseCode") 仓库

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
    },
    flag: {
      type: String,
      default: ''
    }
  },  
  data () {
    return {      
      settingsValue1Show: false, // 启用
      settingsValue_1Show: false, // 是否控制
      settingsValue2Show: false, // 控制时机
      settingsValue3Show: false, // 控制强度
      settingsValue4Show: false, // 控制方式
      settingsValue4_1Show: false, // 机构级别
      groupSettingsValue4_1Show: false // 控制级别  
    }
  },
  created () {
    switch (this.form.settingsType) {
      case '集团内部信誉度控制':
      case '客户信誉度控制':
        this.settingsValue1Show = true
        this.settingsValue2Show = true
        this.settingsValue3Show = true
        this.settingsValue4Show = true
        if (this.flag !== 'edit') {
          this.form.settingsValue1 = '0'
          this.form.settingsValue2 = '0'
          this.form.settingsValue3 = '0'
          this.form.settingsValue4 = '0' 
        }
        break
      case '销售量控制':
        this.settingsValue1Show = true
        this.settingsValue2Show = true
        this.settingsValue3Show = true
        this.groupSettingsValue4_1Show = true    
        if (this.flag !== 'edit') {
          this.form.settingsValue1 = '0'
          this.form.settingsValue2 = '0'
          this.form.settingsValue3 = '0'
          this.form.settingsValue4_21 = 'orgCode' 
        }
        break  
      case '定价销售控制':
        this.settingsValue1Show = true
        this.settingsValue2Show = true
        this.settingsValue3Show = true
        this.settingsValue4_1 = true
        if (this.flag !== 'edit') {
          this.form.settingsValue1 = '0'
          this.form.settingsValue2 = '0'
          this.form.settingsValue3 = '0'
          this.form.settingsValue4_1 = '0' 
        }
        break
      case '未定价销售控制':
        this.settingsValue1Show = true
        this.settingsValue3Show = true
        if (this.flag !== 'edit') {
          this.form.settingsValue1 = '0'
          this.form.settingsValue3 = '0'
        }
        break
      case '销售合同是否进行销售价控制':
        this.settingsValue_1Show = true        
        if (this.flag !== 'edit') {
          this.form.settingsValue_1 = '0'
        }
        break
    }
  },
  methods: {
    async saveAsync () {
      try {
        let api = 'scscm/app/saleTacticsAjax!save.do'
        if (this.form.settingsCode) {
          api = 'scscm/app/saleTacticsAjax!update.do'
        }
        delete this.form._XID
        delete this.form.settingsName
        delete this.form.settingsRemark
        delete this.form.settingsId
        delete this.form.memberCode
        delete this.form.settingsValue
        delete this.form.settingsCode
        const { data } = await this.proxy(this, api, 'post', {beanMod: this.form})
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
      this.$emit('cancel')
    }
  }
}
</script>
<style lang="stylus", scoped>
/deep/.el-input-number .el-input__inner{
  text-align left
}
</style>