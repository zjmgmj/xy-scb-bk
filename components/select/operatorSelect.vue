<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="operatorCode",
    :disabled="disabled",
    clearable,
    filterable,
    remote,
    :multiple="multiple",
    :remote-method="obtain",
    @change="change",
    placeholder="请选择",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.operatorCode",
      :label="item.operatorUser",
      :value="item.operatorCode")
</template>

<script>
  export default {
    name: 'OperatorSelect',
    componentName: 'OperatorSelect',

    props: {
      multiple: {
        type: Boolean,
        default: false
      },
      value: {
        type: [String, Array],
        default: ''
        // required: true
      },
      size: {
        type: String,
        default: 'mini'
      },
      disabled: Boolean
    },
    data() {
      return {
        list: []
      }
    },
    computed: {
      operatorCode: {
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
        const { data } = await this.proxy(this, 'scscm/app/operatorAjax!queryCombo.do', 'get', {
          query,
          page: 1,
          limit: 10
        })
        if ('operatorList' in data) {
          this.list = data.operatorList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x.operatorCode === newValue)
          .forEach(x => this.$emit('change', this.deepCopy(x)))
      }
    }
  }
</script>

<style scoped>

</style>
