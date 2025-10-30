'use strict';
exports.main = async (event, context) => {
  try {
    // 生成1-22的随机整数（包含1和22）
    const randomNum = Math.floor(Math.random() * 22) + 1; 
    // 计算需要跳过的记录数（获取第N条需要跳过前N-1条）
    const skipNum = randomNum - 1;

    // 初始化数据库
    const db = uniCloud.database();
    // 查询words表中第randomNum条记录（按_id升序排序，确保顺序固定）
    const res = await db.collection('words')
      .orderBy('_id', 'asc') // 固定排序方式，避免随机结果混乱
      .skip(skipNum) // 跳过前N-1条
      .limit(1) // 只取1条
      .get();
    
    if (res.data && res.data.length > 0) {
      // 返回随机获取到的word字段，附带随机数信息
      return {
        code: 0,
        data: res.data[0].word,
        randomNum: randomNum, // 本次随机数
        msg: `成功获取第${randomNum}条记录`
      }
    } else {
      // 若表中记录数不足randomNum条，返回提示
      return {
        code: 1,
        msg: `words表记录不足${randomNum}条`
      }
    }
  } catch (err) {
    return {
      code: 2,
      msg: '查询失败：' + err.message
    }
  }
};