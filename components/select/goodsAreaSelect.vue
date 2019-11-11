<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="productareaId",
    clearable,
    filterable,
    remote,
    :disabled="disabled",
    :remote-method="obtain",
    @change="change",
    placeholder="请选择",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.productareaId",
      :label="item.productareaName",
      :value="useName ? item.productareaName : item.productareaId")
</template>

<script>
  export default {
    name: 'ProductareaSelect',
    componentName: 'ProductareaSelect',

    props: {
      value: {
        type: [String, Number],
        required: true,
        default: ''
      },
      disabled: Boolean,
      size: {
        type: String,
        default: 'mini'
      },
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
      productareaId: {
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
        const { data } = await this.proxy(this, 'scscm/app/productareaAjax!queryCombo.do', 'get', {
          query,
          page: 1,
          limit: 10
        })
        if ('productareaList' in data) {
          this.list = data.productareaList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => this.useName ? x.productareaName === newValue : x.productareaId === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
