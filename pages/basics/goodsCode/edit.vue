<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  .row
    .col
      el-form-item(label="品名", prop="partsnameName")
        el-select.full-width(v-model="form.partsnameName", clearable, remote, filterable, :remote-method="getPartsnameList", placeholder="请选择", size="mini")
          el-option(v-for="(item, index) in partsnameNameList", :key="item.partsnameCode", :label="item.partsnameName", :value="item.partsnameName")
    .col
      el-form-item(label="材质", prop="goodsMaterial")
        el-input.full-width(v-model="form.goodsMaterial", clearable, size="mini")
  .row
    .col
      el-form-item(label="规格", prop="goodsSpec")
        el-input.full-width(v-model="form.goodsSpec", clearable, size="mini")        
    .col
      el-form-item(label="产地", prop="productareaName")        
        el-select.full-width(v-model="form.productareaName", remote, filterable, :remote-method="getProductarea", placeholder="请选择", size="mini")
          el-option(v-for="item in productareaList", :key="item.productareaCode", :label="item.productareaName", :value="item.productareaName")
  .row
    .col
      el-form-item(label="数量单位")
        el-select.full-width(v-model="form.partsnameNumunit", placeholder="请选择", size="mini")
          el-option(v-for="item in numunitList", :key="item.ddId", :label="item.ddName", :value="item.ddName")
    .col
      el-form-item(label="重量单位")
        el-select.full-width(v-model="form.partsnameWeightunit", placeholder="请选择", size="mini")
          el-option(v-for="item in weightunitList", :key="item.ddId", :label="item.ddName", :value="item.ddName")
  .row
    .col
      el-form-item(label="助记码")
        el-input.full-width(v-model="form.partsnameMnemcode", clearable, size="mini")        
    .col
      el-form-item(label="备注")
        el-input.full-width(v-model="form.partsnameRemark", clearable, size="mini")
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
      industryCodeList: [],
      partsnameNameList: [],
      productareaList: [],
      numunitList: [],
      weightunitList: [],
      rules: {
        partsnameCode: [{ required: true, message: '请输入品名', trigger: 'blur' }],
        goodsMaterial: [{ required: true, message: '请输入材质', trigger: 'blur' }],
        goodsSpec: [{ required: true, message: '请输入规格' }],
        productareaName: [{ required: true, message: '请输入产地' }],
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      // this.form.partsnameIndex = this.form.partsnameName
      this.getPartsnameList()
      this.getProductarea()
      this.getPartsnameNumunit()
      this.getWeightunitList()
    })    
  },
  methods: {
    // nameChange () {
    //   this.form.partsnameMnemcode = this.publicMakePy(this.form.partsnameName)
    // },
    searchPartsnameName () {},
    async getPartsnameList (query = '') {
      try {
        const params = {
          query: query,
          page:1,
          start:0,
          limit:10
        }
        const { data } = await this.proxy(this, 'scscm/app/partsnameAjax!queryCombo.do', 'get', params) 
        this.partsnameNameList = []
        if (data.partsnameList.length > 0) {
          this.partsnameNameList = data.partsnameList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getProductarea (query='') {
      try {
        const params = {
          query: query,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/productareaAjax!queryCombo.do', 'get', params)        
        this.productareaList = []
        if (data.productareaList.length > 0) {
          this.productareaList = data.productareaList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getPartsnameNumunit () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'get', {ddtypeClass: 'partsnameNumunit'})        
        this.numunitList = []
        if (data.ddList.length > 0) {
          this.numunitList = data.ddList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getWeightunitList () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'get', {ddtypeClass: 'partsnameWeightunit'})        
        this.weightunitList = []
        if (data.ddList.length > 0) {
          this.weightunitList = data.ddList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async goodscodeSave () {
      try {
        const partsnameObj = this.partsnameNameList.filter((item) => {
          return item.partsnameName === this.form.partsnameName
        })
        console.log('partsnameObj:', partsnameObj)
        const params = Object.assign(partsnameObj[0], this.form)
        let api = 'scscm/app/goodscodeAjax!save.do'
        if (this.form.goodscodeCode) {
          api = 'scscm/app/goodscodeAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('goodscode', params))
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
          this.goodscodeSave()
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
