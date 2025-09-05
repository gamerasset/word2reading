#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API配置模板文件
请复制此文件为 config.py 并填入您的真实API配置
"""

# OpenAI兼容API配置
API_CONFIGS = [
    {
        "base_url": "https://apis.iflow.cn/v1",  # 例如: "https://api.openai.com/v1"
        "api_key": "YOUR_API_KEY",        # 您的API密钥
        "model": "YOUR_MODEL_NAME"        # 例如: "gpt-3.5-turbo"
    },
    # 可以配置多个API作为备选
    # {
    #     "base_url": "BACKUP_API_BASE_URL",
    #     "api_key": "BACKUP_API_KEY", 
    #     "model": "BACKUP_MODEL_NAME"
    # }
]

# 服务器配置
SERVER_HOST = "127.0.0.1"
SERVER_PORT = 5123
DEBUG_MODE = True