// frontend/pages/inputword/inputword.js

// 引入词典工具类
const dictionary = require('../../utils/dictionary.js');

Page({
  data: {
    // 使用一个数组来管理所有的输入框状态
    inputs: [
      { value: '', translation: '', error: '', isValid: false, placeholder: '输入第1个单词' },
      { value: '', translation: '', error: '', isValid: false, placeholder: '输入第2个单词' },
      { value: '', translation: '', error: '', isValid: false, placeholder: '输入第3个单词' },
      { value: '', translation: '', error: '', placeholder: '输入第4个单词 (可选)' },
      { value: '', translation: '', error: '', placeholder: '输入第5个单词 (可选)' },
    ],
    isButtonDisabled: true, // "生成短文"按钮的禁用状态
    isLoading: false, // 用于显示加载提示
    isDictionaryLoaded: false, // 词典是否已加载
    article: '', // AI生成的文章
    questions: [], // AI生成的问题
    showResult: false, // 是否显示结果
    userAnswers: [], // 用户答案
    showAnswers: false, // 是否显示答案
    score: 0, // 得分
    totalQuestions: 0 // 总题数
  },

  /**
   * 页面加载时初始化词典
   */
  onLoad() {
    this.initDictionary();
  },

  /**
   * 初始化词典数据
   */
  async initDictionary() {
    wx.showLoading({
      title: '加载词典中...',
      mask: true
    });

    try {
      const success = await dictionary.loadDictionary();
      if (success) {
        this.setData({ isDictionaryLoaded: true });
        const stats = dictionary.getStats();
        console.log('词典加载成功，统计信息:', stats);
        wx.showToast({
          title: `词典加载成功 (${stats.total}个单词)`,
          icon: 'success',
          duration: 2000
        });
        
        // 显示详细统计信息到控制台
        console.log('词典详细统计:', {
          总单词数: stats.total,
          KET专属: stats.ketExclusive,
          PET专属: stats.petExclusive,
          两者共有: stats.both
        });
      } else {
        wx.showModal({
          title: '错误',
          content: '词典加载失败，请重启小程序重试',
          showCancel: false
        });
      }
    } catch (error) {
      console.error('初始化词典失败:', error);
      wx.showModal({
        title: '错误',
        content: '词典初始化失败，请重启小程序重试',
        showCancel: false
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 当输入框失去焦点时触发此函数
   * @param {Object} e 事件对象，包含输入框信息
   */
  onWordBlur(e) {
    const index = e.currentTarget.dataset.index; // 获取当前输入框的索引
    const value = e.detail.value.trim().toLowerCase(); // 获取输入值并格式化

    // 如果输入值没有变化，则不执行任何操作
    if (value === this.data.inputs[index].value) {
      return;
    }

    // 如果输入框被清空，重置该输入框的状态
    if (!value) {
      this.setData({
        [`inputs[${index}]`]: { 
          value: '', 
          translation: '', 
          error: '', 
          isValid: false, 
          placeholder: this.data.inputs[index].placeholder 
        },
      });
      this.checkAllWordsValidity(); // 重新检查所有单词的有效性
      return;
    }

    // 检查词典是否已加载
    if (!this.data.isDictionaryLoaded) {
      this.setData({
        [`inputs[${index}].value`]: value,
        [`inputs[${index}].translation`]: '',
        [`inputs[${index}].error`]: '词典尚未加载完成，请稍候',
        [`inputs[${index}].isValid`]: false,
      });
      this.checkAllWordsValidity();
      return;
    }
    
    // 更新当前输入框的值
    this.setData({
      [`inputs[${index}].value`]: value,
      isLoading: true, // 显示加载状态
    });

    // 使用本地词典查询单词
    try {
      const wordInfo = dictionary.lookupWord(value);
      
      let update = {};
      if (wordInfo) {
        // 单词合法
        update = {
          [`inputs[${index}].translation`]: wordInfo.translation,
          [`inputs[${index}].error`]: '',
          [`inputs[${index}].isValid`]: true,
        };
        console.log(`[本地查询] 找到单词: ${value} -> ${wordInfo.translation}`);
      } else {
        // 单词非法
        update = {
          [`inputs[${index}].translation`]: '',
          [`inputs[${index}].error`]: '单词不在KET/PET词汇表中',
          [`inputs[${index}].isValid`]: false,
        };
        console.log(`[本地查询] 未找到单词: ${value}`);
      }
      
      this.setData(update);
      
    } catch (error) {
      console.error('查询单词时发生错误:', error);
      this.setData({
        [`inputs[${index}].translation`]: '',
        [`inputs[${index}].error`]: '查询单词时发生错误',
        [`inputs[${index}].isValid`]: false,
      });
    } finally {
      this.setData({ isLoading: false }); // 隐藏加载状态
      this.checkAllWordsValidity(); // 检查所有单词的有效性以更新按钮状态
    }
  },

  /**
   * 检查所有单词的有效性，并更新按钮状态
   */
  checkAllWordsValidity() {
    const inputs = this.data.inputs;
    let validWordCount = 0;
    let hasInvalidWord = false;

    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].value) { // 只要有输入值
        if (inputs[i].isValid) {
          validWordCount++;
        } else {
          hasInvalidWord = true;
          break; // 一旦发现一个非法的单词，就没必要继续检查了
        }
      }
    }

    // 规则：至少有3个单词，并且所有已输入的单词都必须是合法的
    const isButtonDisabled = !(validWordCount >= 3 && !hasInvalidWord);

    this.setData({ isButtonDisabled });
  },

  /**
   * 点击"生成短文"按钮
   */
  onGenerateClick() {
    if (this.data.isButtonDisabled || this.data.isLoading) return;

    this.setData({ isLoading: true });

    // 收集所有合法的单词
    const validWords = this.data.inputs
      .filter(input => input.isValid)
      .map(input => input.value);
    
    console.log('向后端发送的单词:', validWords);

    wx.request({
      url: 'http://127.0.0.1:5123/api/generate-reading-test',
      method: 'POST',
      data: {
        words: validWords
      },
      success: (res) => {
        console.log('后端返回成功:', res.data);
        if (res.data.success) {
          if (res.data.data) {
            // 结构化数据
            const { article, questions, level } = res.data.data;
            const processedQuestions = this.processQuestions(questions);
            
            this.setData({
              article: article,
              questions: processedQuestions,
              level: level || 'B1', // 默认B1级别
              showResult: true,
              userAnswers: new Array(5).fill(''), // 初始化用户答案
              showAnswers: false // 是否显示答案
            });
          } else if (res.data.raw_content) {
            // 原始内容，需要手动解析
            wx.showModal({
              title: '提示',
              content: 'AI返回了非结构化内容，请查看控制台',
              showCancel: false
            });
            console.log('原始AI内容:', res.data.raw_content);
          }
        } else {
          wx.showModal({
            title: '生成失败',
            content: res.data.message || '未知错误',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('请求后端失败:', err);
        wx.showModal({
          title: '请求失败',
          content: '无法连接到服务器，请稍后重试',
          showCancel: false
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  /**
   * 处理题目数据，为每个选项添加随机顺序
   */
  processQuestions(questions) {
    return questions.map((q, index) => {
      const correctAnswer = q.correct_answer;
      const options = q.options;
      
      // 创建选项数组并打乱顺序
      const optionKeys = ['A', 'B', 'C', 'D'];
      const shuffledOptions = optionKeys.map(key => ({
        key: key,
        text: options[key],
        isCorrect: key === correctAnswer
      }));
      
      // 简单的打乱算法
      for (let i = shuffledOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
      }
      
      return {
        question: q.question,
        options: shuffledOptions,
        correctAnswer: correctAnswer,
        explanation: q.explanation,
        userAnswer: '',
        questionIndex: index
      };
    });
  },

  /**
   * 用户选择答案
   */
  onAnswerSelect(e) {
    const questionIndex = e.currentTarget.dataset.questionIndex;
    const selectedKey = e.currentTarget.dataset.optionKey;
    
    // 更新用户答案
    this.setData({
      [`questions[${questionIndex}].userAnswer`]: selectedKey
    });
  },

  /**
   * 提交答案
   */
  onSubmitAnswers() {
    const questions = this.data.questions;
    let answeredCount = 0;
    
    // 检查是否所有题目都已回答
    questions.forEach(q => {
      if (q.userAnswer) answeredCount++;
    });
    
    if (answeredCount < questions.length) {
      wx.showModal({
        title: '提示',
        content: `还有 ${questions.length - answeredCount} 道题未回答，确定要提交吗？`,
        success: (res) => {
          if (res.confirm) {
            this.showResults();
          }
        }
      });
    } else {
      this.showResults();
    }
  },

  /**
   * 显示答题结果
   */
  showResults() {
    const questions = this.data.questions;
    let correctCount = 0;
    
    // 计算得分
    const updatedQuestions = questions.map(q => {
      const isCorrect = q.userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      
      return {
        ...q,
        isCorrect: isCorrect,
        showResult: true
      };
    });
    
    this.setData({
      questions: updatedQuestions,
      showAnswers: true,
      score: correctCount,
      totalQuestions: questions.length,
      scorePercentage: Math.round(correctCount / questions.length * 100)
    });

    // 显示得分
    wx.showModal({
      title: '答题完成',
      content: `您答对了 ${correctCount}/${questions.length} 题`,
      showCancel: false
    });
  },

  /**
   * 重新开始
   */
  onRestart() {
    this.setData({
      inputs: [
        { value: '', translation: '', error: '', isValid: false, placeholder: '输入第1个单词' },
        { value: '', translation: '', error: '', isValid: false, placeholder: '输入第2个单词' },
        { value: '', translation: '', error: '', isValid: false, placeholder: '输入第3个单词' },
        { value: '', translation: '', error: '', placeholder: '输入第4个单词 (可选)' },
        { value: '', translation: '', error: '', placeholder: '输入第5个单词 (可选)' },
      ],
      isButtonDisabled: true,
      showResult: false,
      article: '',
      questions: [],
      userAnswers: [],
      showAnswers: false
    });
  }
})