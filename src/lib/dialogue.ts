import type { Lang } from "./content";
import type { AchId, Action } from "./game";

export type Pose = "idle" | "wave" | "point" | "laugh" | "think" | "party";
export type Choice = { label: string; act: Action };
export type Line = { text: string; pose?: Pose; choices?: Choice[]; auto?: number };
export type TourStep = { id: string; text: string; pose?: Pose };

type Script = {
  name: string;
  greet: Line;
  welcomeBack: Line;
  freeOk: Line;
  idle: Line;
  menu: Line;
  tour: TourStep[];
  tourEnd: Line;
  comments: Record<string, string>;
  jokes: string[];
  afterJokeTour: Choice[];
  afterJokeFree: Choice[];
  tourChoices: Choice[];
  hiddenTab: string;
  skip: string;
};

const en: Script = {
  name: "Mohammed",
  greet: {
    pose: "wave",
    text: "Hey there! 👋 I'm Mohammed — well, the sticker version. This portfolio is a little game and I'm your guide. Want me to show you around?",
    choices: [
      { label: "Yes, guide me ▶", act: "tour-start" },
      { label: "I'll explore alone", act: "free" },
      { label: "Tell me a joke first 😄", act: "joke" },
    ],
  },
  welcomeBack: {
    pose: "wave",
    text: "Oh, you're back! 😎 Your progress is saved. Want the tour again, or roam free?",
    choices: [
      { label: "Guide me again ▶", act: "tour-start" },
      { label: "Roam free", act: "free" },
      { label: "Just a joke 😄", act: "joke" },
    ],
  },
  freeOk: { pose: "idle", text: "Cool, go wild! I'll be chilling down here. Click me whenever you need me.", auto: 3800 },
  idle: {
    pose: "think",
    text: "Psst… still there? 👀 Want a quick joke or should I show you the good stuff?",
    choices: [
      { label: "Joke please 😄", act: "joke" },
      { label: "Show me around", act: "tour-start" },
      { label: "I'm good", act: "close" },
    ],
  },
  menu: {
    pose: "idle",
    text: "What can I do for you?",
    choices: [
      { label: "Guide me ▶", act: "tour-start" },
      { label: "Tell a joke 😄", act: "joke" },
      { label: "Hire Mohammed ✉", act: "hire" },
      { label: "Hide for now", act: "hide" },
    ],
  },
  tour: [
    { id: "about", pose: "point", text: "Level 1 — my character sheet. Full Stack & SharePoint Developer, currently at K-Apps: React and Laravel for my freelance work, ASP.NET and SharePoint for the enterprise boss fights." },
    { id: "skills", pose: "point", text: "Level 2 — my inventory. Every item is a skill I actually use. Click one to inspect it — legendary items glow 😏" },
    { id: "services", pose: "point", text: "Level 3 — my abilities. Hover the cards, they're holographic. Click to flip them over." },
    { id: "work", pose: "point", text: "Level 4 — the quest log. Real projects: RanLogic, my freelance fitness platform, plus enterprise SharePoint & .NET systems — WorkFlow, Floward HR and training, and a KPI evaluation system. Pick a quest on the left." },
    { id: "experience", pose: "point", text: "Level 5 — the world map of my career. Scroll and watch me walk the road from Zarqa University all the way to K-Apps." },
    { id: "console", pose: "think", text: "Level 6 — a secret console. Type 'help'… or try a cheat code. I won't tell anyone 🤫" },
    { id: "contact", pose: "party", text: "Final level! This is where you hire me before the countdown ends. No pressure… okay, a little pressure 😅" },
  ],
  tourEnd: {
    pose: "party",
    text: "That's the whole tour! 🎉 Thanks for playing. Shall we work together?",
    choices: [
      { label: "Email Mohammed ✉", act: "hire" },
      { label: "One more joke 😄", act: "joke" },
      { label: "Bye! 👋", act: "close" },
    ],
  },
  comments: {
    about: "That's me on paper. Mostly coffee, honestly ☕",
    skills: "Loot room! Click any item to inspect it.",
    services: "Pro tip: those cards flip 👀",
    work: "Quests I've completed. Pick one!",
    experience: "My career, as a road trip 🛣️",
    console: "Try typing 'joke' in there…",
    contact: "You made it to the final boss: hiring me 😄",
  },
  jokes: [
    "Why do programmers prefer dark mode? Because light attracts bugs. 🐛",
    "I told my manager I'd fix the bug in 5 minutes… that was two sprints ago.",
    "There are 10 kinds of people: those who understand binary and those who don't.",
    "A SQL query walks into a bar, walks up to two tables and asks: 'Can I JOIN you?'",
    "My code doesn't have bugs. It has surprise features. 🎁",
    "Why did the developer go broke? He used up all his cache. 💸",
    "SharePoint asked how I'm doing. I said: depends on your permissions.",
    "I'd tell you a UDP joke… but you might not get it.",
    "Debugging is being the detective in a crime movie where you're also the murderer. 🕵️",
    "Why do Java developers wear glasses? Because they don't C#. 👓",
    "It works on my machine. ✅ Then we'll ship your machine.",
    "CSS is easy. It's like riding a bike… that's on fire… and you're in hell. 🔥",
  ],
  afterJokeTour: [
    { label: "😂 Next level ▶", act: "tour-next" },
    { label: "Another one", act: "joke" },
    { label: "Stop the tour", act: "tour-stop" },
  ],
  afterJokeFree: [
    { label: "😂 Another!", act: "joke" },
    { label: "Show me around", act: "tour-start" },
    { label: "Okay, enough", act: "close" },
  ],
  tourChoices: [
    { label: "Next ▶", act: "tour-next" },
    { label: "Joke 😄", act: "joke" },
    { label: "I'll explore alone", act: "tour-stop" },
  ],
  hiddenTab: "👋 Mohammed",
  skip: "click to skip",
};

