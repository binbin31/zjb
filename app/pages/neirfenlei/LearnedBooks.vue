<template>
  <!-- 已学词书页面组件 -->
  <view class="learned-books-page">
    <!-- 页面头部区域，包含返回按钮和标题 -->
    <view class="page-header">
      <image class="back-icon" src="/pages/images/down.png" @click="goBack" />
      <text class="page-title">已学词书</text>
    </view>
    
    <!-- 词书列表区域，支持垂直滚动 -->
    <scroll-view scroll-y class="page-content">
      <!-- 遍历显示已学词书列表 -->
      <view v-for="(book, index) in learnedBooks" :key="index" class="book-item">
        <image class="book-cover" :src="book.cover || '/pages/images/lun1.png'" />
        <view class="book-info">
          <text class="book-title">{{ book.title }}</text>
          <text class="book-stats">已学: {{ book.learnedCount }}/{{ book.totalWords }}词</text>
        </view>
        <!-- 词书学习进度条 -->
        <progress class="book-progress" :percent="(book.learnedCount / book.totalWords) * 100" />
      </view>
      
      <!-- 无数据状态提示 -->
      <view v-if="learnedBooks.length === 0" class="no-data">
        <text>暂无词书数据</text>
        <button class="retry-btn" @click="fetchData">重新加载</button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import WordDataManager from '@/pages/utils/wordDataManager.js' // 引入单词数据管理器

export default {
  data() {
    return {
      learnedBooks: [],         // 存储已学词书列表
      isLoading: false,         // 加载状态标识
      error: null,              // 错误信息
      totalWords: 0             // 总单词数量
    }
  },
  
  mounted() {
    // 页面挂载后立即加载数据
    this.fetchData();
  },
  
  methods: {
    // 从云函数获取已学词书数据
    async fetchData() {
      this.isLoading = true;    // 显示加载状态
      this.error = null;        // 清空错误信息
      
      try {
        // 初始化单词数据管理器，获取总单词数量
        await WordDataManager.init();
        const wordContainer = WordDataManager.getContainer();
        this.totalWords = wordContainer.allWords.length;
        
        // 调用云函数获取所有已掌握单词
        const res = await uniCloud.callFunction({
          name: 'getMasteredWords'
        });
        
        if (res.result.success) {
          // 处理获取到的单词数据，按词书分组统计
          this.processBookData(res.result.data);
        } else {
          this.error = res.result.message || '获取词书数据失败';
        }
      } catch (err) {
        this.error = '获取词书数据失败，请检查网络';
        console.error('获取词书数据错误:', err);
      } finally {
        this.isLoading = false;  // 隐藏加载状态
      }
    },
    
    // 处理词书数据：按词书分组统计并计算学习进度
    processBookData(words) {
      const booksMap = {};
      
      // 遍历所有单词，按词书ID分组统计已学单词数量
      words.forEach((word) => {
        const bookId = word.bookId || 'default';
        
        // 如果词书不存在，初始化词书信息
        if (!booksMap[bookId]) {
          booksMap[bookId] = {
            id: bookId,
            title: word.bookTitle || '未命名',
            cover: word.bookCover || '',
            learnedCount: 0,
            totalWords: 0  // 初始化总单词数
          };
        }
        
        // 增加已学单词计数
        booksMap[bookId].learnedCount++;
      });
      
      // 将Map转换为数组格式
      this.learnedBooks = Object.values(booksMap);
      
      // 设置每本词书的总单词数并确保计算安全
      this.learnedBooks.forEach((book) => {
        // 优先使用词书自带的总单词数，否则使用全局总单词数，默认100
        book.totalWords = book.totalWords > 0 ? book.totalWords : 
                         (this.totalWords > 0 ? this.totalWords : 100);
        
        // 确保分母不为0，防止计算错误
        if (book.totalWords === 0) book.totalWords = 1;
      });
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
/* 整个页面容器样式 */
.learned-books-page {
  background: #121b56;       /* 主背景色 */
  height: 100vh;             /* 占满整个视口高度 */
  padding: 20rpx;            /* 内边距 */
}

/* 页面头部样式 */
.page-header {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);  /* 底部边框 */
  flex-direction: row;
}

/* 返回按钮样式 */
.back-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 20rpx;
}

/* 页面标题样式 */
.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
}

/* 内容区域样式 */
.page-content {
  height: calc(100vh - 120rpx);  /* 计算高度，排除头部区域 */
  padding: 20rpx;
}

/* 单个词书项样式 */
.book-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.1);  /* 半透明背景 */
  border-radius: 20rpx;                   /* 圆角 */
  margin-bottom: 20rpx;
}

/* 词书封面样式 */
.book-cover {
  width: 120rpx;
  height: 160rpx;
  border-radius: 10rpx;
  margin-right: 30rpx;
}

/* 词书信息区域样式 */
.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 词书标题样式 */
.book-title {
  font-size: 34rpx;
  font-weight: bold;
  color: white;
  margin-bottom: 10rpx;
}

/* 词书统计信息样式 */
.book-stats {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);  /* 半透明白色 */
}

/* 词书进度条样式 */
.book-progress {
  width: 100%;
  height: 10rpx;
  background: rgba(255, 255, 255, 0.2);  /* 背景进度条 */
  border-radius: 5rpx;
  overflow: hidden;
  margin-top: 10rpx;
}

/* 进度条填充样式 */
.book-progress::before {
  content: '';
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ffb641, #ffb641);  /* 进度填充色 */
  border-radius: 5rpx;
}

/* 无数据提示样式 */
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: rgba(255, 255, 255, 0.7);
  font-size: 32rpx;
}

/* 重试按钮样式 */
.retry-btn {
  margin-top: 30rpx;
  padding: 15rpx 40rpx;
  background: rgba(255, 255, 255, 0.15);  /* 半透明背景 */
  border-radius: 50rpx;
  color: white;
  font-size: 28rpx;
}
</style>