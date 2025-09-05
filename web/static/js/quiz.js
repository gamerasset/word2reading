// 答题页面逻辑

class QuizManager {
    constructor() {
        this.quizData = null;
        this.userAnswers = [];
        this.isSubmitted = false;
        
        this.initializePage();
    }

    initializePage() {
        // 从localStorage获取题目数据
        this.quizData = loadFromStorage('quizData');
        
        if (!this.quizData) {
            showMessage('没有找到题目数据', 'error');
            setTimeout(() => {
                navigateTo('/');
            }, 2000);
            return;
        }

        console.log('加载题目数据:', this.quizData);
        
        // 渲染页面内容
        this.renderArticle();
        this.renderQuestions();
        this.bindEvents();
    }

    renderArticle() {
        const articleContent = document.getElementById('article-content');
        const levelBadge = document.getElementById('article-level');
        
        if (articleContent && this.quizData.article) {
            articleContent.textContent = this.quizData.article;
        }
        
        if (levelBadge && this.quizData.level) {
            levelBadge.textContent = `难度: ${this.quizData.level}`;
        }
    }

    renderQuestions() {
        const questionsContainer = document.getElementById('questions-container');
        
        if (!questionsContainer || !this.quizData.questions) {
            return;
        }

        // 初始化用户答案数组
        this.userAnswers = new Array(this.quizData.questions.length).fill('');

        questionsContainer.innerHTML = this.quizData.questions
            .map((question, index) => this.renderQuestion(question, index))
            .join('');
    }

    renderQuestion(question, index) {
        const questionNumber = index + 1;
        
        return `
            <div class="question-item" data-question="${index}">
                <div class="question-title">
                    ${questionNumber}. ${question.question}
                </div>
                <div class="options">
                    ${Object.entries(question.options)
                        .map(([key, text]) => `
                            <label class="option" data-option="${key}">
                                <input type="radio" name="question_${index}" value="${key}">
                                <span class="option-text">${key}. ${text}</span>
                            </label>
                        `).join('')}
                </div>
                <div class="explanation" id="explanation_${index}">
                    <strong>解析：</strong>${question.explanation || '暂无解析'}
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 绑定选项点击事件
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' && e.target.name.startsWith('question_')) {
                this.handleAnswerSelect(e);
            }
        });

        // 绑定提交按钮
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.handleSubmit();
            });
        }

        // 绑定重新开始按钮
        const restartBtn = document.getElementById('restart-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.handleRestart();
            });
        }
    }

    handleAnswerSelect(e) {
        if (this.isSubmitted) return;

        const questionIndex = parseInt(e.target.name.split('_')[1]);
        const selectedOption = e.target.value;
        
        // 保存用户答案
        this.userAnswers[questionIndex] = selectedOption;
        
        // 更新问题项样式
        const questionItem = document.querySelector(`[data-question="${questionIndex}"]`);
        if (questionItem) {
            questionItem.classList.add('answered');
        }
        
        console.log(`问题 ${questionIndex + 1} 选择了: ${selectedOption}`);
    }

    handleSubmit() {
        if (this.isSubmitted) return;

        // 检查是否所有题目都已回答
        const unansweredCount = this.userAnswers.filter(answer => !answer).length;
        
        if (unansweredCount > 0) {
            const confirmSubmit = confirm(`还有 ${unansweredCount} 道题未回答，确定要提交吗？`);
            if (!confirmSubmit) {
                return;
            }
        }

        this.isSubmitted = true;
        this.showResults();
    }

    showResults() {
        let correctCount = 0;
        const totalQuestions = this.quizData.questions.length;

        // 遍历每个问题，显示结果
        this.quizData.questions.forEach((question, index) => {
            const userAnswer = this.userAnswers[index];
            const correctAnswer = question.correct_answer;
            const isCorrect = userAnswer === correctAnswer;
            
            if (isCorrect) {
                correctCount++;
            }

            // 更新选项样式
            const questionItem = document.querySelector(`[data-question="${index}"]`);
            const options = questionItem.querySelectorAll('.option');
            
            options.forEach(option => {
                const optionKey = option.dataset.option;
                const radio = option.querySelector('input[type="radio"]');
                
                // 禁用所有选项
                radio.disabled = true;
                
                if (optionKey === correctAnswer) {
                    // 正确答案
                    option.classList.add('correct');
                } else if (optionKey === userAnswer && userAnswer !== correctAnswer) {
                    // 用户选择的错误答案
                    option.classList.add('incorrect');
                }
            });

            // 显示解析
            const explanation = document.getElementById(`explanation_${index}`);
            if (explanation) {
                explanation.classList.add('show');
            }
        });

        // 显示得分
        this.displayScore(correctCount, totalQuestions);
        
        // 更新按钮
        const submitBtn = document.getElementById('submit-btn');
        const restartBtn = document.getElementById('restart-btn');
        
        if (submitBtn) submitBtn.style.display = 'none';
        if (restartBtn) restartBtn.style.display = 'inline-block';
    }

    displayScore(correct, total) {
        const resultSummary = document.getElementById('result-summary');
        const scoreEl = document.getElementById('score');
        const totalEl = document.getElementById('total');
        const percentageEl = document.getElementById('percentage');
        
        if (resultSummary) {
            resultSummary.style.display = 'block';
        }
        
        if (scoreEl) scoreEl.textContent = correct;
        if (totalEl) totalEl.textContent = total;
        if (percentageEl) {
            const percentage = Math.round((correct / total) * 100);
            percentageEl.textContent = percentage;
        }

        // 显示成绩提示
        const percentage = Math.round((correct / total) * 100);
        let message = '';
        
        if (percentage >= 90) {
            message = '🎉 优秀！';
        } else if (percentage >= 80) {
            message = '👍 良好！';
        } else if (percentage >= 60) {
            message = '📚 继续努力！';
        } else {
            message = '💪 加油！';
        }
        
        showMessage(`${message} 您答对了 ${correct}/${total} 题`, 'success');
    }

    handleRestart() {
        // 清除存储的数据
        clearStorage('selectedWords');
        clearStorage('quizData');
        
        // 跳转到主页
        navigateTo('/');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new QuizManager();
});