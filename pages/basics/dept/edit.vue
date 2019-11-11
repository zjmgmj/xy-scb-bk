<template lang="pug">
el-form(ref="dialogForm", :model="copyForm", :rules="rules" label-width="90px")
  el-row 
    el-col(:span="12")
      el-form-item(label="部门名称", prop="deptName")
        el-input.full-width(v-model="copyForm.deptName", clearable, size="mini")  
    el-col(:span="12")
      el-form-item(label="上级组织", prop="deptParentName")
        el-select.full-width(v-model="copyForm.deptParentName" placeholder="请选择", ref="orgParentSelect", size="mini") 
          el-option.bg-white(:value="treeValue", style="height: auto")
            el-tree(:data="treeData", node-key="id", ref="tree", highlight-current, :props="treeProps", @node-click="treeNodeClick")
  el-row
    el-col(:span="12")
      el-form-item(label="负责人")
        el-input.full-width(v-model="copyForm.deptManager", clearable, size="mini")
    el-col(:span="12")
      el-form-item(label="备注")
        el-input.full-width(v-model="copyForm.deptRemark", clearable, size="mini")
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
      rules: {
        deptName: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
        deptParentName: [{ required: true, message: '请选择上级组织', trigger: 'blur' }]
      },
      copyForm: {}
    }
  },
  mounted () {
    this.copyForm = Object.assign({}, this.form)
  },
  methods: {
    treeNodeClick (obj) {
      console.log('obj', obj)
      this.copyForm.deptParent = obj.id
      this.copyForm.deptParentName = obj.text
      this.$refs.orgParentSelect.blur()
    },
    async saveAsync () {
      try {
        let api = 'scscm/app/deptAjax!save.do'
        if (this.copyForm.deptCode) {
          api = 'scscm/app/deptAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('basicDept', this.copyForm))
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
