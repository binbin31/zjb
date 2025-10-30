<template>
  <!-- 全部已学单词页面组件 -->
  <view class="all-learned-page">
    <!-- 页面头部区域，包含返回按钮、标题和搜索框 -->
    <view class="page-header">
      <!-- 返回按钮，点击触发goBack方法返回上一页 -->
      <image class="back-icon" src="/pages/images/down.png" @click="goBack" />
      <text class="page-title">全部已学</text>
      
      <!-- 搜索功能区，支持按单词或释义搜索 -->
      <view class="search-box">
        <image class="search-icon" src="/pages/images/搜索 (1).png" />
        <input 
          class="search-input" 
          placeholder="搜索已学单词" 
          v-model="searchTerm"
          @input="handleSearch"
          :disabled="isLoading"
        />
      </view>
    </view>
    
    <!-- 单词列表区域，支持垂直滚动 -->
    <scroll-view scroll-y class="page-content">
      <!-- 遍历显示过滤后的单词列表 -->
      <view v-for="(word, index) in filteredWords" :key="index" class="word-item">
        <text class="word-text">{{ word.word }}</text>
        <text class="word-phonetic">{{ word.phonetic }}</text>
        <text class="word-meaning">{{ word.meaning?.translation || '无释义' }}</text>
      </view>
      
      <!-- 无数据状态提示 -->
      <view v-if="filteredWords.length === 0" class="no-data">
        <text v-if="searchTerm">未找到匹配的单词</text>
        <text v-else>暂无已学单词</text>
        <button class="retry-btn" @click="fetchData">重新加载</button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      allWords: [],             // 存储所有已学单词数据
      searchTerm: '',           // 搜索关键词
      isLoading: false,         // 加载状态标识
      error: null               // 错误信息
    }
  },
  
  computed: {
    // 计算属性：根据搜索词过滤单词列表
    filteredWords() {
      if (!this.searchTerm) return this.allWords;
      
      const term = this.searchTerm.toLowerCase();
      // 支持按单词或释义进行模糊搜索
      return this.allWords.filter((word) => 
        (word.word && word.word.toLowerCase().includes(term)) || 
        (word.meaning?.translation && word.meaning.translation.toLowerCase().includes(term))
      );
    }
  },
  
  mounted() {
    // 页面挂载后立即加载数据
    this.fetchData();
  },
  
  methods: {
    // 从云函数获取所有已掌握的单词
    async fetchData() {
      this.isLoading = true;    // 显示加载状态
      this.error = null;        // 清空错误信息
      
      try {
        // 调用云函数获取已掌握单词列表
        const res = await uniCloud.callFunction({
          name: 'getMasteredWords'
        });
        
        if (res.result.success) {
          this.allWords = res.result.data;  // 更新单词数据
        } else {
          this.error = res.result.message || '获取单词数据失败';
        }
      } catch (err) {
        this.error = '获取单词数据失败，请检查网络';
        console.error('获取单词数据错误:', err);
      } finally {
        this.isLoading = false;  // 隐藏加载状态
      }
    },
    
    // 处理搜索输入事件
    handleSearch() {
      // 搜索逻辑由computed属性filteredWords实现
      // 此处可添加防抖处理或其他搜索相关逻辑
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
.all-learned-page {
  background: #121b56;       /* 主背景色 */
  height: 100vh;             /* 占满整个视口高度 */
  padding: 20rpx;            /* 内边距 */
}

/* 页面头部样式 */
.page-header {
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);  /* 底部边框 */
}

/* 返回按钮样式 */
.back-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 20rpx;
}

/* 页面标题样式 */
.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: white;
  display: block;
  margin-bottom: 30rpx;
}

/* 搜索框容器样式 */
.search-box {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);  /* 半透明背景 */
  border-radius: 50rpx;                   /* 圆角 */
  padding: 15rpx 25rpx;
  flex-direction: row;
}

/* 搜索图标样式 */
.search-icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 15rpx;
}

/* 搜索输入框样式 */
.search-input {
  flex: 1;
  color: white;
  font-size: 30rpx;
  height: 50rpx;
}

/* 内容区域样式 */
.page-content {
  height: calc(100vh - 200rpx);  /* 计算高度，排除头部区域 */
  padding: 20rpx;
}

/* 单个单词项样式 */
.word-item {
  background: rgba(255, 255, 255, 0.1);  /* 半透明背景 */
  border-radius: 16rpx;                   /* 圆角 */
  padding: 25rpx;
  margin-bottom: 20rpx;
}

/* 单词文本样式 */
.word-text {
  font-size: 38rpx;
  font-weight: bold;
  color: white;
  display: block;
}

/* 音标样式 */
.word-phonetic {
  font-size: 30rpx;
  color: rgba(255, 255, 255, 0.7);  /* 半透明白色 */
  font-style: italic;
  display: block;
  margin: 8rpx 0;
}

/* 释义样式 */
.word-meaning {
  font-size: 32rpx;
  color: rgba(255, 255, 255, 0.8);  /* 近透明白色 */
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