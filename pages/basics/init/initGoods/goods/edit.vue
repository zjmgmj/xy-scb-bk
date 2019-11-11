<template lang="pug">
  el-form(ref="dialogForm", :model="form", :rules="rules", label-width="90px")
    .row
      .col(style="flex: 2;")
        el-form-item(label="货主", prop="companyCode")
          company-select(v-model="form.companyCode", typeStr="HZ", @change="syncName($event,'companyName','companyName')")
      .col
        el-form-item(label="仓库", prop="warehouseCode")
          goods-warehouse-select(v-model="form.warehouseCode", size="mini")
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
        el-form-item(label="数量", prop="goodsNum")
          el-input(v-model="form.goodsNum", clearable, size="mini", style="width: 125px;", @change="formatNum($event, '+0', 'form.goodsNum')")
          general-select.ml-5(
            v-model="form.partsnameNumunit",
            url="scscm/app/basicDdAjax!queryCombo.do",
            list-prop="ddList",
            code-prop="ddName",
            name-prop="ddName",
            :extraParam="{ddtypeClass: 'partsnameNumunit'}"
            placeholder="", size="mini", style="width: 66px;")
      .col
        el-form-item(label="重量", prop="goodsWeight")
          el-input(v-model="form.goodsWeight", clearable, size="mini", style="width: 125px;", @change="formatNum($event, '+4', 'form.goodsWeight')")
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
        el-form-item(label="计量方式", prop="goodsMetering")
          el-select.full-width(v-model="form.goodsMetering", clearable, size="mini")
            el-option(value="磅计")
            el-option(value="理计")
      .col
        el-form-item(label="件支数", prop="goodsPartsbranch")
          el-input.full-width(v-model="form.goodsPartsbranch", clearable, size="mini")
      .col
        el-form-item(label="卡号", prop="goodsContractstr3")
          el-input.full-width(v-model="form.goodsContractstr3", clearable, size="mini")
    .row
      .col
        el-form-item(label="库区", prop="goodsCodestr10")
          general-select(
            v-model="form.goodsCodestr10",
            url="scscm/app/wareplaceAjax!queryComboFilter.do",
            list-prop="wareplaceList",
            code-prop="wareplaceWregion",
            name-prop="wareplaceWregion",
            lazy,
            :extraParam="{ddtypeClass: 'goodsCodestr10',warehouseCode: form.warehouseCode}"
            @change="syncName($event,'wareplaceName','goodsCodestr1')"
            size="mini")
      .col
        el-form-item(label="库位", prop="goodsCodestr1")
          general-select(
            v-model="form.goodsCodestr1",
            url="scscm/app/wareplaceAjax!queryComboFilter.do",
            list-prop="wareplaceList",
            code-prop="wareplaceName",
            name-prop="wareplaceName",
            lazy,
            :extraParam="{ddtypeClass: 'goodsCodestr1', warehouseCode: form.warehouseCode, wareplaceWregion:form.goodsCodestr10}",
            @change="syncName($event,'wareplaceWregion','goodsCodestr10')"
            size="mini")
      .col
        el-form-item(label="层数", prop="goodsCodenum1")
          el-input.full-width(v-model="form.goodsCodenum1", clearable, size="mini")
    .row
      .col
        el-form-item(label="车皮号", prop="goodsContractstr2")
          general-select(
            v-model="form.goodsContractstr2",
            url="scscm/app/truckAjax!queryCombo.do",
            list-prop="list",
            code-prop="truckNumber",
            name-prop="truckNumber",
            size="mini")
      .col
        el-form-item(label="日期", prop="goodsInitDate")
          el-date-picker.full-width(v-model="form.goodsInitDate", type="date", size="mini", value-format="yyyy-MM-dd")
      .col
        el-form-item(label="原始日期", prop="originalEnterDate")
          el-date-picker.full-width(v-model="form.originalEnterDate", type="date", size="mini", value-format="yyyy-MM-dd")
    .row
      .col
        el-form-item(label="捆包号", prop="goodsCodestr2")
          el-input.full-width(v-model="form.goodsCodestr2", clearable, size="mini")
      .col
        el-form-item(label="业务机构", prop="orgCode")
          org-select(v-model="form.orgCode", clearable, disabled, size="mini", @change="syncName($event,'orgName','orgName')")
      .col
        el-form-item(label="业务部门", prop="deptCode")
          dept-select(v-model="form.deptCode", clearable, disabled, size="mini", @change="syncName($event,'deptName','deptName')")
    .row
      .col
        el-form-item(label="备注", prop="goodsInitRemark")
          el-input.full-width(v-model="form.goodsInitRemark", clearable, size="mini")
    el-form-item.text-right
      el-button(@click="cancel", size="small") 取消
      el-button(@click="save", type="primary", size="small") 确定
</template>
<script>
  import deptSelect from '@/components/select/deptSelect'
  import orgSelect from '@/components/select/orgSelect'
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
          return  {
            isNew: true,

            // TODO 这里要用登录账号所在的机构和部门
            deptCode: '',
            orgCode: '',
            goodsInitDate: new Date(),
            originalEnterDate: new Date(),
          }
        }
      }
    },
    data() {
      return {
        rules: {
          companyCode: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          warehouseCode: [
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
          goodsWeight: [
            { required: true, message: '请输入重量', trigger: 'blur' },
            { type: 'number', message: '必须大于0', min: 0.000001, transform: Number, trigger: 'blur' },
            {
              message: '请选择重量单位',
              validator: (rule, value, callback) => this.form.partsnameWeightunit ? callback() : callback(new Error())
            }
          ],
          goodsCodestr10: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          goodsCodestr1: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          goodsInitDate: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          originalEnterDate: [
            { required: true, message: '请选择', trigger: 'change' }
          ],
          deptCode: [
            { required: true, message: '请选择所属部门', trigger: 'change' }
          ],
          orgCode: [
            { required: true, message: '请选择所属机构', trigger: 'change' }
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
          let api = 'scscm/app/storageGoodsInitAjax!save.do'
          if (this.form.goodsCodebill) {
            api = 'scscm/app/storageGoodsInitAjax!update.do'
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
