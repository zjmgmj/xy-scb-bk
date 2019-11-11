<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="equsettingCode",
    clearable,
    filterable,
    remote,
    :remote-method="obtain",
    @change="change",
    placeholder="请选择",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.equsettingCode",
      :label="item.equsettingName",
      :value="item.equsettingCode")
</template>

<script>
  // 加工设备
  export default {
    name: 'EqusettingSelect',
    componentName: 'EqusettingSelect',

    props: {
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
      equsettingCode: {
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
        const { data } = await this.proxy(this, 'scscm/app/equsettingAjax!queryCombo.do', 'get', {
          query,
          page: 1,
          limit: 10
        })
        if ('equsettingList' in data) {
          this.list = data.equsettingList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x.equsettingCode === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
