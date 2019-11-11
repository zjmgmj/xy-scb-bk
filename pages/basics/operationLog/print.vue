<template lang="pug">
.content
  el-radio(v-model="form.pageType", label="所有页")
  .mt-5
    el-radio(v-model="form.pageType", label="当前页")
  .row.mt-5(style="align-items: center;")
    .col.flex-80
      el-radio(v-model="form.pageType", label="指定页")
    .col.flex-120
      el-input(size="mini", v-model="form.printPage")
    .col.ml-5
      span (例如： 2,5,7-10,12)
  .mt-15
    el-checkbox(v-model="form.checked") 以图片方式打印（针式打印推荐使用）
  .mt-10
    el-checkbox(v-model="form.checked") 根据纸张大小缩放打印
  .mt-15
    .text-red.ft-16 打印机偏移： X = 0.0mm Y = 0.0mm
  .text-right.mt-10
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
export default {
  data () {
    return {
      dialogShow: true,
      dialogTitle: '打印',
      // form: ,
      tempRoleCodelist: [],      
      form: {
        pageType: '',
        printPage: '1-2',
        checked: ''
      }
    }
  },
  methods: {
    save () {
      this.$emit('save', this.form)      
    },
    cancel () {
      this.$emit('cancel')
    }
  }
}
</script>
