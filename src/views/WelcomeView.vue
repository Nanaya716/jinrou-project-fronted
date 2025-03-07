<template>
    <div style="width: 100vw;height: 100vh;overflow: hidden;display: flex">
        <div v-if="!isMobile" style ="flex: 1">
            <el-image style="width: 100%;height: 100%" fit="cover"
                src="/image.jpg" />
        </div>
        <div class="welcome-title">
            <div style="font-size: 30px;font-weight: bold">月夜人狼平台</div>
            <!-- <div style="margin-top: 10px"></div> -->
            <div style="margin-top: 5px">实时对话・高自由度的人狼服务器</div>
        </div>
        <div style="width: 400px;background-color: white;z-index: 1">
            <router-view v-slot="{ Component }">
                <transition name="el-fade-in-linear" mode="out-in">
                    <component :is="Component" style="height: 100%" />
                </transition>
            </router-view>
        </div>
    </div>
</template>

<script setup>
import { checkMobile } from '@/js/base.js';
import { ref, provide, onMounted, onUnmounted } from 'vue';
const isMobile = ref(true);
onMounted(() => {
    isMobile.value = checkMobile()
    window.addEventListener('resize', checkMobile)
});

onUnmounted(() => {
    window.removeEventListener('resize', checkMobile)
});
</script>

<style scoped>
.welcome-title {
    position: absolute;
    bottom: 30px;
    left: 30px;
    color: white;
    text-shadow: 0 0 10px black;
}
</style>