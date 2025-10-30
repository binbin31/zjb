/**
 * 云函数：保存用户已掌握的单词
 * 功能：将用户标记为"已掌握"的单词保存到数据库中
 * 
 * @param {Object} event - 调用云函数时传入的参数
 *        - wordData {Object} 单词数据对象
 *          - word {String} 单词文本
 *          - phonetic {String} 音标（可选）
 *          - meaning {Object} 释义信息
 *            - partOfSpeech {String} 词性（可选）
 *            - translation {String} 翻译
 *            - example {String} 例句（可选）
 *            - synonym {String} 同义词（可选）
 * @param {Object} context - 云函数运行上下文
 * @returns {Object} 返回操作结果的JSON对象
 *          - success {Boolean} 操作是否成功
 *          - message {String} 操作结果消息
 */
exports.main = async (event, context) => {
  try {
    // 从参数中获取单词数据
    const { wordData } = event;
    // 初始化数据库连接
    const db = uniCloud.database();
    // 连接到存储已掌握单词的集合
    const collection = db.collection('mastered_words');
    
    // 检查单词是否已存在于数据库中
    const { data } = await collection.where({
      'word': wordData.word  // 根据单词文本进行查询
    }).get();
    
    // 如果单词已存在，直接返回成功
    if (data && data.length > 0) {
      return { success: true, message: '单词已存在' };
    }
    
    // 单词不存在，执行插入操作
    await collection.add({
      word: wordData.word,  // 单词文本
      phonetic: wordData.phonetic || '',  // 音标（默认空字符串）
      meaning: {
        // 词性（默认空字符串）
        partOfSpeech: wordData.meaning?.partOfSpeech || '',
        // 翻译（必须字段）
        translation: wordData.meaning?.translation || '',
        // 例句（默认空字符串）
        example: wordData.meaning?.example || '',
        // 同义词（默认空字符串）
        synonym: wordData.meaning?.synonym || ''
      }
    });
    
    // 返回成功响应
    return { success: true, message: '单词保存成功' };
  } catch (err) {
    // 错误处理：记录错误并返回错误信息
    console.error('保存单词失败:', err);
    return { success: false, message: '服务器错误' };
  }
};