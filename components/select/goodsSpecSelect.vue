<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="goodsSpec",
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
      :key="item.goodsSpec",
      :label="item.goodsSpec",
      :value="item.goodsSpec")
</template>

<script>
  export default {
    name: 'SpecSelect',
    componentName: 'SpecSelect',

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
      }
    },
    data() {
      return {
        list: []
      }
    },
    computed: {
      goodsSpec: {
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
        const { data } = await this.proxy(this, 'scscm/app/goodscodeAjax!querySpecCombo.do', 'get', {
          query,
          page: 1,
          limit: 10
        })
        if ('specComboList' in data) {
          this.list = data.specComboList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x.goodsSpec === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
