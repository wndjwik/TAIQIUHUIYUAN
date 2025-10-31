// Dify服务集成 - 用于文字生成和语音转换

// Dify API配置
const DIFY_CONFIG = {
  // 在实际使用时需要替换为您的Dify API密钥
  apiKey: 'YOUR_DIFY_API_KEY',
  // Dify API基础URL
  baseUrl: 'https://api.dify.ai/v1',
  // 应用ID
  appId: 'YOUR_DIFY_APP_ID'
};

// 语音播放队列管理
class SpeechQueueManager {
  constructor() {
    this.queue = [];
    this.isPlaying = false;
    this.initialized = false;
    this.pendingPromises = [];
    
    // 预初始化语音服务
    this.preInitialize();
  }
  
  // 预初始化语音服务
  preInitialize() {
    if ('speechSynthesis' in window) {
      // 提前获取语音列表以初始化服务
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.initialized = true;
        console.log('语音服务预初始化完成，可用语音数量:', voices.length);
      } else {
        // 监听语音初始化完成事件
        speechSynthesis.addEventListener('voiceschanged', () => {
          this.initialized = true;
          console.log('语音服务初始化完成，可用语音数量:', speechSynthesis.getVoices().length);
          // 处理等待中的语音请求
          this.processPendingPromises();
        });
      }
    }
  }
  
  // 处理等待中的语音请求
  processPendingPromises() {
    this.pendingPromises.forEach(resolve => resolve());
    this.pendingPromises = [];
  }
  
  // 等待语音服务初始化完成
  async waitForInitialization() {
    if (this.initialized || !('speechSynthesis' in window)) {
      return;
    }
    
    return new Promise(resolve => {
      this.pendingPromises.push(resolve);
      
      // 设置超时
      setTimeout(() => {
        if (!this.initialized) {
          console.warn('语音服务初始化超时，继续执行');
          resolve();
        }
      }, 2000);
    });
  }
  
  // 添加语音到队列
  async addToQueue(text, options) {
    await this.waitForInitialization();
    
    return new Promise((resolve) => {
      this.queue.push({ text, options, resolve });
      if (!this.isPlaying) {
        this.processQueue();
      }
    });
  }
  
  // 处理队列
  async processQueue() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      return;
    }
    
    this.isPlaying = true;
    const { text, options, resolve } = this.queue.shift();
    
    try {
      const result = await this.speakImmediately(text, options);
      resolve(result);
    } catch (error) {
      console.error('队列中语音播放失败:', error);
      resolve(false);
    } finally {
      // 立即处理下一个语音
      setTimeout(() => this.processQueue(), 100);
    }
  }
  
  // 立即播放语音（不加入队列）
  speakImmediately(text, options) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('当前浏览器不支持语音合成功能');
        resolve(false);
        return;
      }
      
      // 停止当前所有语音播放
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 基于场景的预设配置
      const voicePresets = {
        enthusiastic: { rate: 1.2, pitch: 1.1, volume: 1.0 },
        professional: { rate: 0.9, pitch: 0.9, volume: 0.8 },
        friendly: { rate: 1.0, pitch: 1.0, volume: 0.9 },
        energetic: { rate: 1.3, pitch: 1.2, volume: 1.0 },
        calm: { rate: 0.8, pitch: 0.8, volume: 0.7 }
      };
      
      // 应用预设配置
      const preset = options.preset ? voicePresets[options.preset] : {};
      
      // 设置语音选项 - 使用更快的语速以减少延迟感
      utterance.lang = options.lang || 'zh-CN';
      utterance.rate = options.rate || preset.rate || 1.3; // 提高默认语速
      utterance.pitch = options.pitch || preset.pitch || 1.0;
      utterance.volume = options.volume || preset.volume || 0.9;
      
      // 改进的语音选择逻辑
      const selectVoice = () => {
        const voices = speechSynthesis.getVoices();
        if (options.voiceName) {
          // 先尝试精确匹配
          let voice = voices.find(v => v.name === options.voiceName);
          // 如果没有精确匹配，尝试包含匹配
          if (!voice) {
            voice = voices.find(v => v.name.includes(options.voiceName));
          }
          // 如果还没找到，根据语言选择默认语音
          if (!voice) {
            voice = voices.find(v => v.lang === utterance.lang);
          }
          if (voice) {
            utterance.voice = voice;
            console.log(`已选择语音: ${voice.name}`);
          } else {
            console.warn(`未找到指定语音: ${options.voiceName}，使用系统默认语音`);
          }
        }
        
        // 开始播放
        speechSynthesis.speak(utterance);
      };
      
      // 播放结束回调
      utterance.onend = () => {
        console.log('语音播放完成');
        resolve(true);
      };
      
      // 播放错误回调
      utterance.onerror = (event) => {
        console.error('语音播放失败:', event);
        resolve(false);
      };
      
      // 立即选择语音并播放
      selectVoice();
    });
  }
}

