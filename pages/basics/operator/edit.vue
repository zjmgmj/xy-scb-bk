<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    .row
      .col
        el-form-item(label="职员", prop="employeeCode")
          employee-select(v-model="form.employeeCode", @change="changeEmployee")
      .col
        el-form-item(label="用户名称", prop="operatorUser")
          el-input.full-width(v-model="form.operatorUser", clearable, size="mini")
    .row
      .col
        el-form-item(label="账号", prop="operatorUserid")
          el-input.full-width(v-model="form.operatorUserid", clearable, size="mini")
      .col
        el-form-item(label="密码", prop="tempPassword", :rules="passwordRule")
          el-input.full-width(v-model="form.tempPassword", show-password, clearable, size="mini", :maxlength="18", :minlength="6")
    .row
      .col
        el-form-item(label="昵称", prop="operatorNickname")
          el-input.full-width(v-model="form.operatorNickname", clearable, size="mini")
      .col
        el-form-item(label="手机号", prop="operatorMobile")
          el-input.full-width(v-model="form.operatorMobile", clearable, size="mini")
    .row
      .col
        el-form-item(label="所属部门", prop="deptCode")
          dept-select(v-model="form.deptCode", @change="changeDept")
      .col
        el-form-item(label="登录失败次数", prop="operatorFailnum", label-width="110px")
          el-input.full-width(v-model="form.operatorFailnum", clearable, size="mini")
    .row
      .col
        el-form-item(label="所属机构", prop="orgCode")
          org-select(v-model="form.orgCode", @change="changeOrg")
      .col
        el-form-item(label="身份", prop="operatorIdentity")
          el-radio(v-model="form.operatorIdentity", :label="0") 用户
          el-radio(v-model="form.operatorIdentity", :label="1") 管理员
          el-radio(v-model="form.operatorIdentity", :label="2") 系统管理员
    .row
      .col
        el-form-item(label="角色", prop="roleCodelist")
          role-select(v-model="roleList", @change="changeRole")
      .col
        el-form-item(label="状态", prop="operatorState")
          el-radio(v-model="form.operatorState" :label="0") 启用
          el-radio(v-model="form.operatorState" :label="1") 停用
    .row
      .col
        el-form-item(label="NC代码", prop="feeitemName")
          el-input.full-width(v-model="form.feeitemName", clearable, size="mini")
      .col
        el-form-item(label="PDA操作", prop="pdauserState")
          el-radio(v-model="form.pdauserState" :label="0") 未启用
          el-radio(v-model="form.pdauserState" :label="1") 启用
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  import employeeSelect from '@/components/select/employeeSelect'
  import deptSelect from '@/components/select/deptSelect'
  import orgSelect from '@/components/select/orgSelect'
  import roleSelect from '@/components/select/roleSelect'

  export default {
    components: { employeeSelect, deptSelect, orgSelect, roleSelect },
    props: {
      form: {
        type: Object,
        default: () => {
          return  {
            isNew: true,

            employeeCode: '',
            operatorUser: '',
            operatorUserid: '',
            tempPassword: '',
            operatorNickname: '',
            operatorMobile: '',
            deptCode: '',
            orgCode: '',
            operatorFailnum: 0,
            operatorIdentity: 0,
            roleCodelist: '',
            operatorState: 0,
            feeitemName: '',
            pdauserState: 0
          }
        }
      }
    },
    data() {
      return {
        rules: {
          employeeCode: [
            { required: true, message: '请选择职员', trigger: 'blur' }
          ],
          operatorUser: [
            { required: true, message: '请输入用户名称', trigger: 'blur' }
          ],
          operatorUserid: [
            { required: true, message: '请输入账号', trigger: 'blur' }
          ],
          deptCode: [
            { required: true, message: '请选择所属部门', trigger: 'blur' }
          ],
          orgCode: [
            { required: true, message: '请选择所属机构', trigger: 'blur' }
          ]
        }
      }
    },
    computed: {
      passwordRule() {
        if (this.form.isNew) {
          return [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, message: '密码不能小于6位', trigger: 'blur' },
            { max: 18, message: '密码不能大于18位', trigger: 'blur' }
          ]
        }
        return {}
      },
      roleList: {
        get() {
          if ('roleCodelist' in this.form && this.form.roleCodelist) {
            return this.form.roleCodelist.split(',').map(x => x.trim())
          } else {
            return []
          }
        },
        set(newVal) {
          if (newVal && newVal.length > 0) {
            this.form.roleCodelist = newVal.join(',')
          } else {
            this.form.roleCodelist = ''
          }
        }
      }
    },
    mounted() {
    },
    methods: {
      changeEmployee(emp) {
        console.log(emp)
        if (emp.employeeName) this.form.operatorUser = emp.employeeName
        if (emp.orgCode) this.form.orgCode = emp.orgCode
        if (emp.deptCode) this.form.deptCode = emp.deptCode
        if (emp.employeeMobile) this.form.operatorMobile = emp.employeeMobile
      },
      changeDept(dept) {
        console.log(dept)
      },
      changeOrg(org) {
        console.log(org)
      },
      changeRole(role) {
        console.log(role)
      },
      async asyncSave() {
        try {
          let api = 'scscm/app/operatorAjax!save.do'
          if (this.form.operatorCode) {
            api = 'scscm/app/operatorAjax!update.do'
          }
          delete this.form.tempRoleCodelist
          delete this.form.roleListName
          const { data } = await this.proxy(this, api, 'post', { operator: this.form })
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
