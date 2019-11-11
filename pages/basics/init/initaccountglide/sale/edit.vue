<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    .row
      .col(style="flex: 2;")
        el-form-item(label="结算单位", prop="datasBalcorp")
          company-select(v-model="form.datasBalcorp", typeStr="GYS", @change="syncName($event,'companyName','datasBalcorpname')")
      .col
        el-form-item(label="日期", prop="accountglideDate")
          el-date-picker.full-width(v-model="form.accountglideDate", type="date", placeholder="选择日期", size="mini")
    .row
      .col(style="flex: 2;")
        el-form-item(label="余额", prop="accountglideMoney")
          el-input.full-width(v-model="form.accountglideMoney", clearable, size="mini",@change="formatNum($event, '+2', 'form.accountglideMoney')")
      .col
        el-form-item(label-width="70px", prop="accountglideFundflag")
          el-checkbox(v-model="form.accountglideFundflag", :true-label="1", :false-label="0") 费用
    .row
      .col
        el-form-item(label="业务机构", prop="orgCode")
          org-select(v-model="form.orgCode", clearable, size="mini", @change="syncName($event,'orgName','orgName')")
      .col
        el-form-item(label="业务部门", prop="deptCode")
          dept-select(v-model="form.deptCode", clearable, size="mini", @change="syncName($event,'deptName','deptName')")
      .col
        el-form-item(label="业务员", prop="employeeCode")
          employee-select(v-model="form.employeeCode", clearable, size="mini", @change="syncName($event,'employeeName','employeeName')")
    el-form-item(label="备注", prop="accountglideRemark")
      el-input.full-width(v-model="form.accountglideRemark", clearable, size="mini")
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  import deptSelect from '@/components/select/deptSelect'
  import orgSelect from '@/components/select/orgSelect'
  import companySelect from '@/components/select/companySelect'
  import employeeSelect from '@/components/select/employeeSelect'

  export default {
    components: {
      deptSelect,
      orgSelect,
      companySelect,
      employeeSelect
    },
    props: {
      form: {
        type: Object,
        default: () => {
          return {
            datasBalcorp: '',
            accountglideDate: new Date(),
            accountglideMoney: '',
            accountglideFundflag: 0,
            // TODO 这里要用登录账号所在的机构和部门
            orgCode: '',
            deptCode: '',
            employeeCode: '',
            accountinoutRemark: ''
          }
        }
      }
    },
    data() {
      return {
        rules: {
          datasBalcorp: [
            { required: true, message: '请选择', trigger: 'blur' }
          ],
          accountglideDate: [
            { required: true, message: '请选择', trigger: 'blur' }
          ],
          accountglideMoney: [
            { required: true, message: '请输入余额', trigger: 'blur' }
          ],
          deptCode: [
            { required: true, message: '请选择所属部门', trigger: 'blur' }
          ],
          orgCode: [
            { required: true, message: '请选择所属机构', trigger: 'blur' }
          ],
          employeeCode: [
            { required: true, message: '请选择业务员', trigger: 'blur' }
          ]
        },
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.form.deptCode = '000003'
        this.form.orgCode = '000000'

      })
    },
    methods: {
      syncName(e, fromKey, toKey) {
        this.form[toKey] = e[fromKey]
      },
      async asyncSave() {
        try {
          let api = 'scscm/app/saleInitAjax!save.do'
          if (this.form.accountglideId) {
            api = 'scscm/app/saleInitAjax!update.do'
          }
          const { data } = await this.proxy(this, api, 'post', { mod: this.form })
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
