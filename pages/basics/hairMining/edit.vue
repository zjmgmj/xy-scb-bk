<template lang="pug">
.content
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
      // form: ,
      tempRoleCodelist: []
    }
  },
  methods: {
    save () {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {          
          this.$emit('save', this.form)
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
