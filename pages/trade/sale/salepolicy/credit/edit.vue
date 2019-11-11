<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
  el-row
    el-col(:span="12")
      el-form-item(label="启用日期", prop="creditSdate")
        el-date-picker.full-width(v-model="form.creditSdate", type="datetime", format="yyyy-MM-dd", value-format="yyyy-MM-dd", clearable, size="mini")
    el-col(:span="12")
      el-form-item(label="失效日期", prop="creditEdate")
        el-date-picker.full-width(v-model="form.creditEdate", type="datetime", format="yyyy-MM-dd", value-format="yyyy-MM-dd", clearable, size="mini")
    el-col(:span="form.creditGrade !== '0' ? 12 : 24")
      el-form-item(label="结算单位", prop="datasBalcorp")
        company-select(v-model="form.datasBalcorp", :typeStr="'KH'", @change="syncName($event, {datasBalcorpname: 'companyName', datasBalcorp:'companyCode', areaCode:'areaCode'})")
    el-col(:span="12", v-if="form.creditGrade !== '0'")
      el-form-item(label="业务机构", prop="orgCode")
        org-select(v-model="form.orgCode", @change="syncName($event, {orgName: 'orgName', orgAbbreviate: 'orgAbbreviate'})")
    el-col(:span="12")
      el-form-item(label="金额", prop="creditMoney")
        el-input-number.text-left.full-width(:controls="false", :precision="g_decimalP.money_decimalP", v-model="form.creditMoney", clearable, size="mini")
    el-col(:span="12")
      el-form-item(label="启用", prop="creditState")
        el-radio-group(v-model="form.creditState")
          el-radio(:label="0") 是
          el-radio(:label="1") 否        
  el-form-item(label="备注")
    el-input.full-width(v-model="form.creditRemark", clearable, size="mini")
  el-form-item.text-right
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
import { mapState } from 'vuex'
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
      rules: {
        creditSdate: [{ required: true }],
        creditEdate: [{ required: true }],
        datasBalcorp: [{ required: true }],
        orgCode: [{ required: true }],
        creditMoney: [{ required: true }]
      }
    }
  },
   computed: {
    ...mapState({
      g_decimalP: state => state.g_decimalP
    })
  },
  methods: {    
    syncName(e, obj) {     
      Object.keys(obj).forEach((key) => {
        this.form[key] = e[obj[key]]
      })
    },
    async saveAsync () {
      try {
        let api = 'scscm/app/saleCreditAjax!save.do'
        if (this.form.creditId) {
          api = 'scscm/app/saleCreditAjax!update.do'
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