const ar: Script = {
  name: "محمد",
  greet: {
    pose: "wave",
    text: "أهلين! 👋 أنا محمد — بس نسخة الستيكر. هالبورتفوليو عبارة عن لعبة صغيرة وأنا المرشد تبعك. بدك أفرجيك المكان؟",
    choices: [
      { label: "أكيد، فرجيني ▶", act: "tour-start" },
      { label: "بستكشف لحالي", act: "free" },
      { label: "احكيلي نكتة أول 😄", act: "joke" },
    ],
  },
  welcomeBack: {
    pose: "wave",
    text: "يا هلا، رجعت! 😎 تقدّمك محفوظ. بدك الجولة مرة ثانية ولا بتلف لحالك؟",
    choices: [
      { label: "فرجيني كمان مرة ▶", act: "tour-start" },
      { label: "بلف لحالي", act: "free" },
      { label: "بس نكتة 😄", act: "joke" },
    ],
  },
  freeOk: { pose: "idle", text: "تمام، خذ راحتك! أنا قاعد هون تحت. اكبس عليّ وقت ما بدك.", auto: 3800 },
  idle: {
    pose: "think",
    text: "بسسس… لسا هون؟ 👀 بدك نكتة سريعة ولا أفرجيك الأشياء الحلوة؟",
    choices: [
      { label: "نكتة لو سمحت 😄", act: "joke" },
      { label: "فرجيني", act: "tour-start" },
      { label: "تمام هيك", act: "close" },
    ],
  },
  menu: {
    pose: "idle",
    text: "شو بقدر أعملك؟",
    choices: [
      { label: "فرجيني ▶", act: "tour-start" },
      { label: "احكي نكتة 😄", act: "joke" },
      { label: "وظّف محمد ✉", act: "hire" },
      { label: "اختفي هلأ", act: "hide" },
    ],
  },
  tour: [
    { id: "about", pose: "point", text: "المرحلة 1 — بطاقة الشخصية تبعي. مطوّر Full Stack و SharePoint، وهلأ بشتغل مع K-Apps: React و Laravel للشغل الخاص، و ASP.NET و SharePoint لمعارك الشركات الكبيرة." },
    { id: "skills", pose: "point", text: "المرحلة 2 — الحقيبة تبعتي. كل غرض فيها مهارة بستعملها فعلاً. اكبس على أي واحد عشان تفحصه — الأغراض الأسطورية بتلمع 😏" },
    { id: "services", pose: "point", text: "المرحلة 3 — القدرات. مرّق الماوس على الكروت، هي هولوغرام. واكبس عليها بتنقلب." },
    { id: "work", pose: "point", text: "المرحلة 4 — سجل المهمات. مشاريع حقيقية: RanLogic منصة اللياقة (شغل حر)، وأنظمة SharePoint و .NET للشركات — WorkFlow، نظام الموارد البشرية والتدريب لـ Floward، ونظام تقييم KPI. اختار مهمة من القائمة." },
    { id: "experience", pose: "point", text: "المرحلة 5 — خريطة مسيرتي. انزل بالسكرول وشوفني ماشي بالطريق من جامعة الزرقاء لحد K-Apps." },
    { id: "console", pose: "think", text: "المرحلة 6 — كونسول سري. اكتب help… أو جرّب cheat code. ما رح أحكي لحدا 🤫" },
    { id: "contact", pose: "party", text: "المرحلة الأخيرة! هون بتوظفني قبل ما يخلص العد التنازلي. بدون ضغط… ماشي، شوية ضغط 😅" },
  ],
  tourEnd: {
    pose: "party",
    text: "هيك خلصت الجولة! 🎉 شكراً إنك لعبت. شو رأيك نشتغل سوا؟",
    choices: [
      { label: "ابعث إيميل لمحمد ✉", act: "hire" },
      { label: "نكتة كمان 😄", act: "joke" },
      { label: "باي! 👋", act: "close" },
    ],
  },
  comments: {
    about: "هاد أنا على الورق. أغلبه قهوة بصراحة ☕",
    skills: "غرفة الغنائم! اكبس على أي غرض.",
    services: "نصيحة: الكروت بتنقلب 👀",
    work: "مهمات خلصتها. اختار وحدة!",
    experience: "مسيرتي كأنها رحلة بالسيارة 🛣️",
    console: "جرّب تكتب joke هون…",
    contact: "وصلت للزعيم الأخير: إنك توظفني 😄",
  },
  jokes: [
    "ليش المبرمجين بحبوا الدارك مود؟ لأنه الضو بيجيب bugs 🐛",
    "حكيت لمديري بصلّح الباغ بخمس دقايق… هاد كان قبل سبرنتين.",
    "في 10 أنواع من الناس: اللي بيفهموا binary واللي ما بيفهموا.",
    "استعلام SQL دخل مطعم، راح لطاولتين وسألهم: بتسمحولي أعمل JOIN معكم؟",
    "الكود تبعي ما فيه bugs… فيه ميزات مفاجئة 🎁",
    "ليش المبرمج فلّس؟ لأنه صرف كل الـ cache تبعه 💸",
    "SharePoint سألني كيفك؟ حكيتله: بتعتمد على صلاحياتك.",
    "كنت بدي أحكيلك نكتة عن UDP… بس ممكن ما توصلك.",
    "الـ Debugging إنك تكون المحقق بفيلم جريمة… وإنت نفسك القاتل 🕵️",
    "إمي قالتلي: جيب خبز، وإذا في بيض جيب 6. رجعت بـ 6 ربطات خبز… لأنه كان في بيض 🥚",
    "على جهازي شغّال ✅ … طيب منبعتلك جهازي.",
    "الـ CSS سهلة… زي ركوب البسكليت، بس البسكليت ولعانة 🔥",
  ],
  afterJokeTour: [
    { label: "😂 المرحلة الجاية ▶", act: "tour-next" },
    { label: "كمان وحدة", act: "joke" },
    { label: "وقّف الجولة", act: "tour-stop" },
  ],
  afterJokeFree: [
    { label: "😂 كمان!", act: "joke" },
    { label: "فرجيني المكان", act: "tour-start" },
    { label: "خلص بكفي", act: "close" },
  ],
  tourChoices: [
    { label: "التالي ▶", act: "tour-next" },
    { label: "نكتة 😄", act: "joke" },
    { label: "بستكشف لحالي", act: "tour-stop" },
  ],
  hiddenTab: "👋 محمد",
  skip: "اكبس للتخطي",
};

