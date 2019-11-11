<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
  .row
    .col
      el-form-item(label="项目名称", prop="feeitemName")
        el-input.full-width(v-model="form.feeitemName", clearable, size="mini")
    .col
      el-form-item(label="单价", prop="feeitemInprice")
        .row
          .col
            el-input(v-model="form.feeitemInprice", clearable, size="mini")
          el-select(v-model="form.feeitemPriceunitStr", size="mini", style="width: 75px; margin-top: 2px", placeholder="")
            el-option(v-for="item in feeitemPriceunitList", :key="item.code", :label="item.name", :value="item.code")
    .col
      el-form-item(label="税率", prop="goodsTaxrate")
        el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini")
  .ft-16.padding-xs.bg-gray.mb-15 仓储
  .row
    .col
      el-form-item(label="结算方式")
        el-select.full-width(v-model="form.ddTypeSettlement", size="mini", placeholder="")
          el-option(v-for="item in ddTypeSettlementList", :key="item.ddName", :label="item.ddName", :value="item.ddName")
    .col
      el-form-item(label="仓库")
        el-select.full-width(v-model="form.warehouseCode", remote, filterable, :remote-method="getWarehouse", size="mini", placeholder="")
          el-option(v-for="item in warehouseList", :key="item.warehouseCode", :label="item.warehouseName", :value="item.warehouseCode")                    
    .col
      el-form-item(label="库位类型")
        el-select.full-width(v-model="form.warehouseCtype", remote, filterable, :remote-method="getWarehouseCtype", size="mini", placeholder="")
          el-option(v-for="item in warehouseCtypeList", :key="item.ddName", :label="item.ddName", :value="item.ddName")
  .row
    .col
      el-form-item(label="重量尾数")
        el-select.full-width(v-model="form.feeitemWeightmtStr", size="mini")
          el-option(v-for="item in feeitemWeightmtList", :key="item.ddShowname", :label="item.ddShowname", :value="item.ddShowname")
    .col
      el-form-item(label="金额尾数")
        el-select.full-width(v-model="form.feeitemMoneymtStr", size="mini")
          el-option(v-for="item in feeitemMoneymtList", :key="item.ddShowname", :label="item.ddShowname", :value="item.ddShowname")
    .col
      el-form-item(label="计费方式")
        el-select.full-width(v-model="form.feeitemCalmethodStr", size="mini")
          el-option(v-for="item in feeitemCalmethodList", :key="item.ddShowname", :label="item.ddShowname", :value="item.ddShowname")
  .row
    .col
      el-form-item(label="运输方式(当前单据)", remote, filterable, :remote-method="getTypeTransport", label-width="155px", placeholder="")
        el-select.full-width(v-model="form.ddTypeTransport", size="mini")
          el-option(v-for="item in typeTransportList", :key="item.ddName", :label="item.ddName", :value="item.ddName")
    .col
      el-form-item(label="备注")
        el-input.full-width(v-model="form.feeitemRemark", clearable, size="mini")  
  .row
    .col
      el-form-item(label="优惠方式")
        el-radio-group(v-model="form.feeitemFavnumclass", @change="feeitemFavnumclassChange")
          el-radio(:label="0") 不启用
          el-radio(:label="1") 出库量
    .col
      el-form-item(label="统计方式")
        el-radio(v-model="form.feeitemThroughput" :label="1") 本月
        el-radio(v-model="form.feeitemThroughput" :label="2") 本年
  .row
    .col
      el-form-item(label="大于")
        el-input.full-width(v-model="form.feeitemFavnummax", clearable, size="mini", :disabled="disabled")
    .col
      el-form-item(label="小于")
        el-input.full-width(v-model="form.feeitemFavnummin", clearable, size="mini", :disabled="disabled")
  .row
    el-form-item(label="加班")
      el-radio(v-model="form.feeitemOvertime" :label="0") 不启用
      el-radio(v-model="form.feeitemOvertime" :label="1") 周六
      el-radio(v-model="form.feeitemOvertime" :label="2") 周日
      el-radio(v-model="form.feeitemOvertime" :label="3") 周末
  .row
    .col
      el-form-item(label="加班开始时间", label-width="120px")
        el-input.full-width(v-model="form.feeitemOverstimeStr", clearable, size="mini")
    .col
      el-form-item(label="加班结束时间", label-width="120px")
        el-input.full-width(v-model="form.feeitemOveretimeStr", clearable, size="mini")
    .pt-10.pl-5.text-red(style="width: 120px") 输入格式:00:00
  .row
    .col
      el-form-item.mr-5(label="适用单据")
        el-select.full-width(v-model="form.feeitemConbilltype", multiple, filterable, placeholder="请选择", size="mini")
          el-option(v-for="item in feeitemConbilltypeList", :key="item.billtypeCode", :label="item.billtypeName", :value="item.billtypeCode")
  el-form-item(label="单据里物资条件", label-width="130px")
    el-radio(v-model="form.feeitemScope", :label="0") 在下面的名称中
    el-radio(v-model="form.feeitemScope", :label="1") 不在下面名称中
  el-form-item(label-width="0")
    el-input(type="textarea", placeholder="请输入内容", v-model="form.feeitemFavnumcon", show-word-limit)  
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
      dialogShow: true,
      dialogTitle: '费用项目设置',
      feeitemPriceunitList: [
        {code: '4', name: '元/吨'}, 
        {code: '5', name: '元/车'},
        {code: '6', name: '元/支'},
        {code: '7', name: '元/件'},
        {code: '9', name: '元/班'},
        {code: '10', name: '元/次'}
      ],
      ddTypeSettlementList: [{ddName: '现结'}, {ddName: '月结'}, {ddName: '期结'}, {ddName: '货到付款'}],
      warehouseList: [],
      warehouseCtypeList: [],
      feeitemWeightmtList: [],
      feeitemMoneymtList: [],
      feeitemCalmethodList: [],
      typeTransportList: [],
      feeitemConbilltypeList: [],
      disabled: true,
      rules: {
        feeitemName: [{ required: true, message: '请输入项目名称' }],
        feeitemInprice: [{ required: true, message: '请输入单价' }],
        goodsTaxrate: [{ required: true, message: '请输入税率' }]
      }
    }
  },
  mounted () {
    this.getTypeSettlement()
    this.getWarehouse()
    this.getWarehouseCtype()
    this.getFeeitemWeightmt()
    this.getFeeitemMoneymt()
    this.getFeeitemCalmethod()
    this.getTypeTransport()
    this.getBilltypeAjax()
  },
  methods: {
    feeitemFavnumclassChange (val) {
      val === 0 ? this.disabled = true : this.disabled = false
    },
    save () {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          const feeitemConbilltypeArr = []
          this.form.feeitemConbilltype.map((code) => {
            const obj = this.feeitemConbilltypeList.find((item) => {
              return item.billtypeCode === code
            })
            feeitemConbilltypeArr.push(obj.billtypeName)
          })
          console.log('feeitemConbilltypeArr', feeitemConbilltypeArr)
          this.form.feeitemConbilltypeStr = feeitemConbilltypeArr.join(',')
          this.form.feeitemConbilltype = this.form.feeitemConbilltype.join(',')
          console.log('form', this.form)
          this.saveAsync()
        } else {
          console.log('error submit!!')
          return false
        }
      })       
    },
    cancel () {
      this.$emit('cancel')
    },
    async saveAsync () {
      try {
        // this.form.feeitemConbilltypeStr = this.form.feeitemConbilltypeStr.join(',')
        let api = 'scscm/app/feeitemAjax!save.do'
        if (this.form.feeitemCode) {
          api = 'scscm/app/feeitemAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('feeitemMod', this.form))
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
    async getBilltypeAjax () {
      try {
        const params = {
          queryBean: {
            treeFlag: 1,
            typeStr: 'WLP015,WLP001,WLP002,WLP003,WLP021,WLP040,WLP019,WLP009,WLP006,WLP004,WLP005,WLP010,WLP011,WLP012,WLP058'
          },
          page: 1,
          start: 0,
          limit: 200,
          sort: '[{"property":"billtypeCode","direction":"ASC"}]'
        }
        const { data } = await this.proxy(this, 'scscm/app/billtypeAjax.do', 'post', params)
        this.feeitemConbilltypeList = data.billtypeList
      } catch (e) {
        console.error(e)
      }
    },
    async getTypeTransport (key='') {
      try {
        const params = {
          ddtypeClass: 'ddTypeTransport',
          query: key,
          page: 1,
          start: 0,
          limit:25
        }
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'post', params)
        this.typeTransportList = data.ddList
      } catch (e) {
        console.error(e)
      }
    },
    async getTypeSettlement () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'post', {ddtypeClass: 'ddTypeSettlement'})
        this.ddTypeSettlementList = data.ddList
      } catch (e) {
        console.error(e)
      }
    },
    async getWarehouseCtype () {
      try {
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'post', {ddtypeClass: 'warehousetype'})
        this.warehouseCtypeList = data.ddList
      } catch (e) {
        console.error(e)
      }
    },
    async getFeeitemWeightmt (key) {
      try {
        const params = {
          ddtypeClass: 'feeitemWeightmt',
          query: key,
          page: 1,
          start: 0,
          limit:25
        }
        const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'post', params)
        this.feeitemWeightmtList = data.ddList
      } catch (e) {
        console.error(e)
      }
    },
    async getFeeitemMoneymt (key) {
      try {
        const params = {
          ddtypeClass: 'feeitemMoneymt',
          query: key,
          page: 1,
          start: 0,
          limit:25
        }
        const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'post', params)
        this.feeitemMoneymtList = data.ddList
      } catch (e) {
        console.error(e)
      }
    },
    async getFeeitemCalmethod (key) {
      try {
        const params = {
          ddtypeClass: 'feeitemCalmethod',
          query: key,
          page: 1,
          start: 0,
          limit:25
        }
        const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'post', params)
        this.feeitemCalmethodList = data.ddList
      } catch (e) {
        console.error(e)
      }
    },
    async getWarehouse (key) {
      try {
        const params = {
          query: key,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/warehouseAjax!queryCombo.do', 'post', params)
        this.warehouseList = data.warehouseList
      } catch (e) {
        console.error(e)
      }
    }    
  }
}
</script>
