import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Brush, ReferenceLine } from 'recharts';
import { Clock, ArrowLeft, ArrowRight, CheckCircle, Activity, Brain, Shield, Download, BookOpen, Heart, Zap, Lock, DollarSign, MessageCircle } from 'lucide-react';

// --- 工具函数：Fisher-Yates 随机洗牌算法 ---
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- 深度分析文案库 (已更新为朋友般的语气) ---
const analysisContent = {
  types: {
    secure: {
      mechanism: "你的内心住着一个稳稳的小太阳。这源于你潜意识里相信“我是值得被爱的”以及“别人是靠得住的”。在关系里，你就像一个温暖的港湾，既能享受亲密，也能从容独处。",
      strengths: ["情绪稳定的“定海神针”", "遇到分歧倾向于双赢，而不是争输赢", "不仅能表达需求，也能敏锐感知伴侣的情绪"],
      advice: "稳稳的幸福说的就是你呀！\n\n这种“我很值得，你也很好”的心态，是你给自己最好的礼物。在关系里，你就像一个稳稳的锚点，能包容也能独立。\n\n给你的小建议：\n继续做那个发光的人吧！如果你的伴侣比较敏感或回避，你稳定的爱就是最好的治愈良药。不过也要记得，爱别人之前，先保护好那个温暖的自己，不要为了维持和谐而一味忍让哦。"
    },
    anxious: {
      mechanism: "你的依恋雷达开得有点大，对他人的情绪变化超级敏感。这其实不是你的错，可能内心深处有个声音在说：“如果不抓紧，爱就会溜走。”所以你会本能地想要确认和连接。",
      strengths: ["拥有极高的共情能力，非常懂别人的感受", "对感情超级投入和忠诚", "愿意为了关系付出巨大的努力"],
      advice: "抱抱你。我知道那种心总是悬着的感觉，好像如果不紧紧抓着，爱就会消失。\n\n其实你不是“太作”或“太粘人”，你只是太在乎连接了。你的雷达太灵敏，有时候会把一点点风吹草动都放大成暴风雨。\n\n给你的小建议：\n1. 下次焦虑感来袭狂发消息时，试着把手机放下 5 分钟，像哄好朋友一样哄哄自己：“嘿，没事的，我在呢。”\n2. 试着把注意力从“ta 爱不爱我”转回到“我今天开不开心”上。\n3. 请相信，你本身就值得被爱，不需要靠“抓紧”来证明。"
    },
    dismissive: {
      mechanism: "你习惯了穿上一层厚厚的铠甲。潜意识里你可能觉得“靠谁都不如靠自己”，依赖别人让你觉得不安全，甚至有点“麻烦”。这种冷淡其实是你保护自己不受伤害的方式。",
      strengths: ["极强的独立解决问题能力", "情绪波动小，危急时刻特别冷静", "非常尊重彼此的边界"],
      advice: "其实我知道，你并不是真的冷漠，你只是太习惯一个人扛下所有了。\n\n从小到大，你可能觉得“只有靠自己才最安全”，依赖别人让你觉得失控，甚至有点软弱，对吗？所以你穿上了厚厚的铠甲。\n\n给你的小建议：\n1. 试着把铠甲打开一条小缝隙看看？比如，下次累的时候，试着跟伴侣说一句“我今天有点累，求安慰”，而不是躲进房间。\n2. 告诉自己，“依赖”和“独立”并不冲突。适度地依靠一下别人，并不会让你失去自我，反而会让关系更轻松、更真实。"
    },
    fearful: {
      mechanism: "你的内心像是在坐过山车，一边渴望靠近温暖，一边又害怕被烫伤。这通常是因为过去受过伤，让你既想爱又不敢爱。这种忽冷忽热的拉扯，其实是你保护自己的本能。",
      strengths: ["对危险有极高的直觉", "拥有深刻的内省能力", "一旦建立信任，将展现出极具深度的情感"],
      advice: "这种感觉一定很拉扯吧？一边渴望被紧紧拥抱，一边又在对方靠近时本能地想要逃跑。\n\n你就像一只受过伤的小刺猬，想取暖又怕被扎，更怕扎到别人。这种忽冷忽热不是你的错，是过去的伤痛在保护现在的你。\n\n给你的小建议：\n1. 对自己多一点耐心。当想逃跑的时候，告诉自己“我现在感到害怕，这是正常的”，先别急着推开对方。\n2. 试着跟值得信任的人建立一点点“安全的小连接”，慢慢来，不着急。\n3. 如果觉得太辛苦，寻求专业的心理咨询也是一个非常勇敢的选择。"
    }
  },
  categories: {
    "情感亲密与脆弱性表达": { icon: Heart, desc: "涉及面对脆弱、表达爱意及身体接触时的反应。" },
    "冲突应对与沟通模式": { icon: MessageCircle, desc: "涉及争吵、冷战、道歉及意见分歧时的处理机制。" },
    "分离、独立与个人空间": { icon: Lock, desc: "涉及独处、异地、边界感及个人爱好管理。" },
    "压力情境与支持寻求": { icon: Zap, desc: "涉及失业、生病、突发危机时的互相支持模式。" },
    "信任、嫉妒与数字社交行为": { icon: Shield, desc: "涉及社交媒体互动、查岗、嫉妒心及隐私边界。" },
    "财务管理与资源共享": { icon: DollarSign, desc: "涉及金钱观、消费决策、借贷及共同财产规划。" }
  }
};

