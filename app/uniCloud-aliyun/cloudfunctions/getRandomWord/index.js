// cloudfunctions/getRandomWord/index.js
'use strict';
exports.main = async (event, context) => {
  const { index } = event; // 接收前端传递的随机索引
  const db = uniCloud.database();
  // 跳过index条数据，只取1条，即获取第index个单词
  const word = await db.collection('words').skip(index).limit(1).get();
  return {
    success: true,
    word: word.data[0] || null // 返回获取到的单词（若不存在则为null）
  };
};