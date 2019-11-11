<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="85px")
    el-form-item(label="行业名称", prop="industryName")
      el-input(v-model="form.industryName", size="mini")
    el-form-item(label="备注", prop="orgRemark")
      el-input(v-model="form.orgRemark", size="mini")
    el-form-item.text-right.mt-15
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  export default {
    props: {
      queryParam: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        rules: {
          industryName: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
        },
        form: {
          industryName: '',
          orgRemark: ''
        }
      }
    },
    mounted() {
      this.proxy(this, 'scscm/app/industryAjax!editTree.do', 'post', { systemIndustry: this.queryParam }).then(x => this.form = x.data.systemIndustry)
    },
    methods: {
      async asyncSave() {
        try {
          const api = 'scscm/app/industryAjax!updateTree.do'
          const { data } = await this.proxy(this, api, 'post', { systemIndustry: this.form })
          if (data.map.state === '2') {
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
      cancel() {
        this.$refs.dialogForm.resetFields()
        this.$emit('cancel')
      }
    }
  }
</script>
