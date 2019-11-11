<template lang="pug">
  el-select(
    style="width: 100%",
    v-model="selectedValue",
    clearable,
    filterable,
    remote,
    :remote-method="obtain",
    @change="change",
    @focus="focus"
    :disabled="disabled",
    :placeholder="placeholder",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item[codeProp]",
      :label="item[nameProp]",
      :value="item[codeProp]")
</template>

<script>
  export default {
    name: 'GeneralSelect',
    componentName: 'GeneralSelect',

    props: {
      // === functional
      value: {
        type: String,
        required: true,
        default: ''
      },
      url: {
        type: String,
        required: true
      },
      extraParam:{
        type: Object,
        default: () => {
          return {}
        }
      },
      listProp:{
        // 接口返回对象中列表字段名，为空则认为接口返回的是数组
        type: String,
        default: 'list'
      },
      codeProp:{
        // 列表中code字段
        type: String,
        default: 'code'
      },
      nameProp:{
        // 列表中name字段
        type: String,
        default: 'name'
      },
      lazy:{
        // 懒加载，只有在点击下拉框的时候才去远端请求数据
        type:Boolean,
        default:false
      },

      // === style
      size: {
        type: String,
        default: 'mini'
      },
      disabled: {
        type: Boolean,
        default: false
      },
      placeholder: {
        type:String,
        default: '请选择'
      },
    },
    data() {
      return {
        list: []
      }
    },
    computed: {
      selectedValue: {
        get() {
          return this.value
        },
        set(newValue) {
          this.$emit('input', newValue)
        }
      }
    },
    mounted() {
      if (!this.lazy) {
        this.obtain()
      } else {
        console.info('GeneralSelect lazy load data')
      }
    },
    methods: {
      async obtain(query) {
        const { data } = await this.proxy(this, this.url, 'get', {
          query,
          page: 1,
          limit: 20,
          ...this.extraParam
        })
        if (this.listProp && this.listProp in data) {
          this.list = data[this.listProp]
        } else if (!this.listProp) {
          this.list = data
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x[this.codeProp] === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      },
      focus(e){
        if (this.lazy){
          this.list=[]
          this.obtain()
        }
      }
    }
  }
</script>

<style scoped>

</style>
