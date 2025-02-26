<template>
    <div style="text-align: center;margin: 0 20px">
        <div style="margin-top: 150px">
            <div style="font-size: 25px;font-weight: bold">登录</div>
            <div style="font-size: 14px;color: grey">在进入系统之前请先输入账号和密码进行登录</div>
        </div>
        <div @keydown.enter="login"> 
            <el-input v-model="form.account" type="text" placeholder="账号" name="username" >
                <template #prefix>
                    <el-icon>
                        <User />
                    </el-icon>
                </template>
            </el-input>
            <el-input v-model="form.password" type="password" style="margin-top: 10px" placeholder="密码" name="password">
                <template #prefix>
                    <el-icon>
                        <Lock />
                    </el-icon>
                </template>
            </el-input>

            <el-row style="margin-top: 5px">
                <el-col :span="12" style="text-align: left">
                    <el-checkbox v-model="form.remember" label="记住我" />
                </el-col>
                <el-col :span="12" style="text-align: right">
                    <el-link @click="router.push('/forget')">忘记密码？</el-link>
                </el-col>
            </el-row>
            <div style="margin-top: 40px" @keydown.enter="login">
                <el-button @click="login()" style="width: 270px" type="success" plain>立即登录</el-button>
            </div>
            <el-divider>
                <span style="color: grey;font-size: 13px">没有账号</span>
            </el-divider>
            <div>
                <el-button style="width: 270px" @click="router.push('/register')" type="warning" plain>注册账号</el-button>
            </div>
        </div>
    </div>

</template>

<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { onMounted, reactive, onUnmounted } from "vue";
import { ElMessage } from "element-plus";
import { get, post } from "@/net";
import router from "@/router";
import { useStore } from "@/stores";

const store = useStore()

const form = reactive({
    account: '',
    password: '',
    remember: false
})
// 监听键盘事件
// const handleKeyPress = (event) => {
//   if (event.key === 'Enter') {
//     login(); // 按下 Enter 键时调用登录方法
//   }
// };


onMounted(() => {
    // window.addEventListener('keydown', handleKeyPress);
})

onUnmounted(() => {
    //   window.removeEventListener('keydown', handleKeyPress);
});
const login = () => {
    if(!form.account || !form.password) {
        ElMessage.warning('请填写账号和密码！');
    } else {
        post('/api/user/login', {
            account: form.account,
            password: form.password,
            remember: form.remember
        }, (response) => {
            // 假设后端返回的数据包含 token 和 user
            const { token, user } = response.data;  // 注意使用 response.data
            const { message } = response;
            if (token && user) {
                // 将用户信息存入 Pinia 状态
                store.setToken(token); // 保存 Token
                store.setUser(user); // 保存用户信息
                // 将 token 存入 LocalStorage
                localStorage.setItem('token', token);
                // 显示成功消息
                ElMessage.success(message);
                // 跳转到主页
                router.push('/');
            } else {
                ElMessage.error('登录成功，但未返回有效的 Token 或 用户信息！');
            }
        }, (message) => {
            // 登录失败的处理
            ElMessage.error(`${message.message}`);
        });
    }
};


</script>

<style scoped></style>