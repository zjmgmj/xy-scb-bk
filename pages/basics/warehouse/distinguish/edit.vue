<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  .row
    .col
      el-form-item(label="库区", prop="wareareaName")
        el-input.full-width(v-model="form.wareareaName", clearable, size="mini")
    .col
      el-form-item(label="货区")
        el-input.full-width(v-model="form.wareareaGregion", clearable, size="mini")
  .row
    .col
      el-form-item(label="最低存放量")
        el-input.full-width(v-model="form.wareareaMinnum", clearable, size="mini")          
    .col
      el-form-item(label="最大存放量")
        el-input.full-width(v-model="form.wareareaMaxnum", clearable, size="mini")
  .row
    .col
      el-form-item(label="图形行")
        el-input.full-width(v-model="form.wareareaX", clearable, size="mini")
    .col
      el-form-item(label="图形列")
        el-input.full-width(v-model="form.wareareaY", clearable, size="mini") 
  .row
    .col
      el-form-item(label="宽")
        el-input.full-width(v-model="form.wareareaWidth", clearable, size="mini")
    .col
      el-form-item(label="高")
        el-input.full-width(v-model="form.wareareaHeight", clearable, size="mini")   
  .row
    .col
      el-form-item(label="备注")
        el-input.full-width(v-model="form.wareareaRemark", clearable, size="mini")  
    .col
      el-form-item(label="类型")
        el-select.full-width(v-model="form.wareareaCtype", placeholder="请选择", size="mini")
          el-option(v-for="item in wareareaCtypeList", :key="item.ddId", :label="item.ddName", :value="item.ddName")
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
        wareareaName: [{ required: true, message: '请输入库区名称', trigger: 'blur' }]
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
    async warehouseSave () {
      try {
        let api = 'scscm/app/wareareaAjax!save.do'
        if (this.form.wareareaCode) {
          api = 'scscm/app/wareareaAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('warearea', this.form))
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
          this.warehouseSave()
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
