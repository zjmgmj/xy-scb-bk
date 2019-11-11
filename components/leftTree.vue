<template lang="pug">
.content
  el-button-group.padding-xs(v-if="button.length > 0")
    el-button(type="primary", v-for="(item, index) in button", :key="index", :icon="item.icon", size="mini", @click="buttonHandler(item.type)") {{item.label}}
  el-tree(ref="tree", 
    :node-key="nodeKey",
    :default-expanded-keys="defaultExpandedKeys"
    accordion, 
    highlight-current,     
    :data="data", 
    :props="props", 
    @node-click="handleNodeClick", 
    check-on-click-node,
    :draggable="draggable", 
    @node-drop="handleDrop",
    @node-drag-end="handleDragEnd")
    span(slot-scope="{ node, data }") 
      i(v-if="iconClass", :class="iconClass")
      span.pl-5 {{node.label}}
</template>
<script>
export default {
  props: {
    defaultExpandedKeys: {
      type: Array,
      default: () => {
        return []
      }
    },
    nodeKey: {
      type: String,
      default: 'id'
    },
    iconClass: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      required: true
    },
    draggable: {
      type: Boolean,
      default: false
    },
    button: {
      type: Array,
      default: () => {
        return []
      }
    },
    props: {
      type: Object,
      default: () => {
        return { children: 'children', label: 'text' }
      }
    }
  },
  methods: {
    handleDragEnd (draggingNode, dropNode, dropType, ev) {
      // this.confirmDialog(this, '您确定要把该节点移至['+ dropNode.label +']下吗?').then(() => {
      //   // console.log('---------s')
      //   return false
      // })
      console.log('-------------handleDragEnd')
      const dropRes = {
        draggingNode: draggingNode,
        dropNode: dropNode,
        dropType: dropType,
        ev: ev
      }
      this.$emit('nodeDragEnd', dropRes)
    },
    handleDrop (draggingNode, dropNode, dropType, ev) {
      const dropRes = {
        draggingNode: draggingNode,
        dropNode: dropNode,
        dropType: dropType,
        ev: ev
      }
      this.$emit('dropTree', dropRes)      
    },
    buttonHandler (type) {
      // this.$emit('chooseData', row)
      this.$emit(type + 'Event')
    },
    handleNodeClick (data, node, e) {
      console.log('----------s')
      console.log(data)
      console.log(node)
      console.log(e)
      const obj = {
        data: data,
        node: node
        // e: e
      }
      this.$emit('nodeClick', obj)
    }
  }
}
</script>

