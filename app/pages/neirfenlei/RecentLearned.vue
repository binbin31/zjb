<template>
  <!-- 近日已学单词页面 -->
  <view class="recent-learned-page">
    <!-- 页面头部区域 -->
    <view class="page-header">
      <!-- 返回按钮 -->
      <image class="back-icon" src="/pages/images/down.png" @click="goBack" />
      <text class="page-title">近日已学</text>
    </view>
    
    <!-- 可滚动内容区域 -->
    <scroll-view scroll-y class="page-content">
      <!-- 按日期分组显示单词 -->
      <view v-for="(group, index) in recentWords" :key="index" class="date-group">
        <text class="date-title">{{ group.date }}</text>
        
        <view v-for="(word, idx) in group.words" :key="idx" class="word-item">
          <text class="word-text">{{ word.word }}</text>
          <text class="word-meaning">{{ word.meaning?.translation || '无释义' }}</text>
        </view>
      </view>
      
      <!-- 无数据状态提示 -->
      <view v-if="recentWords.length === 0" class="no-data">
        <text>暂无最近学习记录</text>
        <button class="retry-btn" @click="fetchData">重新加载</button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      recentWords: [],        // 按日期分组的最近学习单词
      isLoading: false,       // 加载状态
      error: null             // 错误信息
    }
  },
  
  mounted() {
    // 页面加载时获取数据
    this.fetchData();
  },
  
  methods: {
    // 获取已掌握单词数据
    async fetchData() {
      this.isLoading = true;
      this.error = null;
      
      try {
        // 调用云函数获取已掌握单词
        const res = await uniCloud.callFunction({
          name: 'getMasteredWords'
        });
        
        if (res.result.success) {
          // 处理数据并按日期分组
          this.processRecentWords(res.result.data);
        } else {
          this.error = res.result.message || '获取最近单词失败';
        }
      } catch (err) {
        this.error = '获取最近单词失败，请检查网络';
        console.error('获取最近单词错误:', err);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 按日期分组处理单词数据
    processRecentWords(words) {
      const grouped = {};
      
      // 将单词按学习日期分组
      words.forEach(word => {
        // 提取日期部分（忽略时间）
        const date = word.learnedDate ? word.learnedDate.split('T')[0] : '未知日期';
        
        if (!grouped[date]) {
          grouped[date] = [];
        }
        
        grouped[date].push(word);
      });
      
      // 转换为数组格式并格式化日期显示
      this.recentWords = Object.keys(grouped).map(date => ({
        date: this.formatDate(date),
        words: grouped[date]
      }));
    },
    
    // 格式化日期显示（今天/昨天/具体日期）
    formatDate(dateStr) {
      if (!dateStr) return '未知日期';
      
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // 智能显示日期：今天、昨天或完整日期
      if (dateStr === today) return '今天';
      if (dateStr === yesterdayStr) return '昨天';
      
      return dateStr;
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style scoped>
/* 页面整体样式 */
.recent-learned-page {
  background: #121b56;
  height: 100vh;
  padding: 20rpx;
}

/* 页面头部样式 */
.page-header {
  display: flex;
  align-items: center;
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
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
  height: calc(100vh - 120rpx);
  padding: 20rpx;
}

/* 日期分组样式 */
.date-group {
  margin-bottom: 40rpx;
}

/* 日期标题样式 */
.date-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #ffb641;
  margin-bottom: 20rpx;
  padding-left: 10rpx;
  border-left: 6rpx solid #ffb641;
}

/* 单词项样式 */
.word-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16rpx;
  padding: 25rpx;
  margin-bottom: 20rpx;
}

/* 单词文本样式 */
.word-text {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  display: block;
  margin-bottom: 10rpx;
}

/* 单词释义样式 */
.word-meaning {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.8);
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
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50rpx;
  color: white;
  font-size: 28rpx;
}
</style>