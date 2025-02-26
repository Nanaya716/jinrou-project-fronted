<template>
  <div class="room-lobby-container">
    <!-- 标题 -->
    <el-card class="header-card" shadow="always">
      <h2>房间大厅</h2>
    </el-card>

    <!-- 主体部分 -->
    <el-row class="main-content">
      <!-- 筛选和操作按钮 -->
      <el-col class="filters-section">
        <el-card class="filters-card" shadow="always">
            <el-button type="primary" @click="changeFilterState('NORMAL')">募集中的村</el-button>
            <el-button type="primary" @click="changeFilterState('OLD')">陈旧村</el-button>
            <el-button type="primary" @click="changeFilterState('PLAYING')">进行中的村</el-button>
            <el-button type="primary" @click="changeFilterState('ENDED')">已结束LOG</el-button>
            <el-button type="primary" @click="changeFilterState('DISCARDED')">废村LOG</el-button>
            <el-button type="success" @click="dialogFormVisible = true">建立村子</el-button>
        </el-card>
      </el-col>

      <!-- 房间列表 -->
      <el-col class="rooms-section">
        <el-card class="rooms-card" shadow="always">
          <h3>村子列表</h3>
          <div class="rooms">
            <div v-for="(room, index) in paginatedRooms" :key="index" class="room-item">
              <el-card shadow="hover" class="room-card">
                <div class="room-info">
                  <h2>
                    <div class="room-no">#{{ room.roomId }}</div>
                    {{ room.roomTitle }}
                    <el-tooltip :content="room.isLocked ? '有密码' : '无密码'" placement="top">
                      <el-icon v-if="room.isLocked"  size="30">
                        <Lock />
                      </el-icon>
                      <el-icon v-else  size="30">
                        <Unlock />
                      </el-icon>
                    </el-tooltip>

                    <el-tooltip
                      :content="room.isAnonymous === 'WEAK' ? '弱匿名' : room.isAnonymous === 'STRONG' ? '强匿名' : '不匿名'"
                      placement="top"
                      >
                      <el-icon size="30">
                        <component
                          :is="room.isAnonymous === 'WEAK' || room.isAnonymous === 'STRONG' ? 'Avatar' : 'User'" />
                      </el-icon>
                    </el-tooltip>

                    <el-tooltip placement="right">
                      <template #content>
                        <div class="village-rule-content">
                          {{ room.villageRule }}
                        </div>
                      </template>
                      <el-icon size="30">
                        <List />
                      </el-icon>
                    </el-tooltip>

                    <span :style="{ color: 'red' }">（ {{ room.playerCount }} 人）</span>
                  </h2>
                  <p class="room-description">{{ room.roomDescription }}</p>
                  <p class="room-roomCreateTime">{{ room.roomCreateTime }}</p>
                </div>
                <div class="room-actions">
                  <el-button type="primary" @click="joinRoom(room.roomId)">进入村子</el-button>
                </div>
              </el-card>
            </div>
          </div>
          <div class="pagination-controls">
            <el-button type="primary" :disabled="currentPage === 1" @click="previousPage">上一页</el-button>
            <el-button type="primary" :disabled="currentPage === totalPages" @click="nextPage">下一页</el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>


    <!-- 创建房间弹窗 -->
    <el-dialog v-model="dialogFormVisible" title="建立村子" width="65vw">
      <el-form :model="form">
        <el-form-item label="村子名称" >
          <el-input v-model="form.roomTitle" autocomplete="off" />
        </el-form-item>
        <el-form-item label="村子描述">
          <el-input v-model="form.roomDescription" autocomplete="off" />
        </el-form-item>
        <!-- <el-form-item label="是否匿名" :label-width="formLabelWidth">
          <el-select v-model="form.isAnonymous" placeholder="请选择匿名程度">
            <el-option label="强匿名" value="STRONG" />
            <el-option label="弱匿名" value="WEAK" />
            <el-option label="不匿名" value="NO" />
          </el-select>
        </el-form-item>
        <el-form-item label="密码" :label-width="formLabelWidth">
          <el-select v-model="form.isLocked" placeholder="是否有密码">
            <el-option label="无密码" value="FALSE" />
            <el-option label="有密码" value="TRUE" />
          </el-select>
        </el-form-item> -->
        <!-- 动态显示密码输入框 -->
        <!-- <el-form-item v-if="form.isLocked === 'TRUE'" label="设置密码" :label-width="formLabelWidth">
          <el-input v-model="form.roomPassword" type="password" placeholder="请输入密码" autocomplete="off" />
        </el-form-item> -->
        <el-form-item label="村规" >
          <el-input v-model="form.villageRule" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreate">
            创建
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>


import { ref, computed, onMounted } from 'vue';
import { useStore } from '@/stores';
import { get, post } from '@/net';
import { ElMessage } from "element-plus";
import router from "@/router";



const store = useStore();


// 房间列表数据
var nowFilterState = ref('NORMAL');
var originalRooms = ref([]);
var filteredRooms = ref([]);
var paginatedRooms = ref([]);
var currentPage = ref(1);
const pageSize = 5;
var totalPages = ref(0);
var roomFormRef = ref(null);
// 总页数
var totalPages = ref(0);
const dialogFormVisible = ref(false)
const formLabelWidth = '200px'

