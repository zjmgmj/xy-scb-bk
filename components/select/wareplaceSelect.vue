<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="wareplace",
    clearable,
    filterable,
    remote,
    :remote-method="obtain",
    @change="change",
    placeholder="请选择",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.wareplaceId",
      :label="item[showLabel]",
      :value="item[showLabel]")
</template>

<script>
  export default {
    name: 'WareplaceSelect',
    componentName: 'WareplaceSelect',

    props: {
      value: {
        type: String,
        required: true,
        default: ''
      },
      ddtypeClass: {
        type: String,
        default: ''
      },
      warehouseCode: {
        type: String,
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
      wareplace: {
        get() {
          return this.value
        },
        set(newValue) {
          this.$emit('input', newValue)
        }
      },
      showLabel(){
        return this.ddtypeClass==='goodsCodestr10'?'wareplaceWregion':'wareplaceName'
      }
    },
    mounted() {
      this.obtain()
    },
    methods: {
      async obtain(query) {
        const { data } = await this.proxy(this, 'scscm/app/wareplaceAjax!queryComboFilter.do', 'get', {
          query,
          ddtypeClass: this.ddtypeClass,
          warehouseCode: this.warehouseCode,
          page: 1,
          limit: 10
        })
        if ('wareplaceList' in data) {
          this.list = data.wareplaceList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        this.list
          .filter(x => x[this.showLabel] === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