export const SCRIPT: Record<Lang, Script> = { en, ar };

export const ACHIEVEMENTS: Record<AchId, { icon: string; en: [string, string]; ar: [string, string] }> = {
  start: { icon: "🎮", en: ["Press Start", "Entered the game"], ar: ["ابدأ اللعب", "دخلت اللعبة"] },
  guided: { icon: "🧭", en: ["Tour Guide", "Accepted the guided tour"], ar: ["مع المرشد", "قبلت الجولة"] },
  explorer: { icon: "🗺️", en: ["Explorer", "Visited every level"], ar: ["المستكشف", "زرت كل المراحل"] },
  laugh: { icon: "😂", en: ["Dad-Joke Survivor", "Heard your first joke"], ar: ["نجوت من النكتة", "سمعت أول نكتة"] },
  comedian: { icon: "🎤", en: ["Comedy Club", "Heard 3 jokes"], ar: ["نادي الضحك", "سمعت 3 نكت"] },
  loot: { icon: "🎒", en: ["Loot Inspector", "Inspected 3 items"], ar: ["مفتش الغنائم", "فحصت 3 أغراض"] },
  quest: { icon: "📜", en: ["Quest Reader", "Opened a quest"], ar: ["قارئ المهمات", "فتحت مهمة"] },
  cheater: { icon: "🕹️", en: ["Cheater!", "Used a cheat code"], ar: ["غشّاش!", "استعملت cheat code"] },
  fashion: { icon: "🎨", en: ["Fashionista", "Changed the palette"], ar: ["ذوّيق", "غيّرت الألوان"] },
  polyglot: { icon: "🌍", en: ["Polyglot", "Switched language"], ar: ["متعدد اللغات", "بدّلت اللغة"] },
  boss: { icon: "👑", en: ["Final Boss", "Reached the last level"], ar: ["الزعيم الأخير", "وصلت للمرحلة الأخيرة"] },
  konami: { icon: "⬆️", en: ["Old School", "Entered the Konami code"], ar: ["مدرسة قديمة", "دخلت كود كونامي"] },
};
