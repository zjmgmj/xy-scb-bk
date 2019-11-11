<template lang="pug">
el-form(ref="dialogForm", :model="form", :rules="rules" label-width="90px")
  el-row
    el-col(:span="6")
      el-form-item(label="姓名", prop="employeeName")
        el-input.full-width(v-model="form.employeeName", clearable, size="mini")
    el-col(:span="6")
      el-form-item(label="机构", prop="orgCode")
        org-select(v-model="form.orgCode", @change="syncName($event,'orgName','orgName')")
    el-col(:span="6")
      el-form-item(label="部门", prop="deptCode")
        dept-select(v-model="form.deptCode", @change="syncName($event,'deptName','deptName')")
    el-col(:span="6")
      el-form-item(label="助记码")
        el-input.full-width(v-model="form.employeeMnemcode", clearable, size="mini")
  el-row
    el-col(:span="6")
      el-form-item(label="员工类别")
        basic-select(v-model="form.employeeClass", :ddtypeClass="'employeeClass'", @change="syncName($event, 'ddName', 'employeeClass')")
    el-col(:span="6")
      el-form-item(label="职位")
        basic-select(v-model="form.employeeJob", :ddtypeClass="'employeeJob'", @change="syncName($event, 'ddName', 'employeeJob')")
    el-col(:span="6")
      el-form-item(label="专业")
        basic-select(v-model="form.employeeSpecialty", :ddtypeClass="'employeeSpecialty'", @change="syncName($event, 'ddName', 'employeeSpecialty')")
    el-col(:span="6")
      el-form-item(label="职称")
        basic-select(v-model="form.employeeTechnical", :ddtypeClass="'employeeTechnical'", @change="syncName($event, 'ddName', 'employeeTechnical')")
  el-row
    el-col(:span="6")
      el-form-item(label="性别")
        el-radio-group(v-model="form.employeeSex")
          el-radio(label="男")
          el-radio(label="女")
    el-col(:span="6")
      el-form-item(label="学历")
        basic-select(v-model="form.employeeDegree", :ddtypeClass="'employeeDegree'", @change="syncName($event, 'ddName', 'employeeDegree')")
    el-col(:span="6")
      el-form-item(label="政治面貌")
        basic-select(v-model="form.employeeParty", :ddtypeClass="'employeeParty'", @change="syncName($event, 'ddName', 'employeeParty')")
    el-col(:span="6")
      el-form-item(label="名族")
        basic-select(v-model="form.employeeNation", :ddtypeClass="'employeeNation'", @change="syncName($event, 'ddName', 'employeeNation')")
  el-row
    el-col(:span="6")
      el-form-item(label="籍贯")
        el-input.full-width(v-model="form.employeeNative", clearable, size="mini")
    el-col(:span="6")
      el-form-item(label="婚姻")
        el-radio-group(v-model="form.employeeMarriage")
          el-radio(label="未婚")
          el-radio(label="已婚")
    el-col(:span="6")
      el-form-item(label="出生日期")
        el-date-picker.full-width(v-model="form.employeeBirthday", type="date", placeholder="选择日期", size="mini")
    el-col(:span="6")
      el-form-item(label="入职时间")
        el-date-picker.full-width(v-model="form.employeeJoindate", type="date", placeholder="选择日期", size="mini")
  el-row
    el-col(:span="12")
      el-form-item(label="电子邮箱")
        el-input.full-width(v-model="form.employeeEmail", clearable, size="mini")
    el-col(:span="6")
      el-form-item(label="电话")
        el-input.full-width(v-model="form.employeePhone", clearable, size="mini")
    el-col(:span="6")
      el-form-item(label="手机")
        el-input.full-width(v-model="form.employeeMobile", clearable, size="mini")
  el-row
    el-col(:span="12")
      el-form-item(label="身份证号")
        el-input.full-width(v-model="form.employeeIdcard", clearable, size="mini")
    el-col(:span="6")
      el-form-item(label="工种名称")
        basic-select(v-model="form.worktypeName", :ddtypeClass="'worktypeName'", @change="syncName($event, 'ddName', 'worktypeName')")
    el-col(:span="6")
      el-form-item(label="状态")
        el-radio-group(v-model="form.employeeState")
          el-radio(:label="0") 启用
          el-radio(:label="1") 停用
  el-form-item(label="家庭住址")
    el-input.full-width(v-model="form.employeeAddr", clearable, size="mini")
  el-form-item(label="备注")
    el-input.full-width(v-model="form.employeeRemark", clearable, size="mini")
  el-form-item.text-right
    el-button(@click="cancel", size="small") 取消
    el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
import orgSelect from '@/components/select/orgSelect'
import deptSelect from '@/components/select/deptSelect'
import basicSelect from '@/components/select/basicSelect'
export default {
  components: {
    orgSelect,
    deptSelect,
    basicSelect
  },
  props: {
    form: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data () {
    return {
      rules: {
        employeeName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        orgCode: [{ required: true, message: '请输入机构' }],
        deptCode: [{ required: true, message: '请输入部门' }]
      }
    }
  },
  methods: {
    syncName(e, fromKey, toKey) {
      console.log('e', e)
      console.log('fromKey', fromKey)
      console.log('toKey', toKey)
      this.form[toKey] = e[fromKey]
    },
    async saveAsync () {
      try {
        let api = 'scscm/app/employeeAjax!save.do'
        if (this.form.employeeCode) {
          api = 'scscm/app/employeeAjax!update.do'
        }
        const { data } = await this.proxy(this, api, 'post', this.paramsFormat('basicEmployee', this.form))
        if (data.map.state === "2") {
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
    save () {
      this.$refs.dialogForm.validate((valid) => {
        if (valid) {
          this.saveAsync()
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    cancel () {
      this.$refs.dialogForm.resetFields()
      this.$emit('cancel')
    }
  }
}
</script>
