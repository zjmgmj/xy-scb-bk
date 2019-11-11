<template lang="pug">
el-dialog(title="特权密码", :visible="true", ref="password", :append-to-body="true", width="500px")
  .mb-10(v-html="config.paramsMsg") {{config.paramsMsg}}
  el-form(:model="form" status-icon :rules="rules" ref="pwForm" label-width="80px")
    input(type="password", hidden, autocomplete="new-password")
    el-form-item(label="用户名" prop="operatorCode")
      operator-select(v-model="form.operatorCode", clearable, size="mini")
    el-form-item(label="密码" prop="privpassUserPass")
      el-input(type="password", v-model="form.privpassUserPass", size="mini", autocomplete="off")
    el-form-item
      el-button(type="primary", size="mini", @click="privpass") 提交
      el-button(size="mini", @click="close") 取消
</template>
<script>
export default {
  props: {
    config: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      form: {
        operatorCode: '',
        privpassUserPass: '',
        privpassCode: ''
      },
      rules: {
        operatorCode: [{ required: true, message: '必填项' }],
        privpassUserPass: [{ required: true, message: '必填项' }]
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.form.privpassCode = this.config.privpassCode
    })
  },
  methods: {
    close () {
      this.$emit('close')
    },
    async privpass () {      
      const loading = this.loadShow()
      try {
        const { data } = await this.proxy(this, 'scscm/app/privpassAjax!check.do', 'post', {mod: this.form})
        console.log(data)
        loading.close()        
        if (data.map.state === '2') {
          this.$message.error(data.map.msg ? data.map.msg : '验证失败')
          return false
        }
        const resData = Object.assign({}, this.config)        
        debugger
        resData.conObj.password = this.form.privpassUserPass
        resData.conObj.loginName = this.form.operatorCode
        this.$emit('cellback', resData)
      } catch (e) {
        loading.close()
        console.error(e)
      }
    }
  }
}
</script>