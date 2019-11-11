<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="ddValue",
    clearable,
    filterable,
    remote,
    :disabled="disabled",
    :remote-method="obtain",
    @change="change",
    placeholder="",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.ddValue",
      :label="item.ddShowname",
      :value="item.ddValue")
</template>

<script>
  export default {
    props: {
      ddtypeClass: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      },
      value: {
        type: String,
        required: true,
        default: ''
      },
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
      ddValue: {
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
        const { data } = await this.proxy(this, 'scscm/app/ddAjax!queryCombo.do', 'get', {
          ddtypeClass: this.ddtypeClass,
          query: query,
          page: 1,
          limit: 25
        })
        if ('ddList' in data) {
          this.list = data.ddList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x.ddValue === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
