/**
 * 云函数：获取用户学习进度
 * 功能：查询并返回用户当前的学习进度数据
 * 
 * @param {Object} event - 调用云函数时传入的参数（本函数未使用）
 * @param {Object} context - 云函数运行上下文
 * @returns {Object} 返回包含学习进度的JSON对象
 */
exports.main = async (event, context) => {
  try {
    // 初始化数据库连接
    const db = uniCloud.database();
    const collection = db.collection('user_learning_progress');
    
    // 查询用户学习进度数据
    const { data } = await collection.get();
    
    // 如果数据库中有数据，返回实际进度
    if (data && data.length > 0) {
      return {
        success: true,
        data: {
          currentGroupIndex: data[0].currentGroupIndex,
          currentWordIndex: data[0].currentWordIndex,
          learnedCount: data[0].learnedCount || 0  // 确保有默认值
        }
      };
    } else {
      // 如果无数据，返回初始进度（默认值）
      return {
        success: true,
        data: {
          currentGroupIndex: 0,      // 默认从第0组开始
          currentWordIndex: 0,       // 默认从第0个单词开始
          learnedCount: 0            // 默认已学单词数为0
        }
      };
    }
  } catch (err) {
    // 错误处理：记录错误并返回错误信息
    console.error('获取进度失败:', err);
    return {
      success: false,
      message: '服务器错误'
    };
  }
};