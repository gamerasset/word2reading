#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
启动后端服务器
"""

import os
import sys

def start_server():
    """启动Flask服务器"""
    
    print("=" * 50)
    print("单词阅读理解小程序 - 后端服务器")
    print("=" * 50)
    
    print("🚀 启动服务器...")
    print("📍 地址: http://127.0.0.1:5123")
    print("🔧 API端点:")
    print("   POST /api/generate-reading-test - 生成阅读理解题")
    print()
    print("💡 测试命令:")
    print("   python test_api.py")
    print()
    print("按 Ctrl+C 停止服务器")
    print("-" * 50)
    
    # 导入并运行app
    from app import app
    app.run(host='0.0.0.0', port=5123, debug=True)

if __name__ == "__main__":
    start_server()