<template lang="pug">
.content
  .content(style="height: 90vh")
    jsplumb.border
  //- .text-right.mt-10
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
import jsplumb from '@/components/jsplumb'
export default {
  components: {
    jsplumb
  },
  props: {},
  data () {
    return {
      dialogTitle: '单据打印设置',
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
