<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="feeitemCode",
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
      :key="item.feeitemCode",
      :label="item.feeitemName",
      :value="useName ? item.feeitemName : item.feeitemCode")
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
      feeitemCode: {
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
        const { data } = await this.proxy(this, 'scscm/app/feeitemAjax!queryComboFilter.do', 'post', {
          query,
          page: 1,
          limit: 10
        })
        if ('feeitemList' in data) {
          this.list = data.feeitemList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        // debugger
        // const prop = this.useName ? 'feeitemName' : 'feeitemCode'
        if (Array.isArray(newValue)) {
          const arr = this.list.filter((item) => {
            return newValue.filter(x => x === item.feeitemCode)[0]
          })
          this.$emit('change', arr)
        } else {
          this.list
            .filter(x => x.feeitemCode === newValue)
            .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
        }        
      }
    } 
  }
</script>

<style scoped>

</style>
