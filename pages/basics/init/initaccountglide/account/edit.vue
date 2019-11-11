<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    .row
      .col
        el-form-item(label="账号", prop="inneraccountsCode")
          general-select(
            v-model="form.inneraccountsCode",
            url="scscm/app/inneraccountsAjax!queryCombo.do",
            list-prop="inneraccountsList",
            code-prop="inneraccountsCode",
            name-prop="inneraccountsCode",
            size="mini", @change="syncName($event,'innerbankName','innerbankName')")
      .col
        el-form-item(label="银行名称", prop="innerbankName")
          el-input.full-width(v-model="form.innerbankName", readonly, clearable, size="mini")
      .col
        el-form-item(label="结算方式", prop="ddTypeSettlement")
          general-select(
            v-model="form.ddTypeSettlement",
            url="scscm/app/basicDdAjax!queryCombo.do",
            list-prop="ddList",
            code-prop="ddName",
            name-prop="ddName",
            :extraParam="{ddtypeClass: 'ddTypeSettlementSdp'}"
            size="mini")
    .row
      .col
        el-form-item(label="币种", prop="ddTypeCurrency")
          general-select(
            v-model="form.ddTypeCurrency",
            url="scscm/app/currencyAjax!queryCombo.do",
            list-prop="currencyList",
            code-prop="currencyName",
            name-prop="currencyName",
            size="mini")
      .col
        el-form-item(label="收支方向", prop="accountinoutDirection")
          el-radio(v-model="form.accountinoutDirection", :label="1") 收入
          el-radio(v-model="form.accountinoutDirection", :label="0") 支出
      .col
        el-form-item(label="金额", prop="accountinoutMoney")
          el-input.full-width(v-model="form.accountinoutMoney", clearable, size="mini")
    .row
      .col
        el-form-item(label="业务机构", prop="orgCode")
          org-select(v-model="form.orgCode", clearable, size="mini", @change="syncName($event,'orgName','orgName')")
      .col
        el-form-item(label="业务部门", prop="deptCode")
          dept-select(v-model="form.deptCode", clearable, size="mini", @change="syncName($event,'deptName','deptName')")
      .col
        el-form-item(label="操作员", prop="operatorCode")
          operator-select(v-model="form.operatorCode", clearable, size="mini", @change="syncName($event,'operatorName','operatorName')")
    el-form-item(label="备注", prop="accountinoutRemark")
      el-input.full-width(v-model="form.accountinoutRemark", clearable, size="mini")
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  import deptSelect from '@/components/select/deptSelect'
  import orgSelect from '@/components/select/orgSelect'
  import operatorSelect from '@/components/select/operatorSelect'
  import generalSelect from '@/components/select/generalSelect'

  export default {
    components: {
      deptSelect,
      orgSelect,
      operatorSelect,
      generalSelect,
    },
    props: {
      form: {
        type: Object,
        default: () => {
          return {
            inneraccountsCode: '',
            innerbankName: '',
            ddTypeSettlement: '',
            ddTypeCurrency: '人民币',
            accountinoutDirection: 1,
            accountinoutMoney: '',
            accountinoutRemark: '',

            // TODO 这里要用登录账号所在的机构和部门
            deptCode: '',
            orgCode: '',
            operatorCode: '',
          }
        }
      }
    },
    data() {
      return {
        rules: {
          inneraccountsCode: [
            { required: true, message: '请选择账号', trigger: 'blur' }
          ],
          accountinoutMoney: [
            { required: true, message: '请输入金额', trigger: 'blur' }
          ],
          operatorCode: [
            { required: true, message: '请选择操作员', trigger: 'blur' }
          ],
          deptCode: [
            { required: true, message: '请选择所属部门', trigger: 'blur' }
          ],
          orgCode: [
            { required: true, message: '请选择所属机构', trigger: 'blur' }
          ]
        },
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.form.deptCode = '000003'
        this.form.orgCode = '000000'
        this.form.operatorCode = '0000'
      })
    },
    methods: {
      syncName(e, fromKey, toKey) {
        this.form[toKey] = e[fromKey]
      },
      async asyncSave() {
        try {
          let api = 'scscm/app/accountBalanceInitAjax!save.do'
          if (this.form.accountinoutId) {
            api = 'scscm/app/accountBalanceInitAjax!update.do'
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
