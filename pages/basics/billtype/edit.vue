<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="110px")
    .row
      .col
        el-form-item(label="代码", prop="billtypeCode")
          el-input.full-width(v-model="form.billtypeCode", clearable, readonly, size="mini")
      .col
        el-form-item(label="名称", prop="billtypeName")
          el-input.full-width(v-model="form.billtypeName", clearable, size="mini")
    .row
      .col
        el-form-item(label="关账控制", prop="billtypeClose")
          el-radio(v-model="form.billtypeClose", :label="1") 否
          el-radio(v-model="form.billtypeClose", :label="0") 是
      .col
        el-form-item(label="审核后打印", prop="billtypeCheckprint")
          el-radio(v-model="form.billtypeCheckprint", :label="0") 否
          el-radio(v-model="form.billtypeCheckprint", :label="1") 是
    .row
      .col
        el-form-item(label="审核控制", prop="billtypeCheck")
          el-radio(v-model="form.billtypeCheck", :label="0") 停用
          el-radio(v-model="form.billtypeCheck", :label="1") 启用
      .col
        el-form-item(label="审核模式", prop="billtypeCheckmode")
          el-radio(v-model="form.billtypeCheckmode", :label="0") 逐级
          el-radio(v-model="form.billtypeCheckmode", :label="1") 并级
    .row
      .col
        el-form-item(label="EDI同步", prop="ediSyn")
          el-radio(v-model="form.ediSyn", :label="0") 停用
          el-radio(v-model="form.ediSyn", :label="1") 启用
      .col
    .row
      .col
        el-form-item(label="单据号字段", prop="billcodeColumn", label-width="110px")
          el-input.full-width(v-model="form.billcodeColumn", clearable, size="mini")
      .col
        el-form-item(label="单据主表", prop="billcodeTable", label-width="110px")
          el-input.full-width(v-model="form.billcodeTable", clearable, size="mini")
      .col
        el-form-item(label="打印次数", prop="billtypePrintnum", label-width="110px")
          el-input.full-width(v-model.number="form.billtypePrintnum", clearable, size="mini")
    el-form-item(label="单据地址", prop="billtypeOtherjspath", label-width="110px")
      el-input.full-width(v-model="form.billtypeOtherjspath", clearable, size="mini")
    el-form-item(label="备注", prop="billtypeRemark", label-width="110px")
      el-input.full-width(v-model="form.billtypeRemark", clearable, size="mini")
    .mt-10.ft-16.border-bottom-line.pb-10 单据号生成规则设置
    .row
      el-form-item(label="生成模式", prop="billtypeBillcodemode")
        el-radio(v-model="form.billtypeBillcodemode" :label="0") 自动
        el-radio(v-model="form.billtypeBillcodemode" :label="1") 手动
    .row
      .col
        el-form-item(label="标识符", prop="billtypeBillcodemark")
          el-input.full-width(v-model="form.billtypeBillcodemark", clearable, size="mini")
      .col
        el-form-item(label="流水号长度", prop="billtypeBillcodidlength")
          el-input.full-width(v-model.number="form.billtypeBillcodidlength", clearable, size="mini")
    .row
      .col
        el-form-item(label="机构长度", prop="billtypeFgslength")
          el-input.full-width(v-model.number="form.billtypeFgslength", clearable, size="mini")
      .col
        el-form-item(label="机构顺序", prop="billtypeFgssort")
          el-input.full-width(v-model.number="form.billtypeFgssort", clearable, size="mini")
    .row
      .col
        el-form-item(label="部门长度", prop="billtypeDeptlength")
          el-input.full-width(v-model.number="form.billtypeDeptlength", clearable, size="mini")
      .col
        el-form-item(label="部门顺序", prop="billtypeDeptsort")
          el-input.full-width(v-model.number="form.billtypeDeptsort", clearable, size="mini")
    .row
      .col
        el-form-item(label="操作员长度", prop="billtypeOperatorlength")
          el-input.full-width(v-model.number="form.billtypeOperatorlength", clearable, size="mini")
      .col
        el-form-item(label="操作员顺序", prop="billtypeOperatorsort")
          el-input.full-width(v-model.number="form.billtypeOperatorsort", clearable, size="mini")
    .row
      .col
        el-form-item(label="业务员长度", prop="billtypeEmployeelength")
          el-input.full-width(v-model.number="form.billtypeEmployeelength", clearable, size="mini")
      .col
        el-form-item(label="业务员顺序", prop="billtypeEmployeesort")
          el-input.full-width(v-model.number="form.billtypeEmployeesort", clearable, size="mini")
    <!--.row-->
      <!--.col-->
        <!--el-form-item(label="日期长度", prop="billtypeDatelength")-->
          <!--el-input.full-width(v-model="form.billtypeDatelength", clearable, size="mini")-->
      <!--.col-->
        <!--el-form-item(label="日期顺序", prop="billtypeDatesort")-->
          <!--el-input.full-width(v-model="form.billtypeDatesort", clearable, size="mini")-->
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
          return {}
        }
      }
    },
    data() {
      return {
        rules: {
          billtypeCode: [
            { required: true, message: '代码不能为空', trigger: 'blur' }
          ],
          billtypeName: [
            { required: true, message: '请输入名称', trigger: 'blur' }
          ],
          billcodeColumn: [
            { required: true, message: '请输入单据号字段', trigger: 'blur' }
          ],
          billcodeTable: [
            { required: true, message: '请输入单据主表', trigger: 'blur' }
          ],
          billtypePrintnum: [
            { required: true, message: '请输入打印次数', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
          billtypeBillcodemark: [
            { required: true, message: '请输入标识符', trigger: 'blur' }
          ],
          billtypeBillcodidlength: [
            { required: true, message: '请输入流水号长度', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
          billtypeFgslength: [
            { required: true, message: '请输入机构长度', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
          billtypeFgssort: [
            { required: true, message: '请输入机构顺序', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
          billtypeDeptlength: [
            { required: true, message: '请输入部门长度', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
          billtypeDeptsort: [
            { required: true, message: '请输入部门顺序', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
          billtypeOperatorlength: [
            { required: true, message: '请输入操作员长度', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
          billtypeOperatorsort: [
            { required: true, message: '请输入操作员顺序', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
          billtypeEmployeelength: [
            { required: true, message: '请输入业务员长度', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
          billtypeEmployeesort: [
            { required: true, message: '请输入业务员顺序', trigger: 'blur' },
            { type: 'number', message: '必须为数字', trigger: 'blur' },
            { type: 'number', min: 0, message: '不能小于0', trigger: 'blur' },
          ],
        }
      }
    },
    methods: {
      async asyncSave() {
        try {
          const api = 'scscm/app/billtypeAjax!update.do'
          const { data } = await this.proxy(this, api, 'post', { billtype: this.form })
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
