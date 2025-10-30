// cloudfunctions/clearMasteredWords/index.js
exports.main = async (event, context) => {
  try {
    const db = uniCloud.database();
    const collection = db.collection('mastered_words');
    
    // 直接清空整个单词表（注意：这会删除所有用户的单词！）
    const res = await collection.remove();
    
    return {
      success: true,
      deletedCount: res.deleted
    };
  } catch (err) {
    console.error('清空单词失败:', err);
    return {
      success: false,
      message: '服务器错误'
    };
  }
};