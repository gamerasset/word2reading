// 主页面逻辑 - 输入单词页面

class WordInputManager {
    constructor() {
        this.inputs = [];
        this.validWords = [];
        this.isLoading = false;
        
        this.initializeInputs();
        this.initializeDictionary();
        this.bindEvents();
    }

    initializeInputs() {
        // 初始化输入框状态
        for (let i = 1; i <= 5; i++) {
            this.inputs.push({
                element: document.getElementById(`word${i}`),
                status: document.getElementById(`status${i}`),
                value: '',
                isValid: false,
                translation: ''
            });
        }
    }

    async initializeDictionary() {
        const statusEl = document.getElementById('dictionary-status');
        
        try {
            statusEl.className = 'status-indicator loading';
            statusEl.innerHTML = '<span class="status-text">词典加载中...</span>';
            
            const success = await dictionary.loadDictionary();
            
            if (success) {
                const stats = dictionary.getStats();
                statusEl.className = 'status-indicator success';
                statusEl.innerHTML = `<span class="status-text">✓ 词典已加载 (${stats.total}个单词)</span>`;
            } else {
                statusEl.className = 'status-indicator error';
                statusEl.innerHTML = '<span class="status-text">✗ 词典加载失败</span>';
            }
        } catch (error) {
            console.error('词典初始化失败:', error);
            statusEl.className = 'status-indicator error';
            statusEl.innerHTML = '<span class="status-text">✗ 词典加载失败</span>';
        }
    }

    bindEvents() {
        // 绑定输入框事件
        this.inputs.forEach((input, index) => {
            input.element.addEventListener('blur', (e) => {
                this.handleWordInput(index, e.target.value);
            });
            
            input.element.addEventListener('input', (e) => {
                // 实时清除状态
                if (!e.target.value.trim()) {
                    this.clearInputStatus(index);
                }
            });
        });

        // 绑定生成按钮事件
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.addEventListener('click', () => {
            this.handleGenerate();
        });
    }

    async handleWordInput(index, value) {
        const input = this.inputs[index];
        const word = value.trim().toLowerCase();

        // 清空输入
        if (!word) {
            this.clearInputStatus(index);
            this.updateGenerateButton();
            return;
        }

        // 检查词典是否已加载
        if (!dictionary.isLoaded) {
            this.setInputStatus(index, 'error', '词典尚未加载完成');
            this.updateGenerateButton();
            return;
        }

        // 显示加载状态
        this.setInputStatus(index, 'loading', '检查中...');

        try {
            // 使用本地词典查询
            const wordInfo = dictionary.lookupWord(word);
            
            if (wordInfo) {
                input.value = word;
                input.isValid = true;
                input.translation = wordInfo.translation;
                this.setInputStatus(index, 'success', `✓ ${wordInfo.translation}`);
            } else {
                input.value = word;
                input.isValid = false;
                input.translation = '';
                this.setInputStatus(index, 'error', '✗ 单词不在KET/PET词汇表中');
            }
        } catch (error) {
            console.error('查询单词失败:', error);
            input.isValid = false;
            this.setInputStatus(index, 'error', '✗ 查询失败');
        }

        this.updateGenerateButton();
    }

    setInputStatus(index, type, message) {
        const input = this.inputs[index];
        
        // 更新输入框样式
        input.element.className = `word-input ${type === 'success' ? 'valid' : type === 'error' ? 'invalid' : ''}`;
        
        // 更新状态文本
        input.status.className = `word-status ${type === 'success' ? 'success' : type === 'error' ? 'error' : ''}`;
        input.status.textContent = message;
    }

    clearInputStatus(index) {
        const input = this.inputs[index];
        input.value = '';
        input.isValid = false;
        input.translation = '';
        
        input.element.className = 'word-input';
        input.status.className = 'word-status';
        input.status.textContent = '';
    }

    updateGenerateButton() {
        const generateBtn = document.getElementById('generateBtn');
        
        // 统计有效单词
        this.validWords = this.inputs
            .filter(input => input.isValid)
            .map(input => input.value);

        // 检查是否有无效输入
        const hasInvalidInput = this.inputs.some(input => 
            input.element.value.trim() && !input.isValid
        );

        // 至少3个有效单词且没有无效输入
        const canGenerate = this.validWords.length >= 3 && !hasInvalidInput;
        
        generateBtn.disabled = !canGenerate || this.isLoading;
        
        if (canGenerate && !this.isLoading) {
            generateBtn.querySelector('.btn-text').textContent = `生成阅读理解 (${this.validWords.length}个单词)`;
        } else {
            generateBtn.querySelector('.btn-text').textContent = '生成阅读理解';
        }
    }

    async handleGenerate() {
        if (this.validWords.length < 3 || this.isLoading) {
            return;
        }

        this.isLoading = true;
        const generateBtn = document.getElementById('generateBtn');
        const btnText = generateBtn.querySelector('.btn-text');
        const btnLoading = generateBtn.querySelector('.btn-loading');

        // 显示加载状态
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        generateBtn.disabled = true;

        try {
            // 保存单词到localStorage
            saveToStorage('selectedWords', this.validWords);
            
            // 跳转到等待页面
            navigateTo('/waiting');
            
        } catch (error) {
            console.error('生成失败:', error);
            showMessage('生成失败，请重试', 'error');
            
            // 恢复按钮状态
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            generateBtn.disabled = false;
            this.isLoading = false;
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new WordInputManager();
});