<template lang="pug">
.content(style="height: 537px")
  el-form.mt-10(ref="form", :model="form", :rules="rules", label-width="100px")
    el-row
      el-col(:span="6")
        el-form-item(label="运输方式", prop="contractTransportmode")
          basic-select(v-model="form.contractTransportmode", :ddtypeClass="'ddTypeTransport'", :useName="true")
      el-col(:span="6")
        el-form-item(label="起运港/地", prop="ddTypeStartarea")
          basic-select(v-model="form.ddTypeStartarea", :ddtypeClass="'ddTypeStartarea'", :useName="true")
      el-col(:span="6")
        el-form-item(label="到站港/地", prop="ddTypeDestination")
          basic-select(v-model="form.ddTypeDestination", :ddtypeClass="'ddTypeDestination'", :useName="true")
      el-col(:span="6")
        el-form-item(label="专用线", prop="ddTypeSpecialline")
          basic-select(v-model="form.ddTypeSpecialline", :ddtypeClass="'ddTypeSpecialline'", :useName="true")
    el-row
      el-col(:span="6")      
        el-form-item(label="中专港", prop="ddTypeTransferport")
          basic-select(v-model="form.ddTypeTransferport", :ddtypeClass="'ddTypeTransferport'", :useName="true")
      el-col(:span="6")      
        el-form-item(label="结算方式", prop="ddTypeSettlement")
          basic-select(v-model="form.ddTypeSettlement", :ddtypeClass="'ddTypeSettlementSdp'", :useName="true")
      el-col(:span="6")
        el-form-item(label="交货方式", prop="ddTypeDelivery")
          basic-select(v-model="form.ddTypeDelivery", :ddtypeClass="'sdp_ddTypeDelivery'", :useName="true")
      el-col(:span="6")
        el-form-item(label="付款方式", prop="ddTypePayment")
          basic-select(v-model="form.ddTypePayment", :ddtypeClass="'ddTypePayment'", :useName="true")
    el-row
      el-col(:span="6")
        el-form-item(label="签约地点", prop="contractSigningAt")    
          el-input.full-width(v-model="form.contractSigningAt", clearable, size="mini")  
      el-col(:span="18")
        el-form-item(label="付款说明", prop="ddTypePaymentremark")    
          el-input.full-width(v-model="form.ddTypePaymentremark", clearable, size="mini")  
</template>
<script>
import basicSelect from '@/components/select/basicSelect'
export default {
  components: {
    basicSelect
  },
  props: {
    clauseMod: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      form: {
        contractTransportmode: '',
        ddTypeStartarea: '',
        ddTypeDestination: '',
        ddTypeSpecialline: '',
        ddTypeTransferport: '',
        ddTypeSettlement: '',
        ddTypeDelivery: '',
        ddTypePayment: '',
        contractSigningAt: '',
        ddTypePaymentremark: ''
      },
      rules: {}
    }
  },
  watch: {
    clauseMod () {
      Object.keys(this.form).forEach((key) => {
        this.form[key] = this.clauseMod[key] ? this.clauseMod[key] : ''
      })      
    }
  }
}
</script>