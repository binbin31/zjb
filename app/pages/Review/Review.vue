<template>
  <view class="custom-back-btn" @click="goTohomePage">
    <image src="/pages/images/fanhui.png" mode="aspectFit" class="back-icon" />
  </view>
  <view class="container">
    <!-- 背景区域：保留完整背景图片逻辑 -->
    <view class="bg-box">
      <image class="bg-img" src="/pages/images/preview.jpg" mode="aspectFill"></image>
      <view class="overlay"></view>
    </view>

    <!-- 主内容区域：保留复习核心逻辑，移除无用导航关联 -->
    <view class="content">
      <view v-if="isLoading" class="loading-mask">
        <text class="loading-text">加载单词中...</text>
      </view>
      
      <view v-else-if="error" class="error-mask">
        <text class="error-text">{{ error }}</text>
        <button class="retry-btn" @click="fetchMasteredWords">重试</button>
        <button class="retry-btn" @click="gotoLearning" v-if="error.includes('先去学习')">去学习</button>
      </view>
      
      <view v-else-if="reviewCompleted" class="error-mask">
        <text class="loading-text">复习完成！</text>
        <text class="loading-text">您已复习所有单词</text>
        <button class="retry-btn" @click="gotoLearning">继续学习新单词</button>
      </view>
      
      <view v-else-if="currentWord.word">
        <view class="progress-box">
          <text class="progress-text">剩余复习数: {{ masteredWords.length }}</text>
        </view>

        <view class="word-area">
          <text class="main-word">{{ currentWord.word }}</text>
          <view class="pronunciation-box" v-if="currentWord.phonetic">
            <text class="pronunciation">{{ currentWord.phonetic }}</text>
          </view>
        </view>

        <view class="middle-area" @click="toggleTranslation">
          <text class="hint-text" v-if="showHint">点击查看释义</text>
          <transition 
            name="translation"
            @after-leave="onTranslationLeave"
          >
            <view 
              v-if="showTranslation" 
              class="translation-box flex-container"
            >
              <view class="meaning-container">
                <view class="part-of-speech-container">
                  <text class="part-of-speech">{{ currentWord.meaning?.partOfSpeech || '-' }}</text>
                </view>
                <view class="translation-text-container">
                  <text class="translation-text">{{ currentWord.meaning?.translation || '-' }}</text>
                </view>
                <view class="example-box-container">
                  <text class="example-label">例句：</text>
                  <text class="example-text">{{ currentWord.meaning?.example || '-' }}</text>
                </view>
                <view class="synonyms-box-container" v-if="currentWord.meaning?.synonym">
                  <text class="synonyms-label">同义词：</text>
                  <text class="synonyms-text">{{ currentWord.meaning.synonym }}</text>
                </view>
              </view>
            </view>
          </transition>
        </view>

        <view class="button-group">
          <template v-if="!showNextButton">
            <view class="btn btn-unknown" @click="handleAnswer(false)">
              <text>不认识</text>
            </view>
            <view class="btn btn-known" @click="handleAnswer(true)">
              <text>认识</text>
            </view>
          </template>
          <view v-else class="btn btn-next" @click="handleNext">
            <text>下一个</text>
          </view>
        </view>
      </view>
      
      <view v-else class="no-data-hint">
        <text>暂无复习单词</text>
        <button class="retry-btn" @click="gotoLearning">去学习</button>
      </view>
    </view>
  </view>
</template>

<script>
import WordDataManager from '@/pages/utils/wordDataManager.js'

