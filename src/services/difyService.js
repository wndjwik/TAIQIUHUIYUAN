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

/**
 * 调用Dify API生成祝福语
 * @param {Object} params - 请求参数
 * @param {string} params.memberName - 会员姓名
 * @param {string} params.actionType - 操作类型（recharge/consume）
 * @param {number} params.amount - 金额
 * @param {string} params.gender - 会员性别
 * @param {number} params.balance - 卡内余额（消费时需要）
 * @returns {Promise<string>} 生成的祝福语
 */
export const generateBlessingText = async (params) => {
  try {
    const { memberName, actionType, amount, gender = '男', balance } = params;
    
    // 根据性别确定称呼
    const honorific = gender === '女' ? '女士' : '先生';
    const nameWithHonorific = `${memberName}${honorific}`;
    
    // 构建提示词
    const prompt = `
      请为台球厅会员创建一条简短的${actionType === 'recharge' ? '充值' : '消费'}祝福语。
      会员信息：
      - 姓名：${memberName}
      - 性别：${gender}
      - 称呼：${nameWithHonorific}
      - 金额：¥${amount}
      - ${actionType === 'consume' ? `卡内余额：¥${balance}` : ''}
      - 操作类型：${actionType === 'recharge' ? '充值' : '消费'}
      
      祝福语要求：
      1. 简短友好
      2. 包含会员称呼（${nameWithHonorific}）
      3. 包含金额信息
      4. ${actionType === 'consume' ? '包含余额信息和欢迎下次光临' : ''}
      5. 符合台球厅场景
      6. 语气亲切热情
    `;
    
    // 在没有Dify API的情况下，使用模拟祝福语
    // 在实际项目中，这里应该调用真实的Dify API
    // const response = await fetch(`${DIFY_CONFIG.baseUrl}/chat/completions`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${DIFY_CONFIG.apiKey}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     app_id: DIFY_CONFIG.appId,
    //     inputs: {},
    //     query: prompt,
    //     user: 'system'
    //   })
    // });
    
    // 模拟祝福语生成 - 包含性别称呼和详细信息
    if (actionType === 'consume') {
      // 消费场景 - 固定格式：包含称呼、消费金额、余额和欢迎语
      return `${nameWithHonorific}，此次消费¥${amount}，卡内余额¥${balance}，欢迎您的下次光临。`;
    } else {
      // 充值场景 - 随机选择祝福语
      const rechargeGreetings = [
        `${nameWithHonorific}，感谢充值¥${amount}，祝您打球愉快！`,
        `${nameWithHonorific}，充值¥${amount}成功，欢迎常来打球！`,
        `${nameWithHonorific}，感谢支持，¥${amount}已到账，祝您球技大涨！`
      ];
      const randomIndex = Math.floor(Math.random() * rechargeGreetings.length);
      return rechargeGreetings[randomIndex];
    }
    
    // 实际API调用时返回
    // const data = await response.json();
    // return data.choices[0].message.content;
  } catch (error) {
    console.error('生成祝福语失败:', error);
    
    // 根据性别确定称呼
    const honorific = params.gender === '女' ? '女士' : '先生';
    const nameWithHonorific = `${params.memberName}${honorific}`;
    
    // 返回默认祝福语 - 确保包含性别称呼和所需信息
    if (params.actionType === 'consume') {
      return `${nameWithHonorific}，此次消费¥${params.amount}，卡内余额¥${params.balance || 0}，欢迎您的下次光临。`;
    } else {
      return `${nameWithHonorific}，感谢您的充值，¥${params.amount}已到账！`;
    }
  }
};

/**
 * 使用浏览器Web Speech API播放语音
 * @param {string} text - 要播放的文本
 * @param {Object} options - 语音配置选项
 */
export const speakText = (text, options = {}) => {
  // 检查浏览器是否支持Web Speech API
  if (!('speechSynthesis' in window)) {
    console.warn('当前浏览器不支持语音合成功能');
    return Promise.resolve(false);
  }
  
  return new Promise((resolve) => {
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
    
    // 设置语音选项
    utterance.lang = options.lang || 'zh-CN';
    utterance.rate = options.rate || preset.rate || 1.0;
    utterance.pitch = options.pitch || preset.pitch || 1.0;
    utterance.volume = options.volume || preset.volume || 1.0;
    
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
          console.warn(`未找到指定语音: ${options.voiceName}`);
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
    
    // 确保语音服务已初始化
    const voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      // 语音服务尚未初始化，等待voiceschanged事件
      console.log('等待语音服务初始化...');
      const handleVoicesChanged = () => {
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        selectVoice();
      };
      speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      // 添加超时处理
      setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        if (speechSynthesis.getVoices().length === 0) {
          console.error('语音服务初始化超时');
          resolve(false);
        }
      }, 3000);
    } else {
      selectVoice();
    }
  });
};

/**
 * 为会员操作生成并播放语音祝福
 * @param {Object} memberData - 会员数据
 * @param {string} actionType - 操作类型
 * @param {number} amount - 金额
 * @param {number} balance - 卡内余额（消费时需要）
 */
export const generateAndPlayBlessing = async (memberData, actionType, amount, balance) => {
  try {
    // 生成祝福语 - 传递余额信息
    const blessing = await generateBlessingText({
      memberName: memberData.name,
      actionType,
      amount,
      gender: memberData.gender,
      balance
    });
    
    console.log(`生成的祝福语: ${blessing}`);
    
    // 根据操作类型和金额选择不同的语音配置
    let voiceConfig = {
      lang: 'zh-CN'
    };
    
    // 根据操作类型设置不同的语音和风格
    if (actionType === 'recharge') {
      // 充值操作 - 选择热情活泼的语音风格
      voiceConfig.preset = amount >= 500 ? 'energetic' : 'enthusiastic';
      voiceConfig.voiceName = 'Google 普通话（中国大陆）';
    } else {
      // 消费操作 - 选择友好专业的语音风格
      voiceConfig.preset = 'friendly';
      voiceConfig.voiceName = 'Microsoft Huihui Desktop - Chinese (Simplified)';
    }
    
    // 对于大额交易特殊处理
    if (amount >= 1000) {
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
    
    // 根据性别确定称呼
    const honorific = memberData.gender === '女' ? '女士' : '先生';
    const nameWithHonorific = `${memberData.name}${honorific}`;
    
    // 返回包含性别称呼的错误备用消息
    const fallbackMessage = actionType === 'consume' 
      ? `${nameWithHonorific}，此次消费¥${amount}，卡内余额¥${balance || 0}，欢迎您的下次光临。`
      : `${nameWithHonorific}，${actionType === 'recharge' ? '充值' : '消费'}¥${amount}成功！`;
      
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
