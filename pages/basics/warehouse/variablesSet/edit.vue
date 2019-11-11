<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  .row
    .col
      el-form-item(label="库位", prop="wareplaceName")
        el-input.full-width(v-model="form.wareplaceName", clearable, size="mini")
    .col
      el-form-item(label="库区")        
        el-select.full-width(v-model="form.wareplaceWregion", :remote-method="getWareplaceWregion", filterable, remote, placeholder="请输入关键词", :loading="wareplaceWregionLoading", clearable, size="mini")    
          el-option(v-for="item in wareplaceWregionList", :key="item.wareareaCode", :label="item.wareareaName", :value="item.wareareaName")      
  .row
    .col
      el-form-item(label="货区")
        el-input.full-width(v-model="form.wareplaceGregion", clearable, size="mini")          
    .col
      el-form-item(label="类型")
        el-select.full-width(v-model="form.wareplaceCtype", size="mini")
          el-option(v-for="item in wareplaceCtypeList", :key="item.ddId", :label="item.ddName", :value="item.ddName")
  .row
    .col
      el-form-item(label="最低存放量")
        el-input.full-width(v-model="form.wareplaceMinnum", clearable, size="mini")
    .col
      el-form-item(label="最大存放量")
        el-input.full-width(v-model="form.wareplaceMaxnum", clearable, size="mini") 
  .row
    .col
      el-form-item(label="图形行")
        el-input.full-width(v-model="form.wareplaceX", clearable, size="mini")
    .col
      el-form-item(label="图形列")
        el-input.full-width(v-model="form.wareplaceY", clearable, size="mini")   
  el-form-item(label="视频设备")
    el-select.full-width(v-model="form.deviceName", size="mini")
      el-option(v-for="item in deviceNameList", :key="item.deviceId", :label="item.deviceName", :value="item.deviceId")
    //- el-select.full-width(v-model="form.deviceName", :remote-method="getDeviceNameList", filterable, remote, placeholder="请输入关键词", :loading="deviceNameLoading", clearable, size="mini")    
      el-option(v-for="item in deviceNameList", :key="item.deviceId", :label="item.deviceName", :value="item.deviceId")      
  el-form-item(label="备注")
    el-input.full-width(v-model="form.wareplaceRemark", clearable, size="mini")  
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
      wareplaceWregionLoading: false,
      deviceNameLoading: false,
      wareplaceWregionList: [],
      wareplaceCtypeList: [],
      deviceNameList: [],
      queryObject: {},
      rules: {
        wareplaceName: [{ required: true, message: '请输入库区名称', trigger: 'blur' }]
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.getWarehouseTypeList()
      this.getWareplaceWregion()
    })    
  },
  methods: {
    async getWarehouseTypeList () {
      try {        
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'get', {ddtypeClass: 'warehousetype'})        
        this.wareplaceCtypeList = data.ddList
        console.log(this.wareplaceCtypeList)
      } catch (e) {
        console.error(e)
      }
    },
    async getDeviceNameList (key) {
      this.deviceNameLoading = true
      try {        
        const params = {
          page: 1,          
          otherlikeCol:0,
          start: 0,
          limit: 10,
          query: key
        }
        const { data } = await this.proxy(this, 'scscm/app/monitoringEnrollAjax!queryCombo.do', 'get', params) 
        this.deviceNameList = []
        if (data.mainList.length > 0) {
          this.deviceNameList = data.mainList
        }
      } catch (e) {
        console.error(e)
      }
      this.deviceNameLoading = false
    },
    async warehouseSave () {
      try {
        let api = 'scscm/app/wareplaceAjax!save.do'
        if (this.form.wareplaceCode) {
          api = 'scscm/app/wareplaceAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('wareplace', this.form))
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
    async getWareplaceWregion (key) {
      this.wareplaceWregionLoading = true
      try {        
        console.log(this.form)
        const params = {
          warehouseCode: this.form.warehouseCode,
          page: 1,          
          otherlikeCol:0,
          start: 0,
          limit: 10,
          query: key
        }        
        const { data } = await this.proxy(this, 'scscm/app/wareareaAjax!queryComboFilter.do', 'get', params)
        this.wareplaceWregionList = []
        if (data.wareareaList.length > 0) {
          this.wareplaceWregionList = data.wareareaList
        }        
      } catch (e) {
        console.error(e)
      }
      this.wareplaceWregionLoading = false
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
