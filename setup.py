#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目设置和安全检查工具
"""

import os
import re
import subprocess
import shutil
from pathlib import Path

def check_git_installed():
    """检查Git是否已安装"""
    try:
        result = subprocess.run(['git', '--version'], 
                              capture_output=True, text=True, check=True)
        print(f"✅ Git已安装: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Git未安装，请先安装Git")
        print("   下载地址: https://git-scm.com/downloads")
        return False

def check_sensitive_info():
    """检查敏感信息"""
    print("🔍 检查敏感信息...")
    
    # 真实敏感信息的模式（排除占位符）
    sensitive_patterns = [
        (r'sk-[a-zA-Z0-9]{48}', 'OpenAI API Key'),
        (r'["\']api[_-]?key["\']\s*:\s*["\'][a-zA-Z0-9]{20,}["\']', 'API Key'),
    ]
    
    # 占位符模式（这些是安全的）
    safe_patterns = [
        r'YOUR_.*',
        r'sk-your-.*',
        r'用户的.*',
        r'您的.*',
    ]
    
    issues = []
    
    for root, dirs, files in os.walk('.'):
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            if file.endswith(('.py', '.js', '.json')):
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        
                    for pattern, desc in sensitive_patterns:
                        matches = re.findall(pattern, content)
                        for match in matches:
                            # 检查是否是占位符
                            is_safe = any(re.search(safe_pattern, match, re.IGNORECASE) 
                                        for safe_pattern in safe_patterns)
                            if not is_safe:
                                issues.append((file_path, desc, match))
                                
                except Exception:
                    continue
    
    if issues:
        print("⚠️  发现敏感信息:")
        for file_path, desc, match in issues:
            print(f"   - {file_path}: {desc}")
        return False
    else:
        print("✅ 未发现敏感信息")
        return True

def setup_config():
    """设置配置文件"""
    print("🔧 设置配置文件...")
    
    config_path = Path('web/config.py')
    template_path = Path('web/config_template.py')
    
    if config_path.exists():
        print("ℹ️  config.py已存在")
        return True
    
    if template_path.exists():
        shutil.copy(template_path, config_path)
        print("✅ 已创建config.py")
        print("⚠️  请编辑web/config.py，填入您的API配置")
        return True
    else:
        print("❌ 配置模板不存在")
        return False

def clean_cache():
    """清理缓存文件"""
    print("🧹 清理缓存文件...")
    
    patterns = ['**/__pycache__', '**/*.pyc', '**/.DS_Store']
    cleaned = 0
    
    for pattern in patterns:
        for path in Path('.').glob(pattern):
            try:
                if path.is_file():
                    path.unlink()
                elif path.is_dir():
                    shutil.rmtree(path)
                cleaned += 1
            except Exception:
                pass
    
    print(f"✅ 清理了 {cleaned} 个文件")

def init_git():
    """初始化Git仓库"""
    if os.path.exists('.git'):
        print("ℹ️  Git仓库已存在")
        return True
    
    try:
        subprocess.run(['git', 'init'], check=True, capture_output=True)
        print("✅ Git仓库初始化成功")
        return True
    except subprocess.CalledProcessError:
        print("❌ Git初始化失败")
        return False

def main():
    """主函数"""
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'check':
        # 仅运行安全检查
        print("=" * 40)
        print("🛡️  安全检查")
        print("=" * 40)
        
        if check_sensitive_info():
            print("\n🎉 安全检查通过！")
        else:
            print("\n⚠️  请处理发现的问题")
        return
    
    # 完整设置流程
    print("=" * 40)
    print("🚀 项目设置工具")
    print("=" * 40)
    
    steps = [
        ("检查Git", check_git_installed),
        ("安全检查", check_sensitive_info),
        ("设置配置", setup_config),
        ("清理缓存", clean_cache),
        ("初始化Git", init_git),
    ]
    
    for name, func in steps:
        print(f"\n🔄 {name}...")
        if not func():
            print(f"❌ {name}失败")
            break
    else:
        print("\n" + "=" * 40)
        print("🎉 设置完成！")
        print("=" * 40)
        print("\n📋 下一步:")
        print("1. 编辑 web/config.py 配置API")
        print("2. 运行: python web/start_server.py")
        print("3. 访问: http://127.0.0.1:5123")

if __name__ == "__main__":
    main()