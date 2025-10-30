// cloudfunctions/getLearningProgress/index.js
exports.main = async (event, context) => {
  try {
    // 获取数据库引用
    const db = uniCloud.database();
    const collection = db.collection('user_learning_progress');
    
    // 查询学习进度
    const res = await collection.get();
    
    if (res.data && res.data.length > 0) {
      const progress = res.data[0];
      return {
        code: 200,
        data: {
          currentGroupIndex: progress.currentGroupIndex,
          currentWordIndex: progress.currentWordIndex
        }
      };
    } else {
      // 如果没有记录，返回默认进度
      return {
        code: 200,
        data: {
          currentGroupIndex: 0,
          currentWordIndex: 0
        }
      };
    }
  } catch (error) {
    console.error('获取学习进度失败:', error);
    return {
      code: 500,
      message: '服务器错误: ' + error.message
    };
  }
};