export default {
  data() {
    return {
      // UI交互状态：保留核心控制字段
      showTranslation: false,
      showNextButton: false,
      showHint: true,
      // 复习逻辑状态：保留核心数据
      masteredWords: [],
      currentWord: {},
      currentIndex: 0,
      isLoading: true,
      error: null,
      reviewCompleted: false
      // 移除冗余：queueOrder（仅push无实际使用）
    }
  },

  mounted() {
    this.fetchMasteredWords();
  },

  methods: {
    // 顶部返回首页：保留实际使用的导航方法
    goTohomePage() {
      uni.navigateTo({ url: '/pages/home/home' });
    },

    // 复习核心：获取已掌握单词
    async fetchMasteredWords() {
      this.isLoading = true;
      this.error = null;
      this.reviewCompleted = false;
      
      try {
        // 本地缓存优先
        try {
          const localWords = uni.getStorageSync('masteredWords');
          if (localWords && localWords.length > 0) {
            this.masteredWords = localWords;
            this.initReview();
            this.isLoading = false;
            return;
          }
        } catch (e) {
          console.log('本地无掌握单词数据');
        }
        
        // 云端获取
        const res = await uniCloud.callFunction({
          name: 'getMasteredWords'
        });
        
        if (res.result.success) {
          this.masteredWords = res.result.data;
          if (this.masteredWords.length > 0) {
            this.initReview();
            uni.setStorageSync('masteredWords', this.masteredWords);
          } else {
            this.error = '暂无掌握单词，先去学习吧';
          }
        } else {
          this.error = res.result.message || '获取掌握单词失败';
        }
      } catch (err) {
        this.error = '获取掌握单词失败，请检查网络';
        console.error('获取掌握单词错误:', err);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 复习核心：初始化复习
    initReview() {
      if (this.masteredWords.length > 0) {
        this.currentWord = this.masteredWords[0];
        this.showTranslation = false;
        this.showNextButton = false;
        this.showHint = true;
      } else {
        this.error = '暂无掌握单词，先去学习吧';
      }
    },

    // 翻译框切换：保留核心交互逻辑
    toggleTranslation() {
      if (!this.showNextButton) {
        this.showTranslation = !this.showTranslation;
        if (this.showTranslation) {
          this.showHint = false;
        }
      }
    },

    // 翻译框动画结束钩子
    onTranslationLeave() {
      this.showHint = true;
    },

    // 复习核心：处理单词反馈
    handleAnswer(isKnown) {
      if (isKnown) {
        // 认识：移除该单词
        const wordToRemove = this.masteredWords[this.currentIndex];
        this.masteredWords.splice(this.currentIndex, 1);
        
        uni.showToast({
          title: '已掌握，不再复习',
          icon: 'success',
          duration: 1000
        });
        
        this.deleteMasteredWord(wordToRemove);
        this.updateLocalStorage();
        
        setTimeout(() => {
          if (this.masteredWords.length === 0) {
            this.reviewCompleted = true;
            uni.removeStorageSync('masteredWords');
            return;
          }
          // 切换下一个单词
          this.currentIndex = Math.min(this.currentIndex, this.masteredWords.length - 1);
          this.currentWord = this.masteredWords[this.currentIndex];
          this.showTranslation = false;
          this.showNextButton = false;
          this.showHint = true;
        }, 1000);
      } else {
        // 不认识：显示翻译和下一个按钮
        this.showTranslation = true;
        this.showNextButton = true;
        this.showHint = false;
        uni.showToast({
          title: '已加入待复习',
          icon: 'none',
          duration: 1500
        });
      }
    },

    // 下一个单词：保留核心切换逻辑
    handleNext() {
      if (this.masteredWords.length === 0) return;
      // 循环切换下一个单词
      this.currentIndex = (this.currentIndex + 1) % this.masteredWords.length;
      this.currentWord = this.masteredWords[this.currentIndex];
      // 重置UI状态
      this.showTranslation = false;
      this.showNextButton = false;
      this.showHint = true;
    },

    // 复习核心：删除已掌握单词
    async deleteMasteredWord(word) {
      try {
        await uniCloud.callFunction({
          name: 'deleteMasteredWord',
          data: { word: word.word }
        });
      } catch (e) {
        console.error('删除单词失败:', e);
      }
    },

    // 复习核心：更新本地缓存
    updateLocalStorage() {
      try {
        uni.setStorageSync('masteredWords', this.masteredWords);
      } catch (e) {
        console.error('更新本地缓存失败:', e);
      }
    },

    // 跳转学习页面
    gotoLearning() {
      uni.redirectTo({ url: '/pages/learn/learn' });
    }
    // 移除冗余：handleBack（无对应调用场景）
  }
}
</script>

<style scoped>
/* 顶部返回按钮：保留实际使用的样式 */
.custom-back-btn {
  position: fixed;
  top: 30rpx;
  left: 20rpx;
  width: 40rpx;
  height: 40rpx;
  z-index: 999; /* 确保不被背景/内容遮挡 */
}
.back-icon {
  width: 100%;
  height: 100%;
}

/* 页面容器：保留基础定位 */
.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 背景核心样式：完整保留背景图片、模糊、遮罩逻辑 */
.bg-box {
  position: absolute;
  width: 100%;
  height: 100%;
  filter: blur(20px); /* 背景模糊效果 */
  transform: scale(1.1); /* 避免模糊边缘留白 */
  overflow: hidden;
  z-index: 0; /* 背景层级最低 */
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4); /* 背景遮罩，提升文字可读性 */
  z-index: 1;
}
.bg-img {
  width: 100%;
  height: 100%;
  opacity: 0.9; /* 背景图片透明度控制 */
}

/* 进度框动画：保留核心过渡效果 */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 翻译框过渡动画：保留核心交互动画 */
.translation-enter-from {
  opacity: 0;
  transform: translateY(20rpx);
}
.translation-enter-active {
  transition: all 0.3s ease;
}
.translation-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.translation-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.translation-leave-active {
  transition: all 0.3s ease;
}
.translation-leave-to {
  opacity: 0;
  transform: translateY(20rpx);
}

/* 进度框：保留核心样式 */
.progress-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15rpx 30rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: #fff;
  text-align: center;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(10px);
  margin: 10rpx auto;
  width: 90%;
  animation: slideDown 0.5s ease;
}

