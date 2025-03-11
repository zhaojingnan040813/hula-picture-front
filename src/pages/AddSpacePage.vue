<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">
      {{ route.query?.id ? '修改空间' : '创建空间' }}
    </h2>
    <!-- 空间信息表单 -->
    <a-form name="spaceForm" layout="vertical" :model="spaceForm" @finish="handleSubmit">
      <a-form-item name="spaceName" label="空间名称">
        <a-input v-model:value="spaceForm.spaceName" placeholder="请输入空间" allow-clear />
      </a-form-item>
      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          style="min-width: 180px"
          placeholder="请选择空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading" style="width: 100%">
          提交
        </a-button>
      </a-form-item>
    </a-form>


    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级空间，请联系
        <a href="https://codefather.cn" target="_blank">程序员鱼皮</a>。
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text }}： 大小 {{ formatSize(spaceLevel.maxSize) }}， 数量
        {{ spaceLevel.maxCount }}
      </a-typography-paragraph>
    </a-card>


  </div>


</template>

<script setup lang="ts">
import { SPACE_LEVEL_ENUM, SPACE_LEVEL_OPTIONS } from '@/constants/space'
import { onMounted, reactive, ref } from 'vue'
import {
  addSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet,
  updateSpaceUsingPost
} from '@/api/spaceController'
import { message } from 'ant-design-vue'
import router from '@/router'
import { formatSize } from '../utils'
import { useRoute } from 'vue-router'

//泛型表示`formData`可以是这两种类型中的一种
const formData = reactive<API.SpaceAddRequest | API.SpaceUpdateRequest>({
  spaceName: '',
  spaceLevel: SPACE_LEVEL_ENUM.COMMON,
})
// 在上面应该有一个东西是根据这个loading的真假值来决定展示或者不展示
const loading = ref(false)
const spaceLevelList = ref<API.SpaceLevel[]>([])
// 因为这里的SpaceEditRequest里面不存在spaceLevel，会导致爆红，
const spaceForm = reactive<API.SpaceAddRequest | API.SpaceEditRequest>({})
const space = ref<API.SpaceVO>() //但是我觉得它没有出现初始化的情况呀


/**
 * 提交表单
 * @param values
 */
const handleSubmit=async(values:any)=>{
  // const spaceId=space.value?.id;
  // 如果 space.value 存在则取 id，否则返回 undefined
  const spaceId = space.value ? space.value.id : undefined;
  loading.value=true;
  let res
  if (spaceId){
    //更新
      res=await updateSpaceUsingPost({
      ...spaceForm,
      id: spaceId
    })
  }else{
    // 创建,更新要id , 创建不要id
    res=await addSpaceUsingPost({
      ...spaceForm
    })
  }
// 操作成功
  if (res.data.code===0&&res.data.data){
    message.success("创建成功");
    // 因为创建完空间后我们想要实现跳转到我们创建的那个空间
    // router.push({
    //   //因为在router.ts里面有了 path: '/space/:id', 的配置
    //   path:`/space/${res.data.data}`
    // })
    let path = `/space/${spaceId ?? res.data.data}`
    router.push({
      path,
    })
  }else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value=false;
}
// 注意，上面的是 router , 这个是 route
const route = useRoute()
// 获取空间级别
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error('获取空间级别失败，' + res.data.message)
  }
}


// 获取老数据
const getOldSpace = async () => {
  // 获取到 id
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      // 填充表单
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}


// 页面加载时，请求老数据
onMounted(() => {
  getOldSpace()
  fetchSpaceLevelList()

})






</script>

<style scoped>

</style>
