<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="80px")
    .row
      .col
        el-form-item(label="名称", prop="permissionName")
          el-input.full-width(v-model="form.permissionName", clearable, size="mini")
      .col
        el-form-item(label="应用", prop="applicationCode")
          el-input.full-width(v-model="form.applicationCode", clearable, size="mini")
    .row
      .col
        el-form-item(label="菜单", prop="permissionShowinmenu")
          el-radio(v-model="form.permissionShowinmenu", :label="0") 是
          el-radio(v-model="form.permissionShowinmenu", :label="1") 否
      .col
        el-form-item(label="状态", prop="permissionState")
          el-radio(v-model="form.permissionState", :label="0") 启用
          el-radio(v-model="form.permissionState", :label="1") 停用
    .row
      .col
        el-form-item(label="链接地址", prop="permissionJspath")
          el-input.full-width(v-model="form.permissionJspath", clearable, size="mini")
    .row
      .col
        el-form-item(label="链接方式", prop="permissionShowmode")
          el-radio(v-model="form.permissionShowmode", :label="0") tabpanel
          el-radio(v-model="form.permissionShowmode", :label="1") window
          el-radio(v-model="form.permissionShowmode", :label="2") url
    .row
      .col
        el-form-item(label="授权方式", prop="permissionSort")
          el-radio(v-model="form.permissionSort", :label="0") 操作员
          el-radio(v-model="form.permissionSort", :label="1") 登录
          el-radio(v-model="form.permissionSort", :label="2") 管理员
          el-radio(v-model="form.permissionSort", :label="3") 系统管理员
    .row
      .col
        el-form-item(label="类型", prop="permissionType")
          el-select.full-width(v-model="form.permissionType", placeholder="请选择", size="mini")
            el-option(label="单据", value="0")
            el-option(label="报表", value="1")
            el-option(label="自定义报表", value="2")
      .col
        el-form-item(label="顺序", prop="permissionOrder")
          el-input.full-width(v-model="form.permissionOrder", clearable, size="mini")
    .row
      .col
        el-form-item(label="单据类型", prop="billtypeCode")
          el-input.full-width(v-model="form.billtypeCode", clearable, size="mini")
      .col
        el-form-item(label="模块", prop="menuModule")
          el-input.full-width(v-model="form.menuModule", clearable, size="mini")
    .row
      .col
        el-form-item(label="父菜单", prop="menuCode")
          el-cascader.full-width(
            v-model="form.menuCode",
            :options="menuTree"
            :props="{ checkStrictly: true, emitPath: false, label: 'text', value: 'id' }"
            clearable,
            size="mini")
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
          permissionName: [
            { required: true, message: '请输入', trigger: 'blur' }
          ],
          menuCode: [
            { required: true, message: '请输入' }
          ]
        },
        menuTree: [],
        form: {
          permissionCode:'',
          menuNodecode:'',
          menuProperty:0,
          permissionName: '',
          applicationCode: '',
          permissionShowinmenu: 0,
          permissionState: 0,
          permissionJspath: '',
          permissionShowmode: 0,
          permissionSort: 0,
          permissionType: '',
          permissionOrder: '',
          billtypeCode: '',
          menuModule: '',
          menuCode: ''
        }
      }
    },
    created() {
      this.refreshTree()
      Object.keys(this.originForm).forEach(key => this.form[key] = this.originForm[key])
    },
    methods: {
      async refreshTree() {
        const { data } = await this.proxy(this, 'scscm/app/menuAjax!queryTree.do', 'get', { menuParent: 'root' })
        const fun = obj => {
          if ('children' in obj) {
            if (obj.children.length === 0) delete obj.children
            else obj.children.forEach(fun)
          }
        }
        const list = data.children
        list.forEach(fun)
        this.menuTree = list
      },
      async asyncSave() {
        try {
          let api = 'scscm/app/menuAjax!save.do'
          if (this.form.permissionId) {
            api = 'scscm/app/menuAjax!update.do'
          }
          const { data } = await this.proxy(this, api, 'post', { permission: this.form })
          if (data.map.state === '2') {
            this.$message.error(data.map.msg)
            return
          }
          this.$message.success('保存成功')
          this.$refs.dialogForm.resetFields()
          this.$emit('save', 'edit')
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
        this.$emit('cancel', 'edit')
      }
    }
  }
</script>
