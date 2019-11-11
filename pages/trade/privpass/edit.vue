<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
  el-form-item(label="用户名", prop="operatorCode")
    operator-select(v-model="form.operatorCode", size="mini", clearable)
  el-form-item(label="密码", prop="tempPassword")
    el-input.full-width(v-model="form.tempPassword", :minLength="6", :maxLength="18", type="password", clearable, size="mini")
  el-form-item(label="可用次数", prop="privpassUserNum")
    el-input.full-width(v-model="form.privpassUserNum", clearable, size="mini")
  el-form-item.text-right
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
import { mapState } from 'vuex'
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
    const tempPassword = (rule, value, callback) => {
      debugger
      switch (value) {
        case '':
        case null:
          if (!this.form.privpassUserPass) {
            this.$message.error('密码不能为空')
            callback(new Error(''))
          } else {
            callback()
          }         
          break
        case '123456':
          this.$message.error('密码不能为123456')
          callback(new Error(''))
          break
        default:
          if (value.length < 6) {
            this.$message.error('密码不能为小于6位')
            callback(new Error(''))
          }
          if (value.replace(new RegExp(value.substring(0,1), 'g'), '') === '') {
            this.$message.error('密码不能为同一字符')
            callback(new Error(''))
          }
          callback()
          break
      }
    };
    return {
      dialogShow: true,
      rules: {
        operatorCode: [{ required: true }],
        tempPassword: [
          { required: true, validator: tempPassword, trigger: 'blur' }
        ],
        privpassUserNum: [{ required: true }]
      }
    }
  },
   computed: {
    ...mapState({
      g_decimalP: state => state.g_decimalP
    })
  },
  methods: {    
    syncName(e, obj) {     
      Object.keys(obj).forEach((key) => {
        this.form[key] = e[obj[key]]
      })
    },
    async saveAsync () {
      try {
        let api = 'scscm/app/privpassAjax!save.do'
        if (this.form.privpassUserId) {
          api = 'scscm/app/privpassAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', {mod: this.form})
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
          this.saveAsync()
        } else {
          console.log('error submit!!')
          return false
        }
      })       
    },
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>
<style lang="stylus", scoped>
/deep/.el-input-number .el-input__inner{
  text-align left
}
</style>