<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  .row
    .col
      el-form-item(label="品名", prop="partsnameName")
        el-input.full-width(v-model="form.partsnameName", clearable, size="mini", @change="nameChange")
    .col
      el-form-item(label="助记码")
        el-input.full-width(v-model="form.partsnameMnemcode", clearable, size="mini")
  .row
    .col
      el-form-item(label="行业类别", prop="industryCode")
        el-select.full-width(v-model="form.industryCode", placeholder="请选择", size="mini")
          el-option(v-for="item in industryCodeList", :key="item.industryCode", :label="item.industryName", :value="item.industryCode")
    .col
      el-form-item(label="品名大类")
        el-input.full-width(v-model="form.pntreeName", clearable, size="mini", readonly)
  .row
    .col
      el-form-item(label="计件模式")
        el-select.full-width(v-model="form.goodsPiecemode", placeholder="请选择", size="mini")
          el-option(v-for="item in goodsPiecemodeList", :key="item.goodsPiecemode", :label="item.goodsPiecemodeStr", :value="item.goodsPiecemode")
    .col
      el-form-item(label="计重模式")
        el-select.full-width(v-model="form.goodsWeightmode", placeholder="请选择", size="mini")
          el-option(v-for="item in goodsWeightmodeList", :key="item.goodsWeightmode", :label="item.goodsWeightmodeStr", :value="item.goodsWeightmode")
  .row
    .col
      el-form-item(label="计量方式")
        el-select.full-width(v-model="form.goodsMetering", placeholder="请选择", size="mini")
          el-option(v-for="item in goodsMeteringList", :key="item.ddId", :label="item.ddName", :value="item.ddName")
    .col
      el-form-item(label="计价方式")
        el-select.full-width(v-model="form.goodsPriceun", placeholder="请选择", size="mini")
          el-option(v-for="item in goodsPriceunList", :key="item.goodsPriceun", :label="item.goodsPriceunStr", :value="item.goodsPriceun")
  .row
    .col
      el-form-item(label="工作量系数")
        el-input.full-width(v-model="form.partsnameWorkcoe", clearable, size="mini")
    .col
      el-form-item(label="税率", prop="goodsTaxrate")
        el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
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
      goodsPiecemodeList: [
        {goodsPiecemode:0, goodsPiecemodeStr:'默认'},
        {goodsPiecemode:1, goodsPiecemodeStr:'启用件支模式'}
      ],
      goodsWeightmodeList: [
        {goodsWeightmode:0, goodsWeightmodeStr:'默认'},
        {goodsWeightmode:1, goodsWeightmodeStr:'过磅理算'},
        {goodsWeightmode:2, goodsWeightmodeStr:'湿吨干吨'}
      ],
      goodsMeteringList: [],
      goodsPriceunList: [
        {goodsPriceun:0, goodsPriceunStr:'重量'},
        {goodsPriceun:1, goodsPriceunStr:'数量'}
      ],
      rules: {
        partsnameName: [{ required: true, message: '请输入品名', trigger: 'blur' }],
        goodsTaxrate: [{ required: true, message: '请输入税率', trigger: 'blur' }],
        industryCode: [{ required: true, message: '请输入行业类别' }]
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.getGoodsMeteringList()
      this.getIndustryCodeList()
    })    
  },
  methods: {
    nameChange () {
      this.form.partsnameMnemcode = this.publicMakePy(this.form.partsnameName)
    },
    async getGoodsMeteringList () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'get', {ddtypeClass: 'goodsMetering'})        
        this.goodsMeteringList = []
        if (data.ddList.length > 0) {
          this.goodsMeteringList = data.ddList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async getIndustryCodeList () {
      try {
        const params = {
          query: '',
          page: 1,
          start: 0,
          limit: 25
        }
        const { data } = await this.proxy(this, 'scscm/app/industryAjax!queryCombo.do', 'get', params)        
        this.industryCodeList = []
        if (data.industryComboList.length > 0) {
          this.industryCodeList = data.industryComboList
        }        
      } catch (e) {
        console.error(e)
      }
    },
    async partsnameSave () {
      try {        
        let api = 'scscm/app/partsnameAjax!save.do'
        if (this.form.partsnameCode) {
          api = 'scscm/app/partsnameAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('partsname', this.form))
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
          this.partsnameSave()
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
