<template>
	<view class="custom-back-btn" @click="goTohomePage">
	      <!-- 替换为你项目中的返回图标（建议用和原生风格一致的图标） -->
	      <image src="/pages/images/fanhui.png" mode="aspectFit" class="back-icon" />
	    </view>
  <view class="container">
    <!-- 背景和导航栏区域 -->
    <view class="bg-box">
      <image class="bg-img" src="/pages/images/preview.jpg" mode="aspectFill"></image>
      <view class="overlay"></view>
    </view>
    
    <!-- 主内容区域 -->
    <view class="content">
      <view v-if="wordContainer.isLoading" class="loading-mask">
        <text class="loading-text">加载单词中...</text>
      </view>
      
      <view v-else-if="wordContainer.error" class="error-mask">
        <text class="error-text">{{ wordContainer.error }}</text>
        <button class="retry-btn" @click="loadWords">重试</button>
      </view>
      
      <view v-else-if="currentWord.word">
        <view class="progress-box">
          <text class="progress-text">
            当前组：{{ groupLearnedCount }}/{{ currentGroupSize }} 
            | 今日新词：{{ learnedCount }}/{{ wordContainer.allWords.length }}
          </text>
        </view>

        <view class="word-area">
          <text class="main-word">{{ currentWord.word }}</text>
          <view class="pronunciation-box" v-if="currentWord.phonetic">
            <text class="pronunciation">{{ currentWord.phonetic }}</text>
          </view>
        </view>

        <view class="middle-area" @click="toggleTranslation">
          <!-- 提示文字：由showHint控制显示，延迟到淡出动画后出现 -->
          <text class="hint-text" v-if="showHint">点击查看释义</text>
          
          <!-- 翻译框：过渡组件绑定动画结束钩子 -->
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
        <text>单词数据加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
import WordDataManager from '@/pages/utils/wordDataManager.js'

