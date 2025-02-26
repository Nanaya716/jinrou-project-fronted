<template>
  <div style="padding: 5px">
    <el-form :model="user" :rules="form_rules" :disabled="!edit_mode">
      <!-- 账号（不可更改） -->
      <el-form-item label="账号" prop="account">
        <el-input placeholder="账号不可更改" style="width: 100%;" v-model="user.account" disabled>
        </el-input>
      </el-form-item>

      <!-- 用户名 -->
      <el-form-item label="用户名" prop="username" required>
        <el-input placeholder="请输入用户名" style="width: 100%;" v-model="user.username">
        </el-input>
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item label="邮箱" prop="email" required>
        <el-input placeholder="请输入邮箱" style="width: 100%;" v-model="user.email">
        </el-input>
      </el-form-item>

      <!-- 电话 -->
      <el-form-item label="电话" prop="phoneNumber" required>
        <el-input placeholder="请输入电话" style="width: 100%;" v-model="user.phoneNumber">
        </el-input>
      </el-form-item>

      <!-- 是否公开战绩 -->
      <el-form-item label="是否公开战绩" prop="openHistory">
        <el-switch v-model="user.openHistory"></el-switch>
      </el-form-item>

      <!-- 简介 -->
      <el-form-item label="简介" prop="bio">
        <el-input placeholder="请输入简介" type="textarea" style="width: 100%;" v-model="user.bio">
        </el-input>
      </el-form-item>
    </el-form>

    <div style="margin-top: 10px; text-align: right;">
      <el-button type="primary" @click="toggleEditMode">{{ edit_mode ? '保存' : '编辑' }}</el-button>
      <el-button v-if="edit_mode" @click="cancelEdit">取消</el-button>
      <el-button type="warning" @click="showPasswordDialog">修改密码</el-button>
    </div>

    <!-- 修改密码弹窗 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="30%">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input type="password" v-model="passwordForm.oldPassword" placeholder="请输入旧密码" show-password>
          </el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码" show-password>
          </el-input>
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" show-password>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="passwordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPasswordChange">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from '@/stores';
import { post } from '@/net';
import { ElMessage } from 'element-plus';

const store = useStore();
const user = ref({
  ...store.auth.user,
});

const edit_mode = ref(false);
const original_user = ref({ ...user.value });

// 修改密码相关状态
const passwordDialogVisible = ref(false);
const passwordForm = ref({
  account:user.value.account,
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});
const passwordFormRef = ref(null);
const validateUsername = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('用户名不能为空')); // 空值提示
  } else if (!/^[\u4e00-\u9fa5a-zA-Z]{1,8}$/.test(value)) { // 支持中文和英文，最大 8 个中文字符
    callback(new Error('用户名最多支持 8 个中文字符或 16 个英文字符'));
  } else {
    callback(); // 校验通过
  }
};

const validatePhoneNumber = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('手机号不能为空')); // 空值提示
  } else if (!/^1[3-9]\d{9}$/.test(value)) { // 校验中国大陆手机号
    callback(new Error('请输入有效的手机号码'));
  } else {
    callback(); // 校验通过
  }
};

const validateBio = (rule, value, callback) => {
  if (!value) {
    callback(new Error('简介不能为空'));
  } else if (value.length > 100) {
    callback(new Error('简介不能超过 100 个字符'));
  } else {
    callback();
  }
};

// 表单校验规则
const form_rules = {
  username: [
    { required: true, message: "用户名不能为空", trigger: "blur" },
    { validator: validateUsername, trigger: ['blur', 'change'] },
  ],
  email: [
    { required: true, message: '请输入邮件地址', trigger: 'blur' },
    { type: 'email', message: '请输入合法的电子邮件地址', trigger: ['blur', 'change'] }
  ],
  phoneNumber: [
    { required: true, message: "手机号不能为空", trigger: "blur" },
    { validator: validatePhoneNumber, trigger: ['blur', 'change'] },
  ],
  bio: [
    { required: true, message: "简介不能为空", trigger: "blur" },
    { validator: validateBio, trigger: ['blur', 'change'] },
  ],
};

// 密码校验规则
const passwordRules = {
  oldPassword: [
    { required: true, message: "旧密码不能为空", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "新密码不能为空", trigger: "blur" },
    { min: 6, max: 16, message: "密码长度必须为 6-16 个字符", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error("两次输入的密码不一致"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

// 显示修改密码弹窗
const showPasswordDialog = () => {
  passwordForm.value = { account: user.value.account,oldPassword: '', newPassword: '', confirmPassword: '' };
  passwordDialogVisible.value = true;
};

// 提交密码修改
const submitPasswordChange = () => {
  console.log(passwordForm.value)
  passwordFormRef.value.validate((valid) => {
    if (valid) {
      post('/api/user/changePassword', passwordForm.value,
        (response) => {
          const { token, user: updatedUser, message } = response.data;
          store.setToken(token);
          store.setUser(updatedUser);
          ElMessage.success(message);
          passwordDialogVisible.value = false;
        },
        (failure) => {
          ElMessage.error(`密码修改失败：${failure.message}`);
        },
        (error) => {
          ElMessage.error(error.message);
        }
      );
    } else {
      ElMessage.warning('请检查输入内容');
    }
  });
};

// 其他方法（toggleEditMode、cancelEdit 等保持不变）
const toggleEditMode = () => {
  if (edit_mode.value) {
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