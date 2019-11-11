<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="roleCode",
    clearable,
    multiple,
    filterable,
    remote,
    :remote-method="obtain",
    @change="change",
    placeholder="请选择",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.roleCode",
      :label="item.roleName",
      :value="item.roleCode")
</template>

<script>
  export default {
    name: 'RoleSelect',
    componentName: 'RoleSelect',

    props: {
      value: {
        type: [String, Array],
        required: true,
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
      roleCode: {
        get() {
          if (Array.isArray(this.value)) {
            return this.value
          } else if (typeof (x) === 'string' && this.value !== '') {
            return this.value.split(',').map(x => x.trim())
          } else {
            return []
          }
        },
        set(newValue) {
          if (Array.isArray(this.value)) {
            this.$emit('input', newValue)
          } else if (typeof (x) === 'string' && this.value !== '') {
            this.$emit('input', newValue.join(','))
          } else{
            this.$emit('input', newValue)
          }
        }
      }
    },
    mounted() {
      this.obtain()
    },
    methods: {
      async obtain(query) {
        const { data } = await this.proxy(this, 'scscm/app/roleAjax!queryCombo.do', 'get', {
          query,
          page: 1,
          limit: 10
        })
        if ('roleList' in data) {
          this.list = data.roleList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x.roleCode === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
