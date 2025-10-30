// types.d.ts
declare module 'uni-app' {
  // 扩展 UniCloud 类型
  interface UniCloud {
    database(): UniCloudDatabase; // 添加 database 方法定义
    getCurrentUserInfo(): Promise<{ uid: string }>; // 修正方法名
  }

  interface UniCloudDatabase {
    collection(collectionName: string): UniCloudCollection;
  }

  interface UniCloudCollection {
    get(): Promise<any>;
    doc(id: string): UniCloudDocument;
    add(data: any): Promise<any>;
  }

  interface UniCloudDocument {
    update(data: any): Promise<any>;
  }

  // 单词数据结构
  interface Word {
    _id: string;
    word: string;
    phonetic: string;
    meaning: {
      partOfSpeech: string;
      translation: string;
      example: string;
      synonym: string;
    };
  }

  // 用户进度数据结构
  interface UserProgress {
    _id?: string;
    user_id: string;
    groupSize: number;
    currentGroupIndex: number;
    learnedWords: string[];
    learningHistory: {
      word: string;
      timestamp: Date;
      correct: boolean;
    }[];
  }
  
  
  // types.d.ts
  declare module 'uni-app' {
    interface UniCloud {
      database(): UniCloudDatabase; // 声明 database 方法
    }
  
    interface UniCloudDatabase {
      collection(collectionName: string): UniCloudCollection;
    }
  
    interface UniCloudCollection {
      get(): Promise<{ result: { data: any[] } }>; // 匹配 uniCloud 返回格式
      doc(id: string): UniCloudDocument;
    }
  
    interface UniCloudDocument {
      update(data: any): Promise<any>;
    }
  }
}