export default {
  data() {
    return {
      showTranslation: false,       // 控制翻译框显示/隐藏
      showNextButton: false,        // 控制"下一个"按钮显示/隐藏
      learnedCount: 0,              // 今日已学习单词数
      groupLearnedCount: 0,         // 当前组已学习单词数
      groupSize: 10,                // 每组单词数量
      wordQueue: [],                // 待学习单词队列
      unlearnedWords: [],           // 未掌握单词队列
      currentWord: {},              // 当前学习的单词
      wordContainer: WordDataManager.getContainer(), // 单词数据容器
      currentGroupIndex: 0,         // 当前组索引
      currentWordIndex: 0,          // 当前单词在组内的索引
      masteredWords: [],            // 已掌握单词列表
      showHint: true                // 控制"点击查看释义"提示文字显示（新增）
    }
  },

  computed: {
    // 计算当前组的单词数量（处理边界）
    currentGroupSize() {
      const startIndex = this.currentGroupIndex * this.groupSize;
      return Math.max(
        1, 
        Math.min(this.groupSize, this.wordContainer.allWords.length - startIndex)
      );
    }
  },
  
  mounted() {
    this.fetchLearningProgress();  // 加载学习进度
    this.fetchMasteredWords();     // 加载已掌握单词
  },

  methods: {
	  
	  
	  
	  
    // 加载单词数据
    async loadWords() {
      await WordDataManager.init();
      this.resetGroup();
    },
	 goTohomePage() {
	   uni.navigateTo({
	     url: '/pages/home/home',
	    	   });
	 },

    // 重置当前组的单词队列
    resetGroup() {
      const words = this.wordContainer.allWords;
      const startGroupIndex = this.currentGroupIndex * this.groupSize;
      const endGroupIndex = startGroupIndex + this.groupSize;
      
      const currentGroupWords = words.slice(startGroupIndex, endGroupIndex);
      this.currentWordIndex = Math.min(this.currentWordIndex, currentGroupWords.length - 1);
      
      this.wordQueue = currentGroupWords.slice(this.currentWordIndex);
      this.unlearnedWords = [];
      this.groupLearnedCount = this.currentWordIndex;
      
      this.nextWord();
    },

    // 切换到下一个单词
    nextWord() {
      if (this.wordQueue.length > 0) {
        this.currentWord = this.wordQueue[0];
        this.showTranslation = false;
        this.showNextButton = false;
        this.showHint = true;  // 切换单词时默认显示提示文字
      } else if (this.unlearnedWords.length > 0) {
        this.currentWord = this.unlearnedWords[0];
        this.showTranslation = false;
        this.showNextButton = false;
        this.showHint = true;  // 切换单词时默认显示提示文字
      } else {
        this.completeGroup();
      }
    },

    // 处理返回导航


    // 切换翻译框显示状态（控制提示文字隐藏时机）
    toggleTranslation() {
      if (!this.showNextButton) {
        this.showTranslation = !this.showTranslation;
        
        // 打开翻译框时，立即隐藏提示文字
        if (this.showTranslation) {
          this.showHint = false;
        }
        // 关闭翻译框时，不立即显示提示文字（等待动画结束）
      }
    },

    // 翻译框淡出动画完全结束后触发：显示提示文字
    onTranslationLeave() {
      this.showHint = true;
    },

    // 处理单词掌握状态反馈
    handleAnswer(isKnown) {
      if (isKnown) {
        this.learnedCount++;
        this.groupLearnedCount++;
        this.currentWordIndex++;
        
        this.saveLearningProgress();
        this.addToMasteredWords(this.currentWord);
        
        if (this.wordQueue.length > 0) {
          this.wordQueue.shift();
        }
        
        this.nextWord();
      } else {
        if (this.wordQueue.length > 0) {
          const current = this.wordQueue.shift();
          this.unlearnedWords.push(current);
        } else if (this.unlearnedWords.length > 0) {
          const current = this.unlearnedWords.shift();
          this.unlearnedWords.push(current);
        }
        
        this.showTranslation = true;
        this.showNextButton = true;
        this.showHint = false;  // 显示翻译框时隐藏提示文字
      }
    },
    
    // 添加单词到已掌握列表
    async addToMasteredWords(word) {
      const wordData = {
        word: word.word,
        phonetic: word.phonetic || '',
        meaning: {
          partOfSpeech: word.meaning?.partOfSpeech || '',
          translation: word.meaning?.translation || '',
          example: word.meaning?.example || '',
          synonym: word.meaning?.synonym || ''
        }
      };
      
      if (!this.masteredWords.some(w => w.word === wordData.word)) {
        this.masteredWords.push(wordData);
        
        // 保存到本地缓存
        try {
          uni.setStorageSync('masteredWords', this.masteredWords);
        } catch (e) {
          console.error('本地保存已掌握单词失败:', e);
        }
        
        // 保存到云端
        try {
          const res = await uniCloud.callFunction({
            name: 'saveMasteredWord',
            data: { wordData }
          });
          
          if (!res.result.success) {
            console.error('云端保存已掌握单词失败:', res.result.message);
          }
        } catch (err) {
          console.error('云端请求失败:', err);
        }
      }
    },
    
    // 获取已掌握单词
    async fetchMasteredWords() {
      // 本地缓存获取
      try {
        const localWords = uni.getStorageSync('masteredWords');
        if (localWords && localWords.length > 0) {
          this.masteredWords = localWords;
        }
      } catch (e) {
        console.log('本地无已掌握单词数据');
      }
      
      // 云端获取
      try {
        const res = await uniCloud.callFunction({
          name: 'getMasteredWords'
        });
        
        if (res.result.success) {
          this.masteredWords = res.result.data;
          
          // 同步到本地
          try {
            uni.setStorageSync('masteredWords', this.masteredWords);
          } catch (e) {
            console.error('保存已掌握单词到本地失败:', e);
          }
        }
      } catch (err) {
        console.error('获取已掌握单词失败:', err);
      }
    },

    // 处理下一个单词
    handleNext() {
      this.nextWord();
      this.showNextButton = false;
    },

    // 完成当前组学习
    completeGroup() {
      uni.showToast({
        title: `已完成第${this.currentGroupIndex + 1}组学习！`,
        icon: 'success',
        duration: 2000
      });
      
      this.currentWordIndex = 0;
      this.saveLearningProgress();

      setTimeout(() => {
        this.currentGroupIndex++;
        
        if (this.currentGroupIndex * this.groupSize < this.wordContainer.allWords.length) {
          this.resetGroup();
        } else {
          this.currentGroupIndex = 0;
          this.learnedCount = 0;
          this.resetGroup();
          
          uni.showToast({
            title: '恭喜！已完成所有学习',
            icon: 'none',
            duration: 2000
          });
        }
      }, 2000);
    },

    // 获取学习进度
    async fetchLearningProgress() {
      try {
        const res = await uniCloud.callFunction({
          name: 'getLearningProgress'
        });
        
        if (res.result.success) {
          const { currentGroupIndex, currentWordIndex, learnedCount } = res.result.data;
          this.currentGroupIndex = currentGroupIndex;
          this.currentWordIndex = currentWordIndex;
          this.learnedCount = learnedCount;
          this.loadWords();
        } else {
          this.wordContainer.error = res.result.message;
        }
      } catch (err) {
        this.wordContainer.error = '请求失败，请重试';
      }
    },

    // 保存学习进度
    async saveLearningProgress() {
      try {
        await uniCloud.callFunction({
          name: 'saveLearningProgress',
          data: {
            currentGroupIndex: this.currentGroupIndex,
            currentWordIndex: this.currentWordIndex,
            learnedCount: this.learnedCount
          }
        });
      } catch (err) {
        console.error('保存进度失败:', err);
      }
    }
  }
}
</script>
<style scoped>
/* 顶部返回按钮样式（模板中存在 custom-back-btn 元素，保留） */
.custom-back-btn {
  position: fixed;
  top: 30rpx;
  left: 20rpx;
  width: 40rpx;
  height: 40rpx;
  z-index: 999; /* 确保在最上层，不被其他内容遮挡 */
}
.back-icon {
  width: 100%;
  height: 100%;
}

