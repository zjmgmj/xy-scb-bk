<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="deptCode",
    :disabled="disabled",
    clearable,
    filterable,
    remote,
    :remote-method="obtain",
    @change="change",
    placeholder="请选择",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.deptCode",
      :label="item.deptName",
      :value="useName ? item.deptName : item.deptCode")
</template>

<script>
  export default {
    name: 'DeptSelect',
    componentName: 'DeptSelect',

    props: {
      value: {
        type: String,
        required: true,
        default: ''
      },
      size: {
        type: String,
        default: 'mini'
      },
      useName: {
        // 如果为true，则value字段使用name代替code传值
        type: Boolean,
        default: false
      },
      disabled: Boolean
    },
    data() {
      return {
        list: []
      }
    },
    computed: {
      deptCode: {
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
        const { data } = await this.proxy(this, 'scscm/app/deptAjax!queryCombo.do', 'get', {
          query,
          start:0,
          page: 1,
          limit: 25
        })
        if ('deptList' in data) {
          this.list = data.deptList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        const prop = this.useName ? 'deptName' : 'deptCode'
        if (Array.isArray(newValue)) {
          const arr = this.list.filter((item) => {
            return newValue.filter(x => x === item[prop])[0]
          })
          this.$emit('change', arr)
        } else {
          this.list
            .filter(x => x[prop] === newValue)
            .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
        }
        // this.list
        //   .filter(x => x.deptCode === newValue)
        //   .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
