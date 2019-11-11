<template lang="pug">
.content
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="100px")
    el-form-item(label="总账凭证接口")        
      el-radio(v-model="form.financeLedgerType", :label="0") 用友U8
      el-radio(v-model="form.financeLedgerType", :label="1") 金蝶K3
      el-radio(v-model="form.financeLedgerType", :label="2") 新中大NG
      el-radio(v-model="form.financeLedgerType", :label="3") 高达GD
      el-radio(v-model="form.financeLedgerType", :label="4") 用友NC
      el-radio(v-model="form.financeLedgerType", :label="5") 金蝶EAS
    el-form-item(label="账套名称")        
      el-input.full-width(v-model="form.financeLedgerName", clearable, size="mini", placeholder="请输入备注")
    el-form-item(label="机构列表", prop="financeLedgerOrglist")
      org-select(v-model="form.financeLedgerOrglist", :multiple="true", @change="syncName($event,'orgAbbreviate','financeLedgerOrgName')")
    el-form-item(label="操作员列表", prop="financeLedgerPermitlist")
      operator-select(v-model="form.financeLedgerPermitlist", :multiple="true", @change="syncName($event,'operatorUser','financeLedgerPermitName')")
    el-form-item(label="URL")
      el-input.full-width(v-model="form.financeLedgerUrl", clearable, size="mini")
    el-form-item(label="备注")
      el-input.full-width(v-model="form.financeLedgerRemark", clearable, size="mini")
    el-form-item(label="是否主账套")
      el-radio(v-model="form.financeLedgerFlag", :label="0") 否
      el-radio(v-model="form.financeLedgerFlag", :label="1") 是
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
import operatorSelect from '@/components/select/operatorSelect'
import orgSelect from '@/components/select/orgSelect'
export default {
  components: {
    operatorSelect,
    orgSelect
  },
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
        orgName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        financeLedgerOrglist: [{ required: true, message: '请选择机构' }],
        financeLedgerPermitlist: [{ required: true, message: '请选择操作员' }],
      }
    }
  },
  methods: {
    syncName(e, fromKey, toKey) {
      const arr = []
      e.map((obj) => {        
        arr.push(obj.orgAbbreviate)
      })      
      this.form[toKey] = arr.toString()
    }, 
    async saveForm (params) {
      try {
        let api = 'scscm/app/financeLedgerAjax!saveTree.do'
        if (this.form.financeLedgerCode) {
          api = 'scscm/app/financeLedgerAjax!updateTree.do'
        }
        const { data } = await this.proxy(this, api, 'post', {ledger: params})
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
          const params = JSON.parse(JSON.stringify(this.form))
          params.financeLedgerOrglist = this.form.financeLedgerOrglist.toString()
          params.financeLedgerPermitlist = this.form.financeLedgerPermitlist.toString()
          this.saveForm(params)
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

