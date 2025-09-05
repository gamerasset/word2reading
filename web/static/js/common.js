// 通用工具函数

// 显示加载状态
function showLoading(element, text = '加载中...') {
    if (element) {
        element.innerHTML = `<span class="loading-spinner"></span> ${text}`;
        element.disabled = true;
    }
}

// 隐藏加载状态
function hideLoading(element, text = '完成') {
    if (element) {
        element.innerHTML = text;
        element.disabled = false;
    }
}

// 显示消息
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 存储数据到localStorage
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('保存数据失败:', e);
    }
}

// 从localStorage读取数据
function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('读取数据失败:', e);
        return null;
    }
}

// 清除存储数据
function clearStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        console.error('清除数据失败:', e);
    }
}

// 页面跳转
function navigateTo(url, params = {}) {
    const urlObj = new URL(url, window.location.origin);
    
    // 添加参数
    Object.keys(params).forEach(key => {
        urlObj.searchParams.set(key, params[key]);
    });
    
    window.location.href = urlObj.toString();
}

// 获取URL参数
function getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    
    return params;
}

// API请求封装
async function apiRequest(url, options = {}) {
    const defaultOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const response = await fetch(url, finalOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
}