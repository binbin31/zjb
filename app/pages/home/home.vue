<template>
  <view class="page-container">
    <!-- 全屏背景图片 -->
    <image 
      class="fullscreen-bg"
      :style="{ opacity: bgOpacity }"
      src="/pages/images/preview.jpg"
      mode="aspectFill"
    />

    <!-- 主页面内容 -->
    <view class="main-content" v-show="!showPopup">
      <view class="word-container">
        <text class="main-word">{{ currentWord }}</text>
      </view>

      <view class="stats-panel">
        <view class="data-box" @click="goToLearnPage">
          <text class="label bold">Learn</text>
          <text class="value bold">{{ remainingLearnCount }}</text>
        </view>
        <view class="data-box" @click="goToReviewPage">
          <text class="label bold">Review</text>
          <text class="value bold">{{ learningStats.review }}</text>
        </view>
      </view>
    </view>

    <!-- 自定义底部导航栏 -->
    <view 
      class="custom-tabbar" 
      v-if="!showPopup"
      :style="{ background: tabbarBackground }"
    >
      <view 
        class="tab-item" 
        v-for="(item, index) in tabList" 
        :key="index"
        @click="openPopup(index)"
      >
        <image :src="currentPopup === index ? item.activeIcon : item.icon" />
        <text v-show="showPopup" :style="{color: currentPopup === index ? activeColor : defaultColor}">{{item.text}}</text>
      </view>
    </view>

    <!-- 全屏弹窗 -->
    <view 
      class="popup" 
      :class="{ 'popup-show': showPopup }"
      @touchmove.prevent
    >
      <view class="popup-content">
        <view class="header-container">
          <view class="first-popup-header">
            <image class="left-icon" src="/pages/images/down.png" @click="closePopup" />
            <text class="center-title">{{ getPopupTitle() }}</text>
            <view style="width: 48rpx;"></view>
          </view>
        </view>

        <view class="popup-body">
          <!-- 第一个弹窗：不背学堂 -->
          <view v-if="currentPopup === 0" class="home-popup">
            <scroll-view scroll-y class="content" style="height: 100%;">
              <view class="swiper-container">
                <swiper 
                  class="swiper"
                  indicator-dots
                  autoplay
                  interval="3000"
                  duration="500"
                  :style="{ height: swiperHeight + 'rpx' }"
                >
                  <swiper-item v-for="(item, index) in swiperList" :key="index">
                    <view class="swiper-item">
                      <image :src="item.img" mode="aspectFill" class="swiper-img" />
                    </view>
                  </swiper-item>
                </swiper>
              </view>

              <view class="course-title">
                <text class="course-title-text3">精品课程</text>
              </view>

              <view class="course-container">
                <view class="course-card">
                  <view class="card-content">
                    <text class="course-name">六级听力 阶梯训练</text>
                    <text class="course-desc">轻松练真题</text>
                  </view>
                  <image class="course-icon" src="/pages/images/24gf-headphones.png" />
                </view>
                <view class="course-card">
                  <view class="card-content">
                    <text class="course-name">四级听力 阶梯训练</text>
                    <text class="course-desc">轻松练真题</text>
                  </view>
                  <image class="course-icon" src="/pages/images/24gf-headphones.png" />
                </view>
              </view>
              <view class="course-container">
                <view class="course-card">
                  <view class="card-content">
                    <text class="course-name">考研写作炼句</text>
                    <text class="course-desc">炼制高分金句</text>
                  </view>
                  <image class="course-icon" src="/pages/images/write.png" />
                </view>
                <view class="course-card">
                  <view class="card-content">
                    <text class="course-name">小野解词</text>
                    <text class="course-desc">词根词缀</text>
                  </view>
                  <image class="course-icon" src="/pages/images/zidian.png" />
                </view>
              </view>
              <view class="course-container">
                <view class="course-card">
                  <view class="card-content">
                    <text class="course-name">口语达人</text>
                    <text class="course-desc">地道口语特训</text>
                  </view>
                  <image class="course-icon" src="/pages/images/kouyu.png" />
                </view>
              </view>
			  
			  <view class="course-title">
			    <text class="course-title-text1">快速上手</text>
				<text class="course-title-text2">查看更多</text>
			  </view>
			  
			  <view class="course-container">
			    <view class="course-card">
			      <view class="card-content">
			        <text class="course-name">利用碎片化时间</text>
			        <text class="course-desc">轻松练真题</text>
			      </view>
			      <image class="course-icon" src="/pages/images/wancheng.png" />
			    </view>
			    <view class="course-card">
			      <view class="card-content">
			        <text class="course-name">真题词组</text>
			        <text class="course-desc">轻松背诵</text>
			      </view>
			      <image class="course-icon" src="/pages/images/write.png" />
			    </view>
			  </view>
			  
            </scroll-view>
          </view>

          <!-- 第二个弹窗：内容分类 -->
          <view v-if="currentPopup === 1" class="category-popup">
            <scroll-view scroll-x class="horizontal-scroll" style="padding-bottom: 20rpx;">
              <view class="horizontal-list">
                <view class="large-block first-block">
                  <view class="block-header">
                    <image class="icon" src="/pages/images/headphone.png" />
                    <text class="block-title">随身听</text>
                  </view>
                  <view class="small-blocks-container">
                    <view class="small-block">
                      <text class="stat-title bold">回顾</text>
                      <text class="stat-value">0词</text>
                    </view>
                    <view class="small-block">
                      <text class="stat-title bold">学习</text>
                      <text class="stat-value">0词</text>
                    </view>
                  </view>
                </view>
                <view class="large-block second-block">
                  <view class="block-header">
                    <image class="icon" src="/pages/images/write.png" />
                    <text class="block-title">单词本</text>
                  </view>
                  <view class="small-blocks-container">
                    <view class="small-block single-block">
                      <text class="stat-title bold">单词量</text>
                      <text class="stat-value">0词</text>
                    </view>
                  </view>
                </view>
              </view>
            </scroll-view>
			
			<view class="list-container">
			  <view class="list-item" @click="goToPage('LearnedBooks')">
			    <image class="list-icon" src="/pages/images/shu.png" />
			    <text class="list-text">已学词书</text>
			    <text class="list-value">{{ learnedBooksCount }}词</text>
			    <image class="list-arrow" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTggNWwxMSAxMS0xMSAxMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=" />
			  </view>
			</view>
			
			<view class="list-container">
			  <view class="list-item" @click="goToPage('RecentLearned')">
			    <image class="list-icon" src="/pages/images/zhegnzai.png" />
			    <text class="list-text">在学词书</text>
			    <text class="list-value">1本</text>
			    <image class="list-arrow" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTggNWwxMSAxMS0xMSAxMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=" />
			  </view>
			  <view class="list-item" @click="goToPage('AllLearned')">
			    <image class="list-icon" src="/pages/images/wancheng.png" />
			    <text class="list-text">全部已学</text>
			    <text class="list-value">{{ allLearnedCount }}词</text>
			    <image class="list-arrow" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTggNWwxMSAxMS0xMSAxMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=" />
			  </view>
			</view>
			
			<view class="list-container">
			  <view class="list-item">
			    <image class="list-icon" src="/pages/images/ji.png" />
			    <text class="list-text">单词本</text>
			    <text class="list-value">1本</text>
			    <image class="list-arrow" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTggNWwxMSAxMS0xMSAxMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=" />
			  </view>
			  <view class="list-item">
			    <image class="list-icon" src="/pages/images/ji.png" />
			    <text class="list-text">句库</text>
			    <text class="list-value">0句</text>
			    <image class="list-arrow" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTggNWwxMSAxMS0xMSAxMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=" />
			  </view>
			  <view class="list-item">
			    <image class="list-icon" src="/pages/images/ji.png" />
			    <text class="list-text">笔记</text>
			    <text class="list-value">0条</text>
			    <image class="list-arrow" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTggNWwxMSAxMS0xMSAxMSIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjRkZGIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=" />
			  </view>
			</view>
          </view>

          <!-- 第三个弹窗：用户中心 -->
          <view v-if="currentPopup === 2" class="user-popup">
            <scroll-view 
              scroll-y 
              class="user-scroll-container"
              @touchmove.stop
            >
              <view class="user-header">
                <view class="header-content">
                  <text class="learning-text bold">正在学习</text>
                  <view class="change-book-btn" @click="changeBook">
                    <text class="change-book-text">换本词书</text>
                  </view>
                </view>
              </view>
              
              <view class="user-banner-container">
                <view class="user-banner">
                  <image class="banner-image" src="/pages/images/lun1.png" mode="aspectFill" />
                  <image class="corner-icon" src="/pages/images/more-cui.png" mode="aspectFit" />
                  <view class="user-info-row">
                     <image class="info-icon" src="/pages/images/kong.png" mode="aspectFit" />
                     <text class="info-text">生词本</text>
                   </view>
				   <view class="progress-container">
				    <view class="progress-bar-bg">
				      <view class="progress-bar-fill" :style="{ width: progressPercentage + '%' }" />
				    </view>
				    <view class="progress-text-row">
				      <text class="progress-left-text">今日目标: {{ wordContainer.allWords.length }}词</text>
				      <text class="progress-right-text">已完成: {{ learnedCount }}词</text>
				    </view>
				  </view>
                </view>
              </view>

              <view class="user-header user-header--no-btn">
                <view class="header-content">
                  <text class="learning-text bold">我的数据</text>
                  <view class="header-empty-placeholder"></view>
                </view>
              </view>
              
              <view class="user-banner-container">
                <view class="user-banner user-banner--empty">
                  <view class="four-grid-container">
                      <view class="grid-item">
                         <view class="grid-row-1">
                            <image class="row1-img" src="/pages/images/shuju2.png" mode="aspectFit" />
                            <text class="row1-text">今日学习</text>
                          </view>
                        <view class="grid-row-2">
                           <text class="row2-text"> {{ learnedCount }}</text>
						   <text class="row2-text2">词</text>
                         </view>
                      </view>
                     <view class="grid-item">
                        <view class="grid-row-1">
                           <image class="row1-img" src="/pages/images/shijian1.png" mode="aspectFit" />
                           <text class="row1-text">累计复习</text>
                         </view>
                       <view class="grid-row-2">
                          <text class="row2-text"> {{ learnedCount }}</text>
                          <text class="row2-text2">词</text>
                        </view>
                     </view> 
                     <view class="grid-item">
                         <view class="grid-row-1">
                            <image class="row1-img" src="/pages/images/shuju.png" mode="aspectFit" />
                            <text class="row1-text">今日总时长</text>
                          </view>
                        <view class="grid-row-2">
                           <text class="row2-text">60</text>
						   <text class="row2-text2">分钟</text>
                         </view>
                      </view> 
                      <view class="grid-item">
                         <view class="grid-row-1">
                            <image class="row1-img" src="/pages/images/shuju1.png" mode="aspectFit" />
                            <text class="row1-text">今日学习</text>
                          </view>
                        <view class="grid-row-2">
                           <text class="row2-text">60</text>
						   <text class="row2-text2">分钟</text>
                         </view>
                      </view>
                  </view>
                </view>
              </view>
            </scroll-view>
          </view>
		  
        </view>
		
      </view>
    </view>
  </view>
