import axios from "axios";
import { ElMessage } from "element-plus";
import { getActivePinia } from 'pinia'; // 获取 Pinia 实例

const defaultError = (err) => ElMessage.error('错误:'+err.message);
const defaultFailure = (failure) => ElMessage.warning('失败：'+failure.message);
export const server_url = ""
// 获取当前 Pinia 中的 store
function getToken() {
  const pinia = getActivePinia();
  if (pinia) {
    const store = pinia.state.value.auth;  // 获取当前 store
    return store?.auth?.token;        // 从 store 中获取 token
  }
  return null; // 如果没有找到 token，返回 null
}

// const store = useStore();
var token = getToken();

// 创建 Axios 实例并设置默认配置
const axiosInstance = axios.create({
    baseURL: server_url, // 使用根路径
    withCredentials: true, // 允许跨域请求携带 Cookies
});

// 请求拦截器：在每个请求前自动添加 Token
axiosInstance.interceptors.request.use((config) => {
    token = getToken()
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // 将 Token 添加到请求头
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 封装 POST 请求
function post(url, data, success, failure = defaultFailure, error = defaultError) {
    axiosInstance.post(url, data, {
        headers: {
            'Content-Type': 'application/json', //json数据类型
        },
    }).then(({ data }) => {
        if (data.code == 200) {
            success(data);
        } else {
            failure(data);
        }
    }).catch((err) => {
        error(err);  // 调用传入的 error 函数
    });
}

// 封装 GET 请求
function get(url, success, failure = defaultFailure, error = defaultError) {
    axiosInstance.get(url).then(({ data }) => {
        if (data.code == 200) {
            success(data);
        } else {
            failure(data);
        }
    }).catch((err) => {
        error(err);  // 调用传入的 error 函数
    });
}

export { get, post };