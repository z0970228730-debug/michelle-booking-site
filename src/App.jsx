import React, { useState, useEffect } from "react";

// 確保所有圖示都已匯入
import { Copy, CheckCircle, Heart, Calendar, CreditCard, Info, MapPin, AlertCircle, X, Send, Sparkles, Check, ChevronDown, Clock, UserCheck, ShieldCheck, Star, ArrowRight, HelpCircle, Loader2, AlertTriangle, Building2, Home, Gift, Quote, Camera, ZoomIn, Image as ImageIcon, Map as MapIcon, Activity, Feather, Award, Car, MessageCircle, Crown, Instagram, Facebook } from 'lucide-react';

// --- 全域設定區 ---

// ⚠️ 官方 LINE 連結
const LINE_LINK = "https://lin.ee/qmFjzVr"; 
const LINE_ID = "@ybc0766y";

// ⚠️ 社群連結
const IG_LINK = "https://www.instagram.com/prettymami2020?igsh=MTdnb3MzNWM2Y2J3bQ=="; 
const FB_LINK = "https://www.facebook.com/share/17v5wLG1oX/?mibextid=wwXIfr";

// ✅ 網頁標題
const SITE_TITLE = "Michelle's 專屬媽媽肚回歸優惠";

// ⚠️ 【重要】Google Apps Script 部署網址
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzje9JQBKoWS64ImlvHxI1IdC6GBaBFfPDoHoVRhP9l2tJ7PsNx_BssjIRvDp_bxJjH/exec"; 

// ✅ 安全金鑰與設定
const API_KEY = import.meta?.env?.VITE_API_KEY || "chipton_secure_2026_9f3k";
const SHEET_NAME_BOOKING = "課程名單"; 

// 產生或讀取唯一 Client ID
const getClientId = () => {
  try {
    const k = "pm_client_id";
    const existing = localStorage.getItem(k);
    if (existing) return existing;
    const id = (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()) + "_" + Math.random().toString(16).slice(2));
    localStorage.setItem(k, id);
    return id;
  } catch (e) {
    return "unknown";
  }
};

