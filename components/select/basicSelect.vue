<template lang="pug">
  el-select(
    style="width: 100%;",
    v-model="ddId",
    clearable,
    filterable,
    remote,
    :disabled="disabled",
    :remote-method="obtain",
    @change="change",
    placeholder="",
    :size="size")
    el-option(
      v-for="item in list",
      :key="item.ddId",
      :label="item.ddName",
      :value="useName ? item.ddName : item.ddId")
</template>

<script>
  export default {
    props: {
      ddtypeClass: {
        type: String,
        default: ''
      },
      disabled: {
        type: Boolean,
        default: false
      },
      value: {
        type: [String, Number],
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
      }
    },
    data() {
      return {
        list: []
      }
    },
    computed: {
      ddId: {
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
        const { data } = await this.proxy(this, 'scscm/app/basicDdAjax!queryCombo.do', 'get', {
          ddtypeClass: this.ddtypeClass,
          page: 1,
          limit: 25
        })
        if ('ddList' in data) {
          this.list = data.ddList
        } else {
          this.list = []
        }
      },
      change(newValue) {
        const prop = this.useName ? 'ddName' : 'ddId'
        this.list
          .filter(x => x[prop] === newValue)
          .forEach(x => this.$emit('change', JSON.parse(JSON.stringify(x))))
      }
    }
  }
</script>

<style scoped>

</style>
