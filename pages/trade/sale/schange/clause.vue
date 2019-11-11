<template lang="pug">
.content(style="height: 537px")
  el-form.mt-10(ref="form", :model="form", :rules="rules", label-width="100px")
    el-row
      el-col(:span="6")
        el-form-item(label="贸易性质", prop="scontractTradetype")
          basic-select(v-model="form.scontractTradetype", :ddtypeClass="'ddTypeTradetype'", :useName="true")
      el-col(:span="6")
        el-form-item(label="运输方式", prop="scontractTransportmode")
          basic-select(v-model="form.scontractTransportmode", :ddtypeClass="'ddTypeTransport'", :useName="true")
      el-col(:span="6")
        el-form-item(label="起运港/地", prop="ddTypeStartarea")
          basic-select(v-model="form.ddTypeStartarea", :ddtypeClass="'ddTypeStartarea'", :useName="true")
      el-col(:span="6")
        el-form-item(label="到站港/地", prop="ddTypeDestination")
          basic-select(v-model="form.ddTypeDestination", :ddtypeClass="'ddTypeDestination'", :useName="true")
      el-col(:span="6")
        el-form-item(label="专用线", prop="ddTypeSpecialline")
          basic-select(v-model="form.ddTypeSpecialline", :ddtypeClass="'ddTypeSpecialline'", :useName="true")          
      el-col(:span="6")
        el-form-item(label="付款方式", prop="ddTypePayment")
          basic-select(v-model="form.ddTypePayment", :ddtypeClass="'ddTypePayment'", :useName="true")    
      el-col(:span="6")
        el-form-item(label="付款截止", prop="scontractPaydate")    
          el-date-picker.full-width(v-model="form.scontractPaydate", type="date", placeholder="选择日期", size='mini')          
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
        scontractTradetype: '',
        scontractTransportmode: '',
        ddTypeStartarea: '',
        ddTypeDestination: '',
        ddTypeSpecialline: '',
        ddTypePayment: '',
        scontractPaydate: ''
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