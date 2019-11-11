<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="companyCode",
    clearable,
    filterable,
    :disabled="disabled",
    remote,
    :remote-method="obtain",
    @change="change",
    placeholder="请选择",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.companyCode",
      :label="item.companyName",
      :value="useName ? item.companyName : item.companyCode")
      span(:style="item.companyState===1? 'color:#ccc':''") {{item.companyName}}
</template>

<script>
  export default {
    name: 'CompanySelect',
    componentName: 'CompanySelect',

    props: {
      value: {
        type: String,
        required: true,
        default: ''
      },
      size: {
        type: String,
        default: 'mini'
      },
      disabled: Boolean,
      useName: {
        // 如果为true，则value字段使用name代替code传值
        type: Boolean,
        default: false
      },
      typeStr: {
        type: [String, Function],
        default: ''
      }
    },
    data() {
      return {
        list: []
      }
    },
    computed: {
      companyCode: {
        get() {
          return this.value
        },
        set(newValue) {
          this.$emit('input', newValue)
        }
      }
    },
    mounted() {
      this.obtain()
    },
    methods: {
      async obtain(query) {
        const { data } = await this.proxy(this, 'scscm/app/companyAjax!queryCompanyCombo.do', 'get', {
          typeStr: this.typeStr,
          query,
          page: 1,
          limit: 10
        })
        if ('companyList' in data) {
          this.list = data.companyList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x.companyCode === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