// 🛠️ Google Drive 圖片轉換工具
const getDriveImage = (url) => {
  if (!url) return "";
  if (url.includes('unsplash.com') || url.includes('imgur.com')) return url;
  const idMatch = url.match(/\/d\/(.*?)\/view/) || url.match(/id=(.*?)$/);
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1920`;
  }
  return url;
};

// --- 圖片連結設定區 ---
const IMAGES = {
    HERO: "https://drive.google.com/file/d/1VnImWKk5KkWzPC2iqEiGddWVEdZdQyv2/view?usp=sharing",
    MUSCLE: "https://drive.google.com/file/d/1_Hv_jqYqAjsnlL6ghCd1R_ihHLRz_Z_o/view?usp=sharing",
    MICHELLE_EXPERIENCE: "https://drive.google.com/file/d/1OjR0znGfeVq7YItZFipFC1dekPX3yxSK/view?usp=sharing",
    KOL_BA: "https://drive.google.com/file/d/1Me7j9LouNO7mhZskPFm553XAw2fHTQ28/view?usp=sharing",
    CELEBRITY_CHOICE: "https://drive.google.com/file/d/1rH7BK_gecJhs35s3QCSHb7gw11TNK9SY/view?usp=sharing"
};

// 商品資料
const PRODUCTS = [
  {
    id: 1,
    name: "Michelle 粉絲專屬｜媽媽肚回歸體驗課程 (單堂)",
    price: 2800,
    originalPrice: 3800,
    description: "50-60分鐘純手技調理，幫助體態更好、更有自信！",
    note: "(不包含紮肚以及緊緻精油)", 
    tag: "必選項目 REQUIRED",
    locked: true
  }
];

// 預設工作室列表 (當 API 讀取失敗時的備案)
const DEFAULT_STUDIOS = [
  { region: "台北", name: "台北國父紀念館站 (153之9號2樓)", address: "台北市大安區延吉街153-9號", note: "", status: "是" },
  { region: "台北", name: "台北信義安和 (2A出口)", address: "台北市大安區安和路二段7號9樓", note: "", status: "是" },
  { region: "新北", name: "新北三重捷運站 (3號出口)", address: "新北市三重區重陽路一段60巷59號", note: "", status: "是" },
  { region: "新北", name: "板橋工作室 (新埔站1號出口/新埔民生站)", address: "新北市板橋區民生路三段151號3樓", note: "⛔️請勿攜伴", status: "是" },
  { region: "新北", name: "新北林口昕境廣場", address: "新北市林口區文化三路一段486號", note: "機捷林口站，⛔️請勿攜伴", status: "是" },
  { region: "桃園", name: "桃園旗艦店", address: "桃園市桃園區同德二街139號", note: "", status: "是" },
  { region: "新竹", name: "新竹工作室", address: "新竹市東區民享街66號", note: "", status: "是" },
  { region: "台中", name: "台中南屯工作室", address: "台中市南屯區大墩十二街175號", note: "僅限平日白天", status: "是" },
  { region: "台中", name: "台中清水區", address: "台中市清水區光華路118號1樓", note: "", status: "是" },
  { region: "彰化", name: "彰化門市", address: "彰化市中興路154號", note: "", status: "是" },
  { region: "彰化", name: "員林居家工作室", address: "彰化縣員林市瑞平街", note: "⛔️請勿攜伴", status: "是" },
  { region: "雲林", name: "虎尾工作室", address: "雲林縣虎尾鎮博愛路168-3號", note: "⛔️請勿攜伴", status: "是" },
  { region: "雲林", name: "斗六工作室", address: "雲林縣斗六市南京路232號", note: "⛔️請勿攜伴", status: "是" },
  { region: "嘉義", name: "嘉義工作室", address: "嘉義市民生北路334號", note: "⛔️請勿攜伴", status: "是" },
  { region: "台南", name: "台南北區工作室", address: "台南市北區和緯路二段148號", note: "⛔️請勿攜伴", status: "是" },
  { region: "台南", name: "台南東區工作室", address: "台南市東區莊敬路136巷7號2樓", note: "⛔️請勿攜伴", status: "是" },
  { region: "台南", name: "台南南區工作室", address: "台南市南區永南二街53號", note: "⛔️請勿攜伴", status: "是" },
  { region: "花蓮", name: "花蓮市上海街工作室", address: "花蓮市上海街", note: "僅限假日", status: "是" },
  { region: "高雄", name: "高雄楠梓區工作室", address: "高雄市楠梓區高雄大學路397號", note: "⛔️請勿攜伴", status: "是" },
  { region: "宜蘭", name: "宜蘭五結工作室", address: "宜蘭縣五結鄉協和村親河路一段133號", note: "", status: "是" },
];

// 口碑好評資料
const REVIEWS = [
    { name: "畢業媽咪", content: "腹直肌按摩對產後媽媽體態恢復真的有幫助喔！而且是肉眼可見的那種，超級開心。雖然畢業之後還是得要運動，但按完7堂課就已經恢復有近八成。真的一生推！老師專業又溫柔，每次的到府服務都可以像朋友一樣的開心聊天，一路一起見證每堂課課後體態的變化，也更認識自己的身體，在承受了從懷孕到生產這麽大的改變之後，真的是時候好好的善待自己了！" },
    { name: "林口媽咪", content: "超推薦俏媽咪團隊，手法專業，每次課程皆會依據當下狀態的不同，個別化的調整課程的內容，除了媽媽肚有感縮小外，長年的腰酸背痛也都得到明顯的改善！大力推薦。" },
    { name: "二寶媽咪", content: "二胎產後體態超級可怕，透過推薦得知俏媽咪，獨家手法讓我的體態神雕塑看起來就是「瘦」。體重上的公斤數是靠自己努力，而體態恢復完全靠老師，十堂課畢業了，真心推薦產後媽咪們來修復。" },
    { name: "快樂畢業", content: "謝謝俏媽咪團隊，讓我快樂的畢業了！手法很專業，朋友跟老公都說肚子有變小，大力推薦。" },
    { name: "感動的媽咪", content: "我5月底生產，9月初第一次做媽咪肚回歸課程～老師人很好，因為第一次做疼痛感真的很明顯，也會適當的休息加聊天轉移注意力，並依照個案情況告訴我們需要幾堂課能有好的成效～在這幾次的課程看到自己肚肚越來越小真的很感動！雖然中間我有幾次因為身體關係臨時改期，或因為身體太敏感沒辦法按到太深層，老師都會在其他的地方補強，讓我能保持下去，畢業的成果我很滿意，下一胎我也會再找俏媽咪！" },
    { name: "保養達人", content: "非常推薦～老師手法溫柔，過程會詢問感受及力道需不需要調整，也教了我很多平日維持保養的好方法，還給我滿滿的鼓勵，結束五堂課肚子明顯改善很多！" },
    { name: "愛自己媽咪", content: "謝謝老師幫助我腹直肌修復，課程中學習腹式呼吸來維持體態，也改善了腰痛的問題，雖然過程中難免會痛，不過堅持下去就值得了。媽媽愛小孩的同時也別忘了要愛自己。" },
    { name: "二寶修復", content: "我一定要大大的推薦，第二胎遇到腹直肌分離的狀況，光運動是不容易修復的，透過課程把產後的肚子修平了許多，真的超級推推！" },
    { name: "放鬆體驗", content: "原本抱著嘗試的心態去試試看，體驗後真的很棒！腰痠背痛的問題改善很多。謝謝老師的巧手，每次在修復的過程都很放鬆⋯到差點睡著～推薦給還在觀望的妳們。" },
    { name: "找回自信", content: "才第三堂課，我就開始敢穿露肚子的衣服了～而且…找得到核心發力的感覺了！覺得這筆錢真的花的很值得，感謝有妳們～" },
    { name: "穿回牛仔褲", content: "產後肚皮鬆垮、牛仔褲穿不下，透過IG發現腹直肌修復課程，進而開始了媽媽肚課程。課程中痛是一定的，要能忍痛！課後每天腹式呼吸搭配指定運動也很重要！總共6堂課，前3堂鬆垮程度會明顯改善，牛仔褲也都穿的回去了；第4堂課開始可能會進入停滯期，但我比較在意整體體態，不過度追求數字。另外，老師也會透過按摩手法改善腰痠狀況。如果產後面對走失的肚肚、失聯牛仔褲很焦慮的媽媽，可以來體驗看看！" },
    { name: "找回自己", content: "今天是我腹直肌分離修復課程的最後一堂課，真的非常感謝老師這段時間的用心陪伴與鼓勵。這段時間不只是身體上的改變，更是心態上的轉變。印象最深的是有天和小孩一起洗澡，他突然說：「媽咪你的肚子怎麼變小了？」那一瞬間真的超級感動，也更有動力繼續堅持下去！還有好幾次半夜肚子餓，手機都已經打開 Uber Eats 想點鹹酥雞了，結果腦海就會突然浮現老師的叮嚀，然後我就默默把手機關掉（笑）～謝謝老師讓我不只是動起來，更在生活中學會自律。這堂課不只是產後修復，更像是找回自己的一段旅程。推薦給每一位產後媽媽，妳值得更健康、更有力量的自己！" },
    { name: "雙寶媽咪", content: "生完雙胞胎一直都有腰酸的問題，漸漸也養成駝背的習慣。在新竹體驗第一次就看到非常顯著的變化，馬上就決定連作五次。每一次的按摩身體都有很好的回饋，加上老師超級友善，還會提醒我如何做腹式呼吸與一些運動來改善自己的駝背，每次去都感覺是最佳的放風時刻。做完五次看到腹直肌明顯的變化真的很開心，強力推薦媽咪們來找回自信的自己，又可以療癒放風唷！" },
    { name: "緊緻見證", content: "產後來體驗媽媽肚回歸～謝謝老師讓我鬆垮的肚肚變得很緊緻，也分享了很多專業知識讓我知道怎麼去做調整，推推推！" },
    { name: "開朗媽咪", content: "推薦俏媽咪，手法到位效果顯著！重點是老師個性很開朗，每次按完肚子消了，心情也會變好。" },
    { name: "彰化體驗", content: "懷孕時就有頻尿、腰痠等問題⋯產後肚子還是一團肉⋯無意間發現有腹直肌修復的課程，抱著試試看的心態，預約彰化門市的體驗課。第一次真的被疼痛感嚇到，還持續痠痛了2-3天，但是效果真的很棒！短短一個半月，腹圍小了10公分，腹直肌也都閉合了！感謝俏媽咪團隊厲害的手法與親切的服務！大推！" },
    { name: "核心回歸", content: "朋友轉介紹來的。產後一年了，骨盆歪斜、腹部鬆垮、核心失聯，並且時常覺得腹部有一塊地方抽痛，但檢查都沒問題。進行修復兩堂課後，原先莫名抽痛的地方就沒有再痛了！去運動也終於可以再次感覺到核心肌群！上完五堂課，產後上腹鬆鬆的皮膚也變緊實，我可以微微看見自己原本的腹肌紋理，覺得很感動。" }
];

const QA_LIST = [
    { id: "01", q: "課程內容包含什麼？一定要包堂嗎？", a: "課程採全程「純手技」調理，包含專業數據測量、緊緻精油按摩與獨家腹部手法。單次體驗通常即能感受身體的放鬆與變化，若希望達到更理想且穩定的體態，建議進行完整的週期性調理。" },
    { id: "02", q: "產後多久適合開始課程?", a: "不論產後幾年皆適合！若剛生產完，建議自然產 30 天後、剖腹產約 1.5 個月後（確認傷口癒合且完全無惡露情況下）即可預約進行課程。" },
    { id: "03", q: "為什麼建議做產後腹部調理?", a: "孕期因鬆弛素影響，骨盆與核心肌群容易擴張無力。若產後腹直肌分離未適當恢復，可能引起腰痠背痛、體態困擾甚至影響婦科健康。透過專業調理，能協助身體回到理想的平衡位置。" },
    { id: "04", q: "產後做仰臥起坐可以替代課程嗎?", a: "不建議！在核心肌肉尚未修復閉合前，進行仰臥起坐或捲腹運動可能會加劇分離狀況。建議先透過專業手法修復，待核心穩定後再循序漸進進行肌力訓練。" },
    { id: "05", q: "可以等第二胎生完再一起做嗎?", a: "每一胎的身體負荷與恢復需求皆不同。建議把握產後黃金期先進行修復，改善前一胎留下的不適，以健康的身體基底迎接下一次孕期，對媽咪的體力與情緒都較有助益。" },
    { id: "06", q: "建議需要做幾堂課程呢?", a: "實際堂數需視個人的「分離指數」與「脂肪厚度」而定，我們會於課程中進行專業測量與評估。一般輕度狀況建議約 5-7 堂，較明顯狀況建議約 8-12 堂。若評估發現狀況特殊，我們將秉持專業倫理，建議您優先尋求醫療協助。" }
];

// --- 專業頁尾組件 (Footer) ---
const Footer = () => (
    <div className="mt-20 pt-12 border-t border-[#E5DFD9] bg-[#FDFBF9] pb-32">
        {/* 1. 社群連結圖示 */}
        <div className="flex justify-center items-center gap-8 mb-10">
            <a href={IG_LINK} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2 text-[#9A8F85] hover:text-[#B08D55] transition-colors">
                <div className="p-3 bg-white rounded-full shadow-sm border border-[#EBE5DE] group-hover:border-[#B08D55] transition-colors transform group-hover:scale-110 duration-300">
                    <Instagram size={18} />
                </div>
                <span className="text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Instagram</span>
            </a>
            <a href={FB_LINK} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2 text-[#9A8F85] hover:text-[#B08D55] transition-colors">
                <div className="p-3 bg-white rounded-full shadow-sm border border-[#EBE5DE] group-hover:border-[#B08D55] transition-colors transform group-hover:scale-110 duration-300">
                    <Facebook size={18} />
                </div>
                <span className="text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Facebook</span>
            </a>
            <a href={LINE_LINK} target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2 text-[#9A8F85] hover:text-[#B08D55] transition-colors">
                <div className="p-3 bg-white rounded-full shadow-sm border border-[#EBE5DE] group-hover:border-[#B08D55] transition-colors transform group-hover:scale-110 duration-300">
                    <MessageCircle size={18} />
                </div>
                <span className="text-[10px] tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">Line</span>
            </a>
        </div>
        
        {/* 2. 品牌與版權資訊 */}
        <div className="flex flex-col items-center gap-3 text-center px-4">
            
            {/* A. 品牌聯名標題 */}
            <h4 className="font-serif text-[#4A4238] font-bold tracking-[0.15em] text-sm md:text-base">
                PRETTYMAMI Postpartum Care
            </h4>

            {/* B. 中文描述 */}
            <p className="text-[11px] text-[#9A8F85] tracking-wide font-medium">
                俏媽咪專業孕產照護團隊・官方指定預約頁面
            </p>

            {/* C. 假法律連結 */}
            <div className="flex items-center gap-3 text-[10px] text-[#B08D55]/70 tracking-wider mt-2 font-medium">
                <span className="cursor-pointer hover:text-[#B08D55]">Privacy Policy</span>
                <span className="w-px h-2 bg-[#D6D1C9]"></span>
                <span className="cursor-pointer hover:text-[#B08D55]">Terms of Service</span>
            </div>

            {/* D. 版權宣告 */}
            <p className="text-[9px] text-[#D6D1C9] tracking-[0.2em] uppercase mt-4 scale-90">
                © {new Date().getFullYear()} All Rights Reserved.
            </p>
        </div>
    </div>
);

// --- 肌肉圖解組件 (SVG) ---
const DiastasisRectiDiagram = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-center gap-3">
                <div className="w-40 md:w-full aspect-[3/4] bg-white rounded-2xl shadow-sm border border-[#EBE5DE] relative overflow-hidden flex items-center justify-center p-4">
                    <svg viewBox="0 0 100 120" className="w-full h-full">
                        <path d="M20,15 Q50,5 80,15 Q85,40 85,70 Q85,100 50,115 Q15,100 15,70 Q15,40 20,15 Z" fill="#FDFBF9" stroke="#E5DFD9" strokeWidth="2" />
                        <path d="M48,25 Q46,60 48,100 L38,95 Q35,60 38,25 Z" fill="#8D7F76" opacity="0.7" />
                        <path d="M52,25 Q54,60 52,100 L62,95 Q65,60 62,25 Z" fill="#8D7F76" opacity="0.7" />
                        <line x1="50" y1="25" x2="50" y2="100" stroke="#FFF" strokeWidth="1" strokeDasharray="2 2" />
                    </svg>
                    <div className="absolute bottom-3 bg-white/90 px-2 py-0.5 rounded-full shadow-sm text-[10px] text-[#8D7F76] font-bold">正常狀態</div>
                </div>
                <p className="font-bold text-[#4A4238] text-sm">懷孕前</p>
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="w-44 md:w-full aspect-[3/4] bg-[#FDFBF9] rounded-2xl shadow-md border-2 border-[#D4B08C] relative overflow-hidden flex items-center justify-center p-4 transform scale-105 z-10">
                    <svg viewBox="0 0 100 120" className="w-full h-full">
                        <path d="M15,30 Q50,0 85,30 Q98,60 85,95 Q50,120 15,95 Q2,60 15,30 Z" fill="#FFF8F0" stroke="#E5DFD9" strokeWidth="2" />
                        <path d="M42,25 Q25,60 42,105 L35,100 Q15,60 35,25 Z" fill="#B08D55" opacity="0.6" />
                        <path d="M58,25 Q75,60 58,105 L65,100 Q85,60 65,25 Z" fill="#B08D55" opacity="0.6" />
                        <circle cx="50" cy="65" r="8" fill="#FFFFFF" opacity="0.5" />
                    </svg>
                    <div className="absolute bottom-3 bg-[#B08D55] px-2 py-0.5 rounded-full shadow-sm text-[10px] text-white font-bold">逐漸撐大</div>
                </div>
                <p className="font-bold text-[#B08D55] text-sm">懷孕中</p>
            </div>
            <div className="flex flex-col items-center gap-3">
                <div className="w-40 md:w-full aspect-[3/4] bg-white rounded-2xl shadow-sm border border-[#EBE5DE] relative overflow-hidden flex items-center justify-center p-4">
                    <svg viewBox="0 0 100 120" className="w-full h-full">
                        <path d="M20,15 Q50,5 80,15 Q88,40 85,80 Q90,110 50,115 Q10,110 15,80 Q12,40 20,15 Z" fill="#FDFBF9" stroke="#E5DFD9" strokeWidth="2" />
                        <path d="M40,25 Q35,60 40,100 L32,95 Q25,60 32,25 Z" fill="#A67C52" opacity="0.7" />
                        <path d="M60,25 Q65,60 60,100 L68,95 Q75,60 68,25 Z" fill="#A67C52" opacity="0.7" />
                        <path d="M42,60 L58,60" stroke="#C18C5D" strokeWidth="1.5" strokeDasharray="2 2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
                    </svg>
                    <div className="absolute bottom-3 bg-[#FFF0F0] px-2 py-0.5 rounded-full shadow-sm text-[10px] text-[#C18C5D] font-bold border border-[#F2D7D5]">腹直肌分離</div>
                </div>
                <p className="font-bold text-[#4A4238] text-sm">生產後</p>
            </div>
        </div>
    );
};

// 課程介紹頁面 (IntroView)
const IntroView = ({ onBookNow }) => (
    <div className="animate-fade-in space-y-16 pb-20">
        
        {/* 1. Hero Image & Banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl group">
            <div className="aspect-[4/3] md:aspect-[21/9] w-full bg-gray-200 relative">
                <img 
                    src={getDriveImage(IMAGES.HERO)}
                    alt="俏媽咪專業團隊" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 object-center"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#4A4238]/90 via-[#4A4238]/30 to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 text-white">
                <div className="inline-flex items-center gap-2 bg-[#B08D55] px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold tracking-widest mb-2 md:mb-4 shadow-lg">
                    <Sparkles size={14} fill="currentColor" />
                    <span>TOP RATED TEAM IN TAIWAN</span>
                </div>
                <h2 className="text-2xl md:text-5xl font-serif font-bold tracking-wider leading-tight mb-2 md:mb-3 drop-shadow-lg">
                    全台指名度最高的團隊<br/>
                    <span className="text-lg md:text-3xl font-light opacity-90">媽媽肚回歸專家</span>
                </h2>
                <p className="text-[#F2EEE9] text-sm md:text-base tracking-[0.15em] font-medium border-l-4 border-[#B08D55] pl-4 mt-2">
                    選擇俏媽咪，讓妳成為無懼俏媽咪
                </p>
            </div>
        </div>

        {/* 2. Michelle 親身體驗見證 */}
        {IMAGES.MICHELLE_EXPERIENCE ? (
             <div className="bg-white rounded-2xl border border-[#F2EEE9] shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2 aspect-[4/3] md:aspect-auto bg-gray-100 relative">
                    <img src={getDriveImage(IMAGES.MICHELLE_EXPERIENCE)} alt="Michelle Experience" className="w-full h-full object-cover" onContextMenu={(e) => e.preventDefault()} draggable={false}/>
                    <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold text-[#B08D55] shadow-sm">
                        FOUNDER'S STORY
                    </div>
                </div>
                <div className="p-6 md:p-10 flex flex-col justify-center">
                    <Quote size={32} className="text-[#B08D55] mb-4 opacity-20" />
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-[#4A4238] mb-4">Michelle 親身體驗見證</h3>
                    <p className="text-[#6B635B] text-sm leading-8 tracking-wide font-light mb-6 text-justify">
                        「產後的身體變化，連我自己都感到焦慮。但透過專業團隊的調理，我不僅找回了腰線，更找回了自信。這是一套我親身實證有效，才敢推薦給妳們的課程。」
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#EBE5DE] rounded-full overflow-hidden flex items-center justify-center">
                             <UserCheck className="w-6 h-6 text-[#9A8F85]" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#4A4238]">Michelle</p>
                            <p className="text-[10px] text-[#9A8F85]">一寶媽咪 產後六個月</p>
                        </div>
                    </div>
                </div>
             </div>
        ) : null}

        {/* 2.5 團購主見證 */}
        {IMAGES.KOL_BA ? (
             <div className="bg-white rounded-2xl border border-[#F2EEE9] shadow-sm overflow-hidden p-6 md:p-10 space-y-6">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-[#FAF8F6] px-3 py-1 rounded-full text-[10px] text-[#8D7F76] font-bold tracking-widest uppercase mb-3">
                        <Star size={12} className="text-[#B08D55]" fill="currentColor"/>
                        Real Result
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-[#4A4238]">團購主親身實證</h3>
                    <p className="text-[#9A8F85] text-xs mt-2 tracking-wide">絕無修圖，真實呈現課程效果</p>
                </div>
                <div className="rounded-xl overflow-hidden shadow-md border border-[#EBE5DE]">
                    <img 
                        src={getDriveImage(IMAGES.KOL_BA)} 
                        alt="團購主BA圖" 
                        className="w-full h-auto object-cover"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                    />
                </div>
             </div>
        ) : null}

        {/* 2.6 藝人網紅欽點首選 */}
        {IMAGES.CELEBRITY_CHOICE && (
             <div className="bg-[#FAF8F6] rounded-2xl border border-[#F2EEE9] shadow-sm overflow-hidden p-6 md:p-10 flex flex-col items-center gap-6">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-[#4A4238] text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 shadow-md">
                        <Crown size={12} fill="currentColor"/>
                        Celebrity's Choice
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-[#4A4238]">藝人網紅欽點首選</h3>
                </div>
                <div className="w-full rounded-xl overflow-hidden shadow-md border-2 border-white">
                    <img 
                        src={getDriveImage(IMAGES.CELEBRITY_CHOICE)} 
                        alt="藝人網紅欽點首選" 
                        className="w-full h-auto object-cover"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                    />
                </div>
             </div>
        )}

        {/* 3. 最懂妳的 3 大優勢 */}
        <div className="space-y-8">
            <div className="text-center px-4">
                <p className="text-[#8D7F76] text-xs font-bold tracking-[0.2em] uppercase mb-2">WHY CHOOSE US</p>
                <h3 className="text-xl md:text-2xl font-serif font-bold text-[#4A4238] tracking-widest text-balance">
                    挑剔的你也會愛上 <br className="md:hidden" /><span className="text-[#B08D55]">—</span> 最懂妳的3大優勢
                </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { icon: Feather, title: "免侵入式", desc: "不必挨刀、無傷口，安全舒適的純手技修復。" },
                    { icon: Award, title: "專業師資", desc: "物理治療師陣容，聯合授課、嚴格考核通過。" },
                    { icon: Car, title: "到府及定點服務", desc: "提供到府服務及鄰近工作室，免去媽咪繁瑣奔波。" }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-[#F2EEE9] shadow-sm flex flex-col items-center text-center hover:border-[#D4B08C] transition-colors group">
                        <div className="bg-[#FAF8F6] p-4 rounded-full mb-4 group-hover:bg-[#4A4238] transition-colors">
                            <item.icon size={28} className="text-[#B08D55] group-hover:text-white transition-colors" />
                        </div>
                        <h4 className="text-lg font-bold text-[#4A4238] mb-2">{item.title}</h4>
                        <p className="text-sm text-[#6B635B] leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* 2. 腹直肌分離圖解 */}
        <div className="text-center space-y-10 pt-8 border-t border-[#E5DFD9]">
            <div className="space-y-2 px-4">
                <h3 className="text-lg font-bold text-[#4A4238] tracking-widest uppercase text-opacity-60">The Reason</h3>
                <h2 className="text-2xl font-serif font-bold text-[#4A4238]">為什麼會出現這些改變？</h2>
                <p className="text-[#B08D55] font-medium text-lg">原來是『產後腹直肌分離』</p>
            </div>

            {IMAGES.MUSCLE && IMAGES.MUSCLE.includes("http") ? (
                <div className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg border-4 border-white">
                    <img 
                        src={getDriveImage(IMAGES.MUSCLE)} 
                        alt="腹直肌分離圖解" 
                        className="w-full h-auto"
                        onContextMenu={(e) => e.preventDefault()}
                        draggable={false}
                        onError={(e) => { e.target.style.display='none'; }} 
                    />
                </div>
            ) : (
                <DiastasisRectiDiagram />
            )}
            
            <div className="bg-[#FAF8F6] p-5 rounded-xl text-sm text-[#6B635B] leading-relaxed max-w-2xl mx-auto border border-[#F2EEE9] text-justify md:text-center">
                <Info size={16} className="inline mr-2 text-[#B08D55] mb-0.5"/>
                生產後，分離的肌肉難以自動歸位，導致內臟下垂與小腹凸出。透過專業手技調理，我們能協助腹直肌歸位，改善腰痠背痛與體態問題。
            </div>
        </div>

        {/* 3. 獨家回歸，輕盈有緻 (2x2 Grid) */}
        <div className="space-y-8 pt-8 border-t border-[#E5DFD9]">
            <div className="text-center">
                 <h3 className="text-xl md:text-2xl font-serif font-bold text-[#4A4238] tracking-widest flex items-center justify-center gap-2 flex-wrap">
                    <span className="text-[#B08D55]">▼</span> 獨家回歸，輕盈有緻 <span className="text-[#B08D55]">▼</span>
                </h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {[
                    { icon: Sparkles, title: "緊緻精油按摩", desc: "深層放鬆肌肉、釋放壓力、重塑體態。" },
                    { icon: UserCheck, title: "獨家深層手技", desc: "深層筋絡技法、修復定點核心。" },
                    { icon: ShieldCheck, title: "御用古法紮肚", desc: "使用高規低敏、嬰兒用紗布材質，穩固不移位。" },
                    { icon: Activity, title: "腹式呼吸引導", desc: "傳授腹式呼吸、核心運動的關鍵要點。" }
                ].map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-[#F2EEE9] shadow-sm hover:shadow-md transition-all flex items-start gap-4 group">
                        <div className="bg-[#FAF8F6] p-3 rounded-full group-hover:bg-[#4A4238] transition-colors flex-shrink-0">
                             <item.icon size={24} className="text-[#B08D55] group-hover:text-white transition-colors"/>
                        </div>
                        <div>
                            <h3 className="font-bold text-[#4A4238] text-lg mb-2 font-serif tracking-wide">{item.title}</h3>
                            <p className="text-[#6B635B] text-sm leading-relaxed tracking-wide">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 4. 粉絲專屬優惠卡片 */}
        <div className="bg-gradient-to-br from-[#FFFBF7] to-white rounded-2xl p-8 md:p-12 border border-[#F2EEE9] shadow-md relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-[#B08D55]/10 rounded-full blur-3xl"></div>
             
             <div className="text-center mb-10 relative z-10">
                <h3 className="text-xl md:text-3xl font-serif font-bold text-[#4A4238] tracking-widest flex items-center justify-center gap-3 flex-wrap">
                    <Gift className="text-[#B08D55]" size={28} />
                    Michelle 粉絲專屬優惠
                </h3>
                <p className="text-[#8D7F76] mt-3">
                    現場確認升級包堂，即享獨家折扣價！
                </p>
             </div>

             <div className="grid md:grid-cols-2 gap-8 relative z-10">
                <div className="bg-white p-8 rounded-2xl border border-[#EBE5DE] shadow-sm flex flex-col items-center hover:border-[#B08D55] transition-all duration-300 group hover:-translate-y-1">
                    <div className="text-xs font-bold text-[#9A8F85] tracking-[0.2em] uppercase mb-2">PLAN A</div>
                    <div className="text-xl font-bold text-[#4A4238] mb-4 group-hover:text-[#B08D55] transition-colors">5 堂調理課程</div>
                    <div className="flex items-baseline gap-3"><span className="text-4xl font-serif font-bold text-[#B08D55]">$15,000</span><span className="text-sm text-[#999] line-through decoration-1">$16,000</span></div>
                    <div className="mt-4 text-xs text-[#B08D55] bg-[#FFF8F0] px-4 py-1.5 rounded-full font-bold tracking-wide">現省 $1,000</div>
                </div>
                <div className="bg-white p-8 rounded-2xl border-2 border-[#D4B08C] shadow-lg flex flex-col items-center relative group transform md:scale-105">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#4A4238] text-white text-[10px] px-4 py-1 rounded-full tracking-[0.15em] font-bold shadow-md whitespace-nowrap">BEST VALUE</div>
                    <div className="text-xs font-bold text-[#9A8F85] tracking-[0.2em] uppercase mb-2">PLAN B</div>
                    <div className="text-xl font-bold text-[#4A4238] mb-4">10 堂調理課程</div>
                    <div className="flex items-baseline gap-3"><span className="text-4xl font-serif font-bold text-[#B08D55]">$26,000</span><span className="text-sm text-[#999] line-through decoration-1">$28,000</span></div>
                      <div className="mt-4 text-xs text-[#B08D55] bg-[#FFF8F0] px-4 py-1.5 rounded-full font-bold tracking-wide">現省 $2,000</div>
                </div>
             </div>
             <p className="text-center text-xs text-[#8D7F76] mt-8 leading-relaxed bg-[#F5F2EF] p-4 rounded-xl mx-auto max-w-lg border border-[#EBE5DE] text-justify md:text-center">
                此為現場包堂優惠價格。今日僅需預付 <strong>$2,800</strong> 體驗單堂課程，現場滿意再決定是否升級包堂，無壓力體驗！
             </p>
        </div>

        {/* 7. QA Section */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-[#EBE5DE] space-y-10">
            <div className="flex items-center gap-3 border-b border-[#EBE5DE] pb-6 mb-6">
                <HelpCircle size={28} className="text-[#B08D55]"/>
                <h3 className="text-2xl font-serif font-bold text-[#4A4238] tracking-widest">Q&A 常見問題</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-x-16 gap-y-12">
                {QA_LIST.map((qa, idx) => (
                    <div key={idx} className="space-y-3 group">
                        <div className="flex items-start gap-4">
                            <span className="text-5xl font-serif text-[#EBE5DE] font-bold leading-none -mt-2 group-hover:text-[#D4B08C] transition-colors">{qa.id}</span>
                            <div>
                                <h4 className="text-[#4A4238] font-bold text-base tracking-wide mb-3 leading-relaxed">{qa.q}</h4>
                                <p className="text-[#6B635B] text-sm leading-8 tracking-wide font-light border-l-2 border-[#F2EEE9] pl-4 text-justify">{qa.a}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="text-center space-y-6 pt-8">
            <p className="text-[#B08D55] font-serif font-bold text-xl tracking-widest">找回產前的自信與美麗</p>
            <button onClick={onBookNow} className="bg-[#4A4238] text-white px-14 py-4 rounded-full font-bold tracking-[0.25em] shadow-xl shadow-[#4A4238]/20 hover:bg-[#2C2620] hover:scale-105 transition-all flex items-center gap-4 mx-auto">
                立即預約體驗 <ArrowRight size={18}/>
            </button>
        </div>
    </div>
);

// 頁面 2: 好評推薦 (CaseView)
const CaseView = ({ onBookNow }) => {
    return (
        <div className="animate-fade-in space-y-16 pb-20">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-serif font-bold text-[#4A4238] tracking-widest">好評推薦</h2>
                <div className="w-16 h-1 bg-[#B08D55] mx-auto rounded-full"></div>
                <p className="text-[#9A8F85] text-[10px] font-bold tracking-[0.3em] uppercase">TESTIMONIALS</p>
                <p className="text-[#8D7F76] text-sm tracking-wide mt-2">見證她們的改變，妳也可以。</p>
            </div>

            {/* 口碑好評區 (文字) */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6 px-2">
                    <MessageCircle size={20} className="text-[#B08D55]" />
                    <h3 className="text-lg font-bold text-[#4A4238] tracking-wide">媽咪真實回饋</h3>
                </div>
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {REVIEWS.map((review, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-[#F2EEE9] shadow-sm break-inside-avoid hover:shadow-md transition-shadow relative">
                            <Quote size={24} className="text-[#EBE5DE] absolute top-4 right-4" />
                            <div className="mb-4">
                                <h4 className="font-bold text-[#4A4238] text-sm">{review.name}</h4>
                            </div>
                            <p className="text-[#6B635B] text-sm leading-relaxed text-justify whitespace-pre-line font-light">
                                {review.content}
                            </p>
                            <div className="mt-4 flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} className="text-[#D4B08C] fill-current" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-[#FAF8F6] p-8 md:p-12 rounded-2xl border border-[#EBE5DE] text-center space-y-6 mt-16">
                <h3 className="text-2xl font-serif font-bold text-[#4A4238] tracking-wide">準備好開始妳的旅程了嗎？</h3>
                <p className="text-[#6B635B] text-sm max-w-lg mx-auto leading-relaxed">
                    每個人的身體都是獨一無二的，讓我們為您量身打造最適合的修復計畫。<br/>
                    現在預約，開啟自信媽咪的第一步。
                </p>
                <button 
                    onClick={onBookNow}
                    className="bg-[#B08D55] text-white px-12 py-4 rounded-full font-bold tracking-[0.2em] shadow-lg hover:bg-[#8D6B40] hover:scale-105 transition-all inline-flex items-center gap-3"
                >
                    預約諮詢 <ArrowRight size={18}/>
                </button>
            </div>
        </div>
    );
};

// 全螢幕 Loading 組件
const LoadingOverlay = () => (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FDFBF9]/90 backdrop-blur-sm animate-fade-in">
        <div className="bg-white p-10 rounded-2xl shadow-2xl border border-[#EBE5DE] flex flex-col items-center space-y-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-[#EBE5DE] border-t-[#B08D55] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Heart size={20} className="text-[#B08D55] animate-pulse fill-current" />
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-[#4A4238] font-bold text-xl tracking-widest mb-2">Processing</h3>
                <p className="text-[#9A8F85] text-sm font-medium tracking-wide">正在傳送訂單資料，請稍候...</p>
            </div>
        </div>
    </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('intro');
  const [cart, setCart] = useState({ 1: 1 });
  const [isSystemClosed, setIsSystemClosed] = useState(false);
  const [systemMessage, setSystemMessage] = useState("");
  const [studios, setStudios] = useState([]); // 統一使用一個 studios 狀態
  const [studiosLoaded, setStudiosLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState({
    birthType: 'natural',
    cSectionStatus: '',
    otherSurgery: 'no',
    otherSurgeryDetail: '',
    productionDate: '',
    postpartumDuration: '',
    hives: 'no',
    history: 'no',
    historyDetail: '',
    locationType: 'studio',
    address: '',
    studioLocationIndex: '',
    name: '',
    phone: '',
    email: '', 
    lineName: '',
    remittanceDate: '',
    last5Digits: '', 
    note: ''
  });

  const [errors, setErrors] = useState({});
  const [agreements, setAgreements] = useState({
    fixedLocation: false,
    trialFeeOnly: false,
    addLine: false
  });

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); 
  const [orderText, setOrderText] = useState('');
  const [copied, setCopied] = useState(false);
  const [accountCopied, setAccountCopied] = useState(false);
  const [modalAccountCopied, setModalAccountCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [agreedNoNote, setAgreedNoNote] = useState(false);

  // ===== 設定網頁標題 =====
  useEffect(() => {
    document.title = SITE_TITLE;
  }, []);

 // ===== 讀取據點清單 (已修正重複 fetch 與自動關閉檢查) =====
  useEffect(() => {
    async function loadStudios() {
      // 構建 API URL
      const apiUrl = import.meta.env.VITE_STUDIO_API_URL || `${GOOGLE_SCRIPT_URL}?action=studios`;
      
      try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        // 🛑 檢查系統是否關閉
        if (data.error === "system_closed" || (data.result === "error" && data.message)) {
            setIsSystemClosed(true);
            setSystemMessage(data.message || "活動已結束");
            return; // 🛑 碰到關閉就直接停住，不往下執行
        }

        // --- 若系統未關閉，繼續處理據點資料 ---
        
        // 相容兩種回傳格式 (直接 Array 或 {studios: []})
        const list = Array.isArray(data) ? data : (Array.isArray(data?.studios) ? data.studios : []);
        
        // 格式化資料
        const normalized = list
          .map((s) => ({
            status: String(s["是否開放"] ?? s.status ?? "是").trim(),
            name: String(s["顯示名稱"] ?? s.name ?? "").trim(),
            region: String(s["縣市"] ?? s.region ?? "").trim(),
            address: String(s["地址"] ?? s.address ?? "").trim(),
            openTime: String(s["開放時間"] ?? s.openTime ?? "").trim(),
            note: String(s["備註"] ?? s.note ?? "").trim(),
            mapQuery: String(s["地圖查詢字"] ?? s.mapQuery ?? "").trim(),
            sort: Number(s["排序"] ?? s.sort ?? 0),
          }))
          .filter((s) => s.name && s.status !== "否") // 過濾掉不開放的
          .sort((a, b) => (a.sort || 0) - (b.sort || 0));

        if (normalized.length > 0) {
           setStudios(normalized);
        } else {
           console.warn("API 回傳空資料，使用內建清單");
           setStudios(DEFAULT_STUDIOS);
        }
      } catch (err) {
        console.error("讀取據點失敗，切換至內建清單", err);
        // API 失敗時，使用預設清單作為備案，避免白屏
        setStudios(DEFAULT_STUDIOS);
      } finally {
        setStudiosLoaded(true);
      }
    }

    loadStudios();
  }, []); // 只執行一次

  // 取得當前選中的工作室物件
  const selectedStudio = 
    userInfo.studioLocationIndex !== "" && studios[Number(userInfo.studioLocationIndex)] 
    ? studios[Number(userInfo.studioLocationIndex)] 
    : null;

  const isPausedStudio = !!selectedStudio && selectedStudio.status === "暫停";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  // ===== 計算日期與時間 =====
  useEffect(() => {
    if (!userInfo.productionDate || userInfo.birthType === 'none') {
      setUserInfo(prev => ({ ...prev, postpartumDuration: '' }));
      return;
    }
    const date = new Date(userInfo.productionDate);
    const now = new Date();
    
    if (userInfo.birthType === 'pregnant') {
      const diffTime = date - now;
      if (diffTime < 0) {
        setUserInfo(prev => ({ ...prev, postpartumDuration: '預產期已過' }));
      } else {
        const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const weeksPregnant = 40 - Math.floor(daysUntilDue / 7);
        setUserInfo(prev => ({ ...prev, postpartumDuration: `目前懷孕約 ${weeksPregnant} 週` }));
      }
      return;
    }
    if (now < date) {
        setUserInfo(prev => ({ ...prev, postpartumDuration: '日期在未來' }));
        return;
    }
    let years = now.getFullYear() - date.getFullYear();
    let months = now.getMonth() - date.getMonth();
    if (months < 0) { years--; months += 12; }
    if (years === 0 && months === 0) {
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        setUserInfo(prev => ({ ...prev, postpartumDuration: `產後 ${diffDays} 天` }));
    } else {
        let durationStr = '產後 ';
        if (years > 0) durationStr += `${years} 年 `;
        if (months > 0) durationStr += `${months} 個月`;
        setUserInfo(prev => ({ ...prev, postpartumDuration: durationStr }));
    }
  }, [userInfo.productionDate, userInfo.birthType]);

  const toggleProduct = (productId) => {
    if (productId === 1) return; // 鎖定的商品不能取消
    setCart(prev => {
      const isSelected = !!prev[productId];
      if (isSelected) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [productId]: 1 };
      }
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = PRODUCTS.find(p => p.id === parseInt(id));
      return sum + (product ? product.price * qty : 0);
    }, 0);
  };

  const generateOrderText = () => {
    const total = calculateTotal();
    let itemsText = '';
    Object.entries(cart).forEach(([id, qty]) => {
      const product = PRODUCTS.find(p => p.id === parseInt(id));
      if (product) {
        itemsText += `▫️ ${product.name} $${product.price}\n`;
      }
    });

    let locationInfo = '';
    if (userInfo.locationType === 'home') {
      locationInfo = `到府服務：${userInfo.address}`;
    } else {
      const studio = selectedStudio;
      if (studio) {
          const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studio.address)}`;
          
          // ✨ 新增：如果有備註 (例如: 禁止攜伴)，就把它加進去
          const studioNote = studio.note ? `\n據點備註：${studio.note}` : "";
          
          // ✨ 修改：把 studioNote 變數塞進去
          locationInfo = `工作室：[${studio.region}] ${studio.name}\n地址：${studio.address}${studioNote}\n導航：${mapUrl}`;
      } else {
          locationInfo = '工作室：未選擇';
      }
    }

    const birthTypeMap = {
      natural: '自然產',
      'c-section': '剖腹產',
      pregnant: '孕期中',
      none: '無生產經驗'
    };

    let dateInfo = '';
    if (userInfo.birthType === 'pregnant') {
      dateInfo = `預產期：${userInfo.productionDate} (${userInfo.postpartumDuration})`;
    } else if (userInfo.birthType === 'none') {
      dateInfo = `生產日期：無生產經驗`;
    } else {
      dateInfo = `最後生產日期：${userInfo.productionDate}\n(${userInfo.postpartumDuration})`;
    }

    const otherSurgeryInfo = userInfo.otherSurgery === 'yes' 
      ? `有 (${userInfo.otherSurgeryDetail || '未填寫'})` 
      : '無';

    return `【Michelle專屬 - 媽媽肚回歸體驗】
------------------------
📝 基本資料
姓名：${userInfo.name}
電話：${userInfo.phone}
Email：${userInfo.email}
LINE名稱：${userInfo.lineName}
------------------------
🏥 身體狀況
生產方式：${birthTypeMap[userInfo.birthType]}
${userInfo.birthType === 'c-section' ? `剖腹傷口狀況：${userInfo.cSectionStatus || '未填寫'}` : ''}
腹部手術史：${otherSurgeryInfo}
${dateInfo}
尋麻疹體質：${userInfo.hives === 'yes' ? '有' : '無'}
婦科/腸胃病史：${userInfo.history === 'yes' ? `有 (${userInfo.historyDetail})` : '無'}
------------------------
📍 服務地點
${locationInfo}
(已確認固定地點不更換)
------------------------
💰 匯款資訊
匯款日期：${userInfo.remittanceDate}
匯款後五碼：${userInfo.last5Digits}
總金額：$${total}
(已確認僅付體驗費)
------------------------
🛒 訂購內容
${itemsText}
備註：${userInfo.note || '無'}
------------------------
我已閱讀注意事項，會主動加官方LINE傳送截圖核對！`;
  };

  // ===== 送出表單到 Google Sheets =====
  const submitToGoogleSheets = async (data) => {
    if (!GOOGLE_SCRIPT_URL) {
        console.error("Missing Google Script URL");
        return;
    }
    
    const formData = new FormData();
    // 將所有 user data 加入 formData
    for (const key in data) {
        formData.append(key, data[key]);
    }

    // 處理購物車內容字串
    const cartItems = Object.entries(cart).map(([id]) => {
        const p = PRODUCTS.find(prod => prod.id === parseInt(id));
        return p ? p.name : '';
    }).join(', ');
    
    formData.append('cartItems', cartItems);
    formData.append('totalAmount', calculateTotal());

    // 處理完整地址資訊
    if (data.locationType === 'studio' && data.studioLocationIndex !== '') {
       // ⚠️ 這裡修正了原本的錯誤：直接使用 state 中的 studios，而不是未定義的 studiosList
       const studio = studios[data.studioLocationIndex]; 
       if (studio) {
          formData.append('fullLocation', `[${studio.region}] ${studio.name}`);
       } else {
          formData.append('fullLocation', 'Unknown Studio');
       }
    } else {
       formData.append('fullLocation', data.address);
    }
    
    // ✅ 關鍵參數：讓後端知道寫入哪張表，以及通過驗證
    formData.append('sheetName', SHEET_NAME_BOOKING);
    formData.append('apiKey', API_KEY);
    formData.append('clientId', getClientId());
    formData.append('hp', ""); // 蜜罐欄位保持空白

    try {
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Google Script 必須使用 no-cors
        });
        console.log("Submitted successfully");
    } catch (error) {
        console.error("Error submitting to Google Sheets", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    if (userInfo.locationType === 'studio' && userInfo.studioLocationIndex === '') {
        newErrors.studioLocation = "請選擇一個工作室地點"; isValid = false;
    }
    if (userInfo.locationType === 'home' && !userInfo.address) {
        newErrors.address = "請輸入到府地址"; isValid = false;
    }
    if (userInfo.birthType === 'c-section' && !userInfo.cSectionStatus) {
        newErrors.cSectionStatus = "請簡述傷口狀況"; isValid = false;
    }
    if (userInfo.otherSurgery === 'yes' && !userInfo.otherSurgeryDetail) {
        newErrors.otherSurgeryDetail = "請簡述手術名稱或狀況"; isValid = false;
    }
    if (userInfo.birthType !== 'none' && !userInfo.productionDate) {
        newErrors.productionDate = "請選擇生產日期或預產期"; isValid = false;
    }
    if (userInfo.history === 'yes' && !userInfo.historyDetail) {
        newErrors.historyDetail = "請簡述病史"; isValid = false;
    }
    if (!userInfo.name) { newErrors.name = "請填寫姓名"; isValid = false; }
    if (!userInfo.phone) { newErrors.phone = "請填寫電話"; isValid = false; }
    if (!userInfo.lineName) { newErrors.lineName = "請填寫 LINE 名稱"; isValid = false; }
    if (!userInfo.remittanceDate) { newErrors.remittanceDate = "請選擇匯款日期"; isValid = false; }
    if (!userInfo.last5Digits) { newErrors.last5Digits = "請填寫匯款後五碼"; isValid = false; }
    
    if (!agreements.fixedLocation || !agreements.trialFeeOnly || !agreements.addLine) {
        newErrors.agreements = "請勾選所有確認事項"; isValid = false;
    }
    setErrors(newErrors);
    if (!isValid) {
        const formElement = document.getElementById('booking-form');
        if(formElement) formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    return isValid;
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const text = generateOrderText();
    setOrderText(text);
    setIsModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!paymentConfirmed) {
        alert("請勾選確認已完成匯款");
        return;
    }
    setIsModalOpen(false);
    setIsSubmitting(true);
    await submitToGoogleSheets(userInfo);
    setHasSubmitted(true); 
    setIsSubmitting(false);
    setIsSuccessModalOpen(true);
  };

  const handleCopy = () => {
    const textArea = document.createElement("textarea");
    textArea.value = orderText;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        navigator.clipboard.writeText(orderText).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
      }
    } catch (err) {
      alert("瀏覽器不支援自動複製，請手動複製。");
    }
    document.body.removeChild(textArea);
  };

  const handleCopyAccount = (isModal = false) => {
    const account = "242100072687";
    const textArea = document.createElement("textarea");
    textArea.value = account;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        if (isModal) {
            setModalAccountCopied(true);
            setTimeout(() => setModalAccountCopied(false), 2000);
        } else {
            setAccountCopied(true);
            setTimeout(() => setAccountCopied(false), 2000);
        }
      } else {
        navigator.clipboard.writeText(account).then(() => {
            if (isModal) {
                setModalAccountCopied(true);
                setTimeout(() => setModalAccountCopied(false), 2000);
            } else {
                setAccountCopied(true);
                setTimeout(() => setAccountCopied(false), 2000);
            }
        });
      }
    } catch (err) {
      alert("瀏覽器不支援自動複製，請手動複製");
    }
    document.body.removeChild(textArea);
  };

  const openGoogleMap = () => {
    if (userInfo.studioLocationIndex !== '') {
      const studio = selectedStudio;
      const query = encodeURIComponent(studio.address);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const total = calculateTotal();
  
  // 顯示固定地點同意書的條件
  const showFixedLocationAgreement = 
    (userInfo.locationType === 'studio' && userInfo.studioLocationIndex !== '') || 
    (userInfo.locationType === 'home' && userInfo.address.length > 2);

  return (
    <div className="min-h-screen bg-[#FDFBF9] font-sans text-[#4A4238] antialiased leading-relaxed break-words">
      
      {/* 🛑 系統關閉/活動結束公告 (這裡就是新加入的感謝畫面) */}
      {isSystemClosed && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#FDFBF9] px-4 py-12 text-center animate-fade-in">
            <div className="w-24 h-24 bg-[#FAF8F6] rounded-full flex items-center justify-center mb-6 shadow-inner">
                {/* 溫暖的愛心圖示 */}
                <Heart size={48} className="text-[#B08D55] fill-current" />
            </div>
            
            <h2 className="text-sm font-bold text-[#9A8F85] mb-6 tracking-[0.3em] uppercase">
                THANK YOU
            </h2>

            <div className="w-16 h-1 bg-[#B08D55] rounded-full mb-8"></div>

            {/* 👇 修改重點：加入 text-balance 讓斷句變漂亮，並調整手機版字體 */}
            <p 
                className="text-lg md:text-2xl font-serif font-bold text-[#4A4238] max-w-2xl leading-relaxed whitespace-pre-line"
                style={{ textWrap: "balance" }} 
            >
                {systemMessage}
            </p>

            <div className="mt-16 text-xs text-[#9A8F85] tracking-widest uppercase">
                Michelle's Selection x 俏媽咪專業孕產照護團隊 
            </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isSubmitting && <LoadingOverlay />}

      {/* Header */}
      <header className="bg-[#FDFBF9]/90 sticky top-0 z-30 border-b border-[#E5DFD9] backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-5 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-lg md:text-xl font-serif font-bold tracking-widest text-[#4A4238] flex items-center gap-2">
              <span className="text-[#B08D55]"><Heart size={18} fill="currentColor" /></span>
              {/* ✅ 修改 1：頁面標題 */}
              Michelle's 專屬媽媽肚回歸優惠
            </h1>
            <p className="text-[11px] md:text-sm text-[#8C8077] mt-1.5 tracking-wider font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
               <span className="mr-1">✕</span> 俏媽咪專業孕產照護團隊 <span className="uppercase text-[10px] md:text-xs font-normal">Prettymami Postpartum Care</span>
            </p>
          </div>

          {/* ✅ 修改 2：Grid 排版，三個按鈕寬度平均分配 (grid-cols-3) */}
          <div className="grid grid-cols-3 bg-[#EBE5DE] p-1 rounded-full shadow-inner w-full max-w-md mx-auto md:mx-0">
             <button onClick={() => setActiveTab('intro')} className={`py-2 rounded-full text-xs font-bold tracking-widest transition-all flex items-center justify-center ${activeTab === 'intro' ? 'bg-[#4A4238] text-white shadow-md' : 'text-[#8D7F76] hover:text-[#4A4238]'}`}>課程介紹</button>
             <button onClick={() => setActiveTab('cases')} className={`py-2 rounded-full text-xs font-bold tracking-widest transition-all flex items-center justify-center ${activeTab === 'cases' ? 'bg-[#4A4238] text-white shadow-md' : 'text-[#8D7F76] hover:text-[#4A4238]'}`}>好評推薦</button>
             <button onClick={() => setActiveTab('booking')} className={`py-2 rounded-full text-xs font-bold tracking-widest transition-all flex items-center justify-center ${activeTab === 'booking' ? 'bg-[#4A4238] text-white shadow-md' : 'text-[#8D7F76] hover:text-[#4A4238]'}`}>立即預約</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 pb-40">
         {activeTab === 'intro' && <IntroView onBookNow={() => setActiveTab('booking')} />}
         {activeTab === 'cases' && <CaseView onBookNow={() => setActiveTab('booking')} />}
         {activeTab === 'booking' && (
            <div className="animate-fade-in space-y-10" id="booking-form">
                
                {/* 1. 選擇服務 */}
                <section>
                    <div className="flex items-baseline gap-3 mb-5 pl-1">
                        <span className="text-3xl font-serif text-[#D6D1C9] font-bold">01</span>
                        <div>
                            {/* ✅ 修改 3：精選療程 -> 精選課程 */}
                            <h2 className="text-lg font-bold tracking-wide text-[#4A4238]">精選課程</h2>
                            <span className="text-[10px] font-bold tracking-[0.15em] text-[#9A8F85] uppercase">Services</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        {PRODUCTS.map(product => {
                        const isSelected = !!cart[product.id];
                        return (
                            <div key={product.id} onClick={() => toggleProduct(product.id)} className={`group relative p-6 rounded-xl cursor-pointer transition-all duration-300 border ${isSelected ? 'bg-white border-[#B08D55] shadow-md' : 'bg-white border-transparent hover:border-[#EBE5DE] shadow-sm'} ${product.locked ? 'cursor-default' : ''}`}>
                                <div className="flex justify-between items-center gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className={`text-base font-bold tracking-wide ${isSelected ? 'text-[#4A4238]' : 'text-[#8D7F76]'}`}>{product.name}</h3>
                                            {product.tag && <span className={`text-[10px] px-2 py-0.5 tracking-wider font-bold uppercase rounded-sm ${isSelected ? 'bg-[#B08D55] text-white' : 'bg-[#F2EEE9] text-[#9A8F85]'}`}>{product.tag}</span>}
                                        </div>
                                        <p className="text-xs text-[#8D7F76] leading-relaxed font-medium">{product.description}</p>
                                        {product.note && <p className="text-[10px] text-[#9A8F85] mt-1">{product.note}</p>}
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className={`block text-lg font-serif font-bold ${isSelected ? 'text-[#B08D55]' : 'text-[#8D7F76]'}`}>${product.price.toLocaleString()}</span>
                                        {isSelected && <Check size={18} className="text-[#B08D55]" strokeWidth={3} />}
                                    </div>
                                </div>
                            </div>
                        );
                        })}
                    </div>
                </section>

                {/* 2. 身體評估 */}
                <section>
                    <div className="flex items-baseline gap-3 mb-5 pl-1">
                        <span className="text-3xl font-serif text-[#D6D1C9] font-bold">02</span>
                        <div>
                            <h2 className="text-lg font-bold tracking-wide text-[#4A4238]">專屬評估</h2>
                            <span className="text-[10px] font-bold tracking-[0.15em] text-[#9A8F85] uppercase">Assessment</span>
                        </div>
                    </div>
                    
                    <div className="space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-[#EBE5DE]">
                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-[#4A4238] tracking-wide">生產經驗/方式 <span className="text-[#C18C5D]">*</span></label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {['natural:自然產', 'c-section:剖腹產', 'pregnant:孕期中', 'none:無生產經驗'].map(opt => {
                                    const [val, label] = opt.split(':');
                                    return (
                                        <label key={val} className={`flex items-center justify-center py-3.5 rounded-lg transition-all cursor-pointer text-sm font-bold tracking-wide border ${userInfo.birthType === val ? 'bg-[#4A4238] border-[#4A4238] text-white shadow-md' : 'bg-white border-[#EBE5DE] text-[#9A8F85] hover:border-[#D6D1C9]'}`}>
                                            <input type="radio" name="birthType" value={val} checked={userInfo.birthType === val} onChange={e => setUserInfo({...userInfo, birthType: e.target.value})} className="hidden"/>
                                            {label}
                                        </label>
                                    )
                                })}
                            </div>
                        </div>

                        {userInfo.birthType === 'c-section' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">剖腹傷口狀況 <span className="text-[#C18C5D]">*</span></label>
                                <input type="text" value={userInfo.cSectionStatus} onChange={e => setUserInfo({...userInfo, cSectionStatus: e.target.value})} 
                                    className={`w-full px-4 py-3 bg-[#F9F7F5] rounded-lg outline-none text-[#4A4238] placeholder-[#C9BFB5] focus:ring-1 focus:ring-[#B08D55] transition-all font-medium border ${errors.cSectionStatus ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
                                    placeholder="請簡述：有無紅、腫、熱、痛、滲液" />
                                {errors.cSectionStatus && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.cSectionStatus}</p>}
                            </div>
                        )}

                        <div className="space-y-3">
                            <label className="block text-sm font-bold text-[#4A4238] tracking-wide">腹部手術史 <span className="text-[#C18C5D]">*</span></label>
                            <div className="flex gap-3">
                                {['yes:有', 'no:無'].map(opt => {
                                    const [val, label] = opt.split(':');
                                    return (
                                    <label key={val} className={`flex-1 flex items-center justify-center py-3 rounded-lg cursor-pointer transition-all text-sm font-bold border ${userInfo.otherSurgery === val ? 'bg-[#B08D55] border-[#B08D55] text-white shadow-sm' : 'bg-white border-[#EBE5DE] text-[#9A8F85] hover:border-[#D6D1C9]'}`}>
                                        <input type="radio" name="otherSurgery" value={val} checked={userInfo.otherSurgery === val} onChange={e => setUserInfo({...userInfo, otherSurgery: e.target.value})} className="hidden"/>
                                        {label}
                                    </label>
                                    )
                                })}
                            </div>
                            
                            {userInfo.otherSurgery === 'yes' && (
                                <div className="animate-fade-in mt-2">
                                    <input type="text" value={userInfo.otherSurgeryDetail} onChange={e => setUserInfo({...userInfo, otherSurgeryDetail: e.target.value})} 
                                    className={`w-full px-4 py-3 bg-[#F9F7F5] rounded-lg outline-none text-[#4A4238] placeholder-[#C9BFB5] focus:ring-1 focus:ring-[#B08D55] transition-all font-medium border ${errors.otherSurgeryDetail ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
                                    placeholder="請簡述手術名稱 (例如：盲腸炎、肌瘤手術...)" />
                                    {errors.otherSurgeryDetail && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.otherSurgeryDetail}</p>}
                                </div>
                            )}
                        </div>

                        {userInfo.birthType !== 'none' && (
                            <div className="animate-fade-in">
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">{userInfo.birthType === 'pregnant' ? '預產期' : '最後生產日期'} <span className="text-[#C18C5D]">*</span></label>
                                <div className="flex flex-col md:flex-row gap-3">
                                    <div className="relative flex-1">
                                        <input type="date" value={userInfo.productionDate} onChange={e => setUserInfo({...userInfo, productionDate: e.target.value})} 
                                            className={`w-full px-4 py-3 bg-[#F9F7F5] rounded-lg outline-none text-[#4A4238] focus:ring-1 focus:ring-[#B08D55] font-medium cursor-pointer appearance-none border ${errors.productionDate ? 'border-red-400 bg-red-50' : 'border-transparent'}`} />
                                        {errors.productionDate && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.productionDate}</p>}
                                    </div>
                                    {userInfo.postpartumDuration && (
                                        <div className="flex items-center gap-2 text-[#8C6B4A] bg-[#FFF8F0] px-4 py-3 rounded-lg border border-[#EBE5DE] shadow-sm whitespace-nowrap">
                                            <Clock size={16} />
                                            <span className="text-sm font-bold tracking-wide">{userInfo.postpartumDuration}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide">尋麻疹體質 <span className="text-[#C18C5D]">*</span></label>
                                <div className="flex gap-3">
                                    {['yes:有', 'no:無'].map(opt => {
                                        const [val, label] = opt.split(':');
                                        return (
                                            <label key={val} className={`flex-1 flex items-center justify-center py-3 rounded-lg cursor-pointer transition-all text-sm font-bold border ${userInfo.hives === val ? 'bg-[#4A4238] border-[#4A4238] text-white' : 'bg-white border-[#EBE5DE] text-[#9A8F85] hover:border-[#D6D1C9]'}`}>
                                                <input type="radio" name="hives" value={val} checked={userInfo.hives === val} onChange={e => setUserInfo({...userInfo, hives: e.target.value})} className="hidden"/>
                                                {label}
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide">婦科/腸胃病史 <span className="text-[#C18C5D]">*</span></label>
                                <div className="flex gap-3">
                                    {['yes:有', 'no:無'].map(opt => {
                                        const [val, label] = opt.split(':');
                                        return (
                                            <label key={val} className={`flex-1 flex items-center justify-center py-3 rounded-lg cursor-pointer transition-all text-sm font-bold border ${userInfo.history === val ? 'bg-[#4A4238] border-[#4A4238] text-white' : 'bg-white border-[#EBE5DE] text-[#9A8F85] hover:border-[#D6D1C9]'}`}>
                                                <input type="radio" name="history" value={val} checked={userInfo.history === val} onChange={e => setUserInfo({...userInfo, history: e.target.value})} className="hidden"/>
                                                {label}
                                            </label>
                                        )
                                    })}
                                </div>
                                {userInfo.history === 'yes' && (
                                    <>
                                        <input type="text" value={userInfo.historyDetail} onChange={e => setUserInfo({...userInfo, historyDetail: e.target.value})} 
                                            className={`w-full px-4 py-3 bg-[#F9F7F5] rounded-lg outline-none text-[#4A4238] placeholder-[#C9BFB5] focus:ring-1 focus:ring-[#B08D55] text-sm font-medium border ${errors.historyDetail ? 'border-red-400 bg-red-50' : 'border-transparent'}`} placeholder="請簡述婦科/腸胃病史" />
                                        {errors.historyDetail && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.historyDetail}</p>}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. 地點選擇 */}
                <section>
                    <div className="flex items-baseline gap-3 mb-5 pl-1">
                        <span className="text-3xl font-serif text-[#D6D1C9] font-bold">03</span>
                        <div><h2 className="text-lg font-bold tracking-wide text-[#4A4238]">預約地點</h2><span className="text-[10px] font-bold tracking-[0.15em] text-[#9A8F85] uppercase">Location</span></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        {['studio:工作室:STUDIO', 'home:到府服務:HOME VISIT'].map(opt => {
                            const [val, label, sub] = opt.split(':');
                            const Icon = val === 'studio' ? Building2 : Home;
                            return (
                                <div key={val} onClick={() => setUserInfo({...userInfo, locationType: val})} 
                                    className={`cursor-pointer rounded-lg p-6 md:p-8 transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center border-2 ${userInfo.locationType === val ? 'bg-[#4A4238] border-[#4A4238] text-white shadow-lg transform scale-[1.02]' : 'bg-white border-transparent text-[#9A8F85] hover:bg-[#F9F7F5] shadow-sm'}`}>
                                    <Icon size={28} strokeWidth={1.5} />
                                    <div><span className="block font-bold text-base tracking-wide">{label}</span><span className="text-[9px] opacity-70 tracking-widest uppercase">{sub}</span></div>
                                </div>
                            )
                        })}
                    </div>

                    {userInfo.locationType === 'studio' ? (
                        <div className="animate-fade-in space-y-4 bg-white p-6 rounded-lg shadow-sm border border-[#EBE5DE]">
                            <div className="relative group">
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">選擇工作室 <span className="text-[#C18C5D]">*</span></label>
                                <div className="relative">
                                    <select
                                      value={userInfo.studioLocationIndex}
                                      onChange={(e) =>
                                        setUserInfo({ ...userInfo, studioLocationIndex: e.target.value })
                                      }
                                      className={`w-full px-4 py-3 bg-[#FAF8F6] rounded-lg border focus:ring-2 focus:ring-[#C18C5D] focus:border-transparent transition-all appearance-none ${errors.studioLocation ? 'border-red-400 bg-red-50' : 'border-transparent'}`}
                                    >
                                      <option value="">請選擇地點...</option>
                                      {studios.map((s, idx) => {
                                        const paused = String(s.status || '').trim() === '暫停';
                                        return (
                                          <option key={idx} value={idx}>
                                            {paused ? `${s.name}（暫停預約）` : s.name}
                                          </option>
                                        );
                                      })}
                                    </select>

                                    {isPausedStudio && (
                                      <div className="mt-2 text-sm" style={{ color: "#999" }}>
                                        （暫停預約）此據點目前暫停預約，請改選其他據點
                                      </div>
                                    )}

                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9A8F85]"><ChevronDown size={18} /></div>
                                </div>
                                {errors.studioLocation && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.studioLocation}</p>}
                                <p className="text-[10px] text-[#9A8F85] mt-2 font-medium bg-[#FAF8F6] p-2 rounded inline-block">💡 註：部分工作室禁止攜伴，請參考選單內容。</p>
                            </div>
                            {selectedStudio && (
                                <div className="animate-slide-up mt-4 bg-[#F9F7F5] rounded-lg p-5 border-l-4 border-[#B08D55]">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 bg-[#EBE5DE] p-1.5 rounded-full text-[#8D7F76]"><MapPin size={18} /></div>
                                                <div><p className="text-base font-bold text-[#4A4238] tracking-wide">{selectedStudio.name}</p><p className="text-xs text-[#8D7F76] mt-1 font-medium">{selectedStudio.address}</p></div>
                                            </div>
                                            <button type="button" onClick={(e) => { e.preventDefault(); openGoogleMap(); }} className="flex items-center gap-1 text-[10px] font-bold text-[#B08D55] hover:bg-[#EBE5DE] px-3 py-1.5 rounded-full transition-colors uppercase tracking-widest border border-[#EBE5DE]"><MapIcon size={12} />MAP</button>
                                        </div>
                                        {selectedStudio.note && <div className="flex items-center gap-2 bg-[#FFF0F0] p-3 rounded-md border border-[#FFE0E0]"><AlertCircle size={16} className="text-rose-500 flex-shrink-0"/><p className="text-xs text-rose-700 font-bold tracking-wide">{selectedStudio.note}</p></div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-fade-in bg-white p-6 rounded-lg shadow-sm border border-[#EBE5DE]">
                            <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">到府地址 <span className="text-[#C18C5D]">*</span></label>
                            <div className="relative">
                                <input type="text" value={userInfo.address} onChange={e => setUserInfo({...userInfo, address: e.target.value})} 
                                className={`w-full px-4 py-3 bg-[#F5F2EF] rounded-lg outline-none text-[#4A4238] placeholder-[#C9BFB5] focus:ring-1 focus:ring-[#B08D55] focus:bg-white font-medium border ${errors.address ? 'border-red-400 bg-red-50' : 'border-transparent'}`} placeholder="請詳填完整地址" />
                                {errors.address && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.address}</p>}
                            </div>
                            <p className="text-[10px] text-[#9A8F85] mt-2 font-medium bg-[#FAF8F6] p-2 rounded inline-block">⚠️ 偏遠地區 (山區、南投、屏東、台東) 將酌收車馬費或無法服務</p>
                        </div>
                    )}
                    
                    {showFixedLocationAgreement && (
                        <div className="animate-slide-up mt-6">
                            <label className={`flex items-center gap-3 cursor-pointer p-4 bg-white rounded-lg border-l-4 shadow-sm hover:bg-[#FAFAFA] transition-all ${errors.agreements && !agreements.fixedLocation ? 'border-red-500 bg-red-50' : 'border-[#4A4238]'}`}>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${agreements.fixedLocation ? 'border-[#4A4238] bg-[#4A4238]' : 'border-[#D6D1C9] bg-white'}`}>
                                    {agreements.fixedLocation && <Check size={12} className="text-white"/>}
                                </div>
                                <input type="checkbox" checked={agreements.fixedLocation} onChange={e => setAgreements({...agreements, fixedLocation: e.target.checked})} className="hidden" />
                                <span className="text-xs text-[#4A4238] tracking-wide font-bold">我了解，並清楚只能固定同一個地點做課程</span>
                            </label>
                            {errors.agreements && !agreements.fixedLocation && <p className="text-red-500 text-xs mt-1 font-bold ml-1">請勾選確認</p>}
                        </div>
                    )}
                </section>

                {/* 4. 聯絡與匯款 */}
                <section>
                    <div className="flex items-baseline gap-3 mb-5 pl-1">
                        <span className="text-3xl font-serif text-[#D6D1C9] font-bold">04</span>
                        <div><h2 className="text-lg font-bold tracking-wide text-[#4A4238]">聯絡與匯款</h2><span className="text-[10px] font-bold tracking-[0.15em] text-[#9A8F85] uppercase">Contact & Payment</span></div>
                    </div>
                    
                    <div className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-sm border-t-4 border-[#B08D55]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">姓名 <span className="text-[#C18C5D]">*</span></label>
                                <input type="text" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} 
                                    className={`w-full px-4 py-3 bg-[#F5F2EF] rounded-lg outline-none text-[#4A4238] focus:ring-1 focus:ring-[#B08D55] focus:bg-white font-medium border ${errors.name ? 'border-red-400 bg-red-50' : 'border-transparent'}`} placeholder="訂購者姓名"/>
                                {errors.name && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">電話 <span className="text-[#C18C5D]">*</span></label>
                                <input type="tel" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} 
                                    className={`w-full px-4 py-3 bg-[#F5F2EF] rounded-lg outline-none text-[#4A4238] focus:ring-1 focus:ring-[#B08D55] focus:bg-white font-medium border ${errors.phone ? 'border-red-400 bg-red-50' : 'border-transparent'}`} placeholder="09xx-xxx-xxx"/>
                                {errors.phone && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.phone}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">電子信箱</label>
                                <input type="email" value={userInfo.email} onChange={e => setUserInfo({...userInfo, email: e.target.value})} className="w-full px-4 py-3 bg-[#F5F2EF] rounded-lg outline-none text-[#4A4238] focus:ring-1 focus:ring-[#B08D55] focus:bg-white font-medium border border-transparent" placeholder="example@email.com (選填)"/>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">LINE 名稱 <span className="text-[#C18C5D]">*</span></label>
                                <input type="text" value={userInfo.lineName} onChange={e => setUserInfo({...userInfo, lineName: e.target.value})} 
                                    className={`w-full px-4 py-3 bg-[#F5F2EF] rounded-lg outline-none text-[#4A4238] focus:ring-1 focus:ring-[#B08D55] focus:bg-white font-medium border ${errors.lineName ? 'border-red-400 bg-red-50' : 'border-transparent'}`} placeholder="以便核對身份"/>
                                {errors.lineName && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.lineName}</p>}
                            </div>
                        </div>

                        {/* 匯款顯示區 - 實體卡片 */}
                        <div className="bg-[#FAF8F5] p-6 rounded-lg border border-[#EBE5DE] relative">
                                <div className="flex items-center gap-2 mb-4 text-[#B08D55]">
                                    <CreditCard size={18}/>
                                    <span className="text-xs font-bold tracking-widest uppercase">Transfer Details</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <div><p className="text-[10px] text-[#9A8F85] uppercase tracking-widest mb-1">Bank</p><p className="text-[#4A4238] font-bold">華南銀行 (008)</p></div>
                                    <div><p className="text-[10px] text-[#9A8F85] uppercase tracking-widest mb-1">Account Name</p><p className="text-[#4A4238] font-bold">俏媽咪事業有限公司</p></div>
                                    <div className="md:col-span-1"><p className="text-[10px] text-[#9A8F85] uppercase tracking-widest mb-1">Account No.</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[#B08D55] font-bold text-xl tracking-widest font-mono">242100072687</p>
                                            <button type="button" onClick={() => handleCopyAccount(false)} className="bg-[#B08D55] text-white p-1 rounded hover:bg-[#8D6B40] transition-colors"><Copy size={12}/></button>
                                        </div>
                                    </div>
                              {/* === 🔴 修正：改成強制勾選框 === */}
<div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start cursor-pointer hover:bg-rose-100 transition-colors"
     onClick={() => setAgreedNoNote(!agreedNoNote)}> {/* 點擊整塊區域都能勾選 */}
    
    <input
        id="check-no-note"
        type="checkbox"
        checked={agreedNoNote}
        onChange={(e) => setAgreedNoNote(e.target.checked)}
        className="mt-1 mr-3 h-5 w-5 text-rose-600 focus:ring-rose-500 border-gray-300 rounded cursor-pointer"
        onClick={(e) => e.stopPropagation()} // 防止點擊框框時觸發兩次
    />
    
    <label htmlFor="check-no-note" className="text-sm text-gray-700 cursor-pointer select-none leading-relaxed">
        <span className="flex items-center gap-1 font-bold text-rose-700 mb-1">
            <AlertCircle size={16} /> 必讀確認：
        </span>
        轉帳時
        <span className="font-bold text-rose-600 underline decoration-2 underline-offset-2 mx-1">
            請勿填寫備註
        </span>
        ，以免遮擋後五碼導致系統無法對帳。
    </label>
</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">匯款日期 <span className="text-[#C18C5D]">*</span></label>
                                <div className="relative group">
                                    <input type="date" value={userInfo.remittanceDate} onChange={e => setUserInfo({...userInfo, remittanceDate: e.target.value})} className={`w-full px-5 py-4 bg-[#F5F2EF] rounded-lg outline-none text-[#4A4238] focus:ring-1 focus:ring-[#B08D55] focus:bg-white font-medium cursor-pointer appearance-none ${errors.remittanceDate ? 'border border-red-400 bg-red-50' : 'border-transparent'}`}/>
                                    <Calendar size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A8F85] pointer-events-none group-hover:text-[#B08D55] transition-colors"/>
                                </div>
                                {errors.remittanceDate && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.remittanceDate}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">匯款後五碼 <span className="text-[#C18C5D]">*</span></label>
                                <input required type="text" maxLength={5} value={userInfo.last5Digits} onChange={e => setUserInfo({...userInfo, last5Digits: e.target.value})} className={`w-full px-4 py-3 bg-[#F5F2EF] rounded-lg outline-none text-[#4A4238] focus:ring-1 focus:ring-[#B08D55] focus:bg-white font-mono tracking-widest text-lg border ${errors.last5Digits ? 'border-red-400 bg-red-50' : 'border-transparent'}`} placeholder="12345"/>
                                {errors.last5Digits && <p className="text-red-500 text-xs mt-1 font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.last5Digits}</p>}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-[#F5F2EF]">
                            <label className={`flex items-start gap-3 cursor-pointer group p-3 rounded-lg border ${errors.agreements && !agreements.trialFeeOnly ? 'border-red-400 bg-red-50' : 'border-transparent hover:bg-[#FAF8F6]'}`}>
                                <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${agreements.trialFeeOnly ? 'border-[#4A4238] bg-[#4A4238]' : 'border-[#D6D1C9] bg-white group-hover:border-[#9A8F85]'}`}>
                                    {agreements.trialFeeOnly && <Check size={12} className="text-white"/>}
                                </div>
                                <input type="checkbox" checked={agreements.trialFeeOnly} onChange={e => setAgreements({...agreements, trialFeeOnly: e.target.checked})} className="hidden" />
                                <span className="text-sm text-[#6B635B] font-medium leading-relaxed">我明白只需轉帳體驗費(單堂$2800)，老師評估後才付包堂費用。</span>
                            </label>
                            {errors.agreements && !agreements.trialFeeOnly && <p className="text-red-500 text-xs ml-4 font-bold flex items-center gap-1"><AlertCircle size={12}/> 請勾選確認</p>}

                            <label className={`flex items-start gap-3 cursor-pointer group p-3 rounded-lg border ${errors.agreements && !agreements.addLine ? 'border-red-400 bg-red-50' : 'border-transparent hover:bg-[#FAF8F6]'}`}>
                                <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${agreements.addLine ? 'border-[#4A4238] bg-[#4A4238]' : 'border-[#D6D1C9] bg-white group-hover:border-[#9A8F85]'}`}>
                                    {agreements.addLine && <Check size={12} className="text-white"/>}
                                </div>
                                <input type="checkbox" checked={agreements.addLine} onChange={e => setAgreements({...agreements, addLine: e.target.checked})} className="hidden" />
                                <span className="text-sm text-[#6B635B] font-medium leading-relaxed">送出後我會主動加官方LINE傳送：匯款截圖、姓名、電話、後五碼核對。</span>
                            </label>
                            {errors.agreements && !agreements.addLine && <p className="text-red-500 text-xs ml-4 font-bold flex items-center gap-1"><AlertCircle size={12}/> 請勾選確認</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-[#4A4238] tracking-wide mb-2">備註</label>
                            <textarea value={userInfo.note} onChange={e => setUserInfo({...userInfo, note: e.target.value})} className="w-full px-5 py-4 bg-[#F5F2EF] rounded-md outline-none text-[#4A4238] min-h-[100px] focus:ring-1 focus:ring-[#B08D55] focus:bg-white font-medium border border-transparent" placeholder="其他事項..."/>
                        </div>

                        {/* 👇 修改重點：隱私權安全宣告 (精簡化 + 放大字體) */}
                        <div className="mt-6 text-xs text-[#9A8F85]/80 text-center leading-relaxed bg-[#FAF8F6] p-4 rounded-lg flex items-start md:items-center justify-center gap-2 border border-[#EBE5DE]/50">
                            <ShieldCheck size={16} className="text-[#B08D55] flex-shrink-0 mt-0.5 md:mt-0"/>
                            <span>個資僅供課程安排與聯繫使用，嚴格保密絕不外流，請安心填寫。</span>
                        </div>

                    </div>
                </section>
            </div>
         )}
         
         <Footer />

      </main>

      {/* 底部懸浮結帳欄 */}
      {activeTab === 'booking' ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#FDFBF9]/95 backdrop-blur-md border-t border-[#E5DFD9] p-5 safe-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
            <div className="flex flex-col pl-2">
                <span className="text-[10px] text-[#9A8F85] uppercase font-bold tracking-[0.2em] mb-1">Total Estimated</span>
                <span className="text-3xl font-serif text-[#4A4238] font-medium">${total.toLocaleString()}</span>
            </div>
            <button 
                onClick={handlePreSubmit} 
                disabled={isSubmitting || hasSubmitted|| !agreedNoNote}
                className="flex-1 bg-[#4A4238] text-white py-4 font-bold uppercase tracking-[0.15em] text-sm hover:bg-[#2C2620] transition-all rounded-md shadow-lg shadow-[#4A4238]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> 處理中...</> : hasSubmitted ? <>已送出</> : <>送出訂單</>}
            </button>
            </div>
        </div>
      ) : null}

      {/* 1. 匯款確認視窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2620]/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm shadow-2xl rounded-xl overflow-hidden animate-slide-up">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-[#FFF8F0] rounded-full flex items-center justify-center mx-auto mb-4 text-[#B08D55]">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-[#4A4238] mb-2">匯款確認</h3>
                    <p className="text-sm text-[#8D7F76] mb-6 leading-relaxed">為確保您的預約權益，<br/>請確認已完成匯款後再送出訂單。</p>
                    <div className="bg-[#FAF8F6] p-4 rounded-lg border border-[#EBE5DE] mb-6 text-left">
                        <p className="text-[10px] text-[#9A8F85] uppercase tracking-wider mb-1">Total Amount</p>
                        <p className="text-2xl font-bold text-[#B08D55] mb-3">${total.toLocaleString()}</p>
                        <p className="text-[10px] text-[#9A8F85] uppercase tracking-wider mb-1">Transfer To</p>
                        <div className="flex items-center justify-between bg-white p-3 rounded border border-[#EBE5DE]">
                            <span className="font-mono font-bold text-[#4A4238] tracking-widest">242100072687</span>
                            <button onClick={() => handleCopyAccount(true)} className="text-[#B08D55] text-xs font-bold px-3 py-1.5 hover:bg-[#F5F2EF] rounded transition-colors bg-[#F5F2EF]">{modalAccountCopied ? '已複製' : '複製'}</button>
                        </div>
                        <p className="text-[10px] text-[#9A8F85] mt-1 text-right">華南銀行 (008)</p>
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-[#F9F7F5] rounded-lg transition-colors text-left mb-6">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${paymentConfirmed ? 'border-[#4A4238] bg-[#4A4238]' : 'border-[#D6D1C9] bg-white'}`}>
                            {paymentConfirmed && <Check size={12} className="text-white"/>}
                        </div>
                        <input type="checkbox" checked={paymentConfirmed} onChange={e => setPaymentConfirmed(e.target.checked)} className="hidden" />
                        <span className="text-sm text-[#4A4238] font-bold">我已完成匯款，確認送出</span>
                    </label>
                    <div className="flex gap-3">
                        <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-md text-sm font-bold text-[#8D7F76] hover:bg-[#F5F2EF] transition-colors">稍後</button>
                        <button onClick={handleFinalSubmit} className={`flex-1 py-3 rounded-md text-sm font-bold text-white transition-all shadow-lg ${paymentConfirmed ? 'bg-[#4A4238] hover:bg-[#2C2620]' : 'bg-[#D6D1C9] cursor-not-allowed'}`} disabled={!paymentConfirmed}>確認送出</button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* 2. 訂單成功視窗 (含修正後的 LINE 連結) */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2C2620]/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md shadow-2xl rounded-xl max-h-[90vh] flex flex-col overflow-hidden relative z-[110]">
            <div className="p-5 md:p-6 border-b border-[#F5F2EF] flex justify-between items-center sticky top-0 z-10 bg-white">
               <div>
                   <h3 className="font-bold text-lg md:text-xl text-[#B08D55] flex items-center gap-2 font-serif uppercase tracking-wide md:tracking-widest">
                       ⚠️ 訂單保留中：剩最後一步！
                   </h3>
                   <p className="text-[10px] text-[#9A8F85] mt-1 tracking-wider font-bold">請務必傳送 LINE 訊息以完成報名</p>
               </div>
               <button onClick={() => setIsSuccessModalOpen(false)} className="p-2 hover:bg-[#F9F7F5] rounded-full transition-colors flex-shrink-0"><X size={24} className="text-[#9A8F85]"/></button>
            </div>
            <div className="p-8 overflow-y-auto space-y-8 bg-[#FDFBF9]">
              <div className="space-y-6">
                  <div className="flex gap-5">
                      <div className="w-10 h-10 bg-[#4A4238] text-white font-serif flex items-center justify-center flex-shrink-0 text-lg rounded-full shadow-md">1</div>
                      <div className="flex-1">
                          <p className="font-bold text-[#4A4238] mb-2 text-sm uppercase tracking-wider">複製訂單資訊</p>
                          <button onClick={handleCopy} className={`w-full py-4 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all tracking-widest uppercase ${copied ? 'bg-[#8D7F76] text-white' : 'bg-white border border-[#D6D1C9] text-[#4A4238] hover:bg-[#F5F2EF]'}`}>
                             {copied ? <><CheckCircle size={16}/> 已複製</> : <><Copy size={16}/> 點擊複製內容</>}
                          </button>
                      </div>
                  </div>
                  <div className="flex gap-5">
                      <div className="w-10 h-10 bg-[#4A4238] text-white font-serif flex items-center justify-center flex-shrink-0 text-lg rounded-full shadow-md">2</div>
                      <div className="flex-1">
                          <p className="font-bold text-[#4A4238] mb-1 text-sm uppercase tracking-wider">前往官方 LINE 貼上資訊</p>
                          <p className="text-[11px] text-[#B08D55] font-bold mb-3">請將剛剛複製的內容<span className="underline font-black mx-1">貼上並傳送</span>，以完成預約核對</p>
                          
                          <button 
                            onClick={() => window.open(LINE_LINK, '_blank')}
                            className="w-full bg-[#06C755] text-white py-4 text-center text-sm font-bold hover:bg-[#05b64d] transition-all tracking-widest uppercase rounded-lg shadow-xl shadow-green-200 transform active:scale-95 flex items-center justify-center gap-2 group border-b-4 border-[#048C3A]"
                          >
                             <Send size={18} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" /> 
                             立即傳送以完成報名
                          </button>
                      </div>
                  </div>
              </div>
              <div className="bg-white p-6 border border-[#EBE5DE] text-[11px] text-[#8D7F76] font-mono whitespace-pre-wrap leading-relaxed rounded-lg">{orderText}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}