/* Flex容器：保留布局辅助 */
.flex-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 翻译框：保留核心样式 */
.translation-box {
  padding: 60rpx 40rpx;
  border-radius: 24rpx;
  font-size: 36rpx;
  color: #ffffff;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(15px);
  width: 90%;
  max-width: 680rpx;
  min-height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 释义内容容器：保留核心样式 */
.meaning-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

/* 词性/翻译/例句/同义词：保留核心样式 */
.part-of-speech-container,
.translation-text-container,
.example-box-container,
.synonyms-box-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.part-of-speech {
  font-size: 42rpx;
  color: rgba(255,255,255,0.8);
  font-weight: 500;
}
.translation-text {
  font-size: 52rpx;
  color: #fff;
  font-weight: 600;
  line-height: 1.4;
}
.example-box-container {
  margin-top: 10rpx;
  padding: 20rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 16rpx;
}
.example-label {
  font-size: 34rpx;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8rpx;
}
.example-text {
  font-size: 36rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.5;
}
.synonyms-box-container {
  margin-top: 10rpx;
  padding: 20rpx;
  background: rgba(255,255,255,0.05);
  border-radius: 16rpx;
}
.synonyms-label {
  font-size: 34rpx;
  color: rgba(255,255,255,0.6);
  margin-bottom: 8rpx;
}
.synonyms-text {
  font-size: 36rpx;
  color: rgba(255,255,255,0.9);
  line-height: 1.5;
}

/* 主内容区：保留核心布局 */
.content {
  position: relative;
  z-index: 2; /* 内容层级高于背景 */
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 100rpx 40rpx 80rpx;
}

/* 加载/错误/无数据提示：保留核心样式 */
.loading-mask, .error-mask, .no-data-hint {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 32rpx;
}
.retry-btn {
  margin-top: 20rpx;
  padding: 15rpx 30rpx;
  background: rgba(255,255,255,0.18);
  border-radius: 16rpx;
  color: #fff;
  font-size: 28rpx;
}

/* 单词区域：保留核心样式 */
.word-area {
  text-align: center;
  flex: 0.3;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20rpx;
}
.main-word {
  font-size: 72rpx;
  color: #ffffff;
  text-shadow: 0 4rpx 12rpx rgba(0,0,0,0.2);
  line-height: 1.4;
}
.pronunciation {
  font-size: 32rpx;
  color: rgba(255,255,255,0.8);
  font-style: italic;
}

/* 中间交互区域：保留核心样式 */
.middle-area {
  flex: 0.5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20rpx 0;
  position: relative;
}
.hint-text {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin-top: 260rpx;
}

/* 按钮组：保留核心样式 */
.button-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20rpx;
  padding: 0rpx;
  margin-bottom: 40rpx;
  width: 100%;
  max-width: 700rpx;
  margin: 0 auto 40rpx;
  position: fixed;
  bottom: 40rpx;
}
.btn {
  width: calc(50% - 10rpx);
  min-width: 280rpx;
  height: 180rpx;
  background: rgba(255,255,255,0.18);
  border: 2rpx solid rgba(255,255,255,0.25);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 36rpx;
  backdrop-filter: blur(6px);
  transition: all 0.3s;
}
.btn-next {
  width: 100%;
  max-width: 700rpx;
}
.btn:active {
  background: rgba(255,255,255,0.3);
  transform: scale(0.96);
}

/* 移除冗余：.nav-bar、.nav-icons-right等无对应元素的样式 */
</style>