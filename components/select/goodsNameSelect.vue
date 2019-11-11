<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="partsnameCode",
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
      :key="item.partsnameCode",
      :label="item.partsnameName",
      :value="useName ? item.partsnameName : item.partsnameCode")
</template>

<script>
  export default {
    name: 'PartsnameSelect',
    componentName: 'PartsnameSelect',

    props: {
      value: {
        type: String,
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
      partsnameCode: {
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
        const { data } = await this.proxy(this, 'scscm/app/partsnameAjax!queryCombo.do', 'get', {
          query,
          page: 1,
          limit: 10
        })
        if ('partsnameList' in data) {
          this.list = data.partsnameList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => this.useName ? x.partsnameName === newValue : x.partsnameCode === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
