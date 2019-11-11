<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="projectCode",
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
      :key="projectName",
      :label="item.projectName",
      :value="useName ? item.projectName : item.projectCode")
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
      },
      companyCode: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        list: []
      }
    },
    computed: {
      projectCode: {
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
        const { data } = await this.proxy(this, 'scscm/app/companyAjax!queryCompanyProjectCombo.do', 'get', {
          companyCode: this.companyCode,          
          query,
          page: 1,
          limit: 10
        })
        if ('projectList' in data) {
          this.list = data.projectList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        if (Array.isArray(newValue)) {
          const arr = this.list.filter((item) => {
            return newValue.filter(x => x === item.projectCode)[0]
          })
          this.$emit('change', arr)
        } else {
          this.list
            .filter(x => x.projectCode === newValue)
            .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
        }        
      }
    } 
  }
</script>

<style scoped>

</style>
