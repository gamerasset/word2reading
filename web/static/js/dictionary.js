// 词典管理类
class Dictionary {
    constructor() {
        this.data = {};
        this.isLoaded = false;
    }

    async loadDictionary() {
        try {
            console.log('开始加载词典...');
            const response = await fetch('/api/dictionary');
            console.log('API响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('词典数据类型:', typeof data);
            console.log('词典数据长度:', Object.keys(data).length);
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            this.data = data;
            this.isLoaded = true;
            console.log('词典加载成功');
            return true;
        } catch (error) {
            console.error('词典加载失败:', error);
            return false;
        }
    }

    lookupWord(word) {
        if (!this.isLoaded) {
            return null;
        }
        
        const normalizedWord = word.toLowerCase().trim();
        return this.data[normalizedWord] || null;
    }

    getStats() {
        if (!this.isLoaded) {
            return { total: 0 };
        }
        
        return {
            total: Object.keys(this.data).length
        };
    }

    // 检查单词是否有效
    async checkWord(word) {
        try {
            const response = await fetch('/api/check_word', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ word: word })
            });
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('检查单词失败:', error);
            return { success: false, message: '网络错误' };
        }
    }
}

// 创建全局词典实例
const dictionary = new Dictionary();