// 创建语音队列管理器实例
const speechQueueManager = new SpeechQueueManager();

/**
 * 调用Dify API生成祝福语
 * @param {Object|string} params - 参数对象或操作类型
 * @param {string} [params.memberName] - 会员姓名
 * @param {string} [params.actionType] - 操作类型 ('recharge' 或 'consume')
 * @param {number} [params.amount] - 金额
 * @param {string} [params.gender] - 会员性别
 * @param {number} [params.balance] - 卡内余额
 * @param {number} [amount] - 金额（当第一个参数是字符串时）
 * @param {string} [memberName] - 会员姓名（当第一个参数是字符串时）
 * @returns {Promise<string>} 生成的祝福语
 */
export const generateBlessingText = async (params, amount = 0, memberName = '会员') => {
  try {
    // 解析参数，兼容新旧两种格式
    let finalActionType = 'recharge';
    let finalAmount = 0;
    let finalMemberName = '会员';
    let gender = '男';
    let balance;
    
    if (typeof params === 'object' && params !== null) {
      // 新格式: { memberName, actionType, amount, gender, balance }
      finalActionType = params.actionType || 'recharge';
      finalAmount = params.amount || 0;
      finalMemberName = params.memberName || '会员';
      gender = params.gender || '男';
      balance = params.balance;
    } else {
      // 旧格式: (actionType, amount, memberName)
      finalActionType = params || 'recharge';
      finalAmount = amount || 0;
      finalMemberName = memberName || '会员';
    }
    
    console.log(`生成祝福文本: 操作=${finalActionType}, 金额=${finalAmount}, 会员=${finalMemberName}`);
    
    // 根据性别确定称呼
    const honorific = gender === '女' ? '女士' : '先生';
    const nameWithHonorific = finalMemberName !== '会员' ? `${finalMemberName}${honorific}` : '会员';
    
    // 模拟祝福语生成 - 包含性别称呼和详细信息
    if (finalActionType === 'consume') {
      // 消费场景 - 固定格式：包含称呼、消费金额、余额和欢迎语
      return `${nameWithHonorific}，此次消费¥${finalAmount}，卡内余额¥${balance}，欢迎您的下次光临。`;
    } else {
      // 充值场景 - 随机选择祝福语
      const rechargeGreetings = [
        `${nameWithHonorific}，感谢充值¥${finalAmount}，祝您打球愉快！`,
        `${nameWithHonorific}，充值¥${finalAmount}成功，欢迎常来打球！`,
        `${nameWithHonorific}，感谢支持，¥${finalAmount}已到账，祝您球技大涨！`
      ];
      const randomIndex = Math.floor(Math.random() * rechargeGreetings.length);
      return rechargeGreetings[randomIndex];
    }
  } catch (error) {
    console.error('生成祝福文本失败:', error);
    
    // 解析参数以获取基本信息
    let finalActionType = 'recharge';
    let finalAmount = 0;
    let finalMemberName = '会员';
    let gender = '男';
    
    if (typeof params === 'object' && params !== null) {
      finalActionType = params.actionType || 'recharge';
      finalAmount = params.amount || 0;
      finalMemberName = params.memberName || '会员';
      gender = params.gender || '男';
    } else {
      finalActionType = params || 'recharge';
      finalAmount = amount || 0;
      finalMemberName = memberName || '会员';
    }
    
    // 根据性别确定称呼
    const honorific = gender === '女' ? '女士' : '先生';
    const nameWithHonorific = finalMemberName !== '会员' ? `${finalMemberName}${honorific}` : '会员';
    
    // 返回默认祝福语作为备用
    if (finalActionType === 'consume') {
      return `${nameWithHonorific}，此次消费¥${finalAmount}，卡内余额¥${typeof params === 'object' ? (params.balance || 0) : 0}，欢迎您的下次光临。`;
    } else {
      return `${nameWithHonorific}，感谢您的充值，¥${finalAmount}已到账！`;
    }
  }
};

