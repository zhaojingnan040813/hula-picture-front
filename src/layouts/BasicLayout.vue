<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">

        <GlobalHeader/>
      </a-layout-header>




      <a-layout>
<!-- 我不理解这个class有什么用  -->
        <GlobalSider class="sider"/>
        <a-layout-content class="content" >
          <!-- 这个router-view是框架里面的       -->
          <router-view />
        </a-layout-content>

      </a-layout>




      <a-layout-footer class="footer">
        <a href="https://github.com/zhaojingnan040813" target="_blank">
          作者 By 呼啦
        </a>
      </a-layout-footer>

    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/layouts/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<style scoped>
#basicLayout .header {
  background: #fff;
  /* 这一行将文本颜色设置为 unset，这意味着文本颜色将继承其父元素的颜色。 */
  color: unset;
  margin-bottom: 16px;
  padding-inline: 20px;
}



#basicLayout .footer {
  background: #efefef;
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  margin-bottom: 28px;
  padding: 20px;
}


</style>