// --- 数据定义 (语气已弱化、生活化) ---
const rawQuestions = [
  // 1-9: 情感亲密
  { id: 1, category: "情感亲密与脆弱性表达", text: "这是一个普通的周二，伴侣突然送了你一份精心挑选且昂贵的礼物。ta满怀期待地看着你。", options: [{ label: "A", text: "我感到很温暖，开心地接受这份心意，觉得这是我们关系好的证明。", type: "A" }, { label: "B", text: "我有点不安，担心自己是不是也得马上回送一个同等价值的，怕配不上这份好意。", type: "B" }, { label: "C", text: "我感到有些压力，觉得“无功不受禄”，担心这背后是不是有什么要求。", type: "C" }, { label: "D", text: "我心情很复杂，既想收下，又怕欠了人情以后被控制，甚至想推脱掉。", type: "D" }] },
  { id: 2, category: "情感亲密与脆弱性表达", text: "深夜，伴侣向你吐露了一个ta童年时期从未告诉过别人的难过经历，并流下了眼泪。", options: [{ label: "A", text: "我握着ta的手，静静倾听，感觉我们的心更近了。", type: "A" }, { label: "B", text: "我情绪很激动，跟着一起难过，甚至忍不住分享自己更惨的经历来安慰ta。", type: "B" }, { label: "C", text: "我感到有点不知所措，不太习惯这种场面，想给点理性的建议帮ta走出来。", type: "C" }, { label: "D", text: "我感到有些害怕或抗拒，这种极度的脆弱让我本能地想逃离或转移话题。", type: "D" }] },
  { id: 3, category: "情感亲密与脆弱性表达", text: "周末早晨，你正准备起床做事，伴侣却从背后抱住你，希望能再赖床拥抱一会儿。", options: [{ label: "A", text: "我享受这片刻的温馨，回应拥抱，然后再商量起床的时间。", type: "A" }, { label: "B", text: "我求之不得，紧紧抱住对方，觉得这种时刻最能让我感到被爱，完全不想动。", type: "B" }, { label: "C", text: "我身体有点僵硬，觉得被束缚了，心里想着计划表，会找借口先起来。", type: "C" }, { label: "D", text: "我一开始接受，但很快觉得有点不自在，担心这种亲密太粘腻，或者突然想推开。", type: "D" }] },
  { id: 4, category: "情感亲密与脆弱性表达", text: "在朋友聚会上，伴侣突然当众亲了一下你的脸颊，并夸你是最好的人。", options: [{ label: "A", text: "我挺开心的，自然地接受并笑一笑，不觉得尴尬。", type: "A" }, { label: "B", text: "我特别激动，忍不住看周围人的反应，觉得这证明了ta很在乎我。", type: "B" }, { label: "C", text: "我感到有点尴尬，觉得这种私密的事没必要在大家面前做，甚至想躲开。", type: "C" }, { label: "D", text: "我浑身不自在，怀疑ta是不是做了什么亏心事才这样讨好，或者担心别人在看笑话。", type: "D" }] },
  { id: 5, category: "情感亲密与脆弱性表达", text: "交往一段时间后，伴侣第一次认真地看着你的眼睛说“我爱你”。", options: [{ label: "A", text: "如果我也有感觉，我会真诚回应；如果还没到，我会诚实表达，不觉得有压力。", type: "A" }, { label: "B", text: "我马上回应“我也爱你”，心里狂喜，但也隐隐担心这份爱能持续多久。", type: "B" }, { label: "C", text: "我感到有点想回避，或者开个玩笑岔过去，觉得这句话像个沉重的承诺。", type: "C" }, { label: "D", text: "我心里一沉，既渴望这句话，又本能地害怕一旦建立了这种契约，未来可能会受伤害。", type: "D" }] },
  { id: 6, category: "情感亲密与脆弱性表达", text: "亲密行为结束后，伴侣想要和你多聊会儿天，温存一下。", options: [{ label: "A", text: "我很享受这种放松的时刻，觉得这增加了感情。", type: "A" }, { label: "B", text: "我希望能一直抱着不松手，一旦分开就会觉得有点失落或被冷落。", type: "B" }, { label: "C", text: "我觉得需要一点个人空间，想去洗澡或看会儿手机，不太习惯粘在一起。", type: "C" }, { label: "D", text: "我有时想温存，有时又突然觉得想独处，对身体接触感到矛盾。", type: "D" }] },
  { id: 7, category: "情感亲密与脆弱性表达", text: "伴侣总是把你理想化，说你是完美的，虽然你知道自己有很多缺点。", options: [{ label: "A", text: "我感谢ta的欣赏，但也会幽默地提醒ta我并不完美，希望关系真实一点。", type: "A" }, { label: "B", text: "我听了很高兴，但也担心万一哪天打破了这个形象，ta就不爱我了。", type: "B" }, { label: "C", text: "我觉得ta有点不切实际，或者觉得ta根本不了解真实的我。", type: "C" }, { label: "D", text: "我觉得我不配得到这种评价，感到压力很大，怕ta发现真相后会失望离开。", type: "D" }] },
  { id: 8, category: "情感亲密与脆弱性表达", text: "伴侣好奇地问起你过去的一段感情经历。", options: [{ label: "A", text: "我会选择性但诚实地分享，认为这有助于相互了解。", type: "A" }, { label: "B", text: "我会忍不住说很多细节，甚至抱怨前任，希望ta能多理解我、心疼我。", type: "B" }, { label: "C", text: "我会轻描淡写地说“没什么好说的”，认为过去的事与现在无关，不想多谈。", type: "C" }, { label: "D", text: "我会有点紧张，不敢说实话或含糊其辞，怕ta介意或嫌弃我的过去。", type: "D" }] },
  { id: 9, category: "情感亲密与脆弱性表达", text: "你感觉最近被伴侣忽略了，你想表达这种感受。", options: [{ label: "A", text: "我找个时间平静地说：“最近我们互动有点少，我有点想你了。”", type: "A" }, { label: "B", text: "我忍了很久，最后可能因为一件小事忍不住抱怨：“你是不是不在乎我了？”", type: "B" }, { label: "C", text: "我什么都不说，告诉自己“无所谓”，并开始对ta也冷淡一点。", type: "C" }, { label: "D", text: "我想说但不敢说，最后可能用有点讽刺的语气说反话，希望ta能猜到。", type: "D" }] },
  // 10-19: 冲突应对
  { id: 10, category: "冲突应对与沟通模式", text: "你给伴侣发了消息显示已读，但过了三个小时ta还没回，且你看到ta给别人朋友圈点了赞。", options: [{ label: "A", text: "虽然有点不高兴，但想ta可能在忙或忘了，晚点再问问。", type: "A" }, { label: "B", text: "我感到很焦虑，忍不住胡思乱想，可能会再发消息问“你怎么不回我？”。", type: "B" }, { label: "C", text: "没放在心上，正好我也有自己的事做。如果不回就算了，懒得追问。", type: "C" }, { label: "D", text: "我觉得被忽视了，很生气，决定接下来也不理ta，让ta也尝尝这滋味。", type: "D" }] },
  { id: 11, category: "冲突应对与沟通模式", text: "吵架时，伴侣突然说：“我现在没法沟通，想一个人静一静。”然后进房间关了门。", options: [{ label: "A", text: "虽然想解决问题，但我尊重ta的需求，等大家都冷静了再谈。", type: "A" }, { label: "B", text: "我很慌，忍不住去敲门或发消息，想现在就把话说清楚，不然心里难受。", type: "B" }, { label: "C", text: "我觉得正好，我也懒得吵，大家各过各的，互不干扰更好。", type: "C" }, { label: "D", text: "我在门外很纠结，一会想冲进去理论，一会又觉得自己是不是太过分了。", type: "D" }] },
  { id: 12, category: "冲突应对与沟通模式", text: "伴侣指出你最近做家务不太用心，语气稍微有点重。", options: [{ label: "A", text: "我承认最近确实有点懈怠，解释一下原因，以后注意。", type: "A" }, { label: "B", text: "我感到很委屈，觉得ta是不是嫌弃我了，忍不住哭诉自己平时的付出。", type: "B" }, { label: "C", text: "我不爽地看着ta，心里想“你也没好到哪去”，然后不理ta走开。", type: "C" }, { label: "D", text: "我立刻反击，翻出ta以前的错事来回怼，不想让自己处于下风。", type: "D" }] },
  { id: 13, category: "冲突应对与沟通模式", text: "你们在讨论未来定居城市时产生了分歧，伴侣态度很强硬。", options: [{ label: "A", text: "我尝试理解ta的理由，但也坚定表达我的想法，寻找折中方案。", type: "A" }, { label: "B", text: "我可能会妥协，心想“只要能在一起就行”，虽然心里挺委屈的。", type: "B" }, { label: "C", text: "觉得没法沟通，直接说“以后再说吧”，心里开始盘算如果不行的退路。", type: "C" }, { label: "D", text: "我情绪比较激动，指责ta自私，甚至气头上会说“那不如分手”。", type: "D" }] },
  { id: 14, category: "冲突应对与沟通模式", text: "冷战两天后，其实你已经消气了，想和好。", options: [{ label: "A", text: "我会主动找个台阶，比如分享个有趣的东西，试着恢复联系。", type: "A" }, { label: "B", text: "我一直盯着手机，发些伤感的朋友圈，等着ta来找我，不找我就很焦虑。", type: "B" }, { label: "C", text: "我不想主动低头，如果ta不道歉，我就继续冷着，觉得一个人也挺好。", type: "C" }, { label: "D", text: "我想找ta又怕被拒绝，写了消息又删掉，内心很纠结。", type: "D" }] },
  { id: 15, category: "冲突应对与沟通模式", text: "伴侣工作不顺，回家后心情不好，对你说话语气很冲。", options: [{ label: "A", text: "我知道这不是针对我，会跟ta说：“理解你心情不好，但别对我发火”，给ta点空间。", type: "A" }, { label: "B", text: "我马上担心是不是我做错了什么，小心翼翼地想讨好ta。", type: "B" }, { label: "C", text: "我觉得这人乱发脾气，懒得理ta，直接无视或躲开。", type: "C" }, { label: "D", text: "ta的怒气让我感到害怕或愤怒，我可能会比ta更激动，或者整个人僵住。", type: "D" }] },
  { id: 16, category: "冲突应对与沟通模式", text: "伴侣严肃地说：“我们需要谈谈我们之间的问题。”", options: [{ label: "A", text: "虽然有点紧张，但我愿意听听ta的想法，希望能解决问题。", type: "A" }, { label: "B", text: "我心里一沉，第一反应是“完了，ta是不是要分手”，特别慌。", type: "B" }, { label: "C", text: "我第一反应是“又来了，真麻烦”，想找借口避开这个话题。", type: "C" }, { label: "D", text: "我预感到要出事，甚至想先发制人提分手，免得被甩。", type: "D" }] },
  { id: 17, category: "冲突应对与沟通模式", text: "你确实做错事伤害了伴侣，需要道歉。", options: [{ label: "A", text: "我真诚地看着ta说对不起，承认错误，并想办法弥补。", type: "A" }, { label: "B", text: "我哭着道歉，不断责怪自己“真没用”，直到ta反过来安慰我。", type: "B" }, { label: "C", text: "我轻描淡写地说句“行了吧”，或者买个礼物代替，不太想说“对不起”三个字。", type: "C" }, { label: "D", text: "道歉后如果ta没马上原谅，我会变得很烦躁，觉得“我都道歉了你还想怎样”。", type: "D" }] },
  { id: 18, category: "冲突应对与沟通模式", text: "晚餐时，伴侣异常沉默，对你的话题反应冷淡。", options: [{ label: "A", text: "我问问ta是不是累了，如果ta不想说，就安静吃完，不觉得是针对我。", type: "A" }, { label: "B", text: "我心里开始慌，反复想是不是自己说错话了，不停追问“你怎么了”。", type: "B" }, { label: "C", text: "我觉得这样挺好，乐得清静，拿出手机自己玩自己的。", type: "C" }, { label: "D", text: "我既担心ta是不是想离开我，又对这种冷暴力感到生气，可能会弄出点动静引ta注意。", type: "D" }] },
  { id: 19, category: "冲突应对与沟通模式", text: "朋友聚会时，伴侣当众反驳了你的观点，让你有点下不来台。", options: [{ label: "A", text: "我暂时不争辩，用幽默化解尴尬，回家后再跟ta讨论这件事。", type: "A" }, { label: "B", text: "我觉得很丢脸，很难过，觉得ta在朋友面前不给我面子是不爱我。", type: "B" }, { label: "C", text: "我冷笑一声，用更犀利的话回击，或者干脆离席。", type: "C" }, { label: "D", text: "我当时愣住了，不知道怎么办，事后心里会对ta有怨气。", type: "D" }] },
  // 20-29: 分离与独立
  { id: 20, category: "分离、独立与个人空间", text: "伴侣提出想一个人去旅行一周，放松心情，不带你。", options: [{ label: "A", text: "表示理解，虽然会想念，但觉得每个人都需要独处时间。", type: "A" }, { label: "B", text: "感到很失落，问ta“为什么不想跟我一起？”，如果不带我我会很难过。", type: "B" }, { label: "C", text: "觉得挺好，我也正好享受一下自由时光，不用照顾人。", type: "C" }, { label: "D", text: "怀疑ta是不是去见别人，或者觉得这是ta想疏远我的借口。", type: "D" }] },
  { id: 21, category: "分离、独立与个人空间", text: "伴侣出差，因为太忙今天只发了一条简短的信息。", options: [{ label: "A", text: "理解工作忙，回复让ta注意休息，并不介意。", type: "A" }, { label: "B", text: "觉得ta在敷衍，整晚盯着手机看ta在不在线，心里不踏实。", type: "B" }, { label: "C", text: "甚至没注意ta只发了一条，正好我也不想聊太久。", type: "C" }, { label: "D", text: "故意不回ta这条信息，想让ta也体验一下被冷落的感觉。", type: "D" }] },
  { id: 22, category: "分离、独立与个人空间", text: "周末你想和ta一起过，但ta想和朋友去打球。", options: [{ label: "A", text: "没问题，我也找我的朋友聚聚，晚上再一起。", type: "A" }, { label: "B", text: "感到挺失落的，觉得朋友比我重要，可能会闹点小情绪。", type: "B" }, { label: "C", text: "松了一口气，不用履行“陪伴义务”了，自己待着挺爽。", type: "C" }, { label: "D", text: "会有点嫉妒ta的朋友，甚至想装病或找个理由让ta留下来。", type: "D" }] },
  { id: 23, category: "分离、独立与个人空间", text: "关系稳定了，到了讨论同居的时候。", options: [{ label: "A", text: "感到兴奋，期待一起生活，但也准备好磨合生活习惯。", type: "A" }, { label: "B", text: "很期待，觉得终于可以天天在一起，更有安全感了。", type: "B" }, { label: "C", text: "感到有点压力，担心失去个人空间，可能会找理由拖延一下。", type: "C" }, { label: "D", text: "既想天天在一起，又怕看到缺点会幻灭，心情很矛盾。", type: "D" }] },
  { id: 24, category: "分离、独立与个人空间", text: "伴侣沉迷于一项新爱好（如摄影），花了大量时间。", options: [{ label: "A", text: "为ta找到热情而高兴，鼓励ta分享作品。", type: "A" }, { label: "B", text: "有点嫉妒那个爱好，觉得占用ta太多时间了，感觉被冷落。", type: "B" }, { label: "C", text: "挺好的，这样ta就不在粘着我了，我也有自己的时间。", type: "C" }, { label: "D", text: "觉得ta是不是在用爱好逃避我们的关系问题。", type: "D" }] },
  { id: 25, category: "分离、独立与个人空间", text: "你独立完成了一件很有挑战性的事，没让伴侣帮忙。", options: [{ label: "A", text: "自豪地跟ta分享成果，享受ta的赞赏。", type: "A" }, { label: "B", text: "有点遗憾ta没参与，觉得如果是一起完成的会更甜。", type: "B" }, { label: "C", text: "觉得很爽，证明了我不需要依赖任何人，自己挺行。", type: "C" }, { label: "D", text: "担心我表现得太强了，会让ta觉得自己没用，从而疏远我。", type: "D" }] },
  { id: 26, category: "分离、独立与个人空间", text: "为了睡眠质量，伴侣提议偶尔分房或分床睡。", options: [{ label: "A", text: "如果能睡得更好，我愿意尝试，不代表感情不好。", type: "A" }, { label: "B", text: "坚决反对，觉得这是分手的征兆，不抱着睡不踏实。", type: "B" }, { label: "C", text: "立刻同意，其实我早想这么提了，自己睡舒服多了。", type: "C" }, { label: "D", text: "觉得ta是不是嫌弃我，或者为了方便偷偷玩手机。", type: "D" }] },
  { id: 27, category: "分离、独立与个人空间", text: "伴侣最近变得特别粘人，总是想和你在一起。", options: [{ label: "A", text: "询问ta是不是压力大，给ta支持的同时也保留点自己的空间。", type: "A" }, { label: "B", text: "虽然嘴上嫌烦，心里其实很享受被需要的感觉。", type: "B" }, { label: "C", text: "感到有点窒息，可能会故意晚回家，逼ta退后一点。", type: "C" }, { label: "D", text: "一会觉得高兴，一会又觉得烦，对ta忽冷忽热。", type: "D" }] },
  { id: 28, category: "分离、独立与个人空间", text: "因为工作，你们必须面临一年的异地。", options: [{ label: "A", text: "制定详细的沟通计划，相信关系能经受住考验。", type: "A" }, { label: "B", text: "觉得天塌了，特别焦虑，甚至想辞职跟ta走。", type: "B" }, { label: "C", text: "觉得距离产生美，反而对关系更有信心，也更自由。", type: "C" }, { label: "D", text: "情绪波动很大，一会说等ta，一会又怕ta变心想分手。", type: "D" }] },
  { id: 29, category: "分离、独立与个人空间", text: "伴侣带你去参加全是ta陌生朋友的聚会。", options: [{ label: "A", text: "欣然前往，希望能认识ta的朋友圈。", type: "A" }, { label: "B", text: "很紧张，全程粘着ta，如果ta离开我去和别人说话，我会不高兴。", type: "B" }, { label: "C", text: "不想去，不喜欢这种无意义的社交，觉得很累。", type: "C" }, { label: "D", text: "去了觉得格格不入，总觉得别人在评判我。", type: "D" }] },
  // 30-39: 压力与支持
  { id: 30, category: "压力情境与支持寻求", text: "你突然失业了，感到非常迷茫。", options: [{ label: "A", text: "告诉伴侣我的感受，听听建议，相信能共度难关。", type: "A" }, { label: "B", text: "觉得自己是累赘，怕如果不赶紧找到工作ta会嫌弃我。", type: "B" }, { label: "C", text: "不想告诉ta，假装上班自己偷偷找，不想被怜悯。", type: "C" }, { label: "D", text: "很崩溃，可能会在家里摆烂，怪ta不够支持我。", type: "D" }] },
  { id: 31, category: "压力情境与支持寻求", text: "伴侣重感冒，躺在床上很虚弱。", options: [{ label: "A", text: "给ta买药做饭，细心照顾，不时去看看。", type: "A" }, { label: "B", text: "很紧张，过度照顾，不停问ta感觉怎么样，怕出事。", type: "B" }, { label: "C", text: "把药水放床头就走开了，让ta自己睡一觉，不太会照顾人。", type: "C" }, { label: "D", text: "照顾ta，但态度有点不耐烦，抱怨ta怎么不小心。", type: "D" }] },
  { id: 32, category: "压力情境与支持寻求", text: "你项目失败了，心情低落，伴侣试图安慰你。", options: [{ label: "A", text: "接受拥抱，在ta安慰下感觉好受些。", type: "A" }, { label: "B", text: "觉得ta安慰得不够，无论怎么做都觉得ta不懂我的苦。", type: "B" }, { label: "C", text: "推开ta说“我没事，想静静”，想自己消化。", type: "C" }, { label: "D", text: "忍不住冲ta发火，把气撒在ta身上。", type: "D" }] },
  { id: 33, category: "压力情境与支持寻求", text: "伴侣投资失败，欠了点债。", options: [{ label: "A", text: "虽然生气，但一起坐下来算账，制定还款计划。", type: "A" }, { label: "B", text: "非常恐慌，觉得安全感没了，不停指责ta，甚至想分手。", type: "B" }, { label: "C", text: "会帮忙，但会划清界限，“这是你的错，你自己解决”。", type: "C" }, { label: "D", text: "感到绝望，觉得这验证了“谁都靠不住”的想法。", type: "D" }] },
  { id: 34, category: "压力情境与支持寻求", text: "旅行时迷路了，天黑了还没找到酒店，又累又饿。", options: [{ label: "A", text: "互相安抚，一起看地图，当成个难忘经历。", type: "A" }, { label: "B", text: "很慌张，责怪ta没安排好，完全指望ta解决。", type: "B" }, { label: "C", text: "拿过地图自己看，心想“早知道靠自己了，真麻烦”。", type: "C" }, { label: "D", text: "情绪崩溃，大吵一架，觉得旅行毁了。", type: "D" }] },
  { id: 35, category: "压力情境与支持寻求", text: "伴侣亲人去世了，ta非常悲痛消沉。", options: [{ label: "A", text: "陪在身边，即使不说话，也让ta知道我在。", type: "A" }, { label: "B", text: "不知怎么安慰，更担心ta因悲伤忽略我，想转移ta注意力。", type: "B" }, { label: "C", text: "建议ta“向前看”，理性分析，不太敢接触剧烈悲伤。", type: "C" }, { label: "D", text: "ta的悲伤触发了我的情绪，我反而崩溃了，变成ta来安慰我。", type: "D" }] },
  { id: 36, category: "压力情境与支持寻求", text: "你完成大事兴奋地告诉伴侣，ta反应冷淡只回了个“哦”。", options: [{ label: "A", text: "直接说：“希望你能为我开心点”，表达失望但不吵架。", type: "A" }, { label: "B", text: "觉得ta肯定不爱我了，心里默默扣分，开始怀疑自己。", type: "B" }, { label: "C", text: "无所谓，我为自己做的事，不需要ta认可。", type: "C" }, { label: "D", text: "故意找茬吵一架，把被忽视的火发出来。", type: "D" }] },
  { id: 37, category: "压力情境与支持寻求", text: "你急需一笔钱周转，伴侣负担得起。", options: [{ label: "A", text: "直接开口，说明情况和还款计划，相信ta会帮。", type: "A" }, { label: "B", text: "不敢开口，怕ta觉得我是为了钱，纠结很久。", type: "B" }, { label: "C", text: "宁愿找朋友借，也不想欠伴侣人情，怕被看低。", type: "C" }, { label: "D", text: "开口借，但如果ta犹豫，我就会暴怒，觉得ta不爱我。", type: "D" }] },
  { id: 38, category: "压力情境与支持寻求", text: "走夜路遇到一群看起来不怀好意的人。", options: [{ label: "A", text: "紧紧靠在一起，快速通过，互相照应。", type: "A" }, { label: "B", text: "躲在ta身后，抓着ta胳膊，完全指望ta保护。", type: "B" }, { label: "C", text: "评估形势，准备自己跑或自卫，潜意识觉得顾不上ta。", type: "C" }, { label: "D", text: "吓呆了，完全动不了，脑子一片空白。", type: "D" }] },
  { id: 39, category: "压力情境与支持寻求", text: "伴侣想换个更忙、出差更多的工作谋求发展。", options: [{ label: "A", text: "支持ta发展，讨论怎么应对相处时间变少的问题。", type: "A" }, { label: "B", text: "坚决反对，觉得工作比我重要就是不爱我。", type: "B" }, { label: "C", text: "支持，心里想“正好我也能更自由点”。", type: "C" }, { label: "D", text: "表面支持，实际开始疏远，为可能的分手做准备。", type: "D" }] },
  // 40-45: 信任与社交
  { id: 40, category: "信任、嫉妒与数字社交行为", text: "你发现伴侣给异性的一张性感照片点了赞。", options: [{ label: "A", text: "只是个赞，不代表什么，不会放在心上。", type: "A" }, { label: "B", text: "点进那人主页看半天，对比自己，然后质问伴侣。", type: "B" }, { label: "C", text: "根本没注意，也不关注这些琐事，懒得管。", type: "C" }, { label: "D", text: "觉得是背叛征兆，可能会为了报复也给异性点赞。", type: "D" }] },
  { id: 41, category: "信任、嫉妒与数字社交行为", text: "伴侣提出不想交换手机密码，想保留隐私。", options: [{ label: "A", text: "同意，每个人都需要私密空间，我相信ta。", type: "A" }, { label: "B", text: "不同意，不给密码就是心里有鬼，我很不安。", type: "B" }, { label: "C", text: "无所谓，正好我也不想给我的，互不干涉。", type: "C" }, { label: "D", text: "表面同意，背地里想办法偷看，忍不住怀疑。", type: "D" }] },
  { id: 42, category: "信任、嫉妒与数字社交行为", text: "伴侣前任发消息祝生日快乐，ta礼貌回了谢谢。", options: [{ label: "A", text: "觉得很正常，基本的礼貌而已。", type: "A" }, { label: "B", text: "立刻炸毛，觉得旧情复燃，逼问是不是常联系。", type: "B" }, { label: "C", text: "心里冷笑“还没断干净”，表面装不在乎。", type: "C" }, { label: "D", text: "陷入恐惧，觉得我只是替代品，ta还爱着前任。", type: "D" }] },
  { id: 43, category: "信任、嫉妒与数字社交行为", text: "在一起很久，伴侣从不发你照片在朋友圈。", options: [{ label: "A", text: "每个人习惯不同，不介意，现实对我也好就行。", type: "A" }, { label: "B", text: "很介意，觉得ta在给别人留机会，经常为此吵架。", type: "B" }, { label: "C", text: "我也不发，觉得秀恩爱没必要，不需要这种形式。", type: "C" }, { label: "D", text: "怀疑ta装单身，觉得关系随时会断，很自卑。", type: "D" }] },
  { id: 44, category: "信任、嫉妒与数字社交行为", text: "伴侣去洗澡，ta手机响了一声。", options: [{ label: "A", text: "除非ta让我看，否则不看，这是隐私。", type: "A" }, { label: "B", text: "很难忍住不看，总觉得瞒着我什么，看了才安心。", type: "B" }, { label: "C", text: "懒得看，ta的事我没兴趣，看了反而麻烦。", type: "C" }, { label: "D", text: "想看又不敢看，纠结半天，最后可能还是看了。", type: "D" }] },
  { id: 45, category: "信任、嫉妒与数字社交行为", text: "你会故意做一些事让伴侣吃醋吗？", options: [{ label: "A", text: "不会，觉得很幼稚伤感情。", type: "A" }, { label: "B", text: "会，如果不吃醋觉得ta不在乎我，偶尔试探。", type: "B" }, { label: "C", text: "不会，讨厌这种把戏，如果对我这样会分手。", type: "C" }, { label: "D", text: "会，想看ta失控的样子，有种扭曲的快感。", type: "D" }] },
  // 46-50: 财务
  { id: 46, category: "财务管理与资源共享", text: "讨论长期关系的财务管理。", options: [{ label: "A", text: "设立共同账户付家用，其余各自保留，适度独立。", type: "A" }, { label: "B", text: "希望钱放一起，这样才觉得是一家人，分太清不好。", type: "B" }, { label: "C", text: "必须AA制，账分得越清越好，不想有纠葛。", type: "C" }, { label: "D", text: "随便，但总担心ta卷钱跑了或用钱控制我。", type: "D" }] },
  { id: 47, category: "财务管理与资源共享", text: "伴侣用ta自己的钱买了个你觉得没用且贵的东西。", options: [{ label: "A", text: "问问为什么买，如果ta喜欢且买得起，尊重ta。", type: "A" }, { label: "B", text: "会焦虑，觉得钱该存着未来用，指责ta乱花钱。", type: "B" }, { label: "C", text: "心里觉得ta肤浅，但不说话，反正那是ta的钱。", type: "C" }, { label: "D", text: "我也去买个贵的平衡心理，或觉得ta在羞辱我没钱。", type: "D" }] },
  { id: 48, category: "财务管理与资源共享", text: "计划旅行，关于预算和买单。", options: [{ label: "A", text: "根据各自收入商量怎么分担。", type: "A" }, { label: "B", text: "希望ta全包是爱的证明，或者我全包讨好ta。", type: "B" }, { label: "C", text: "严格算清每一笔账，一分钱都不想欠。", type: "C" }, { label: "D", text: "还没去就开始担心因钱吵架，甚至不想去了。", type: "D" }] },
  { id: 49, category: "财务管理与资源共享", text: "伴侣想买房，写两人名字，背30年房贷。", options: [{ label: "A", text: "这是重大承诺，需要详细评估财务和规划。", type: "A" }, { label: "B", text: "很开心，觉得终于锁住ta了，房贷是纽带。", type: "B" }, { label: "C", text: "想到背债还要绑在一起，就想逃跑。", type: "C" }, { label: "D", text: "担心万一分手房子怎么分，会变成噩梦。", type: "D" }] },
  { id: 50, category: "财务管理与资源共享", text: "伴侣急需用钱，向你借了一大笔。", options: [{ label: "A", text: "能力范围内借，约定还款方式，互相支持。", type: "A" }, { label: "B", text: "哪怕借贷也要帮，甚至不好意思让ta还。", type: "B" }, { label: "C", text: "拒绝借，或借了后不停催，觉得破坏感情纯粹性。", type: "C" }, { label: "D", text: "借给ta，但以后吵架会拿这事攻击ta。", type: "D" }] }
];

