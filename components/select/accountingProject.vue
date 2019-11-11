<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="financeItemCode",
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
      :key="item.financeItemCode",
      :label="item.financeItemName",
      :value="item.financeItemCode")
</template>

<script>
  export default {
    props: {
      multiple: {
        type: Boolean,
        default: false
      },
      value: {
        type: [String, Array],
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
      financeItemCode: {
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
      async obtain() {
        const { data } = await this.proxy(this, 'scscm/app/accountingProjectAjax!queryCombo.do', 'get', {
          page: 1,
          start:0,
          limit: 40
        })
        if ('iiList' in data) {
          this.list = data.iiList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        if (Array.isArray(newValue)) {
          const arr = this.list.filter((item) => {
            return newValue.filter(x => x === item.financeItemCode)[0]
          })
          this.$emit('change', arr)
        } else {
          this.list
            .filter(x => x.financeItemCode === newValue)
            .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
        }        
      }
    } 
  }
</script>

<style scoped>

</style>
