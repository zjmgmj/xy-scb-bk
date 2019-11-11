<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="billtypeCode",
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
      :key="item.billtypeCode",
      :label="item.billtypeName",
      :value="item.billtypeCode")
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
        default: ''
        // required: true
      },
      size: {
        type: String,
        default: 'mini'
      },
      typeStr: {
        type: [String, Function],
        default: 'WLP033,WLP023,WLP024,F002,F003,F004,F005,F006,F007,F009,F010,F017,F018,ST03,ST04,ST05,ST07,ST08,M003,P005,W015,W022,W024,S009,W017,V001,V002,V003,V004'
      }
    },
    data() {
      return {
        list: []
      }
    },
    computed: {
      billtypeCode: {
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
        const { data } = await this.proxy(this, 'scscm/app/billtypeAjax!queryBilltypeCombo.do', 'post', {          
          typeStr: this.typeStr,
          query,
          page: 1,
          start: 0,
          limit: 10
        })
        if ('billtypeList' in data) {
          this.list = data.billtypeList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        if (Array.isArray(newValue)) {
          const arr = this.list.filter((item) => {
            return newValue.filter(x => x === item.billtypeCode)[0]
          })
          this.$emit('change', arr)
        } else {
          this.list
            .filter(x => x.billtypeCode === newValue)
            .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
        }        
      }
    }
  }
</script>

<style scoped>

</style>
