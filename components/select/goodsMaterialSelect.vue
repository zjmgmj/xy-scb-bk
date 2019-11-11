<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="goodsMaterial",
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
      :key="item.goodsMaterial",
      :label="item.goodsMaterial",
      :value="item.goodsMaterial")
</template>

<script>
  export default {
    name: 'MaterialSelect',
    componentName: 'MaterialSelect',

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
      goodsMaterial: {
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
        const { data } = await this.proxy(this, 'scscm/app/goodscodeAjax!queryMaterialCombo.do', 'get', {
          query,
          page: 1,
          limit: 10
        })
        if ('materialComboList' in data) {
          this.list = data.materialComboList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x.goodsMaterial === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
