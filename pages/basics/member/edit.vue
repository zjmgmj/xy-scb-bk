<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="85px")
    .row
      .col
        el-form-item(label="使用单位", prop="memberName")
          el-input.full-width(v-model="form.memberName", clearable, size="mini")
    .row
      .col
        el-form-item(label="单位简称", prop="memberAbbreviate")
          el-input.full-width(v-model="form.memberAbbreviate", clearable, size="mini")
      .col
        el-form-item(label="注册单位", prop="memberFlag")
          el-radio(v-model="form.memberFlag", :label="0") 否
          el-radio(v-model="form.memberFlag", :label="1") 是
    .row
      .col
        el-form-item(label="使用日期", prop="memberDate")
          el-date-picker.full-width(v-model="form.memberDate", type="date", size="mini", value-format="yyyy-MM-dd")
      .col
        el-form-item(label="备注", prop="memberRemark")
          el-input.full-width(v-model="form.memberRemark", clearable, size="mini")
    .row
      .col
        el-form-item(label="注册码", prop="memberRegcode")
          el-input(type="textarea", rows="2", v-model="form.memberRegcode")
    .row
      .col
        el-form-item(label="授权号", prop="memberAuthcode")
          el-input(type="textarea", rows="2", v-model="form.memberAuthcode")
    el-form-item.text-right.mt-15
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
            memberName: '',
            memberAbbreviate: '',
            memberFlag: '',
            memberDate: '',
            memberRemark: '',
            memberRegcode: '',
            memberAuthcode: ''
          }
        }
      }
    },
    data() {
      return {
        rules: {
          memberName: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
          memberRegcode: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
          memberAuthcode: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
        }
      }
    },
    methods: {
      async asyncSave() {
        try {
          const api = 'scscm/app/memberAjax!update.do'
          const { data } = await this.proxy(this, api, 'post', { member: this.form })
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
