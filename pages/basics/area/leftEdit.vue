<template lang="pug">
  el-dialog(ref="dialog", :title="title", :visible="dialogShow",  width="800px", @close="dialogHandler('cancel')")
    el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
      el-form-item(label="地区名称", prop="orgName")        
        el-input.full-width(v-model="form.areaName", clearable, size="small")
      el-form-item(label="助记码")        
        el-input.full-width(v-model="form.areaMnemcode", clearable, size="small")
      el-form-item(label="备注")        
        el-input.full-width(v-model="form.areaRemark", clearable, size="small")
    .dialog-footer(slot="footer")
      el-button(@click="dialogHandler('cancel')", size="small") 取消
      el-button(@click="dialogHandler('sure')", type="primary", size="small") 确定
</template>
<script>
export default {
  props: {
    title: {
      type: String,
      default: '地区设置'
    },
    dialogShow: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      form: {
        areaName: '',
        areaMnemcode: '',
        areaRemark: ''
      },
      rules: {
        areaName: [{ required: true, message: '请输入地区名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    dialogHandler (type) {
      if (type === 'cancel') {
        this.$emit('close')
      } else {
        this.$emit('save', this.form)
      }
    }
  }
}
</script>

