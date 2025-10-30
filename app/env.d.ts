/// <reference types="uni-app" />
declare module 'uni-app' {
  interface UniCloud {
    database: () => any; // 解决uniCloud.database()的类型警告
  }
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
}