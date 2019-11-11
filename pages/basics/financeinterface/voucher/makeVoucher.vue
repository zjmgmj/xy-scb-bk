<template lang="pug">
el-form(:inline="true", :model="form")
  el-form-item(label="凭证类型")
    el-select(
      v-model="form.dataVouchertype", 
      clearable,
      filterable,
      size="mini", style='width: 150px')
      el-option(v-for="(item, index) in vouchertypeList", :key="index", :label="item.financeVoutypeName", :value="item.financeVoutypeCode")
  el-form-item(label="凭证日期")
    el-date-picker(v-model="form.dataVoucherdate", type="date", clearable, size="mini", style='width: 150px')
  el-form-item
    el-button(size="mini", type="primary", @click="makeHandler") 生成凭证
</template>
<script>
export default {
  props: {
    tabRow: {
      type: Object,
      default: () => {
        return {}
      }
    },
    checkNodeData: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },  
  data () {
    return {
      form: {
        dataVouchertype: '',
        dataVoucherdate: ''
      },
      vouchertypeList: []
    }
  },
  watch: {
    'checkNodeData.financeLedgerCode': {
      handler (newVal, oldVal) {
        if (newVal) {
          this.getVoucherType()
        }        
      },
      deep: true
    }
  },
  mounted () {
    // this.$nextTick(() => {
    //   this.getVoucherType()
    // })
  },
  methods: {
    makeHandler () {
      if (this.tabRow.financeLeadBillbatch) {
        let params = {
          financeLeadBillbatchs: this.tabRow.financeLeadBillbatch,
          financeLedgerCode: this.checkNodeData.financeLedgerCode
        }
        params = Object.assign(params, this.form)
        this.voucherAjaxQueryVoucher(params)
      } else {
        this.$message.error('请选择需要操作的记录!')
        return false
      }
    },
    async voucherAjaxQueryVoucher (params) {
      try {
        const { data } = await this.proxy(this, 'scscm/app/voucherAjax!queryVoucher.do', 'post', params)
        console.log(data)
      } catch (e) {
        console.error(e)
      }
    },
    async getVoucherType () {
      try {
        const params = {
          financeLedgerCode: this.checkNodeData.financeLedgerCode,
          page: 1,
          start: 0,
          limit: 10
        }
        const { data } = await this.proxy(this, 'scscm/app/voucherTypeAjax!queryCombo.do', 'post', params)
        this.vouchertypeList = data.ifvList
      } catch (e) {
        console.error(e)
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
/deep/.el-form-item{
  margin-bottom: 0
}
</style>

