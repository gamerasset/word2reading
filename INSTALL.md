# 详细安装指南

## 🎯 适用人群
本指南适合计算机初学者，将手把手教您完成整个安装过程。

## 📋 安装前准备

### 系统要求
- Windows 10/11、macOS 10.14+、或 Linux
- 至少4GB内存
- 至少2GB可用磁盘空间
- 稳定的网络连接

## 🔧 第一步：安装Anaconda

### Windows用户

1. **下载Anaconda**
   - 打开浏览器，访问：https://www.anaconda.com/download
   - 点击"Download"按钮
   - 选择"Windows"版本
   - 下载完成后，文件名类似：`Anaconda3-2024.02-1-Windows-x86_64.exe`

2. **安装Anaconda**
   - 双击下载的exe文件
   - 点击"Next"继续
   - 点击"I Agree"同意许可协议
   - 选择"Just Me"（推荐）
   - 选择安装路径（默认即可）
   - ⚠️ **重要**：勾选"Add Anaconda3 to my PATH environment variable"
   - 点击"Install"开始安装
   - 安装完成后点击"Finish"

3. **验证安装**
   - 按`Win+R`键，输入`cmd`，按回车
   - 在命令提示符中输入：`python --version`
   - 应该显示类似：`Python 3.11.7`
   - 输入：`conda --version`
   - 应该显示类似：`conda 24.1.2`

### macOS用户

1. **下载Anaconda**
   - 访问：https://www.anaconda.com/download
   - 选择"macOS"版本下载

2. **安装Anaconda**
   - 双击下载的pkg文件
   - 按照安装向导完成安装
   - 安装完成后重启终端

3. **验证安装**
   - 按`Cmd+空格`，输入"Terminal"，打开终端
   - 输入：`python --version`和`conda --version`验证

## 🚀 第二步：安装Kiro

### 下载和安装

1. **访问Kiro官网**
   - 打开浏览器，访问：https://kiro.ai
   - 点击"Download"按钮

2. **选择版本**
   - Windows用户：下载`.exe`文件
   - macOS用户：下载`.dmg`文件
   - Linux用户：下载`.AppImage`文件

3. **安装Kiro**
   - **Windows**：双击exe文件，按向导安装
   - **macOS**：双击dmg文件，拖拽到Applications文件夹
   - **Linux**：给AppImage文件执行权限后运行

4. **首次启动**
   - 启动Kiro
   - 可能需要注册账号或登录
   - 完成初始设置

## ⚙️ 第三步：配置Kiro中的Python

### 设置Python解释器

1. **打开Kiro**
   - 启动Kiro应用程序

2. **打开命令面板**
   - Windows/Linux：按`Ctrl+Shift+P`
   - macOS：按`Cmd+Shift+P`

3. **选择Python解释器**
   - 在命令面板中输入：`Python: Select Interpreter`
   - 选择包含"anaconda"或"conda"的Python路径
   - 例如：`~/anaconda3/bin/python`或`C:\\Users\\YourName\\anaconda3\\python.exe`

4. **验证配置**
   - 在Kiro中打开终端：`View` → `Terminal`
   - 输入`python --version`确认版本

## 📥 第四步：下载项目

### 方法一：使用Git（推荐）

1. **安装Git**
   - Windows：从 https://git-scm.com 下载安装
   - macOS：通过Homebrew安装：`brew install git`
   - Linux：`sudo apt install git`（Ubuntu）

2. **克隆项目**
   ```bash
   git clone https://github.com/YOUR_USERNAME/danciyuedu.git
   cd danciyuedu
   ```

### 方法二：直接下载

1. **下载ZIP文件**
   - 访问项目GitHub页面
   - 点击绿色"Code"按钮
   - 选择"Download ZIP"
   - 解压到您选择的文件夹

## 🔧 第五步：配置项目

### 1. 在Kiro中打开项目

1. **打开文件夹**
   - 在Kiro中选择：`File` → `Open Folder`
   - 选择项目文件夹（danciyuedu）

### 2. 安装Python依赖

1. **打开终端**
   - 在Kiro中按`Ctrl+`` （反引号）打开终端
   - 或者选择：`View` → `Terminal`

2. **安装依赖包**
   ```bash
   pip install flask flask-cors openai
   ```
   
   或者使用requirements文件：
   ```bash
   pip install -r web/requirements.txt
   ```

### 3. 配置API密钥

1. **复制配置模板**
   - 在项目的`web`文件夹中找到`config_template.py`
   - 复制该文件并重命名为`config.py`

2. **编辑配置文件**
   - 在Kiro中打开`web/config.py`
   - 修改API配置：
   ```python
   API_CONFIGS = [
       {
           "base_url": "https://api.openai.com/v1",  # 您的API地址
           "api_key": "sk-your-actual-api-key",      # 您的API密钥
           "model": "gpt-3.5-turbo"                  # 模型名称
       }
   ]
   ```

## 🎮 第六步：运行项目

### 启动服务器

1. **运行启动脚本**
   - 在Kiro终端中输入：
   ```bash
   python web/start_server.py
   ```

2. **查看启动信息**
   - 应该看到类似输出：
   ```
   ==================================================
   单词阅读理解生成器 - 网页版
   ==================================================
   🚀 启动服务器...
   📍 访问地址: http://127.0.0.1:5123
   ```

3. **访问网站**
   - 打开浏览器
   - 访问：http://127.0.0.1:5123
   - 开始使用！

## 🔍 常见问题解决

### 问题1：找不到python命令
**解决方案**：
- 确认Anaconda安装时勾选了PATH选项
- 重启命令提示符或终端
- 重新安装Anaconda

### 问题2：pip install失败
**解决方案**：
```bash
# 升级pip
python -m pip install --upgrade pip

# 使用国内镜像源
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple flask flask-cors openai
```

### 问题3：端口被占用
**解决方案**：
- 修改`web/config.py`中的`SERVER_PORT`为其他端口
- 或者关闭占用5123端口的其他程序

### 问题4：API调用失败
**解决方案**：
- 检查API密钥是否正确
- 确认API服务商账户有余额
- 检查网络连接

### 问题5：词典加载失败
**解决方案**：
- 确认`miniprogram/data/dictionary.js`文件存在
- 检查文件是否完整（约379KB）

## 📞 获取帮助

如果遇到问题：
1. 查看项目的Issues页面
2. 提交新的Issue描述问题
3. 加入学习群获得更多帮助

## 🎉 成功标志

当您看到以下内容时，说明安装成功：
- 浏览器能正常访问 http://127.0.0.1:5123
- 页面显示"单词阅读理解生成器"
- 词典状态显示"✓ 词典已加载"
- 能够输入单词并看到翻译

恭喜您！现在可以开始使用这个AI驱动的英语学习工具了！