// utils/wordDataManager.js
import { reactive } from 'vue'

// 数据容器使用Vue的reactive响应式系统，确保数据变化时视图自动更新
const wordContainer = reactive({
  allWords: [],           // 存储从数据库获取的所有单词数据
  isLoading: false,       // 数据加载状态标识
  error: null             // 错误信息存储
})

// 单词数据管理器对象，封装数据获取和管理方法
const WordDataManager = {
  // 获取数据容器的公共方法，方便外部访问响应式数据
  getContainer() {
    return wordContainer
  },
  
  // 初始化数据的核心方法，异步从数据库获取单词
  async init() {
    // 防止重复加载
    if (wordContainer.isLoading) return
    
    // 设置加载状态并清空错误信息
    wordContainer.isLoading = true
    wordContainer.error = null
    
    try {
      // 使用uniCloud数据库API获取单词集合数据
      const db = uniCloud.database()
      const res = await db.collection('words').get()
      
      // 打印完整响应用于调试
      console.log('数据库查询结果:', JSON.stringify(res, null, 2)) 
      
      // 检查响应数据有效性
      if (res.result && res.result.data && res.result.data.length > 0) {
        // 将数据库格式转换为应用所需格式
        wordContainer.allWords = res.result.data.map(item => {
          console.log('处理单个单词:', item) // 打印单个单词数据用于调试
          
          // 字段映射：适配数据库字段到应用所需格式
          // 注意：这里根据数据库结构调整字段映射关系
          return {
            word: item.word,                 // 单词文本
            phonetic: item.phonetic,         // 音标
            meaning: {
              partOfSpeech: item.meaning?.partOfSpeech || '', // 词性
              translation: item.meaning?.translation || '',   // 翻译
              example: item.meaning?.example || '',           // 例句
              synonym: item.meaning?.synonym || ''            // 同义词
            }
          }
        })
        
        // 打印成功加载的单词数量
        console.log('成功加载单词数据，共', wordContainer.allWords.length, '个单词')
      } else {
        // 处理无数据情况
        wordContainer.error = '未从数据库获取到单词数据'
        console.error(wordContainer.error, '数据库响应:', res)
      }
    } catch (error) {
      // 异常处理
      wordContainer.error = '数据库获取单词失败: ' + error.message
      console.error(wordContainer.error, '错误详情:', error)
    } finally {
      // 无论成功或失败，最终都要重置加载状态
      wordContainer.isLoading = false
    }
  },
  
  // 获取随机单词的方法，用于随机学习场景
  getRandomWord() {
    if (wordContainer.allWords.length === 0) {
      console.warn('没有可用的单词数据')
      return null
    }
    
    // 生成随机索引并返回对应单词
    const randomIndex = Math.floor(Math.random() * wordContainer.allWords.length)
    return wordContainer.allWords[randomIndex]
  }
}

export default WordDataManager