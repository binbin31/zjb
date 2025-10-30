/**
 * 云函数：从已掌握单词列表中删除指定单词
 * 功能：根据单词文本，从数据库中删除用户标记为"已掌握"的单词
 * 
 * @param {Object} event - 调用云函数时传入的参数
 *        - word {String} 需要删除的单词文本
 * @returns {Object} 返回操作结果的JSON对象
 *          - success {Boolean} 操作是否成功
 *          - deleted {Number} 成功删除的记录数量（0或1）
 */
exports.main = async (event) => {
  try {
    // 初始化数据库连接
    const db = uniCloud.database();
    // 连接到存储已掌握单词的集合
    const collection = db.collection('mastered_words');
    
    // 执行数据库删除操作，根据单词文本匹配记录
    const res = await collection.where({
      word: event.word  // 匹配单词字段
    }).remove();
    
    // 返回成功响应，包含删除的记录数量
    return {
      success: true,
      deleted: res.deleted  // 成功删除的记录数（通常为0或1）
    };
  } catch (err) {
    // 错误处理：记录错误并返回错误信息
    console.error('删除单词失败:', err);
    return {
      success: false,
      message: '删除单词失败'
    };
  }
};