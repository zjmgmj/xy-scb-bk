<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="partsnameCode",
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
      :key="item.partsnameCode",
      :label="item.partsnameName",
      :value="useName ? item.partsnameName : item.partsnameCode")
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
        if (Array.isArray(newValue)) {
          const arr = this.list.filter((item) => {
            return newValue.filter(x => x === item.partsnameCode)[0]
          })
          this.$emit('change', arr)
        } else {
          this.list
            .filter(x => x.partsnameCode === newValue)
            .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
        }        
      }
    } 
  }
</script>

<style scoped>

</style>
