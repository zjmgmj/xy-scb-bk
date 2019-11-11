<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  .row
    .col
      el-form-item(label="仓库名称", prop="warehouseName")
        el-input.full-width(v-model="form.warehouseName", clearable, size="mini")
    .col
      el-form-item(label="助记码")
        el-input.full-width(v-model="form.warehouseMnemcode", clearable, size="mini")
  .row
    .col
      el-form-item(label="仓库类型")
        el-select.full-width(v-model="form.warehouseCtype", placeholder="请选择", size="mini")
          el-option(v-for="item in warehouseTypeList", :key="item.ddId", :label="item.ddName", :value="item.ddName")
    .col
      el-form-item(label="地区")
        el-input.full-width(v-model="form.areaCode", clearable, size="mini")
  .row
    .col
      el-form-item(label="联系人")
        el-input.full-width(v-model="form.warehouseLinkman", clearable, size="mini")
    .col
      el-form-item(label="电话")
        el-input.full-width(v-model="form.warehousePhone", clearable, size="mini") 
  .row
    .col
      el-form-item(label="手机")
        el-input.full-width(v-model="form.warehouseMobile", clearable, size="mini")
    .col
      el-form-item(label="地址")
        el-input.full-width(v-model="form.warehouseAddr", clearable, size="mini")   
  .row
    .col
      el-form-item(label="库位")
        el-checkbox(v-model="form.warehouseWareplace", :true-label="1", :false-label="0") 启用
    .col
      el-form-item(label="自有监管")
        el-checkbox(v-model="form.warehouseOwnSupervise", :true-label="1", :false-label="0") 是
  el-form-item(label="备注")
    el-input.full-width(v-model="form.warehouseRemark", clearable, size="mini")  
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
      warehouseTypeList: [],
      queryObject: {},
      rules: {
        warehouseName: [{ required: true, message: '请输入仓库名称', trigger: 'blur' }]
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
        this.warehouseTypeList = data.ddList
        console.log(this.warehouseTypeList)
      } catch (e) {
        console.error(e)
      }
    },
    async warehouseSave () {
      try {
        let api = 'scscm/app/warehouseAjax!save.do'
        if (this.form.warehouseId) {
          api = 'scscm/app/warehouseAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('warehouse', this.form))
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