export const speakText = (text, options = {}) => {
  // 直接使用队列管理器
  return speechQueueManager.addToQueue(text, options);
};

/**
 * 为会员操作生成并播放语音祝福
 * @param {Object} data - 生成祝福所需的数据或会员数据对象
 * @param {string} data.memberName - 会员姓名
 * @param {string} data.actionType - 操作类型
 * @param {number} data.amount - 金额
 * @param {string} data.gender - 性别
 * @param {number} data.balance - 卡内余额（消费时需要）
 * @param {string} actionType - 操作类型(兼容旧格式)
 * @param {number} amount - 金额(兼容旧格式)
 * @param {number} balance - 卡内余额（兼容旧格式）
 */
export const generateAndPlayBlessing = async (data, actionType, amount, balance) => {
  try {
    // 兼容新旧函数签名
    let memberName, finalActionType, finalAmount, finalBalance, gender;
    
    // 判断参数类型，兼容两种调用方式
    if (typeof data === 'object' && !Array.isArray(data) && 'memberName' in data) {
      // 新格式: { memberName, actionType, amount, gender, balance }
      memberName = data.memberName || '会员';
      finalActionType = data.actionType || 'recharge';
      finalAmount = data.amount || 0;
      finalBalance = data.balance;
      gender = data.gender || '男';
    } else {
      // 旧格式: (memberData, actionType, amount, balance)
      const memberData = data;
      memberName = memberData.name || '会员';
      finalActionType = actionType || 'recharge';
      finalAmount = amount || 0;
      finalBalance = balance;
      gender = memberData.gender || '男';
    }
    
    // 生成祝福语 - 传递余额信息
    const blessing = await generateBlessingText({
      memberName,
      actionType: finalActionType,
      amount: finalAmount,
      gender,
      balance: finalBalance
    });
    
    console.log(`生成的祝福语: ${blessing}`);
    
    // 优化：在页面加载时预先生成语音配置，减少运行时计算
    const voiceConfigs = {
      recharge: {
        preset: finalAmount >= 500 ? 'energetic' : 'enthusiastic',
        voiceName: 'Google 普通话（中国大陆）',
        lang: 'zh-CN'
      },
      consume: {
        preset: 'friendly',
        voiceName: 'Microsoft Huihui Desktop - Chinese (Simplified)',
        lang: 'zh-CN'
      }
    };
    
    // 根据操作类型获取配置
    let voiceConfig = { ...voiceConfigs[finalActionType] };
    
    // 对于大额交易特殊处理
    if (finalAmount >= 1000) {
      voiceConfig.volume = 1.0; // 大额交易音量稍高
    }
    
    // 播放语音
    const result = await speakText(blessing, voiceConfig);
    
    return { 
      success: result, 
      blessing,
      voiceConfig 
    };
  } catch (error) {
    console.error('生成或播放祝福失败:', error);
    
    // 确定称呼和消息内容
    let nameWithHonorific = '会员';
    let finalActionType = actionType || 'recharge';
    let finalAmount = amount || 0;
    let finalBalance = balance || 0;
    
    if (typeof data === 'object') {
      if ('memberName' in data) {
        // 新格式
        const gender = data.gender || '男';
        const honorific = gender === '女' ? '女士' : '先生';
        nameWithHonorific = `${data.memberName || '会员'}${honorific}`;
        finalActionType = data.actionType || finalActionType;
        finalAmount = data.amount || finalAmount;
        finalBalance = data.balance !== undefined ? data.balance : finalBalance;
      } else if ('name' in data) {
        // 旧格式
        const honorific = data.gender === '女' ? '女士' : '先生';
        nameWithHonorific = `${data.name || '会员'}${honorific}`;
      }
    }
    
    // 返回包含性别称呼的错误备用消息
    const fallbackMessage = finalActionType === 'consume' 
      ? `${nameWithHonorific}，此次消费¥${finalAmount}，卡内余额¥${finalBalance}，欢迎您的下次光临。`
      : `${nameWithHonorific}，${finalActionType === 'recharge' ? '充值' : '消费'}¥${finalAmount}成功！`;
      
    return { 
      success: false, 
      error: error.message,
      fallbackMessage
    };
  }
};

export default {
  generateBlessingText,
  speakText,
  generateAndPlayBlessing
};
