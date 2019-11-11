<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    .row
      .col
        el-form-item(label="角色名称", prop="roleName")
          el-input.full-width(v-model="form.roleName", clearable, size="mini")
    .row
      .col
        el-form-item(label="备注", prop="roleRemark")
          el-input.full-width(v-model="form.roleRemark", clearable, size="mini")
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  export default {
    props: {
      form: {
        type: Object,
        default: () => {
          return {
            isNew: true,

            roleName: '',
            roleRemark: ''
          }
        }
      }
    },
    data() {
      return {
        rules: {
          roleName: [
            { required: true, message: '请输入角色名称', trigger: 'blur' }
          ]
        }
      }
    },
    mounted() {
    },
    methods: {
      async asyncSave() {
        try {
          let api = 'scscm/app/roleAjax!save.do'
          if (this.form.roleId) {
            api = 'scscm/app/roleAjax!update.do'
          }
          const { data } = await this.proxy(this, api, 'post', { role: this.form })
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
