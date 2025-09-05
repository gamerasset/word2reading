/**
 * 词典工具类
 * 用于加载和查询词典数据
 */
const dictionaryData = require('../data/dictionary.js');

class Dictionary {
  constructor() {
    this.data = dictionaryData;
    this.isLoaded = true; // Data is loaded at import time
  }

  /**
   * 异步加载词典的存根，以保持与以前的API兼容。
   * @returns {Promise<boolean>}
   */
  async loadDictionary() {
    // Data is already loaded, so we just return true.
    return Promise.resolve(true);
  }

  /**
   * 查询单词
   * @param {string} word 要查询的单词
   * @returns {Object|null} 单词信息或null
   */
  lookupWord(word) {
    if (!this.isLoaded || !this.data) {
      console.warn('词典尚未加载');
      return null;
    }

    const normalizedWord = word.toLowerCase().trim();
    return this.data[normalizedWord] || null;
  }

  /**
   * 检查单词是否存在
   * @param {string} word 要检查的单词
   * @returns {boolean} 单词是否存在
   */
  hasWord(word) {
    return this.lookupWord(word) !== null;
  }

  /**
   * 获取单词翻译
   * @param {string} word 要查询的单词
   * @returns {string|null} 翻译或null
   */
  getTranslation(word) {
    const wordInfo = this.lookupWord(word);
    return wordInfo ? wordInfo.translation : null;
  }

  /**
   * 获取单词级别信息
   * @param {string} word 要查询的单词
   * @returns {Object|null} 级别信息或null
   */
  getWordLevel(word) {
    const wordInfo = this.lookupWord(word);
    if (!wordInfo) return null;
    
    return {
      isKetExclusive: wordInfo.is_ket_exclusive,
      isPetExclusive: wordInfo.is_pet_exclusive,
      isBoth: !wordInfo.is_ket_exclusive && !wordInfo.is_pet_exclusive
    };
  }

  /**
   * 获取词典统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    if (!this.isLoaded || !this.data) {
      return { 
        total: 0, 
        ketExclusive: 0, 
        petExclusive: 0, 
        both: 0 
      };
    }

    const stats = { 
      total: 0, 
      ketExclusive: 0, 
      petExclusive: 0, 
      both: 0 
    };
    
    for (const word in this.data) {
      const info = this.data[word];
      stats.total++;
      if (info.is_ket_exclusive) {
        stats.ketExclusive++;
      } else if (info.is_pet_exclusive) {
        stats.petExclusive++;
      } else {
        stats.both++;
      }
    }

    return stats;
  }
}

// 创建全局实例
const dictionary = new Dictionary();

module.exports = dictionary;