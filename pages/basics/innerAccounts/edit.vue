<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  el-form-item(label="账号", prop="inneraccountsCode")
    el-input.full-width(v-model="form.inneraccountsCode", clearable, size="mini")
  .row 
    .col
      el-form-item(label="银行名称", prop="innerbankName")
        el-select.full-width(v-model="form.innerbankName", clearable, remote, filterable, :remote-method="getBankNameList", placeholder="请选择", size="mini")
          el-option(v-for="(item, index) in innerbankNameList", :key="item.innerbankCode", :label="item.innerbankName", :value="item.innerbankName")
    .col
      el-form-item(label="账户名称", prop="inneraccountsName")
        el-input.full-width(v-model="form.inneraccountsName", clearable, size="mini") 
  .row       
    .col
      el-form-item(label="账号类型", prop="inneraccountsType") 
        el-input.full-width(v-model="form.inneraccountsType", clearable, size="mini")         
    .col
      el-form-item(label="账号性质")
        el-input.full-width(v-model="form.inneraccountsProperty", clearable, size="mini")        
  .row    
    .col
      el-form-item(label="联系人")
        el-input.full-width(v-model="form.inneraccountsLinkman", clearable, size="mini")
    .col
      el-form-item(label="币种")
        el-select.full-width(v-model="form.ddTypeCurrency", clearable, placeholder="请选择", size="mini")
          el-option(v-for="(item, index) in ddTypeCurrencyList", :key="item.currencyCode", :label="item.currencyName", :value="item.currencyName")
  el-form-item(label="备注")
    el-input.full-width(v-model="form.inneraccountsRemark", clearable, size="mini")
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
      innerbankNameList: [],
      ddTypeCurrencyList: [],
      rules: {
        inneraccountsCode: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        innerbankName: [{ required: true, message: '请输入银行名称', trigger: 'blur' }],
        inneraccountsName: [{ required: true, message: '请输入账户名称' }]
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.getBankNameList()
      this.getCurrencyList()
    })    
  },
  methods: {
    async getBankNameList (query = '') {
      try {
        const params = {
          query: query,
          page:1,
          start:0,
          limit:10
        }
        const { data } = await this.proxy(this, 'scscm/app/innerbankAjax!queryCombo.do', 'get', params) 
        this.partsnameNameList = []
        if (data.innerbankList.length > 0) {
          this.innerbankNameList = data.innerbankList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getCurrencyList (query='') {
      try {
        const params = {
          query: query,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/currencyAjax!queryCombo.do', 'get', params)        
        this.ddTypeCurrencyList = []
        if (data.currencyList.length > 0) {
          this.ddTypeCurrencyList = data.currencyList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async inneraccountsSave () {
      try {
        // const partsnameObj = this.partsnameNameList.filter((item) => {
        //   return item.partsnameName === this.form.partsnameName
        // })
        // console.log('partsnameObj:', partsnameObj)
        // const params = Object.assign(partsnameObj[0], this.form)
        let api = 'scscm/app/inneraccountsAjax!save.do'
        if (this.form.inneraccountsId) {
          api = 'scscm/app/inneraccountsAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('inneraccounts', this.form))
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
          this.inneraccountsSave()
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
