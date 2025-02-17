<template>
  <div style="padding: 5px">
    <el-form :model="user" :rules="form_rules" :disabled="!edit_mode">
      <!-- 账号（不可更改） -->
      <el-form-item label="账号" prop="account">
        <el-input 
          placeholder="账号不可更改" 
          style="width: 100%;" 
          v-model="user.account" 
          disabled>
        </el-input>
      </el-form-item>

      <!-- 用户名 -->
      <el-form-item label="用户名" prop="username" required>
        <el-input 
          placeholder="请输入用户名" 
          style="width: 100%;" 
          v-model="user.username">
        </el-input>
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email" required>
        <el-input 
          placeholder="请输入邮箱" 
          style="width: 100%;" 
          v-model="user.email">
        </el-input>
      </el-form-item>

      <!-- 电话 -->
      <el-form-item label="电话" prop="phoneNumber" required>
        <el-input 
          placeholder="请输入电话" 
          style="width: 100%;" 
          v-model="user.phoneNumber">
        </el-input>
      </el-form-item>

      <!-- 用户状态 -->
      <!-- <el-form-item label="用户状态" prop="userState">
        <el-input 
          placeholder="请选择用户状态" 
          style="width: 100%;" 
          v-model="user.userState" disabled>
        </el-input>
      </el-form-item> -->

      <!-- 是否公开战绩 -->
      <el-form-item label="是否公开战绩" prop="openHistory">
        <el-switch v-model="user.openHistory"></el-switch>
      </el-form-item>

      <!-- 简介 -->
      <el-form-item label="简介" prop="bio">
        <el-input 
          placeholder="请输入简介" 
          type="textarea" 
          style="width: 100%;" 
          v-model="user.bio">
        </el-input>
      </el-form-item>
    </el-form>

    <div style="margin-top: 10px; text-align: right;">
      <el-button type="primary" @click="toggleEditMode">{{ edit_mode ? '保存' : '编辑' }}</el-button>
      <el-button v-if="edit_mode" @click="cancelEdit">取消</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from '@/stores';
import { post } from '@/net';

const store = useStore();
const user = ref({
  ...store.auth.user,
});

const edit_mode = ref(false);
// 原始用户数据，取消编辑时恢复
const original_user = ref({ ...user.value });

const form_rules = {
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  email: [{ required: true, message: "邮箱不能为空", trigger: "blur" }],
  phoneNumber: [{ required: true, message: "电话不能为空", trigger: "blur" }],
  bio: [{ required: true, message: "简介不能为空", trigger: "blur" }],
};

const toggleEditMode = () => {
  if (edit_mode.value) {
    console.log(JSON.stringify(user.value));
    post('/api/user/updateUserDetail', user.value, 
      (response) => {
        const { token, user: updatedUser, message } = response.data;
        if (token && updatedUser) {
          store.setToken(token);
          store.setUser(updatedUser);
          ElMessage.success(message);
        } else {
          ElMessage.error('修改成功，但有异常报错，请咨询管理员：' + message);
        }
      },
      (failure) => {
        ElMessage.error(`失败：${failure.message}`);
      },
      (error) => {
        ElMessage.error(error.message);
      }
    );
    original_user.value = { ...user.value };
  }
  edit_mode.value = !edit_mode.value;
};

const cancelEdit = () => {
  user.value = { ...original_user.value };
  edit_mode.value = false;
};
</script>