const form = ref({
  roomTitle: '',
  roomDescription: '',
  isAnonymous: '',
  isLocked: '',
  roomPassword: '',
  roomCreatorId: '',
  villageRule: ''
})
// 计算分页后的房间列表
const paginateRooms = (filteredRooms) => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  const rooms = filteredRooms.slice(start, end)
  paginatedRooms.value = rooms;
  totalPages.value = Math.ceil(filteredRooms.length / pageSize);
}

const changeFilterState = (state) => {
  currentPage.value = 1; // 切换状态时重置页码
  nowFilterState.value = state;
  //根据状态获取未分页的房间列表
  switch (nowFilterState.value) {
    case "NORMAL":
      filteredRooms.value = originalRooms.value.filter((room) => room.roomState == "NORMAL");
      break;
    case "OLD":
      filteredRooms.value = originalRooms.value.filter((room) => room.roomState == "OLD");
      break;
    case "PLAYING":
      filteredRooms.value = originalRooms.value.filter((room) => room.roomState == "PLAYING");
      break;
    case "ENDED":
      filteredRooms.value = originalRooms.value.filter((room) => room.roomState == "ENDED");
      break;
    case "DISCARDED":
      filteredRooms.value = originalRooms.value.filter((room) => room.roomState == "DISCARDED");
      break;
    default:
      break;
  }
  //分页
  paginateRooms(filteredRooms.value);
}

// 页面加载时获取房间数据
onMounted(() => {
  getRoomsWithStates(["NORMAL", "PLAYING", "OLD","ENDED","DISCARDED"]);
});


// 获取房间列表数据
function getRoomsWithStates(states) {
  const stateQuery = states.join(","); // 将数组转换为逗号分隔的字符串
  return new Promise((resolve, reject) => {
    get(`/api/rooms/getRooms?states=${stateQuery}`, (response) => {
      const { data } = response;
      const { message } = response;
      if (message && data) {
        originalRooms.value = data;
        changeFilterState(nowFilterState.value); // 数据加载完成后调用
        resolve(); // 异步操作成功时调用 resolve
      } else {
        ElMessage.error(`错误：${message}`);
        reject(new Error(message)); // 异步操作失败时调用 reject
      }
    }, (message) => {
      ElMessage.error(`获取房间列表失败：${message}`);
      reject(new Error(message)); // 如果请求失败，也调用 reject
    });
  });
}


// 分页控制
const previousPage = () => {
  if (currentPage.value > 1) currentPage.value--;
  paginateRooms(filteredRooms.value)
};
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++;
  paginateRooms(filteredRooms.value)
};

// 创建房间的异步操作
async function createRoom(form) {
  return new Promise((resolve, reject) => {
    post(`/api/rooms/createRoom`, {
      roomTitle: form.roomTitle,
      roomDescription: form.roomDescription,
      isAnonymous: form.isAnonymous,
      isLocked: form.isLocked,
      roomPassword: form.isLocked === 'TRUE' ? form.roomPassword : null, // 动态设置密码
      roomCreatorId: store.auth.user.userId,
      villageRule: form.villageRule
    }, (response) => {
      const { data } = response;
      const { message } = response;
      if (message && data) {
        //data中返回roomId
        resolve(data); // 异步操作成功时调用 resolve
      } else {
        ElMessage.error(`创建房间失败：${message}`);
        reject(new Error(message)); // 异步操作失败时调用 reject
      }
    }, (message) => {
      ElMessage.error(`创建房间失败：${message}`);
      reject(new Error(message)); // 如果请求失败，也调用 reject
    });
  });
}

// 点击创建按钮的逻辑
const handleCreate = async () => {
  try {
    const createdRoomId = await createRoom(form.value);
    dialogFormVisible.value = false;
    ElMessage.success("房间创建成功！");
    router.push(`/room/${createdRoomId}`); // 跳转到房间页面
  } catch (error) {
    console.error("房间创建失败:", error);
    ElMessage.error(error.message || "房间创建失败，请重试！");
  }
};
// 加入房间方法
const joinRoom = (roomId) => {
  router.push(`/room/${roomId}`); // 跳转到房间页面
  // 跳转到对应房间逻辑
};
</script>

<style scoped>
.room-lobby-container {
  width: 100%;
  margin: 20px auto;
}

.header-card {
  text-align: center;
  margin-bottom: 20px;
}

.main-content {
  margin-bottom: 20px;
}

.filters-section {
  margin-bottom: 20px;
}

.filters-card {
  padding: 10px;
}

.filters {
  gap: 10px;
  align-items: center;
}

.rooms-section {
  overflow-x: hidden;
  overflow-y: auto;
}

.rooms-card {
  width: 100%;
}

.room-item {
  margin-bottom: 10px;
}

.room-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
}

.room-info {
  flex: 1;
  max-height: 230px;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}


.village-rule-content {
  max-height: 800px;
  /* 限制高度 */
  overflow-y: auto;
  /* 超出时显示滚动条 */
  white-space: pre-wrap;
  /* 保持换行 */
  padding: 8px;
  /* 增加内边距提升可读性 */
}

.el-tooltip .el-icon {
  margin-right: 8px;
  /* 给图标和文字之间增加间距 */
}

.room-no {
  font-size: 20px;
}

.room-actions {
  display: flex;
  align-items: center;
}
</style>
