# 使用轻量级 Nginx 镜像
FROM nginx

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 Nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 复制 Vue 构建后的 `dist` 目录到 Nginx 静态目录
COPY dist/ /usr/share/nginx/html

# 暴露 Nginx 端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
