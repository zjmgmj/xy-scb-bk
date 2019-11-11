<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="60px")
    .row
      .col
        el-form-item(label="名称")
          el-input.full-width(v-model="form.menuName", clearable, size="mini")
      .col
        el-form-item(label="模块")
          el-input.full-width(v-model="form.menuModule", clearable, size="mini")
    .row
      .col
        el-form-item(label="图标")
          el-input.full-width(v-model="form.menuIcon", clearable, size="mini")
    .row
      .col
        el-form-item(label="菜单")
          el-radio(v-model="form.menuShowinmenu", :label="0") 是
          el-radio(v-model="form.menuShowinmenu", :label="1") 否
      .col
        el-form-item(label="顺序")
          el-input.full-width(v-model="form.menuOrder", clearable, size="mini")
    el-form-item.text-right.mt-15
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  export default {
    props: {
      originForm: {
        type: Object,
        default: () => {
          return {}
        }
      }
    },
    data() {
      return {
        rules: {
          menuName: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
        },
        form: {
          menuParent: '',
          menuState: '',
          menuCode: '',
          menuNodecode: '',
          menuProperty: 0,

          menuName: '',
          menuModule: '',
          menuIcon: '',
          menuShowinmenu: 0,
          menuOrder: ''
        }
      }
    },
    created() {
      if (!('menuParent' in this.originForm) && !('menuCode' in this.originForm)) {
        console.error('menuParent/menuCode 必填')
        this.$message.error('menuParent/menuCode 必填')
      }
      if ('menuCode' in this.originForm) {
        // 修改操作，拉取数据
        this.proxy(this, 'scscm/app/menuAjax!editTree.do', 'post', { menu: this.originForm }).then(x => this.form = x.data.menu)
      } else if (Object.keys(this.originForm).length > 0) {
        // 新增
        Object.keys(this.originForm).forEach(key => this.form[key] = this.originForm[key])
      }
    },
    methods: {
      async asyncSave() {
        try {
          let api = 'scscm/app/menuAjax!saveTree.do'
          if (this.form.menuCode) {
            api = 'scscm/app/menuAjax!updateTree.do'
          }
          const { data } = await this.proxy(this, api, 'post', { menu: this.form })
          if (data.map.state === '2') {
            this.$message.error(data.map.msg)
            return
          }
          this.$message.success('保存成功')
          this.$refs.dialogForm.resetFields()
          this.$emit('save', 'tree')
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
        this.$emit('cancel', 'tree')
      }
    }
  }
</script>
