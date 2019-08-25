<template>
  <section class="mod-bar">
    <el-tag
      v-for="tag in sortTags"
      size="small"
      :type="tag.type"
      @click.native="handleSort(tag)"
      :key="tag.id"
    >
      {{ tag.name }}
    </el-tag>
  </section>
</template>

<script>
  export default {
    data () {
      return {
        sortTags: [
          {name: 'ALL', type: '', pre: ''},
          {name: 'PNGs', type: 'gray', pre: 'primary'},
          {name: 'APNG', type: 'gray', pre: 'success'},
          {name: 'GIF', type: 'gray', pre: 'warning'}
          // {name: 'WEBP', type: 'gray', pre: 'warning'}
        ]
      }
    },
    methods: {
      handleSort (tag) {
        // console.log(this.$root)
        this.sortTags.forEach(function (ele) {
          ele.type = 'gray'
        })
        // tag.isActive = true
        tag.type = tag.pre
        this.$root.eventBus.$emit('sortList', tag.name)
      }
    }
  }
</script>

<style lang="scss">
.mod-bar{
  position:fixed;
  left:0;
  bottom:0;
  width:100%;
  height:40px;
  line-height:40px;
  border:1px solid #E4E4E4;
  background:#F2F2F2;
  padding:0 10px;
  display: flex;
  align-items: center;
  .el-tag{
    margin:0 5px;
    cursor:pointer;
  }
  .el-tag--gray{
    background:transparent;
    border-color:transparent;
    &:hover{
      border-color: rgba(71,86,105,.2);
    }
  }
}
</style>
