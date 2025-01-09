<template>
  <div id="addPicturePage">
    <PictureUpload :picture="picture" :onSuccess="onSuccess" />
  </div>

</template>

<script setup lang="ts">

import PictureUpload from '@/components/PictureUpload.vue'
import { ref } from 'vue'

const picture = ref<API.PictureVO>()
const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture // 更新图片,不是一个属性，而是很多
}



</script>

<style scoped>



</style>
