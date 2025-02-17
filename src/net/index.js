import axios from "axios";
import { ElMessage } from "element-plus";
import { getActivePinia } from 'pinia'; // 获取 Pinia 实例

const defaultError = (err) => ElMessage.error('发生了一些错误，请联系管理员:'+err.message);
const defaultFailure = (failure) => ElMessage.warning('失败：'+failure.message);

// 获取 Token 的工具方法
// function getToken(store) {
//     return store.auth.token;
// }


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
    baseURL: 'http://localhost:8080', // 设置默认的请求地址
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


// const client = new Client({
//     // 使用 SockJS 工厂创建 WebSocket
//     webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
//     connectHeaders: {
//         Authorization: `Bearer ${token = getToken()}`,
//     },
//     onConnect: () => {
//         console.log('STOMP 连接成功:', WebsocketToken);
//         client.subscribe('/topic/game-updates', (message) => {
//             console.log('收到消息:', message.body);
//         });
//     },
//     onStompError: (frame) => {
//         console.error('STOMP 错误:', frame);
//     },
//     debug: (str) => console.log(str),
// });

// // 启动连接
// client.activate();

export { get, post };