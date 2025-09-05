// 等待页面逻辑

class WaitingPageManager {
    constructor() {
        this.selectedWords = [];
        this.initializePage();
        this.startGeneration();
    }

    initializePage() {
        // 从localStorage获取选中的单词
        this.selectedWords = loadFromStorage('selectedWords') || [];
        
        if (this.selectedWords.length === 0) {
            // 如果没有单词，跳转回主页
            showMessage('没有找到选中的单词', 'error');
            setTimeout(() => {
                navigateTo('/');
            }, 2000);
            return;
        }

        // 显示选中的单词
        this.displaySelectedWords();
    }

    displaySelectedWords() {
        const wordsContainer = document.getElementById('selected-words');
        
        if (wordsContainer) {
            wordsContainer.innerHTML = this.selectedWords
                .map(word => `<span class="word-tag">${word}</span>`)
                .join('');
        }
    }

    async startGeneration() {
        try {
            console.log('开始生成阅读理解，单词:', this.selectedWords);
            
            const response = await fetch('/api/generate-reading-test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    words: this.selectedWords
                })
            });

            const result = await response.json();
            console.log('生成结果:', result);

            if (result.success) {
                if (result.data) {
                    // 保存生成的数据
                    saveToStorage('quizData', result.data);
                    
                    // 延迟一下让用户看到加载动画
                    setTimeout(() => {
                        navigateTo('/quiz');
                    }, 1500);
                } else if (result.raw_content) {
                    // 处理原始内容
                    console.log('收到原始内容:', result.raw_content);
                    showMessage('AI返回了非结构化内容，请查看控制台', 'warning');
                    
                    // 尝试解析原始内容
                    try {
                        let content = result.raw_content.trim();
                        
                        // 清理markdown代码块
                        if (content.startsWith('```json')) {
                            content = content.substring(7);
                        }
                        if (content.endsWith('```')) {
                            content = content.substring(0, content.length - 3);
                        }
                        
                        const parsedData = JSON.parse(content);
                        saveToStorage('quizData', parsedData);
                        
                        setTimeout(() => {
                            navigateTo('/quiz');
                        }, 1500);
                        
                    } catch (parseError) {
                        console.error('解析原始内容失败:', parseError);
                        this.handleGenerationError('AI返回的内容格式有误');
                    }
                } else {
                    this.handleGenerationError('生成的数据格式不正确');
                }
            } else {
                this.handleGenerationError(result.message || '生成失败');
            }

        } catch (error) {
            console.error('生成请求失败:', error);
            this.handleGenerationError('网络请求失败，请检查服务器连接');
        }
    }

    handleGenerationError(message) {
        // 显示错误信息
        const container = document.querySelector('.waiting-container');
        container.innerHTML = `
            <div class="error-container">
                <h2>😔 生成失败</h2>
                <p class="error-message">${message}</p>
                <div class="error-actions">
                    <button class="btn btn-primary" onclick="location.href='/'">重新开始</button>
                    <button class="btn btn-secondary" onclick="location.reload()">重试</button>
                </div>
            </div>
        `;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new WaitingPageManager();
});