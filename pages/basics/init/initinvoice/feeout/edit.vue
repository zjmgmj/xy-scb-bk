<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    .row
      .col
        el-form-item(label="日期", prop="unmakeDate")
          el-date-picker.full-width(v-model="form.unmakeDate", type="date", size="mini", value-format="yyyy-MM-dd")
      .col(style="flex: 2;")
        el-form-item(label="结算单位", prop="datasCustomer")
          company-select(v-model="form.datasCustomer", typeStr="FYDW", @change="syncName($event,'companyName','datasCustomername')")
    .row
      .col(style="flex: 2;")
        el-form-item(label="费用名称", prop="feeitemName")
          general-select.ml-5(
            v-model="form.feeitemName",
            url="scscm/app/feeitemAjax!queryComboFilter.do",
            list-prop="feeitemList",
            code-prop="feeitemName",
            name-prop="feeitemName",
            size="mini", @change="changeFee")
      .col
        el-form-item(label="费用类别", prop="feeclassName")
          el-input.full-width(v-model="form.feeclassName", readonly, size="mini")
    .row
      .col
        el-form-item(label="品名", prop="partsnameName")
          goods-name-select(v-model="form.partsnameName", :useName="true", clearable, size="mini", @change="changeGoods")
      .col
        el-form-item(label="材质", prop="goodsMaterial")
          goods-material-select(v-model="form.goodsMaterial", clearable, size="mini")
      .col
        el-form-item(label="规格", prop="goodsSpec")
          goods-spec-select(v-model="form.goodsSpec", clearable, size="mini")
    .row
      .col
        el-form-item(label="产地", prop="productareaName")
          goods-area-select(v-model="form.productareaName", :useName="true", clearable, size="mini")
      .col
        el-form-item(label="数量", prop="dataBnum")
          el-input(v-model="form.dataBnum", clearable, size="mini", style="width: 92px;", @change="formatNum($event, '+0', 'form.dataBnum')")
          general-select.ml-5(
            v-model="form.partsnameNumunit",
            url="scscm/app/basicDdAjax!queryCombo.do",
            list-prop="ddList",
            code-prop="ddName",
            name-prop="ddName",
            :extraParam="{ddtypeClass: 'partsnameNumunit'}"
            placeholder="", size="mini", style="width: 66px;")
      .col
        el-form-item(label="重量", prop="dataBweight")
          el-input(v-model="form.dataBweight", clearable, size="mini", style="width: 92px;", @change="formatNum($event, '+4', 'form.dataBweight')")
          general-select.ml-5(
            v-model="form.partsnameWeightunit",
            url="scscm/app/basicDdAjax!queryCombo.do",
            list-prop="ddList",
            code-prop="ddName",
            name-prop="ddName",
            :extraParam="{ddtypeClass: 'partsnameWeightunit'}"
            placeholder="", size="mini", style="width: 66px;")
    .row
      .col
        el-form-item(label="含税单价", prop="goodsInprice")
          el-input.full-width(v-model="form.goodsInprice", clearable, size="mini", @change="formatNum($event, '+2', 'form.goodsInprice', calculatePriceMoney)")
      .col
        el-form-item(label="含税金额", prop="goodsInmoney")
          el-input.full-width(v-model="form.goodsInmoney", clearable, size="mini", @change="formatNum($event, '+2', 'form.goodsInmoney', calculatePriceMoney)")
      .col
        el-form-item(label="税率", prop="goodsTaxrate")
          el-input.full-width(v-model="form.goodsTaxrate", clearable, size="mini", @change="formatNum($event, '+2', 'form.goodsTaxrate', calculatePriceMoney)")
    .row
      .col
        el-form-item(label="无税单价", prop="goodsExprice")
          el-input.full-width(v-model="form.goodsExprice", clearable, size="mini", @change="formatNum($event, '+6', 'form.goodsExprice', calculatePriceMoney)")
      .col
        el-form-item(label="无税金额", prop="goodsExmoney")
          el-input.full-width(v-model="form.goodsExmoney", clearable, size="mini", @change="formatNum($event, '+2', 'form.goodsExmoney', calculatePriceMoney)")
      .col
        el-form-item(label="税额", prop="goodsTaxmoney")
          el-input.full-width(v-model="form.goodsTaxmoney", clearable, readonly, size="mini", @change="formatNum($event, '+2', 'form.goodsTaxmoney', calculatePriceMoney)")
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
    .row
      .col(style="flex: 2;")
        el-form-item(label="备注", prop="unmakeInitRemark")
          el-input.full-width(v-model="form.unmakeInitRemark", clearable, size="mini")
      .col
        el-form-item(label="制单人", prop="operatorCode")
          operator-select(v-model="form.operatorCode", clearable, disabled, size="mini", @change="syncName($event,'operatorName','operatorName')")
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  import deptSelect from '@/components/select/deptSelect'
  import orgSelect from '@/components/select/orgSelect'
  import employeeSelect from '@/components/select/employeeSelect'
  import operatorSelect from '@/components/select/operatorSelect'
  import companySelect from '@/components/select/companySelect'
  import goodsNameSelect from '@/components/select/goodsNameSelect'
  import goodsSpecSelect from '@/components/select/goodsSpecSelect'
  import goodsMaterialSelect from '@/components/select/goodsMaterialSelect'
  import goodsAreaSelect from '@/components/select/goodsAreaSelect'
  import goodsWarehouseSelect from '@/components/select/goodsWarehouseSelect'
  import generalSelect from '@/components/select/generalSelect'

  export default {
    components: {
      deptSelect,
      orgSelect,
      employeeSelect,
      operatorSelect,
      companySelect,
      goodsNameSelect,
      goodsSpecSelect,
      goodsMaterialSelect,
      goodsAreaSelect,
      goodsWarehouseSelect,
      generalSelect
    },
    props: {
      form: {
        type: Object,
        default: () => {
          return {
            unmakeDate: new Date(),
            datasCustomer: '',
            datasCustomername:'',
            feeitemName:'',
            feeclassName: '',

            partsnameName:'',
            goodsMaterial:'',
            goodsSpec:'',
            productareaName:'',
            partsnameNumunit:'',
            partsnameWeightunit:'',
            unmakeInitRemark: '',

            goodsTaxrate: 0.17,
            goodsInprice:0,
            goodsInmoney:0,
            goodsExprice: 0,
            goodsExmoney: 0,
            goodsTaxmoney: 0,
            dataBnum: 0,
            dataBweight: 0,

            // TODO 这里要用登录账号所在的机构和部门
            orgCode: '',
            deptCode: '',
            operatorCode: '',
            employeeCode: '',
          }
        }
      }
    },
    data() {
      return {
        rules: {
          unmakeDate: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          datasCustomer: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          feeitemName: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          partsnameName: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          goodsMaterial: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          goodsSpec: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          productareaName: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          dataBweight: [
            { required: true, message: '请输入重量', trigger: 'blur' },
            { type: 'number', message: '必须大于0', min: 0.000001, transform: Number, trigger: 'blur' },
            {
              message: '请选择重量单位',
              validator: (rule, value, callback) => this.form.partsnameWeightunit ? callback() : callback(new Error())
            }
          ],
          goodsInprice: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          goodsInmoney: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          deptCode: [
            { required: true, message: '请选择所属部门', trigger: 'change' }
          ],
          orgCode: [
            { required: true, message: '请选择所属机构', trigger: 'change' }
          ],
          employeeCode: [
            { required: true, message: '请选择业务员', trigger: 'change' }
          ]
        },
      }
    },
    created() {
      // 特殊处理为null的情况
      if (!this.form.partsnameNumunit) this.form.partsnameNumunit = ''
    },
    mounted() {
      this.$nextTick(() => {
        this.form.deptCode = '000003'
        this.form.orgCode = '000000'
        this.form.operatorCode = '0001'

      })
    },
    methods: {
      syncName(e, fromKey, toKey) {
        this.form[toKey] = e[fromKey]
      },
      changeFee(obj) {
        this.form.goodsTaxrate = obj.goodsTaxrate
        this.form.feeclassName = obj.feeclassName
        this.form.goodsInprice = obj.feeitemInprice
        this.calculatePriceMoney()
      },
      calculatePriceMoney(val){
        // TODO 计算税率，公共方法
      },
      changeGoods(obj) {
        this.form.pntreeName = obj.pntreeName
        this.form.industryCode = obj.industryCode
        this.form.goodsPriceun = obj.goodsPriceun
        this.form.goodsPiecemode = obj.goodsPiecemode
        this.form.goodsWeightmode = obj.goodsWeightmode
        this.form.goodsMetering = obj.goodsMetering
        this.form.goodsProperty = obj.goodsProperty
      },
      async asyncSave() {
        try {
          let api = 'scscm/app/invoiceFeeoutInitAjax!save.do'
          if (this.form.unmakeInitId) {
            api = 'scscm/app/invoiceFeeoutInitAjax!update.do'
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
