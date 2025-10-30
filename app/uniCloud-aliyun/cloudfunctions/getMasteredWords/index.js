/**
 * 云函数：获取用户已掌握的单词列表
 * 功能：从数据库中查询并返回用户标记为"已掌握"的所有单词
 * 
 * @param {Object} event - 调用云函数时传入的参数（本函数未使用）
 * @returns {Object} 返回包含单词列表的JSON对象
 *          - success {Boolean} 请求是否成功
 *          - data {Array} 已掌握的单词数组
 *            - 每个单词包含：word（单词）、phonetic（音标）、meaning（释义）等字段
 */
exports.main = async (event) => {
  try {
    // 初始化数据库连接
    const db = uniCloud.database();
    // 连接到存储已掌握单词的集合
    const collection = db.collection('mastered_words');
    
    // 执行数据库查询，获取所有已掌握单词
    const res = await collection.get();
    
    // 返回成功响应，包含单词数据
    return {
      success: true,
      data: res.data  // res.data 是查询返回的单词数组
    };
  } catch (err) {
    // 错误处理：记录错误堆栈信息
    console.error('查询已掌握单词失败:', err);
    
    // 返回失败响应，包含错误信息
    return {
      success: false,
      message: '数据库查询失败'
    };
  }
};