// 莫兰迪色系配置
const morandi = {
  bg: "bg-[#F0F2F0]", // 浅灰绿背景
  card: "bg-white",
  primary: "text-[#6A665D]", // 深褐灰
  secondary: "text-[#8F9EAB]", // 雾霾蓝
  accent: "bg-[#A3B9B6]", // 豆沙绿 (按钮)
  accentHover: "hover:bg-[#8F9EAB]",
  progress: "bg-[#D6C6C5]", // 藕粉色 (进度条)
  chartBlue: "#8F9EAB",
  chartRed: "#D6C6C5",
  chartGreen: "#A3B9B6",
  chartYellow: "#E5D4A5"
};

// --- 组件 ---

const WelcomeScreen = ({ onStart }) => (
  <div className={`flex flex-col items-center justify-center min-h-screen ${morandi.bg} p-4 sm:p-6 text-center`}>
    <div className={`${morandi.card} p-6 sm:p-10 rounded-3xl shadow-xl max-w-2xl w-full`}>
      <Brain className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 text-[#A3B9B6]" />
      <h1 className={`text-2xl sm:text-4xl font-serif font-bold mb-4 ${morandi.primary}`}>成人依恋风格测试</h1>
      <h2 className="text-sm sm:text-lg text-gray-500 mb-6 sm:mb-8 font-light tracking-wider">SJT 情境化判断测验</h2>
      
      <p className={`text-base sm:text-lg mb-6 sm:mb-8 leading-relaxed ${morandi.primary} opacity-80`}>
        本测试并非传统的性格问卷，而是基于<strong>50个真实生活情境</strong>的深度评估。<br className="hidden sm:block"/>
        我们将探索您在亲密关系、冲突应对、金钱管理等核心领域的潜意识反应。
      </p>

      <div className="bg-[#F9F9F9] p-4 sm:p-6 rounded-xl mb-6 sm:mb-10 text-left text-xs sm:text-sm text-gray-600 space-y-2">
        <p>🕰️ <strong>测试时间：</strong> 约 10-15 分钟</p>
        <p>🧘 <strong>建议：</strong> 请在安静的环境下，凭借第一直觉选择最符合您真实感受的选项。</p>
        <p>🔒 <strong>隐私：</strong> 所有数据仅在本地处理，不会上传。</p>
        <p>🔀 <strong>说明：</strong> 题目选项顺序随机，请仔细阅读。</p>
      </div>

      <button 
        onClick={onStart}
        className={`${morandi.accent} text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-medium shadow-lg ${morandi.accentHover} transition-all transform hover:scale-105 duration-300 flex items-center mx-auto`}
      >
        开始探索内心 <ArrowRight className="ml-2 w-5 h-5" />
      </button>
    </div>
  </div>
);

const QuizScreen = ({ question, currentIdx, total, onNext, onPrev, selectedOption, onSelect }) => {
  // 生成 A, B, C, D 标签
  const getOptionLabel = (index) => String.fromCharCode(65 + index);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${morandi.bg} p-3 sm:p-8 transition-colors duration-500`}>
      
      {/* 进度条 */}
      <div className="w-full max-w-3xl mb-4 sm:mb-8 flex items-center gap-4">
        <span className={`text-xs sm:text-sm font-medium ${morandi.secondary}`}>
          {currentIdx + 1} / {total}
        </span>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${morandi.progress} transition-all duration-500 ease-out`} 
            style={{ width: `${((currentIdx + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className={`${morandi.card} p-4 sm:p-12 rounded-2xl sm:rounded-3xl shadow-xl max-w-3xl w-full flex flex-col justify-between relative overflow-hidden`}>
        
        {/* 装饰背景字 */}
        <div className="absolute -top-10 -right-10 text-9xl text-gray-50 opacity-10 font-serif select-none pointer-events-none">
          {currentIdx + 1}
        </div>

        <div>
          <div className="mb-2">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 mb-2 sm:mb-4`}>
              {question.category}
            </span>
          </div>
          
          {/* 题干：衬线字体，桌面端大字体，移动端适中 */}
          <h2 className={`text-xl sm:text-3xl font-serif font-bold mb-6 sm:mb-10 leading-snug ${morandi.primary}`}>
            {question.text}
          </h2>

          <div className="space-y-3 sm:space-y-4">
            {question.options.map((opt, index) => (
              <button
                key={opt.type} // 使用 type 作为 key，因为内容是唯一的
                onClick={() => onSelect(opt.type)}
                className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all duration-200 group relative overflow-hidden
                  ${selectedOption === opt.type 
                    ? `border-[#A3B9B6] bg-[#F2F7F6] ${morandi.primary}` 
                    : 'border-transparent bg-gray-50 hover:bg-gray-100 text-gray-600'
                  }
                `}
              >
                <div className="flex items-start">
                  <span className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-3 sm:mr-4 text-xs sm:text-sm font-bold border
                    ${selectedOption === opt.type 
                      ? 'bg-[#A3B9B6] text-white border-[#A3B9B6]' 
                      : 'bg-white text-gray-400 border-gray-300 group-hover:border-gray-400'
                    }
                  `}>
                    {getOptionLabel(index)}
                  </span>
                  {/* 选项：无衬线字体，移动端小字号，避免太长 */}
                  <span className="text-sm sm:text-lg font-sans leading-relaxed">{opt.text}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-8 sm:mt-12 pt-6 border-t border-gray-100">
          <button 
            onClick={onPrev}
            disabled={currentIdx === 0}
            className={`flex items-center px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base text-gray-500 hover:text-gray-800 disabled:opacity-30 disabled:hover:text-gray-500 transition-colors`}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" /> 上一题
          </button>

          <button 
            onClick={onNext}
            disabled={!selectedOption}
            className={`flex items-center px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base text-white font-medium shadow-md transition-all
              ${selectedOption 
                ? `${morandi.accent} ${morandi.accentHover} transform hover:translate-y-[-2px]` 
                : 'bg-gray-300 cursor-not-allowed'
              }
            `}
          >
            {currentIdx === total - 1 ? '查看结果' : '下一题'}
            {currentIdx !== total - 1 && <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />}
            {currentIdx === total - 1 && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResultScreen = ({ answers, timeData }) => {
  const resultRef = useRef(null); // 用于截取图片的容器

  // --- 计算逻辑 ---
  const { scores, categoryScores } = useMemo(() => {
    let anxiety = 0;
    let avoidance = 0;
    let counts = { A: 0, B: 0, C: 0, D: 0 };
    let catScores = {};

    // 初始化 category scores
    rawQuestions.forEach(q => {
      if (!catScores[q.category]) {
        catScores[q.category] = { total: 0, anxiety: 0, avoidance: 0, secure: 0, type: [] };
      }
    });

    Object.entries(answers).forEach(([id, type]) => {
      counts[type] = (counts[type] || 0) + 1;
      
      // 找回原始题目以获取 category
      const question = rawQuestions.find(q => q.id === parseInt(id));
      if (question) {
        const cat = catScores[question.category];
        cat.total += 1;
        cat.type.push(type);

        if (type === 'A') cat.secure += 1;
        if (type === 'B') { anxiety += 1; cat.anxiety += 1; }
        if (type === 'C') { avoidance += 1; cat.avoidance += 1; }
        if (type === 'D') { anxiety += 1; avoidance += 1; cat.anxiety += 1; cat.avoidance += 1; }
      }
    });

    return { scores: { anxiety, avoidance, counts }, categoryScores: catScores };
  }, [answers]);

  // 判定类型
  const resultType = useMemo(() => {
    const { anxiety, avoidance } = scores;
    const highAnxiety = anxiety > 20;
    const highAvoidance = avoidance > 20;

    let typeKey = "secure";
    let title = "安全型依恋 (Secure)";
    let color = morandi.chartGreen;

    if (highAnxiety && !highAvoidance) { typeKey = "anxious"; title = "痴迷型依恋 (Preoccupied)"; color = morandi.chartYellow; }
    if (!highAnxiety && highAvoidance) { typeKey = "dismissive"; title = "疏离-回避型依恋 (Dismissive)"; color = morandi.chartBlue; }
    if (highAnxiety && highAvoidance) { typeKey = "fearful"; title = "恐惧-回避型依恋 (Fearful)"; color = morandi.chartRed; }

    return { 
      key: typeKey, 
      title, 
      color, 
      ...analysisContent.types[typeKey] // 合并深度分析内容
    };
  }, [scores]);

  // 雷达图数据
  const radarData = [
    { subject: '安全型', A: scores.counts.A, fullMark: 50 },
    { subject: '恐惧型', A: scores.counts.D, fullMark: 50 },
    { subject: '疏离型', A: scores.counts.C, fullMark: 50 },
    { subject: '痴迷型', A: scores.counts.B, fullMark: 50 },
  ];

  // 折线图数据 (时间)
  const lineChartData = rawQuestions.map((q) => ({
    name: `Q${q.id}`,
    time: (timeData[q.id] || 0) / 1000,
    fullText: q.text
  }));

   const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg max-w-xs">
          <p className="font-bold text-gray-700 mb-2">{data.name}</p>
          <p className="text-sm text-gray-600 mb-2">{data.fullText}</p>
          <p className="text-sm font-medium text-[#A3B9B6]">
            耗时: {data.time.toFixed(1)} 秒
          </p>
        </div>
      );
    }
    return null;
  };

  // --- 图片导出处理 (使用原生打印，兼容性更好) ---
  const handleExportImage = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen ${morandi.bg} p-4 sm:p-10 pb-20`}>
      {/* 这里的 ref 将包含所有需要被截图的内容 */}
      <div ref={resultRef} className={`max-w-5xl mx-auto space-y-8 ${morandi.bg} p-4`}>
        
        {/* 头部结果卡片 */}
        <div className={`${morandi.card} rounded-3xl p-6 sm:p-10 shadow-lg text-center relative overflow-hidden print-break-inside-avoid`}>
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#A3B9B6] via-[#D6C6C5] to-[#8F9EAB]"></div>
          <h1 className="text-lg sm:text-xl text-gray-500 mb-4 uppercase tracking-widest">测试结果分析</h1>
          <h2 className={`text-3xl sm:text-5xl font-serif font-bold mb-6 ${morandi.primary}`}>{resultType.title}</h2>
          
          <div className="flex justify-center mt-8 gap-8 text-sm font-medium text-gray-400">
             <div>焦虑指数: <span className="text-gray-800 text-lg">{scores.anxiety}</span></div>
             <div>回避指数: <span className="text-gray-800 text-lg">{scores.avoidance}</span></div>
          </div>
        </div>

        {/* 核心机制与优势 (新增) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-inside-avoid">
           <div className={`${morandi.card} rounded-3xl p-6 sm:p-8 shadow-lg`}>
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-[#8F9EAB]"/> 潜意识机制解码
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {resultType.mechanism}
              </p>
           </div>
           <div className={`${morandi.card} rounded-3xl p-6 sm:p-8 shadow-lg`}>
              <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-[#A3B9B6]"/> 性格光辉面
              </h3>
              <ul className="space-y-3">
                {resultType.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 mr-2 text-[#A3B9B6] flex-shrink-0 mt-0.5" />
                    {str}
                  </li>
                ))}
              </ul>
           </div>
        </div>

        {/* 维度分析雷达 */}
        <div className={`${morandi.card} rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col items-center print-break-inside-avoid`}>
          <h3 className="text-xl font-medium text-gray-700 mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-[#A3B9B6]"/> 人格倾向分布
          </h3>
          <div className="w-full h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar name="依恋倾向" dataKey="A" stroke="#A3B9B6" strokeWidth={3} fill="#A3B9B6" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 六维情境深度画像 (新增) */}
        <div className={`${morandi.card} rounded-3xl p-6 sm:p-8 shadow-lg page-break print-break-inside-avoid`}>
           <h3 className="text-xl font-medium text-gray-700 mb-8 flex items-center">
             <BookOpen className="w-5 h-5 mr-2 text-[#6A665D]"/> 六维情境深度画像
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {Object.entries(categoryScores).map(([catName, data]) => {
                const Meta = analysisContent.categories[catName];
                const Icon = Meta.icon;
                // 简单判定该领域的倾向
                let tendency = "安全为主";
                let tColor = "text-green-600";
                if (data.anxiety > data.total / 3) { tendency = "存在焦虑倾向"; tColor = "text-yellow-600"; }
                if (data.avoidance > data.total / 3) { tendency = "存在回避倾向"; tColor = "text-blue-500"; }
                if (data.anxiety > data.total / 3 && data.avoidance > data.total / 3) { tendency = "矛盾/恐惧倾向"; tColor = "text-red-500"; }

                return (
                  <div key={catName} className="bg-gray-50 rounded-xl p-5 border border-gray-100 print-break-inside-avoid">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
                        <Icon className="w-5 h-5 text-[#8F9EAB]" />
                      </div>
                      <h4 className="font-bold text-gray-700 text-sm">{catName}</h4>
                    </div>
                    <p className="text-xs text-gray-400 mb-3">{Meta.desc}</p>
                    <div className="flex justify-between items-end">
                      <div className="text-xs space-y-1 text-gray-500">
                        <div>焦虑反应: {data.anxiety}</div>
                        <div>回避反应: {data.avoidance}</div>
                      </div>
                      <span className={`text-sm font-bold ${tColor}`}>{tendency}</span>
                    </div>
                  </div>
                );
             })}
           </div>
        </div>

        {/* 心理处方 (新增) */}
        <div className={`${morandi.card} rounded-3xl p-6 sm:p-8 shadow-lg bg-[#F2F7F6] print-break-inside-avoid`}>
           <h3 className="text-xl font-medium text-[#5c7a76] mb-4 flex items-center">
             <Activity className="w-5 h-5 mr-2"/> 心理处方与行动建议
           </h3>
           <div className="text-gray-700 leading-relaxed text-sm whitespace-pre-line">
             {resultType.advice}
           </div>
        </div>

        {/* 答题时间分析 */}
        <div className={`${morandi.card} rounded-3xl p-6 sm:p-8 shadow-lg print-break-inside-avoid`}>
          <h3 className="text-xl font-medium text-gray-700 mb-2 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-[#8F9EAB]"/> 潜意识阻抗分析 (答题用时)
          </h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={false} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={5} stroke="#A3B9B6" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="time" stroke="#8F9EAB" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                <Brush dataKey="name" height={20} stroke="#D6C6C5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 导出按钮 (固定在右下角) */}
      <button
        onClick={handleExportImage}
        className="fixed bottom-8 right-8 bg-[#6A665D] text-white p-4 rounded-full shadow-2xl hover:bg-[#4a4741] transition-all no-print z-50 flex items-center gap-2"
        title="导出结果"
      >
        <Download className="w-6 h-6" />
        <span className="text-sm font-medium">导出结果 (PDF)</span>
      </button>

      {/* 打印样式优化 */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-bg-force { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          ::-webkit-scrollbar { display: none; }
          @page { margin: 10mm; size: auto; }
        }
      `}</style>
    </div>
  );
};

export default function App() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeData, setTimeData] = useState({});
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [startTime, setStartTime] = useState(null);

  const handleStart = () => {
    const newQuestions = rawQuestions.map(q => ({
      ...q,
      options: shuffleArray([...q.options])
    }));
    setShuffledQuestions(newQuestions);
    setStarted(true);
    setStartTime(Date.now());
  };

  const recordTimeAndProceed = (nextIdx) => {
    const now = Date.now();
    const elapsed = now - startTime;
    const currentQId = shuffledQuestions[currentQuestionIdx].id;
    setTimeData(prev => ({ ...prev, [currentQId]: (prev[currentQId] || 0) + elapsed }));
    setStartTime(now);
    setCurrentQuestionIdx(nextIdx);
  };

  const handleNext = () => {
    if (currentQuestionIdx < shuffledQuestions.length - 1) {
      recordTimeAndProceed(currentQuestionIdx + 1);
    } else {
      const now = Date.now();
      const elapsed = now - startTime;
      const currentQId = shuffledQuestions[currentQuestionIdx].id;
      setTimeData(prev => ({ ...prev, [currentQId]: (prev[currentQId] || 0) + elapsed }));
      setFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
       recordTimeAndProceed(currentQuestionIdx - 1);
    }
  };

  const handleSelect = (optionType) => {
    setAnswers(prev => ({ ...prev, [shuffledQuestions[currentQuestionIdx].id]: optionType }));
  };

  if (!started) return <WelcomeScreen onStart={handleStart} />;
  if (finished) return <ResultScreen answers={answers} timeData={timeData} />;

  return (
    <QuizScreen
      question={shuffledQuestions[currentQuestionIdx]}
      currentIdx={currentQuestionIdx}
      total={shuffledQuestions.length}
      onNext={handleNext}
      onPrev={handlePrev}
      selectedOption={answers[shuffledQuestions[currentQuestionIdx].id]}
      onSelect={handleSelect}
    />
  );
}