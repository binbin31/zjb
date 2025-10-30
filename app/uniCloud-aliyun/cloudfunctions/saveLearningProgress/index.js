/**
 * 云函数：保存用户学习进度
 * 功能：将用户的学习进度数据保存到数据库中
 * 
 * @param {Object} event - 调用云函数时传入的参数
 *        - currentGroupIndex {Number} 当前学习组索引
 *        - currentWordIndex {Number} 当前单词在组内的索引
 *        - learnedCount {Number} 已学习的单词总数
 * @param {Object} context - 云函数运行上下文
 * @returns {Object} 返回保存结果的JSON对象
 */
exports.main = async (event, context) => {
  try {
    // 初始化数据库连接
    const db = uniCloud.database();
    const collection = db.collection('user_learning_progress');
    // 从参数中获取学习进度数据
    const { currentGroupIndex, currentWordIndex, learnedCount } = event;
    
    // 获取当前时间，用于记录更新时间
    const now = new Date();
    
    // 查询用户当前的学习进度数据
    const { data } = await collection.get();
    
    // 如果已有记录，则更新该记录
    if (data && data.length > 0) {
      await collection.doc(data[0]._id).update({
        currentGroupIndex,
        currentWordIndex,
        learnedCount,
        updateTime: now  // 更新更新时间戳
      });
    } else {
      // 如果无记录，则创建新记录
      await collection.add({
        currentGroupIndex,
        currentWordIndex,
        learnedCount,
        createTime: now,  // 创建时间戳
        updateTime: now   // 更新时间戳（初始与创建时间相同）
      });
    }
    
    // 返回成功响应
    return {
      success: true,
      message: '学习进度保存成功'
    };
  } catch (err) {
    // 错误处理：记录错误并返回错误信息
    console.error('保存进度失败:', err);
    return {
      success: false,
      message: '服务器错误'
    };
  }
};