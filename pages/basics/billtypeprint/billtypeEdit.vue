<template lang="pug">
  el-dialog(ref="dialog", title="单据打印设置", :visible="true", width="600px", @close="close")
    el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
      el-form-item(label="审核后打印", prop="billtypeCheckprint")
        el-radio(v-model="form.billtypeCheckprint", :label="0") 否
        el-radio(v-model="form.billtypeCheckprint", :label="1") 是
      el-form-item(label="打印次数", prop="billtypePrintnum")
        el-input.full-width(v-model.number="form.billtypePrintnum", clearable, size="small")
    .dialog-footer(slot="footer")
      el-button(@click="close", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  export default {
    props: {
      billtypeCode: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        form: {
          billtypePrintnum: 0,
          billtypeCheckprint: '',
          billtypeCode: ''
        },
        rules: {
          billtypePrintnum: [
            { required: true, message: '请输入打印次数', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' }
          ]
        }
      }
    },
    mounted() {
      this.proxy(this, 'scscm/app/billtypePrintAjax!queryBillType.do', 'get', { billtypeCode: this.billtypeCode }).then(x => {
        this.form.billtypePrintnum = x.data.billtype.billtypePrintnum
        this.form.billtypeCheckprint = x.data.billtype.billtypeCheckprint
        this.form.billtypeCode = x.data.billtype.billtypeCode
      })
    },
    methods: {
      async asyncSave() {
        try {
          const api = 'scscm/app/billtypePrintAjax!updateBillPrint.do'
          const { data } = await this.proxy(this, api, 'post', this.form)
          if (data.map.state === '2') {
            this.$message.error(data.map.msg)
            return
          }
          this.$message.success('保存成功')
          this.$refs.dialogForm.resetFields()
          this.$emit('close')
        } catch (e) {
          console.error(e)
        }
      },
      save() {
        this.$refs.dialogForm.validate((valid) => {
          if (valid) {
            this.asyncSave()
          } else {
            console.log('error submit!!')
            return false
          }
        })
      },
      close() {
        this.$emit('close')
      }
    }
  }
</script>

