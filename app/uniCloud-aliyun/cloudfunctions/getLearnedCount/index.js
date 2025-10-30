// cloudfunctions/getLearnedCount/index.js
'use strict';
exports.main = async (event, context) => {
  const db = uniCloud.database();
  const collection = db.collection('user_learning_progress');
  
  try {
    // 查询学习进度记录（假设每个用户一条记录，这里取第一条）
    const res = await collection.get();
    
    if (res.data && res.data.length > 0) {
      // 返回learnedCount的值
      return {
        code: 200,
        message: '获取成功',
        data: {
          learnedCount: res.data[0].learnedCount
        }
      };
    } else {
      return {
        code: 404,
        message: '未找到学习进度记录',
        data: null
      };
    }
  } catch (err) {
    console.error('获取学习进度失败：', err);
    return {
      code: 500,
      message: '获取失败',
      data: null
    };
  }
};