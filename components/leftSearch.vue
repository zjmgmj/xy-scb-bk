<template lang="pug">
  .content.mt-15
    el-form(inline, :model="formItemModel", ref="searchForm", :label-width="labelWidth")
      template(v-for="item in formItem")
        template(v-if="item.type==='hidden'")
        el-form-item.mb-10.mr-10.ml-5(:label="item.lbl", clearable, :key="item.prop", v-else)
          template(v-if="item.type === 'select'")
            el-select.full-width(
              v-model="formItemModel[item.prop]",
              clearable,
              filterable,
              :placeholder="item.placeholder",
              size="small")
              el-option(
                v-for="opt in item.list",
                :key="opt[item.valueKey ? item.valueKey : 'value']",
                :label="opt[item.labelKey ? item.labelKey : 'label']",
                :value="opt[item.valueKey ? item.valueKey : 'value']")
          el-date-picker.full-width(v-model="formItemModel[item.prop]", type="date", v-else-if="item.type === 'date'", :placeholder="item.placeholder", size="small", value-format="yyyy-MM-dd")
          el-date-picker.full-width(v-model="formItemModel[item.prop]", type="datetime", v-else-if="item.type === 'datetime'", :placeholder="item.placeholder", size="small", :format="item.format ? item.format : 'yyyy-MM-dd HH:mm'", :value-format="item.format ? item.format : 'yyyy-MM-dd HH:mm:ss'")
          el-date-picker.full-width.crm-timeLimit(v-model="formItemModel[item.prop]", type="datetimerange", v-else-if="item.type === 'datetimerange'", range-separator="-", start-placeholder="开始日期", end-placeholder="结束日期", size="small", :format="item.format ? item.format : 'yyyy-MM-dd HH:mm:ss'", :value-format="item.format ? item.format : 'yyyy-MM-dd HH:mm:ss'")
          employee-select(v-model="formItemModel[item.prop]", size="small", v-else-if="item.type==='employee'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          operator-select(v-model="formItemModel[item.prop]", size="small", v-else-if="item.type==='operator'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          dept-select(v-model="formItemModel[item.prop]", size="small", v-else-if="item.type==='dept'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          org-select(v-model="formItemModel[item.prop]", size="small", v-else-if="item.type==='org'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          company-select(v-model="formItemModel[item.prop]", :typeStr="item.typeStr", size="small", v-else-if="item.type==='company'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          goods-name-select(v-model="formItemModel[item.prop]", :useName="item.useName", size="small", v-else-if="item.type==='goods'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          goods-spec-select(v-model="formItemModel[item.prop]", size="small", v-else-if="item.type==='spec'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          goods-material-select(v-model="formItemModel[item.prop]", size="small", v-else-if="item.type==='material'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          goods-area-select(v-model="formItemModel[item.prop]", :useName="item.useName", size="small", v-else-if="item.type==='area'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          goods-warehouse-select(v-model="formItemModel[item.prop]", :useName="item.useName", size="small", v-else-if="item.type==='warehouse'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          billtype-select(v-model="formItemModel[item.prop]", :typeStr="item.typeStr" :useName="item.useName", size="small", v-else-if="item.type==='billtype'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          pntree-partsname-select(v-model="formItemModel[item.prop]", size="small", v-else-if="item.type==='pntreePartsname'", @change="selectChange($event, item.props)", :disabled="item.disabled")
          basic-select(v-model="formItemModel[item.prop]", :useName="item.useName", size="small", v-else-if="item.type==='basic'", :ddtypeClass="item.ddtypeClass", @change="selectChange($event, item.props)", :disabled="item.disabled")
          el-input(v-model="formItemModel[item.prop]", v-else, :readonly="item.readonly", :placeholder="item.placeholder", size="small", clearable, , :disabled="item.disabled")
      el-form-item.full-width.justify-center
        el-button-group
          el-button(type="primary", size="small", @click="searchHandler") 搜索
          el-button(size="small", @click="resetForm") 重置
</template>
<script>
  import employeeSelect from '@/components/select/employeeSelect'
  import operatorSelect from '@/components/select/operatorSelect'
  import deptSelect from '@/components/select/deptSelect'
  import orgSelect from '@/components/select/orgSelect'
  import roleSelect from '@/components/select/roleSelect'
  import companySelect from '@/components/select/companySelect'
  import goodsNameSelect from '@/components/select/goodsNameSelect'
  import goodsSpecSelect from '@/components/select/goodsSpecSelect'
  import goodsMaterialSelect from '@/components/select/goodsMaterialSelect'
  import goodsAreaSelect from '@/components/select/goodsAreaSelect'
  import goodsWarehouseSelect from '@/components/select/goodsWarehouseSelect'
  import billtypeSelect from '@/components/select/billtypeSelect'

  export default {
    components: {
      employeeSelect,
      operatorSelect,
      deptSelect,
      orgSelect,
      roleSelect,
      companySelect,
      goodsNameSelect,
      goodsSpecSelect,
      goodsMaterialSelect,
      goodsAreaSelect,
      goodsWarehouseSelect,
      billtypeSelect
    },
    props: {
      formItem: {
        type: Array,
        required: true
      },
      searchEvent: {
        type: Function,
        required: true
      },
      labelWidth: {
        type: String,
        default: '100px'
      }
    },
    data() {
      return {
        copyForm: {},
        formItemModel: {}
      }
    },
    mounted() {
      const obj = {}
      this.formItem.forEach((item) => {
        obj[item.prop] = item.val
        if (item.valProp) obj[item.valProp] = item.val
      })
      this.formItemModel = obj
      this.copyForm = JSON.parse(JSON.stringify(this.formItemModel))
    },
    methods: {
      selectChange (e, props) {
        for (const key in props) {
          this.formItemModel[key] = e[props[key]]
        }
      },
      searchHandler() {
        this.searchEvent(this.formItemModel)
      },
      resetForm() {
        this.formItemModel = JSON.parse(JSON.stringify(this.copyForm))
      }
    }
  }
</script>

<style scoped>
  .row {
    align-items: center;
  }

  .el-form--inline .el-form-item {
    display: flex !important;
  }

  .justify-center {
    justify-content: center;
  }
</style>

