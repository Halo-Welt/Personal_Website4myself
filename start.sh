#!/bin/bash

# 检查是否已经运行
if pm2 list | grep -q "chat-server"; then
    echo "Chat server is already running"
    pm2 logs chat-server
    exit 0
fi

# 启动服务器
echo "Starting chat server..."
pm2 start ecosystem.config.js
pm2 logs chat-server 