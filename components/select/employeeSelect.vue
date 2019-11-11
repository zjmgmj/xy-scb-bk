<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="employeeCode",
    clearable,
    filterable,
    remote,
    :remote-method="obtain",
    @change="change",
    placeholder="请选择",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.employeeCode",
      :label="item.employeeName",
      :value="item.employeeCode")
</template>

<script>
  export default {
    name: 'EmployeeSelect',
    componentName: 'EmployeeSelect',

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
      employeeCode: {
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
        const { data } = await this.proxy(this, 'scscm/app/employeeAjax!queryCombo.do', 'get', {
          query,
          page: 1,
          limit: 10
        })
        if ('employeeComboList' in data) {
          this.list = data.employeeComboList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x.employeeCode === newValue)
          .forEach(x => this.$emit('change', this.deepCopy(x)))
      }
    }
  }
</script>

<style scoped>

</style>
