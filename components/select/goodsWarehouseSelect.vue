<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="warehouseCode",
    :disabled="disabled",
    clearable,
    filterable,
    remote,
    :remote-method="obtain",
    @change="change",
    placeholder="请选择",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.warehouseCode",
      :label="item.warehouseName",
      :value="useName ? item.warehouseName : item.warehouseCode")
</template>

<script>
  export default {
    name: 'WarehouseSelect',
    componentName: 'WarehouseSelect',

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
      }
    },
    data() {
      return {
        list: []
      }
    },
    computed: {
      warehouseCode: {
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
        const { data } = await this.proxy(this, 'scscm/app/warehouseAjax!queryCombo.do', 'get', {
          query,
          page: 1,
          limit: 10
        })
        if ('warehouseList' in data) {
          this.list = data.warehouseList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => this.useName ? x.warehouseName === newValue : x.warehouseCode === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
