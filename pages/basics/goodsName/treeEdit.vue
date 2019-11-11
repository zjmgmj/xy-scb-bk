<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="60px")
  el-form-item(label="名称", prop="pntreeName")
    el-input.full-width(v-model="form.pntreeName", clearable, size="mini")
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
      wareareaCtypeList: [],
      queryObject: {},
      rules: {
        pntreeName: [{ required: true, message: '请输入名称', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.getWarehouseTypeList()
    })    
  },
  methods: {
    async getWarehouseTypeList () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'get', {ddtypeClass: 'warehousetype'})        
        this.wareareaCtypeList = data.ddList
        console.log(this.wareareaCtypeList)
      } catch (e) {
        console.error(e)
      }
    },
    async saveForm () {
      try {
        let api = 'scscm/app/partsnameAjax!saveTree.do'
        if (this.form.pntreeNodecode) {
          api = 'scscm/app/partsnameAjax!updateTree.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('pntree', this.form))
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
          this.saveForm()
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
