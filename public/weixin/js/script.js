document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    const chatContainer = document.querySelector('.chat-container');
    const choiceContainer = document.querySelector('.choice-container');
    const sendSound = document.getElementById('send-sound');
    const receiveSound = document.getElementById('receive-sound');
    const testSound = document.getElementById('test-sound'); // 获取测试音频元素
    const startScreen = document.getElementById('startScreen');
    const startButton = document.getElementById('startButton');
    const testSoundButton = document.getElementById('testSoundButton');
    
    // 控制面板元素
    const fastForwardBtn = document.getElementById('fastForwardBtn');
    const historyBtn = document.getElementById('historyBtn');
    const historyPanel = document.getElementById('historyPanel');
    const closeHistory = document.getElementById('closeHistory');
    const historyList = document.getElementById('historyList');
    
    // 音频播放状态
    let audioEnabled = false;
    
    // 设置音量
    if (sendSound) sendSound.volume = 0.5;
    if (receiveSound) receiveSound.volume = 0.5;
    if (testSound) testSound.volume = 0.5;
    
    // 添加测试音效按钮事件
    testSoundButton.addEventListener('click', function() {
        if (testSound) {
            // 重置音频
            testSound.currentTime = 0;
            
            // 播放测试音效
            testSound.play()
                .then(() => {
                    audioEnabled = true; // 标记音频可用
                    testSoundButton.textContent = "音效正常";
                    setTimeout(() => {
                        testSoundButton.textContent = "测试音效";
                    }, 2000);
                })
                .catch(e => {
                    console.log("测试音效失败:", e);
                    testSoundButton.textContent = "音效异常";
                    setTimeout(() => {
                        testSoundButton.textContent = "测试音效";
                    }, 2000);
                });
        }
    });
    
    // 添加开始按钮事件
    startButton.addEventListener('click', function() {
        // 隐藏开始屏幕
        startScreen.style.display = 'none';
        
        // 尝试播放一次无声音频，解锁后续音频播放
        if (testSound && !audioEnabled) {
            testSound.volume = 0;
            testSound.play().then(() => {
                audioEnabled = true;
                testSound.pause();
                testSound.currentTime = 0;
                testSound.volume = 0.5;
            }).catch(e => console.log("音频解锁失败:", e));
        }
        
        // 初始化游戏
        initGame();
    });
    
    // 消息显示速度（毫秒）
    let messageDelay = 2500; // 默认2.5秒
    let isFastForward = false; // 快进状态
    
    // 历史记录
    let historyChoices = [];
    let visitedScenes = new Set(); // 记录已访问的场景
    
    // 更新时间显示
    updateTime();
    setInterval(updateTime, 60000); // 每分钟更新一次时间
    
    // 图片映射表
    const imageMap = {
        "【截图：网站注册界面】": "images/屏幕截图 2025-03-02 143027.png",
        "【截图：订单界面】": "images/屏幕截图 2025-03-02 143118.png",
        "【截图：网站截图】": "images/屏幕截图 2025-03-02 143202.png",
        "【网站截图】": "images/屏幕截图 2025-03-02 143234.png",
        "【截图：平台充值记录】": "images/屏幕截图 2025-03-02 143301.png"
    };
    
    // 当前场景索引
    let currentScene = 'start';
    let currentMessageIndex = 0;
    let isPlaying = false;
    
    // 对话内容数据
    const dialogData = [
        // 初始场景 - 骗子发起交易请求
        {
            id: 'start',
            messages: [
                { type: 'time', content: '上午10:23' },
                { type: 'friend', content: '你手上玩的这个让我给我可以吗500' },
                { type: 'self', content: '刚刚有点惊讶 考虑了一下 还需要吗' },
                { type: 'friend', content: '可以' },
                { type: 'friend', content: '方便录屏看看你的车辆和服装的总数量吗' },
                { type: 'self', content: '稍等' },
                { type: 'time', content: '录屏后...' },
                { type: 'self', content: '可能有点乱 你看看还有哪里不清楚的' },
                { type: 'friend', content: '你没压缩吗怎么点不开' },
                { type: 'self', content: '不会吧 那我再发一次' },
                { type: 'friend', content: '你点频道发一下' },
                { type: 'time', content: '几分钟后' },
                { type: 'friend', content: '来了吗？' },
                { type: 'self', content: '来了来了' },
                { type: 'friend', content: '你都成年了吧' },
                { type: 'self', content: '嗯' },
                { type: 'friend', content: '礼格购.top' },
                { type: 'friend', content: '你复制到浏览器，进入平台注册账号' },
                { type: 'friend', content: '上架发布选 qq 飞车数据迁移' },
                { type: 'friend', content: '通过审核跟我说一下，我去下单' },
                { type: 'choices', options: [
                    { text: '好的，我去注册', next: 'register' },
                    { text: '我先查一下这个网站', next: 'check_website' }
                ]}
            ]
        },
        // 注册分支
        {
            id: 'register',
            messages: [
                { type: 'self', content: '好的，我这就去注册' },
                { type: 'time', content: '几分钟后...' },
                { type: 'self', content: '【截图：网站注册界面】' },
                { type: 'self', content: '看了下网站的基本信息没搜出啥问题，按照你的指示发了账号信息' },
                { type: 'friend', content: '【截图：订单界面】' },
                { type: 'friend', content: '好了，你看下你那边到了没' },
                { type: 'friend', content: '我已经下单了，你那边弄好以后问客服拿激活码订单给我上号' },
                { type: 'self', content: '稍等，我这边正在提现中，到账了跟你联系' },
                { type: 'time', content: '半小时后...' },
                { type: 'friend', content: '好了没有啊？' },
                { type: 'friend', content: '怎么这么久的啊拿激活码订单给我上号啊' },
                { type: 'self', content: '好了好了，我要怎么做' },
                { type: 'time', content: '你查看界面，发现账号显示冻结' },
                { type: 'self', content: '完了我这边把卡号输错了这边显示冻结了，不好意思' },
                { type: 'friend', content: '那你先去问问客服咋解决呀？' },
                { type: 'choices', options: [
                    { text: '我自己去解决', next: 'contact_support' },
                    { text: '问问游戏好友', next: 'ask_friend' }
                ]}
            ]
        },
        // 查网站分支
        {
            id: 'check_website',
            messages: [
                { type: 'self', content: '这个网站我没听说过，我先查一下' },
                { type: 'time', content: '搜索中...' },
                { type: 'self', content: '我查了一下，这个网站好像有问题，网上有人说是诈骗网站' },
                { type: 'friend', content: '不会吧，我朋友都是在这个平台交易的，很安全的' },
                { type: 'friend', content: '你是不是搜错了？' },
                { type: 'choices', options: [
                    { text: '可能是我弄错了，我去注册', next: 'register' },
                    { text: '我已经举报并拉黑你了', next: 'report_end' }
                ]}
            ]
        },
        // 识破骗局结局
        {
            id: 'report_end',
            messages: [
                { type: 'self', content: '我已经举报并拉黑你了，这明显是诈骗' },
                { type: 'system', content: '恭喜你成功识破了骗局！' },
                { type: 'time', content: '反诈提示' },
                { type: 'system', content: '🚨 反诈提示：陌生网站交易存在高风险，特别是未知的非官方平台。正规游戏交易应通过游戏官方渠道或知名第三方平台进行。' },
                { type: 'system', content: '🔍 识别方法：可通过搜索引擎查询平台信息，看是否有投诉记录；查看网站是否有正规备案；注意不规范的网址后缀如.top等可能存在风险。' },
                { type: 'end', content: '结局：成功避免被骗' }
            ]
        },
        // 联系客服分支
        {
            id: 'contact_support',
            messages: [
                { type: 'self', content: '我去联系客服解决问题' },
                { type: 'time', content: '片刻后...' },
                { type: 'friend', content: '问清楚客服了吗？' },
                { type: 'self', content: '回了回了，但跟我说资金还没到账不能给激活码，还要辛苦你再等等了' },
                { type: 'friend', content: '好吧' },
                { type: 'self', content: '好了我第一时间告诉你，辛苦了' },
                { type: 'time', content: '一小时后...' },
                { type: 'friend', content: '好了没有啊？' },
                { type: 'self', content: '我问了问题，没带零头被冻结了，抱歉抱歉，我在努力' },
                { type: 'friend', content: '还要多久啊？' },
                { type: 'friend', content: '你说一下，看看我能不能帮你' },
                { type: 'self', content: '我很抱歉，但解冻要充钱，你能给我转 3000 吗' },
                { type: 'friend', content: '？' },
                { type: 'self', content: '真的很抱歉' },
                { type: 'friend', content: '我手上也没那么多啊，你还差多少' },
                { type: 'choices', options: [
                    { text: '我差2800元', next: 'first_payment' },
                    { text: '这看起来很可疑，我要报警', next: 'police_report' }
                ]}
            ]
        },
        // 问游戏好友分支
        {
            id: 'ask_friend',
            messages: [
                { type: 'self', content: '我先问问我游戏里的朋友，他玩这个游戏很久了' },
                { type: 'time', content: '与游戏好友聊天中...' },
                { type: 'system', content: '你的游戏好友告诉你这是典型的游戏账号交易诈骗，建议立即停止交易并报警' },
                { type: 'self', content: '我问了游戏里的朋友，他说这可能是诈骗，建议我不要继续了' },
                { type: 'friend', content: '不会吧，你朋友是不是没玩过这种平台？这很正常的，就是系统验证有点麻烦' },
                { type: 'friend', content: '我们都弄了这么久了，你现在放弃对我们都不好啊' },
                { type: 'choices', options: [
                    { text: '听朋友的去报警', next: 'friend_police' },
                    { text: '好吧，我自己解决', next: 'contact_support' }
                ]}
            ]
        },
        // 首次付款分支
        {
            id: 'first_payment',
            messages: [
                { type: 'self', content: '我差2800' },
                { type: 'self', content: '真的很抱歉抱歉' },
                { type: 'friend', content: '我手上也没有那么多' },
                { type: 'friend', content: '你问人家凑一下吧，我也帮你凑下' },
                { type: 'friend', content: '我刚刚买了号，手上还有 300' },
                { type: 'friend', content: '你跟人家说急用，等一下弄好了就还给人家就行' },
                { type: 'friend', content: '我这边也去帮你凑一下，一起把它处理，我这边也等着上号' },
                { type: 'self', content: '我试试' },
                { type: 'self', content: '真的很抱歉' },
                { type: 'friend', content: '你一定要说急用的 ，等下弄好了就还给人家' },
                { type: 'friend', content: '如果你说充游戏干嘛的人家怎么可能会借给你对吧' },
                { type: 'self', content: '嗯嗯' },
                { type: 'friend', content: '你看一下你那边凑到多少，我这边也去凑一下，一起赶赶把它弄好' },
                { type: 'friend', content: '真的是无语了' },
                { type: 'self', content: '我现在还有 2100' },
                { type: 'friend', content: '好的' },
                { type: 'friend', content: '【网站截图】' },
                { type: 'time', content: '几小时后...' },
                { type: 'self', content: '凑够 3000 了，我已经充钱解冻，正在申请提现' },
                { type: 'time', content: '片刻后...' },
                { type: 'self', content: '在吗？我那个身份证忘上传了又被冻结了' },
                { type: 'self', content: '还要充值 4000 带零头才能解冻' },
                { type: 'self', content: '我真的很抱歉' },
                { type: 'friend', content: '你怎么又被冻结了？这么大人了搞个东西都搞不好吗？' },
                { type: 'friend', content: '我现在也没有那么多钱呀？服了你了' },
                { type: 'friend', content: '先分开凑凑吧，真的无语了玩个游戏这么累，你也是神人了' },
                { type: 'self', content: '我也是服了我自己了' },
                { type: 'self', content: '真的真的很抱歉' },
                { type: 'friend', content: '行了赶紧的，烦死了' },
                { type: 'choices', options: [
                    { text: '我会想办法筹钱', next: 'second_payment' },
                    { text: '这看起来更可疑了，我要再查查', next: 'tech_investigation' }
                ]}
            ]
        },
        // 报警结局
        {
            id: 'police_report',
            messages: [
                { type: 'self', content: '我已经举报并拉黑你了，这明显是诈骗' },
                { type: 'system', content: '恭喜你成功识破了骗局！' },
                { type: 'time', content: '反诈提示' },
                { type: 'system', content: '🚨 反诈提示：当对方以系统故障、冻结为由要求额外付款时，极有可能是诈骗。' },
                { type: 'system', content: '✅ 正确做法：发现被骗时，应立即停止转账并保留证据，拨打110或国家反诈中心热线96110报警。' },
                { type: 'end', content: '结局：避免更大损失' }
            ]
        },
        // 根据朋友建议报警
        {
            id: 'friend_police',
            messages: [
                { type: 'self', content: '我决定听朋友的建议去报警，这看起来确实不对劲' },
                { type: 'friend', content: '你真的想多了，平台就是这样的啊，我朋友都是这么交易的' },
                { type: 'friend', content: '算了，你不想交易就算了，浪费我时间' },
                { type: 'system', content: '恭喜你做出了正确的选择！' },
                { type: 'time', content: '反诈提示' },
                { type: 'system', content: '🚨 反诈提示：游戏账号交易诈骗常见套路包括利用非官方平台、虚构交易冻结、要求额外付款解冻等。' },
                { type: 'system', content: '✅ 正确做法：遇到可疑情况时，及时咨询有经验的朋友或家人，发现被骗及时报警。' },
                { type: 'end', content: '结局：及时止损' }
            ]
        },
        // 技术调查分支
        {
            id: 'tech_investigation',
            messages: [
                { type: 'self', content: '我觉得这网站有问题，让我查一下这个网站的IP和信息' },
                { type: 'time', content: '调查中...' },
                { type: 'system', content: '你发现这个网站使用的是境外服务器，注册时间很短，没有正规备案信息' },
                { type: 'self', content: '我查了一下，这个网站是境外服务器，没有备案，很可能是诈骗网站' },
                { type: 'friend', content: '怎么可能？我朋友都是在这交易的啊' },
                { type: 'friend', content: '你是不是搜错了？' },
                { type: 'friend', content: '你再这样拖下去，号就彻底没了' },
                { type: 'choices', options: [
                    { text: '我已经报警了，不会再转钱了', next: 'tech_report' },
                    { text: '我收集了证据，准备举报', next: 'collect_evidence' }
                ]}
            ]
        },
        // 技术分支报警结局
        {
            id: 'tech_report',
            messages: [
                { type: 'self', content: '我已经联系了网安部门，你的信息已经被记录了' },
                { type: 'friend', content: '你在说什么啊？我只是正常交易啊' },
                { type: 'friend', content: '我也是上当受骗的，平台跑路了' },
                { type: 'system', content: '骗子开始改变策略，企图摆脱责任' },
                { type: 'self', content: '不用装了，你的账号IP已经被锁定，警方会调查的' },
                { type: 'friend', content: '【对方已将您拉黑】' },
                { type: 'system', content: '恭喜你成功识破了骗局！' },
                { type: 'time', content: '反诈提示' },
                { type: 'system', content: '🚨 反诈提示：通过技术手段验证平台真实性是防范诈骗的有效方法。可查询网站备案信息、服务器归属地等信息。' },
                { type: 'system', content: '✅ 正确做法：发现诈骗网站时，应保留证据并向网安部门举报，帮助更多人避免被骗。' },
                { type: 'end', content: '结局：放弃追讨但避免更大损失' }
            ]
        },
        // 收集证据结局
        {
            id: 'collect_evidence',
            messages: [
                { type: 'self', content: '我已经收集了所有证据，包括聊天记录、转账记录和网站信息' },
                { type: 'self', content: '我会把这些信息提交给警方，协助他们破案' },
                { type: 'friend', content: '你在说什么啊？我也是受害者啊' },
                { type: 'friend', content: '平台跑路了，我损失比你还大' },
                { type: 'system', content: '骗子开始改变策略，企图摆脱责任' },
                { type: 'self', content: '警方会调查的，你再狡辩也没用' },
                { type: 'friend', content: '【对方无法接收您的消息】' },
                { type: 'system', content: '你提交的证据成功协助警方追踪到了一个诈骗团伙！' },
                { type: 'time', content: '反诈提示' },
                { type: 'system', content: '🚨 反诈提示：收集和保存与诈骗相关的所有证据非常重要，包括聊天记录、转账凭证、网站截图等。' },
                { type: 'system', content: '✅ 正确做法：将完整证据提交给警方，有助于案件侦破和挽回损失。' },
                { type: 'end', content: '结局：线索移交警方' }
            ]
        },
        // 二次付款分支
        {
            id: 'second_payment',
            messages: [
                { type: 'self', content: '客服提示我要在两个小时内完成，你凑到多少了' },
                { type: 'friend', content: '你那边多少了我这边只有 800' },
                { type: 'self', content: '300...' },
                { type: 'friend', content: '唉，赶紧打电话问吧' },
                { type: 'friend', content: '我这边也在打' },
                { type: 'self', content: '其实我目前上大一，家里供学费已经尽力了' },
                { type: 'self', content: '我努力' },
                { type: 'self', content: '但估计只能靠你了' },
                { type: 'self', content: '真的非常非常抱歉' },
                { type: 'friend', content: '那你那边凑 1000 吧，剩下的我想办法，行吧？' },
                { type: 'self', content: '我努力凑 1000，不过拜托你尽量凑个四千吧' },
                { type: 'choices', options: [
                    { text: '我就不借钱了，坦白告诉父母', next: 'family_help' },
                    { text: '我再向同学借钱', next: 'final_payment' }
                ]}
            ]
        },
        // 家人帮助分支
        {
            id: 'family_help',
            messages: [
                { type: 'self', content: '我决定不再借钱了，刚刚我把情况告诉了我父母' },
                { type: 'friend', content: '你疯了吗？现在告诉家长就全完了！' },
                { type: 'friend', content: '我们差一点就能拿回所有钱了！' },
                { type: 'self', content: '我父母说这是典型的游戏诈骗，他们已经报警并冻结了我的账户' },
                { type: 'friend', content: '你真是个白痴！现在所有钱都打水漂了！' },
                { type: 'system', content: '父母帮助你联系了银行，冻结了部分转账' },
                { type: 'time', content: '反诈提示' },
                { type: 'system', content: '🚨 反诈提示：遇到可疑情况时，及时告知父母或监护人是最明智的选择。' },
                { type: 'system', content: '✅ 正确做法：被骗后72小时内报警并联系银行，有可能追回部分资金。' },
                { type: 'end', content: '结局：在家人帮助下挽回部分损失' }
            ]
        }
    ];
    
    // 快进按钮事件
    fastForwardBtn.addEventListener('click', function() {
        isFastForward = !isFastForward;
        
        if (isFastForward) {
            messageDelay = 300; // 快进模式
            fastForwardBtn.innerHTML = '<i class="fas fa-pause"></i>'; // 更改图标为暂停
            fastForwardBtn.title = "恢复正常速度";
        } else {
            messageDelay = 2500; // 正常模式
            fastForwardBtn.innerHTML = '<i class="fas fa-forward"></i>'; // 恢复图标
            fastForwardBtn.title = "快进对话";
        }
        
        // 如果当前没有播放消息，则继续播放
        if (!isPlaying && currentMessageIndex < getCurrentSceneData().messages.length) {
            playNextMessage();
        }
    });
    
    // 历史按钮事件
    historyBtn.addEventListener('click', function() {
        historyPanel.classList.add('active');
        updateHistoryList();
    });
    
    // 关闭历史面板
    closeHistory.addEventListener('click', function() {
        historyPanel.classList.remove('active');
    });
    
    // 更新历史选择列表
    function updateHistoryList() {
        historyList.innerHTML = '';
        
        if (historyChoices.length === 0) {
            const noHistory = document.createElement('div');
            noHistory.className = 'history-item locked';
            noHistory.textContent = '暂无历史选择点';
            historyList.appendChild(noHistory);
            return;
        }
        
        historyChoices.forEach((choice, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = `选择点 ${index + 1}: ${choice.choiceText}`;
            
            // 为每个历史选择添加点击事件
            historyItem.addEventListener('click', function() {
                // 回到该选择点
                goBackToChoice(index);
                // 关闭历史面板
                historyPanel.classList.remove('active');
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    // 回到指定的选择点
    function goBackToChoice(index) {
        if (index >= 0 && index < historyChoices.length) {
            const choice = historyChoices[index];
            
            // 清空聊天记录
            clearChat();
            
            // 重置当前场景和消息索引
            currentScene = choice.sceneId;
            currentMessageIndex = 0;
            
            // 截断历史记录到当前选择点
            historyChoices = historyChoices.slice(0, index);
            
            // 重新播放场景
            playScene(currentScene);
        }
    }
    
    // 初始化游戏
    function initGame() {
        // 重置变量
        currentScene = 'start';
        currentMessageIndex = 0;
        isPlaying = false;
        historyChoices = [];
        visitedScenes = new Set();
        
        // 清空聊天记录
        clearChat();
        
        // 开始游戏
        startGame();
    }
    
    // 播放消息声音
    function playMessageSound(type = 'friend') {
        if (!audioEnabled) return;
        
        try {
            if (type === 'friend' && receiveSound) {
                receiveSound.currentTime = 0;
                receiveSound.play().catch(e => {
                    console.log("播放接收声音失败:", e);
                    audioEnabled = false;
                });
            } else if (type === 'self' && sendSound) {
                sendSound.currentTime = 0;
                sendSound.play().catch(e => {
                    console.log("播放发送声音失败:", e);
                    audioEnabled = false;
                });
            }
        } catch (e) {
            console.log("播放声音时出错:", e);
            audioEnabled = false;
        }
    }
    
    // 开始游戏
    function startGame() {
        // 播放初始场景
        playScene('start');
    }
    
    // 获取当前场景数据
    function getCurrentSceneData() {
        return dialogData.find(scene => scene.id === currentScene);
    }
    
    // 播放场景
    function playScene(sceneId) {
        // 记录已访问的场景
        visitedScenes.add(sceneId);
        
        // 设置当前场景
        currentScene = sceneId;
        currentMessageIndex = 0;
        
        // 开始播放消息
        playNextMessage();
    }
    
    // 播放下一条消息
    function playNextMessage() {
        const sceneData = getCurrentSceneData();
        
        if (!sceneData) {
            console.error("找不到场景:", currentScene);
            return;
        }
        
        if (currentMessageIndex < sceneData.messages.length) {
            isPlaying = true;
            const message = sceneData.messages[currentMessageIndex];
            
            switch (message.type) {
                case 'friend':
                    addFriendMessage(message.content);
                    playMessageSound('friend');
                    break;
                case 'self':
                    addSelfMessage(message.content);
                    playMessageSound('self');
                    break;
                case 'time':
                    addTimeMessage(message.content);
                    break;
                case 'system':
                    addSystemMessage(message.content);
                    break;
                case 'choices':
                    showChoices(message.options);
                    isPlaying = false;
                    return;
                case 'end':
                    addSystemMessage(message.content);
                    isPlaying = false;
                    return;
            }
            
            currentMessageIndex++;
            
            // 设置下一条消息的延迟
            setTimeout(() => {
                playNextMessage();
            }, messageDelay);
        } else {
            isPlaying = false;
        }
    }
    
    // 添加好友消息
    function addFriendMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message friend';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        
        const avatarImg = document.createElement('img');
        // 使用骗子头像
        avatarImg.src = '/public/images/16pic_6886490_b.jpg';
        avatarImg.alt = '好友头像';
        avatarImg.style.width = '100%';
        avatarImg.style.height = '100%';
        avatarImg.style.objectFit = 'cover';
        
        avatarDiv.appendChild(avatarImg);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        
        // 检查是否是图片消息
        if (text in imageMap) {
            const img = document.createElement('img');
            img.src = imageMap[text];
            img.alt = text;
            img.style.maxWidth = '100%';
            contentDiv.appendChild(img);
            contentDiv.classList.add('image-content');
        } else {
            contentDiv.textContent = text;
        }
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // 添加自己的消息
    function addSelfMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message self';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        
        const avatarImg = document.createElement('img');
        // 使用受害者头像
        avatarImg.src = '/public/images/b84988dbac52f581a79bd9c44e31faa.jpg';
        avatarImg.alt = '我的头像';
        avatarImg.style.width = '100%';
        avatarImg.style.height = '100%';
        avatarImg.style.objectFit = 'cover';
        
        avatarDiv.appendChild(avatarImg);
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';
        
        // 检查是否是图片消息
        if (text in imageMap) {
            const img = document.createElement('img');
            img.src = imageMap[text];
            img.alt = text;
            img.style.maxWidth = '100%';
            contentDiv.appendChild(img);
            contentDiv.classList.add('image-content');
        } else {
            contentDiv.textContent = text;
        }
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(avatarDiv);
        
        chatContainer.appendChild(messageDiv);
        scrollToBottom();
    }
    
    // 添加时间消息
    function addTimeMessage(text) {
        const timeDiv = document.createElement('div');
        timeDiv.className = 'chat-time';
        timeDiv.textContent = text;
        
        chatContainer.appendChild(timeDiv);
        scrollToBottom();
    }
    
    // 添加系统消息
    function addSystemMessage(text) {
        const systemDiv = document.createElement('div');
        systemDiv.className = 'system-message';
        systemDiv.textContent = text;
        
        chatContainer.appendChild(systemDiv);
        scrollToBottom();
    }
    
    // 显示选择按钮
    function showChoices(options) {
        choiceContainer.innerHTML = '';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'choice-btn';
            button.textContent = option.text;
            
            button.addEventListener('click', function() {
                // 记录选择历史
                historyChoices.push({
                    sceneId: currentScene,
                    choiceText: option.text,
                    nextScene: option.next
                });
                
                // 隐藏选择按钮
                hideChoices();
                
                // 延迟后切换到下一个场景
                setTimeout(() => {
                    playScene(option.next);
                }, 500);
            });
            
            choiceContainer.appendChild(button);
        });
    }
    
    // 隐藏选择按钮
    function hideChoices() {
        choiceContainer.innerHTML = '';
    }
    
    // 清空聊天记录
    function clearChat() {
        chatContainer.innerHTML = '';
        hideChoices();
    }
    
    // 滚动到底部
    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    
    // 更新时间显示
    function updateTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        document.querySelector('.status-time').textContent = `${hours}:${minutes}`;
    }
}); 