</template>

<script>
import WordDataManager from '@/pages/utils/wordDataManager.js'

export default {
  data() {
    return {
      progressPercentage: 0,
      currentWord: "",
      learningStats: { review: 0 },
      showPopup: false,
      currentPopup: null,
      bgOpacity: 0.8,
      activeColor: '#007AFF',
      defaultColor: '#55ffff',
      tabbarBackground: 'transparent',
      tabList: [
        { icon: '/pages/images/xuetang.png', activeIcon: '/pages/images/down.png', text: '不背学堂' },
        { icon: '/pages/images/neirong.png', activeIcon: '/pages/images/neirong-active.png', text: '内容分类' },
        { icon: '/pages/images/yibiaopan.png', activeIcon: '/pages/images/yibiaopan-active.png', text: '用户中心' }
      ],
      swiperList: [
        { img: '/pages/images/lun1.png', title: '' },
        { img: '/pages/images/lun2.png', title: '' },
        { img: '/pages/images/lun3.png', title: '' }
      ],
      swiperHeight: 300,
      learnedBooksCount: 0,
      allLearnedCount: 0,
      learnedCount: 0,
      wordContainer: WordDataManager.getContainer(),
      loading: false,
      error: ''
    }
  },
  computed: {
    progressPercentage() {
      const totalWords = this.wordContainer.allWords.length;
      return totalWords ? Math.min(100, Math.round((this.learnedCount / totalWords) * 100)) : 0;
    },
    remainingLearnCount() {
      const total = this.wordContainer.allWords.length;
      const learned = this.learnedCount;
      return Math.max(0, total - learned);
    }
  },
  async mounted() {
    await this.refreshAllData();
    await this.fetchRandomWord();
  },
  async onShow() {
    await this.refreshAllData();
    await this.fetchRandomWord();
  },
  methods: {
    async fetchRandomWord() {
      this.loading = true;
      this.error = '';
      try {
        const res = await uniCloud.callFunction({
          name: 'getFirstWord'
        });
        
        if (res.result.code === 0) {
          this.currentWord = res.result.data;
        } else {
          this.error = res.result.msg || '获取单词失败';
          this.currentWord = '暂无单词';
        }
      } catch (err) {
        this.error = '调用云函数失败：' + err.message;
        this.currentWord = '获取失败';
      } finally {
        this.loading = false;
      }
    },

    async refreshAllData() {
      await Promise.all([
        this.initWordData(),
        this.loadLearningProgress(),
        this.fetchReviewCount()
      ]);
      this.fetchWordCounts();
    },

    async initWordData() {
      try {
        if (this.wordContainer.allWords.length === 0 && !this.wordContainer.isLoading) {
          await WordDataManager.init();
        }
      } catch (error) {
        console.error('初始化单词数据失败:', error);
      }
    },

    async loadLearningProgress() {
      try {
        const res = await uniCloud.callFunction({ name: 'getLearningProgress' });
        if (res.result.success) {
          this.learnedCount = res.result.data.learnedCount;
        } else {
          this.learnedCount = 15;
        }
      } catch (err) {
        console.error('获取学习进度失败:', err);
        this.learnedCount = 15;
      }
    },

    async fetchReviewCount() {
      try {
        const res = await uniCloud.callFunction({ name: 'getMasteredWords' });
        if (res.result.success) {
          this.learningStats.review = res.result.data.length;
        } else {
          this.learningStats.review = 0;
        }
      } catch (err) {
        console.error('获取复习数失败:', err);
        this.learningStats.review = 0;
      }
    },

    async fetchWordCounts() {
      try {
        const res = await uniCloud.callFunction({ name: 'getMasteredWords' });
        if (res.result.success) {
          const words = res.result.data;
          this.allLearnedCount = words.length;
          this.learnedBooksCount = words.length;
        } else {
          this.learnedBooksCount = 1200;
          this.allLearnedCount = 1200;
        }
      } catch (err) {
        this.learnedBooksCount = 1200;
        this.allLearnedCount = 1200;
      }
    },

    getPopupTitle() {
      return this.tabList[this.currentPopup]?.text || '';
    },

    goToLearnPage() {
      this.closePopup();
      uni.navigateTo({ url: '/pages/learn/learn' });
    },

    goToReviewPage() {
      this.closePopup();
      uni.navigateTo({ url: '/pages/Review/Review' });
    },

    openPopup(index) {
      this.currentPopup = index;
      this.showPopup = true;
      this.animateBackground(0);
    },

    closePopup() {
      this.showPopup = false;
      this.animateBackground(0.8);
      setTimeout(() => this.currentPopup = null, 300);
    },

    animateBackground(targetOpacity) {
      const duration = 400;
      const start = Date.now();
      const initialOpacity = this.bgOpacity;
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        this.bgOpacity = initialOpacity + (targetOpacity - initialOpacity) * progress;
        if (progress < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    },

    changeBook() {
      uni.showToast({ title: '词书已更换', icon: 'none' });
    },

    goToPage(pageName) {
      uni.navigateTo({ url: `/pages/neirfenlei/${pageName}` });
    },

    refreshLearningProgress(addedCount = 1) {
      this.learnedCount += addedCount;
      this.saveLearningProgress();
    },

    async saveLearningProgress() {
      try {
        await uniCloud.callFunction({
          name: 'saveLearningProgress',
          data: { learnedCount: this.learnedCount }
        });
      } catch (err) {
        console.error('保存学习进度失败:', err);
      }
    }
  }
}
</script>

<style scoped>
	/* 进度条区域样式 */
	.progress-container {
	  padding: 0rpx 30rpx;
	  margin-top: 20rpx;
	  margin-bottom: 20rpx;
	}
	
	.progress-bar-bg {
	  width: 100%;
	  height: 16rpx;
	  background-color: rgba(255, 255, 255, 0.1);
	  border-radius: 8rpx;
	  overflow: hidden;
	}
	
	.progress-bar-fill {
	  height: 100%;
	  background: linear-gradient(90deg, #ffb641, #ffb641);
	  border-radius: 8rpx;
	  transition: width 0.5s ease;
	}
	
	/* 进度条下方的文字区域 */
	.progress-text-row {
	  display: flex;
	  flex-direction: row;
	  justify-content: space-between;
	  margin-top: 15rpx;
	}

	.progress-left-text {
	  font-size: 28rpx;
	  color: rgba(255, 255, 255, 0.7);
	}
	
	.progress-right-text {
	  font-size: 28rpx;
	  color: rgba(255, 255, 255, 0.9);
	  font-weight: 500;
	}

	/* 图标和文字区域样式 */
	.user-info-row {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  margin: 20rpx 20rpx;
	}
	
	.info-icon {
	  width: 48rpx;
	  height: 48rpx;
	  margin-right: 20rpx;
	}
	
	.info-text {
	  font-size: 32rpx;
	  color: rgba(255, 255, 255, 0.9);
	}

	/* 用户中心内容块样式 */
	.user-banner-container {
	  padding: 0 30rpx;
	  margin-bottom: 30rpx;
	}
	
	.user-banner {
	  position: relative;
	  width: 100%;
	  border-radius: 20rpx;
	  overflow: hidden;
	 background-color: rgba(255, 255, 255, 0.1);
	  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.15);
	  padding: 20rpx 0;
	}
	
	/* 空框样式 */
	.user-banner--empty {
	 background-color: rgba(255, 255, 255, 0.1);
	  padding: 5rpx 0;
	  min-height: 700rpx;
	}
	
	.four-grid-container {
	  width: 100%;
	  height: 100%;
	  padding: 20rpx;
	  box-sizing: border-box;
	  display: grid;
	  grid-template-columns: 1fr 1fr;
	  grid-template-rows: 1fr 1fr;
	  gap: 20rpx;
	}
	
	.grid-item {
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
}

.grid-row-1 {
  display: flex;
  flex-direction: row;
 align-items: center;
  gap: 10rpx;
}

.row1-img {
  width: 60rpx;
  height: 60rpx;
  flex-shrink: 0;
}

.row1-text {
  font-size: 35rpx;
  color: white;
}

.grid-row-2 {
  flex: 2;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.row2-text {
	font-weight: bold;
  font-size: 70rpx;
  color: white;
  text-align: center;
}
.row2-text2 {
	padding: 10rpx;
  font-size: 36rpx;
  color: white;
  text-align: center;
}
	
	/* 第三个弹窗滚动核心样式 */
	.user-popup {
	  height: 100%;
	  overflow: hidden;
	}
	
	.user-scroll-container {
	  height: 100%;
	  padding-bottom: 120rpx;
	  box-sizing: border-box;
	}

	/* 横幅图片样式 */
	.banner-image {
	  margin-top: 20rpx;
	  width: 30%;
	  height: 250rpx;
	  left: 20rpx;
	  display: block;
	  border-radius: 20rpx;
	}
	
	.corner-icon {
	  position: absolute;
	  right: 0rpx;
	  width: 80rpx;
	  height: 80rpx;
	  padding: 12rpx;
	  box-sizing: border-box;
	}
	
	.banner-text {
	  position: absolute;
	  bottom: 0;
	  left: 0;
	  right: 0;
	  padding: 20rpx 30rpx;
	  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
	}
	
	.banner-title {
	  font-size: 34rpx;
	  font-weight: bold;
	  color: white;
	  margin-bottom: 5rpx;
	}
	
	.banner-desc {
	  font-size: 28rpx;
	  color: rgba(255, 255, 255, 0.8);
	}

	/* 用户中心标题栏样式 */
	.user-header {
	  padding: 30rpx;
	}
	
	.user-header--no-btn {
	  padding-top: 10rpx;
	}
	
	.header-content {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  width: 100%;
	  justify-content: space-between;
	}
	
	.header-empty-placeholder {
	  width: 160rpx;
	}
	
	.learning-text {
	  font-size: 36rpx;
	  color: #FFFFFF;
	}
	
	.change-book-btn {
	  background: #684d1e;
	  border-radius: 100rpx;
	  padding: 16rpx 32rpx;
	  display: flex;
	  align-items: center;
	  transition: all 0.3s;
	}
	
	.change-book-btn:active {
	  transform: scale(0.95);
	  background: linear-gradient(135deg, #0065D9, #2980B9);
	}
	
	.change-book-text {
	  font-size: 20rpx;
	  color: #ffb641;
	  font-weight: 500;
	}

	/* 列表容器样式 */
	.list-container {
	  padding: 0 30rpx;
	  margin-top: 20rpx;
	  background-color: #00356b;
	  border-radius: 30rpx;
	}
	
	/* 列表项样式 */
	.list-item {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  padding: 25rpx 0;
	  height: 125rpx;
	}
	
	/* 列表图标 */
	.list-icon {
	  width: 40rpx;
	  height: 40rpx;
	  margin-right: 20rpx;
	}
	
	/* 列表文本 */
	.list-text {
	  font-size: 32rpx;
	  color: white;
	  flex: 1;
	}
	
	/* 列表数值 */
	.list-value {
	  font-size: 28rpx;
	  color: rgba(255, 255, 255, 0.8);
	  margin-right: 15rpx;
	}
	
	/* 列表箭头 */
	.list-arrow {
	  width: 24rpx;
	  height: 24rpx;
	}

	/* 全屏背景样式 */
	.fullscreen-bg {
	  filter: blur(5px);
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: 100vw;
	  height: 100vh;
	  z-index: -1;
	  transition: opacity 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	/* 页面容器样式 */
	.page-container {
	  height: 100vh;
	  overflow: hidden;
	  touch-action: none;
	}

	/* 主内容区样式 */
	.main-content {
	  display: flex;
	  flex-direction: column;
	  justify-content: space-between;
	  height: 100vh;
	  padding: 0;
	  overflow: hidden;
	  touch-action: none;
	}

	/* 单词显示容器 */
	.word-container {
	  position: fixed;
	  top: 50%;
	  left: 50%;
	  transform: translate(-50%, -50%);
	  z-index: 1;
	  pointer-events: none;
	  overflow: hidden;
	  touch-action: none;
	  height: 100%;
	}
	
	.main-word {
	  font-size: 72rpx;
	  font-weight: 800;
	  color: #FFFFFF;
	  text-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
	  letter-spacing: 4rpx;
	  white-space: nowrap;
	  overflow: hidden;
	  height: 100%;
	  display: flex;
	  align-items: center;
	  pointer-events: none;
	}

	/* 底部导航栏样式 */
	.custom-tabbar {
	  position: fixed;
	  bottom: 0;
	  left: 0;
	  right: 0;
	  height: 100rpx;
	  display: flex;
	  background: transparent;
	  border-top: none;
	  backdrop-filter: none;
	  box-shadow: none;
	  z-index: 2;
	  display: flex;
	  flex-direction: row;
	  justify-content: space-evenly;
	  align-items: center;
	  height: 80rpx;
	}
	
	.tab-item {
	  flex: 1;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	}
	
	.tab-item image {
	  width: 70rpx;
	  height: 70rpx;
	  margin-bottom: 8rpx;
	}
	
	.tab-item text {
	  font-size: 24rpx;
	  transition: color 0.3s;
	}

	/* 弹窗基础样式 */
	.popup {
	  position: fixed;
	  bottom: -100vh;
	  left: 0;
	  right: 0;
	  height: 100vh;
	  background: #121b56;
	  z-index: 999;
	  border-top-left-radius: 70rpx;
	  border-top-right-radius: 70rpx;
	  transition: 
	    bottom 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94),
	    border-radius 0.2s 0.3s;
	  box-shadow: 0 -10rpx 30rpx rgba(0,0,0,0.1);
	  touch-action: pan-y;
	}
	
	.popup-show {
	  bottom: 0;
	  border-top-left-radius: 0;
	  border-top-right-radius: 0;
	}
	
	.popup-content {
	  height: 100%;
	  position: relative;
	  overflow: hidden;
	}

	/* 弹窗标题栏样式 */
	.header-container {
	  height: 100rpx;
	  background: #121b56;
	  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
	  position: relative;
	}
	
	.first-popup-header {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  justify-content: space-between;
	  width: 100%;
	  height: 100%;
	  padding: 0 30rpx;
	}
	
	.left-icon {
	  width: 48rpx;
	  height: 48rpx;
	}
	
	.center-title {
	  font-size: 36rpx;
	  font-weight: bold;
	  color: white;
	  flex: 1;
	  text-align: center;
	}

	/* 弹窗内容区样式 */
	.popup-body {
	  position: absolute;
	  top: 100rpx;
	  bottom: 0;
	  left: 0;
	  right: 0;
	  padding: 30rpx;
	  overflow-y: auto;
	}

	/* 第一个弹窗课程相关样式 */
	.swiper-container {
	  width: 100%;
	  margin-bottom: 30rpx;
	  border-radius: 20rpx;
	  overflow: hidden;
	}
	
	.swiper {
	  width: 100%;
	}
	
	.swiper-item {
	  position: relative;
	  width: 100%;
	  height: 100%;
	}
	
	.swiper-img {
	  width: 100%;
	  height: 100%;
	  display: block;
	}
	
	.course-title {
	  margin: 30rpx 0 20rpx 0;
	  display: flex;
	  flex-direction: row;
	  justify-content: space-between;
	  align-items: center;
	}
	
	.course-title-text3 {
	  font-size: 40rpx;
	  font-weight: bold;
	  color: white;
	}
	
	.course-title-text1 {
	  font-size: 40rpx;
	  font-weight: bold;
	  color: white;
	}
	
	.course-title-text2 {
	  font-size: 20rpx;
	  font-weight: bold;
	  color: rgba(255, 255, 255, 0.8);
	}
	
	.course-container {
	  display: flex;
	  flex-direction: row;
	  justify-content: space-between;
	  margin: 0 -10rpx;
	}
	
	.course-card {
	  width: 47%;
	  background: rgba(255, 255, 255, 0.2);
	  border-radius: 40rpx;
	  padding: 30rpx;
	  position: relative;
	  height: 200rpx;
	  box-sizing: border-box;
	  margin: 0 10rpx 20rpx;
	}
	
	.card-content {
	  display: flex;
	  flex-direction: column;
	}
	
	.course-name {
	  font-size: 34rpx;
	  font-weight: bold;
	  color: white;
	  margin-bottom: 10rpx;
	}
	
	.course-desc {
	  font-size: 28rpx;
	  color: rgba(255, 255, 255, 0.8);
	}
	
	.course-icon {
	  position: absolute;
	  bottom: 20rpx;
	  right: 20rpx;
	  width: 80rpx;
	  height: 80rpx;
	  border-radius: 50%;
	  background: rgba(255, 255, 255, 0.3);
	  padding: 10rpx;
	}

	/* 第二个弹窗横向列表样式 */
	.horizontal-scroll {
	  padding: 0 10rpx;
	  overflow-x: auto;
	  white-space: nowrap;
	  -webkit-overflow-scrolling: touch;
	}
	
	.horizontal-list {
	  display: flex;
	  flex-direction: row;
	  gap: 28rpx;
	  min-width: max-content;
	}
	
	.large-block {
	  background: #00356b;
	  border-radius: 20rpx;
	  padding: 20rpx;
	  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.15);
	  display: inline-block;
	  flex-shrink: 0;
	}
	
	.first-block {
	  width: 60%;
	}
	
	.second-block {
	  width: 35%;
	}
	
	.block-header {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  margin-bottom: 15rpx;
	}
	
	.icon {
	  width: 40rpx;
	  height: 40rpx;
	  margin-right: 10rpx;
	}
	
	.block-title {
	  font-size: 32rpx;
	  font-weight: bold;
	  color: white;
	}
	
	.small-blocks-container {
	  display: flex;
	  flex-direction: row;
	  gap: 15rpx;
	}
	
	.small-block {
	  flex: 1;
	  background: rgba(255, 255, 255, 0.2);
	  border-radius: 12rpx;
	  padding: 15rpx;
	  text-align: center;
	}
	
	.single-block {
	  width: 100%;
	}
	
	.stat-title {
	  font-size: 32rpx;
	  color: white;
	  margin-bottom: 5rpx;
	}
	
	.stat-value {
	  font-size: 28rpx;
	  color: rgba(255, 255, 255, 0.8);
	}

	/* 统计面板样式 */
	.stats-panel {
	  position: fixed;
	  bottom: 100rpx;
	  left: 0;
	  right: 0;
	  padding: 40rpx 0;
	  display: flex;
	  justify-content: space-around;
	  flex-direction: row;
	  gap: 20rpx;
	  touch-action: none;
	}
	
	.data-box {
	  width: 250rpx;
	  background: rgba(255, 255, 255, 0.18);
	  border-radius: 35rpx;
	  padding: 40rpx 60rpx;
	  backdrop-filter: blur(20rpx);
	  border: 1rpx solid rgba(255, 255, 255, 0.25);
	  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.1);
	  margin: 0 10rpx;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  text-align: center;
	}
	
	.bold {
	  font-weight: bold;
	}
	
	.label {
	  font-size: 40rpx;
	  color: rgba(255, 255, 255, 0.95);
	  margin-bottom: 8rpx;
	}
	
	.value {
	  font-size: 48rpx;
	  color: #FFFFFF;
	}
</style>