<template lang="pug">
el-form(ref="dialogForm", :model="copyForm", :rules="rules" label-width="90px")
  el-form-item(label="机构名称", prop="orgName")
    el-input.full-width(v-model="copyForm.orgName", clearable, size="mini")
  el-row      
    el-col(:span="12")
      el-form-item(label="机构简称", prop="orgAbbreviate")
        el-input.full-width(v-model="copyForm.orgAbbreviate", clearable, size="mini")
    el-col(:span="12")
      el-form-item(label="上级组织", prop="orgParentName")
        el-select.full-width(v-model="copyForm.orgParentName" placeholder="请选择", ref="orgParentSelect", size="mini") 
          el-option.bg-white(:value="treeValue", style="height: auto")
            el-tree(:data="treeData", node-key="id", ref="tree", highlight-current, :props="treeProps", @node-click="treeNodeClick")
  el-row
    el-col(:span="12")
      el-form-item(label="电话")
        el-input.full-width(v-model="copyForm.orgPhone", clearable, size="mini")
    el-col(:span="12")
      el-form-item(label="传真")
        el-input.full-width(v-model="copyForm.orgFax", clearable, size="mini")
  el-row  
    el-col(:span="12")
      el-form-item(label="法人代表")
        el-input.full-width(v-model="copyForm.orgCorporation", clearable, size="mini") 
    el-col(:span="12")
      el-form-item(label="税号")
        el-input.full-width(v-model="copyForm.orgTanu", clearable, size="mini")
  el-row
    el-col(:span="12")
      el-form-item(label="账号")
        el-input.full-width(v-model="copyForm.orgAccounts", clearable, size="mini")     
    el-col(:span="12")
      el-form-item(label="开户银行")
        el-input.full-width(v-model="copyForm.orgBankname", clearable, size="mini") 
  el-row
    el-col(:span="12")
      el-form-item(label="地址")
        el-input.full-width(v-model="copyForm.orgAddr", clearable, size="mini") 
    el-col(:span="12")
      el-form-item(label="备注")
        el-input.full-width(v-model="copyForm.orgRemark", clearable, size="mini")  
  el-form-item.text-right
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
import leftTree from '@/components/leftTree'
export default {
  components: {
    leftTree
  },
  props: {
    form: {
      type: Object,
      default: () => {
        return {}
      }
    },
    treeData: {
      type: Array,
      default: () => {
        return []
      }
    },
    treeProps: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      treeValue: '',
      warehouseTypeList: [],
      queryObject: {},
      rules: {
        orgName: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
        orgAbbreviate: [{ required: true, message: '请输入机构简称', trigger: 'blur' }],
        orgParentName: [{ required: true, message: '请选择上级组织', trigger: 'blur' }]
      },
      copyForm: {}
    }
  },
  mounted () {
    this.copyForm = Object.assign({}, this.form)
  },
  methods: {
    treeNodeClick (obj) {
      console.log('obj---', obj)
      this.copyForm.orgParent = obj.id
      this.copyForm.orgParentName = obj.text
      console.log('form', this.copyForm)
      this.$refs.orgParentSelect.blur()
    },
    async saveAsync () {
      try {
        let api = 'scscm/app/orgAjax!save.do'
        if (this.copyForm.orgCode) {
          api = 'scscm/app/orgAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('basicOrg', this.copyForm))
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