/* 页面容器样式（模板中存在 container 元素，保留） */
.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 进度框滑入动画（模板中 progress-box 使用，保留） */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-30rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* 学习进度框样式（模板中存在 progress-box 元素，保留） */
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

/* Flex容器样式（模板中 translation-box 使用，保留） */
.flex-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 翻译框基础样式（模板中存在 translation-box 元素，保留） */
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

/* 翻译框过渡动画（模板中 transition 组件使用，保留） */
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

/* 释义内容容器样式（模板中存在 meaning-container 元素，保留） */
.meaning-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24rpx;
}

/* 词性/翻译/例句/同义词样式（模板中均有对应元素，保留） */
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

/* 背景层样式（模板中存在 bg-box/overlay/bg-img 元素，保留） */
.bg-box {
  position: absolute;
  width: 100%;
  height: 100%;
  filter: blur(15px);
  transform: scale(1.1);
  overflow: hidden;
  z-index: 0;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}
.bg-img {
  width: 100%;
  height: 100%;
  opacity: 0.9;
}

/* 主内容区样式（模板中存在 content 元素，保留） */
.content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 100rpx 40rpx 80rpx;
}

/* 加载/错误/无数据提示样式（模板中均有对应元素，保留） */
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

/* 单词区域样式（模板中存在 word-area 元素，保留） */
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

/* 中间交互区域样式（模板中存在 middle-area 元素，保留） */
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

/* 按钮组样式（模板中存在 button-group 元素，保留） */
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
</style>