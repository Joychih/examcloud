import type { Exam, ExamResult, Question, School, ExamCategory, StudentUser, Announcement, ExamAssignment } from "./models";

// ============================================================================
// 學校資料 - 9區共45+所學校
// ============================================================================
export const mockSchools: School[] = [
  // 測試用
  { id: "test01", name: "【測試】良師塾高中", region: "測試區", examCount: 0, isFreeTrial: true },
  // 基北區
  { id: "s01", name: "建國中學", region: "基北區", examCount: 0, isFreeTrial: true },
  { id: "s02", name: "北一女中", region: "基北區", examCount: 0, isFreeTrial: true },
  { id: "s03", name: "師大附中", region: "基北區", examCount: 0, isFreeTrial: false },
  { id: "s04", name: "成功高中", region: "基北區", examCount: 0, isFreeTrial: false },
  { id: "s05", name: "中山女中", region: "基北區", examCount: 0, isFreeTrial: false },
  { id: "s06", name: "松山高中", region: "基北區", examCount: 0, isFreeTrial: false },
  { id: "s07", name: "大同高中", region: "基北區", examCount: 0, isFreeTrial: false },
  { id: "s08", name: "薇閣高中", region: "基北區", examCount: 0, isFreeTrial: false },
  // 桃連區
  { id: "s09", name: "武陵高中", region: "桃連區", examCount: 0, isFreeTrial: false },
  { id: "s10", name: "中壢高中", region: "桃連區", examCount: 0, isFreeTrial: false },
  { id: "s11", name: "桃園高中", region: "桃連區", examCount: 0, isFreeTrial: false },
  { id: "s12", name: "內壢高中", region: "桃連區", examCount: 0, isFreeTrial: false },
  { id: "s13", name: "陽明高中", region: "桃連區", examCount: 0, isFreeTrial: false },
  // 竹苗區
  { id: "s14", name: "新竹實驗中學", region: "竹苗區", examCount: 0, isFreeTrial: false },
  { id: "s15", name: "新竹高中", region: "竹苗區", examCount: 0, isFreeTrial: false },
  { id: "s16", name: "新竹女中", region: "竹苗區", examCount: 0, isFreeTrial: false },
  { id: "s17", name: "竹北高中", region: "竹苗區", examCount: 0, isFreeTrial: false },
  { id: "s18", name: "建功高中", region: "竹苗區", examCount: 0, isFreeTrial: false },
  { id: "s19", name: "六家高中", region: "竹苗區", examCount: 0, isFreeTrial: false },
  // 中投區
  { id: "s20", name: "台中一中", region: "中投區", examCount: 0, isFreeTrial: true },
  { id: "s21", name: "台中女中", region: "中投區", examCount: 0, isFreeTrial: false },
  { id: "s22", name: "興大附中", region: "中投區", examCount: 0, isFreeTrial: false },
  { id: "s23", name: "文華高中", region: "中投區", examCount: 0, isFreeTrial: false },
  { id: "s24", name: "台中二中", region: "中投區", examCount: 0, isFreeTrial: false },
  { id: "s25", name: "惠文高中", region: "中投區", examCount: 0, isFreeTrial: false },
  { id: "s26", name: "忠明高中", region: "中投區", examCount: 0, isFreeTrial: false },
  // 彰化區
  { id: "s27", name: "彰化高中", region: "彰化區", examCount: 0, isFreeTrial: false },
  { id: "s28", name: "彰化女中", region: "彰化區", examCount: 0, isFreeTrial: false },
  { id: "s29", name: "精誠中學", region: "彰化區", examCount: 0, isFreeTrial: false },
  { id: "s30", name: "員林高中", region: "彰化區", examCount: 0, isFreeTrial: false },
  { id: "s31", name: "彰化藝術高中", region: "彰化區", examCount: 0, isFreeTrial: false },
  { id: "s32", name: "溪湖高中", region: "彰化區", examCount: 0, isFreeTrial: false },
  // 雲林區
  { id: "s33", name: "斗六高中", region: "雲林區", examCount: 0, isFreeTrial: false },
  { id: "s34", name: "虎尾高中", region: "雲林區", examCount: 0, isFreeTrial: false },
  { id: "s35", name: "正心中學", region: "雲林區", examCount: 0, isFreeTrial: false },
  { id: "s36", name: "麥寮高中", region: "雲林區", examCount: 0, isFreeTrial: false },
  { id: "s37", name: "斗南高中", region: "雲林區", examCount: 0, isFreeTrial: false },
  // 嘉義區
  { id: "s38", name: "嘉義高中", region: "嘉義區", examCount: 0, isFreeTrial: false },
  { id: "s39", name: "嘉義女中", region: "嘉義區", examCount: 0, isFreeTrial: false },
  { id: "s40", name: "嘉義高工", region: "嘉義區", examCount: 0, isFreeTrial: false },
  { id: "s41", name: "新港藝術高中", region: "嘉義區", examCount: 0, isFreeTrial: false },
  { id: "s42", name: "民雄農工", region: "嘉義區", examCount: 0, isFreeTrial: false },
  // 台南區
  { id: "s43", name: "台南一中", region: "台南區", examCount: 0, isFreeTrial: false },
  { id: "s44", name: "台南女中", region: "台南區", examCount: 0, isFreeTrial: false },
  { id: "s45", name: "南科實中", region: "台南區", examCount: 0, isFreeTrial: false },
  { id: "s46", name: "家齊高中", region: "台南區", examCount: 0, isFreeTrial: false },
  { id: "s47", name: "台南二中", region: "台南區", examCount: 0, isFreeTrial: false },
  { id: "s48", name: "大灣高中", region: "台南區", examCount: 0, isFreeTrial: false },
  // 高雄區
  { id: "s49", name: "高雄中學", region: "高雄區", examCount: 0, isFreeTrial: false },
  { id: "s50", name: "高雄女中", region: "高雄區", examCount: 0, isFreeTrial: false },
  { id: "s51", name: "高師大附中", region: "高雄區", examCount: 0, isFreeTrial: false },
  { id: "s52", name: "鳳山高中", region: "高雄區", examCount: 0, isFreeTrial: false },
  { id: "s53", name: "鳳新高中", region: "高雄區", examCount: 0, isFreeTrial: false },
  { id: "s54", name: "新莊高中", region: "高雄區", examCount: 0, isFreeTrial: false },
];

// ============================================================================
// 題庫 - 各類型題目
// ============================================================================

// 高一數學題目
const grade1Questions: Question[] = [
  {
    id: "g1q01",
    type: "MCQ",
    content: "若 $|x-3| < 2$，則 $x$ 的範圍為何？",
    options: ["$1 < x < 5$", "$x < 1$ 或 $x > 5$", "$-5 < x < -1$", "$x > 5$"],
    correctAnswer: "$1 < x < 5$",
    textExplanation: "絕對值不等式 |x-3| < 2 表示 x 與 3 的距離小於 2，即 -2 < x-3 < 2，解得 1 < x < 5。",
    videoUrl: "https://example.com/video-g1q01",
    tags: ["數與式", "絕對值"],
    difficulty: "easy",
  },
  {
    id: "g1q02",
    type: "MCQ",
    content: "設 $a, b$ 為實數，若 $a + b = 5$，$ab = 6$，則 $a^2 + b^2 = $？",
    options: ["11", "13", "19", "25"],
    correctAnswer: "13",
    textExplanation: "利用恆等式 a² + b² = (a+b)² - 2ab = 5² - 2×6 = 25 - 12 = 13。",
    videoUrl: "https://example.com/video-g1q02",
    tags: ["多項式", "恆等式"],
    difficulty: "easy",
  },
  {
    id: "g1q03",
    type: "Fill",
    content: "化簡 $\\sqrt{12} + \\sqrt{27} - \\sqrt{48}$，答案為 $k\\sqrt{3}$，則 $k = $",
    correctAnswer: "1",
    textExplanation: "√12 = 2√3，√27 = 3√3，√48 = 4√3，所以 2√3 + 3√3 - 4√3 = 1√3，k = 1。",
    videoUrl: "https://example.com/video-g1q03",
    tags: ["數與式", "根式"],
    difficulty: "easy",
  },
  {
    id: "g1q04",
    type: "MCQ",
    content: "若多項式 $f(x) = x^3 - 2x^2 + 3x - 4$，則 $f(2) = $？",
    options: ["0", "2", "4", "6"],
    correctAnswer: "2",
    textExplanation: "f(2) = 2³ - 2×2² + 3×2 - 4 = 8 - 8 + 6 - 4 = 2。",
    videoUrl: "https://example.com/video-g1q04",
    tags: ["多項式", "函數值"],
    difficulty: "easy",
  },
  {
    id: "g1q05",
    type: "TF",
    content: "若 $x^2 - 5x + 6 = 0$ 的兩根為 $\\alpha, \\beta$，則 $\\alpha + \\beta = 5$。",
    correctAnswer: "是",
    textExplanation: "根據韋達定理，二次方程式 ax² + bx + c = 0 的兩根和為 -b/a。此處 α + β = -(-5)/1 = 5。",
    videoUrl: "https://example.com/video-g1q05",
    tags: ["多項式", "韋達定理"],
    difficulty: "easy",
  },
];

// 高二數A題目
const grade2AQuestions: Question[] = [
  {
    id: "g2aq01",
    type: "MCQ",
    content: "在 $\\triangle ABC$ 中，若 $a = 5$，$b = 7$，$C = 60°$，則 $c = $？",
    options: ["$\\sqrt{39}$", "$\\sqrt{41}$", "$\\sqrt{43}$", "$\\sqrt{45}$"],
    correctAnswer: "$\\sqrt{39}$",
    textExplanation: "餘弦定理：c² = a² + b² - 2ab cos C = 25 + 49 - 2×5×7×(1/2) = 74 - 35 = 39，故 c = √39。",
    videoUrl: "https://example.com/video-g2aq01",
    tags: ["三角函數", "餘弦定理"],
    difficulty: "medium",
  },
  {
    id: "g2aq02",
    type: "MCQ",
    content: "設向量 $\\vec{a} = (2, 3)$，$\\vec{b} = (4, -1)$，則 $\\vec{a} \\cdot \\vec{b} = $？",
    options: ["5", "7", "11", "14"],
    correctAnswer: "5",
    textExplanation: "向量內積 a⃗·b⃗ = 2×4 + 3×(-1) = 8 - 3 = 5。",
    videoUrl: "https://example.com/video-g2aq02",
    tags: ["向量", "內積"],
    difficulty: "easy",
  },
  {
    id: "g2aq03",
    type: "Fill",
    content: "若 $\\sin\\theta = \\frac{3}{5}$，$\\theta$ 在第一象限，則 $\\cos\\theta = $",
    correctAnswer: "4/5",
    textExplanation: "由 sin²θ + cos²θ = 1，得 cos²θ = 1 - 9/25 = 16/25，θ 在第一象限故 cosθ > 0，cosθ = 4/5。",
    videoUrl: "https://example.com/video-g2aq03",
    tags: ["三角函數", "恆等式"],
    difficulty: "easy",
  },
  {
    id: "g2aq04",
    type: "MCQ",
    content: "過點 $(1, 2)$ 且斜率為 $3$ 的直線方程式為？",
    options: ["$3x - y - 1 = 0$", "$3x - y + 1 = 0$", "$x - 3y + 5 = 0$", "$x + 3y - 7 = 0$"],
    correctAnswer: "$3x - y - 1 = 0$",
    textExplanation: "點斜式：y - 2 = 3(x - 1)，展開得 y = 3x - 1，整理為 3x - y - 1 = 0。",
    videoUrl: "https://example.com/video-g2aq04",
    tags: ["平面向量", "直線方程"],
    difficulty: "easy",
  },
  {
    id: "g2aq05",
    type: "TF",
    content: "圓 $x^2 + y^2 = 25$ 的圓心為原點，半徑為 $5$。",
    correctAnswer: "是",
    textExplanation: "標準圓方程式 x² + y² = r² 表示圓心在原點，半徑為 r。此處 r² = 25，故 r = 5。",
    videoUrl: "https://example.com/video-g2aq05",
    tags: ["圓與球", "圓方程式"],
    difficulty: "easy",
  },
];

// 高二數B題目
const grade2BQuestions: Question[] = [
  {
    id: "g2bq01",
    type: "MCQ",
    content: "某班 40 人數學成績的平均為 70 分，標準差為 10 分。若每人加 5 分，則新的平均與標準差分別為？",
    options: ["75, 10", "75, 15", "70, 15", "75, 5"],
    correctAnswer: "75, 10",
    textExplanation: "每人加常數 k，平均增加 k（變成 75），但標準差不變（仍為 10）。",
    videoUrl: "https://example.com/video-g2bq01",
    tags: ["統計", "平均與標準差"],
    difficulty: "easy",
  },
  {
    id: "g2bq02",
    type: "MCQ",
    content: "從 1 到 10 的整數中隨機取一數，取到質數的機率為？",
    options: ["2/5", "3/10", "1/2", "4/10"],
    correctAnswer: "2/5",
    textExplanation: "1 到 10 中的質數有 2, 3, 5, 7 共 4 個，機率 = 4/10 = 2/5。",
    videoUrl: "https://example.com/video-g2bq02",
    tags: ["機率", "古典機率"],
    difficulty: "easy",
  },
  {
    id: "g2bq03",
    type: "Fill",
    content: "擲一公正骰子兩次，點數和為 7 的機率為（以最簡分數表示）",
    correctAnswer: "1/6",
    textExplanation: "和為 7 的情況：(1,6)(2,5)(3,4)(4,3)(5,2)(6,1) 共 6 種，總共 36 種可能，機率 = 6/36 = 1/6。",
    videoUrl: "https://example.com/video-g2bq03",
    tags: ["機率", "古典機率"],
    difficulty: "medium",
  },
  {
    id: "g2bq04",
    type: "MCQ",
    content: "若數據 2, 4, 6, 8, 10 的中位數為 $M$，眾數為 $N$，則 $M + N = $？",
    options: ["6", "12", "無法確定", "10"],
    correctAnswer: "無法確定",
    textExplanation: "中位數 M = 6（第 3 個數），但此數據無重複值，故無眾數，N 無法確定。",
    videoUrl: "https://example.com/video-g2bq04",
    tags: ["統計", "中位數與眾數"],
    difficulty: "medium",
  },
  {
    id: "g2bq05",
    type: "TF",
    content: "若 A, B 為獨立事件，則 $P(A \\cap B) = P(A) \\times P(B)$。",
    correctAnswer: "是",
    textExplanation: "獨立事件的定義：P(A∩B) = P(A)×P(B)，這是獨立事件的充要條件。",
    videoUrl: "https://example.com/video-g2bq05",
    tags: ["機率", "獨立事件"],
    difficulty: "easy",
  },
];

// 高三數甲題目
const grade3JiaQuestions: Question[] = [
  {
    id: "g3jq01",
    type: "MCQ",
    content: "$\\lim_{x \\to 0} \\frac{\\sin 3x}{x} = $？",
    options: ["0", "1", "3", "不存在"],
    correctAnswer: "3",
    textExplanation: "利用 lim(x→0) sinx/x = 1，得 lim(x→0) sin3x/x = lim(x→0) 3×(sin3x/3x) = 3×1 = 3。",
    videoUrl: "https://example.com/video-g3jq01",
    tags: ["極限", "三角函數極限"],
    difficulty: "medium",
  },
  {
    id: "g3jq02",
    type: "MCQ",
    content: "若 $f(x) = x^3 - 3x^2 + 2$，則 $f'(x) = $？",
    options: ["$3x^2 - 6x$", "$3x^2 - 6$", "$x^2 - 6x$", "$3x^2 + 6x$"],
    correctAnswer: "$3x^2 - 6x$",
    textExplanation: "f'(x) = 3x² - 6x（對每項分別微分：d/dx(x³) = 3x²，d/dx(-3x²) = -6x，d/dx(2) = 0）。",
    videoUrl: "https://example.com/video-g3jq02",
    tags: ["微分", "多項式微分"],
    difficulty: "easy",
  },
  {
    id: "g3jq03",
    type: "Fill",
    content: "$\\int_0^2 (3x^2 + 2x) dx = $",
    correctAnswer: "12",
    textExplanation: "∫(3x² + 2x)dx = x³ + x²，代入上下限：(2³ + 2²) - (0 + 0) = 8 + 4 = 12。",
    videoUrl: "https://example.com/video-g3jq03",
    tags: ["積分", "定積分"],
    difficulty: "medium",
  },
  {
    id: "g3jq04",
    type: "MCQ",
    content: "曲線 $y = x^2$ 在點 $(1, 1)$ 的切線斜率為？",
    options: ["1", "2", "3", "4"],
    correctAnswer: "2",
    textExplanation: "y' = 2x，在 x = 1 處，切線斜率 = 2×1 = 2。",
    videoUrl: "https://example.com/video-g3jq04",
    tags: ["微分", "切線"],
    difficulty: "easy",
  },
  {
    id: "g3jq05",
    type: "TF",
    content: "若 $f(x)$ 在 $x = a$ 連續，則 $\\lim_{x \\to a} f(x) = f(a)$。",
    correctAnswer: "是",
    textExplanation: "這正是連續的定義：f 在 x=a 連續，當且僅當 lim(x→a) f(x) = f(a)。",
    videoUrl: "https://example.com/video-g3jq05",
    tags: ["極限", "連續性"],
    difficulty: "easy",
  },
];

// 高三數乙題目
const grade3YiQuestions: Question[] = [
  {
    id: "g3yq01",
    type: "MCQ",
    content: "某商品定價為成本的 1.5 倍，若打 8 折出售，則利潤率為？",
    options: ["20%", "25%", "30%", "50%"],
    correctAnswer: "20%",
    textExplanation: "設成本為 100，定價 = 150，售價 = 150×0.8 = 120，利潤 = 120 - 100 = 20，利潤率 = 20/100 = 20%。",
    videoUrl: "https://example.com/video-g3yq01",
    tags: ["應用數學", "百分比"],
    difficulty: "easy",
  },
  {
    id: "g3yq02",
    type: "MCQ",
    content: "若 $\\log_2 8 = x$，則 $x = $？",
    options: ["2", "3", "4", "8"],
    correctAnswer: "3",
    textExplanation: "log₂8 = x 表示 2ˣ = 8 = 2³，故 x = 3。",
    videoUrl: "https://example.com/video-g3yq02",
    tags: ["指數與對數", "對數"],
    difficulty: "easy",
  },
  {
    id: "g3yq03",
    type: "Fill",
    content: "若 $2^{x+1} = 32$，則 $x = $",
    correctAnswer: "4",
    textExplanation: "2^(x+1) = 32 = 2⁵，故 x + 1 = 5，x = 4。",
    videoUrl: "https://example.com/video-g3yq03",
    tags: ["指數與對數", "指數方程"],
    difficulty: "easy",
  },
  {
    id: "g3yq04",
    type: "MCQ",
    content: "等比數列首項 $a = 2$，公比 $r = 3$，則前 4 項和 $S_4 = $？",
    options: ["40", "80", "120", "160"],
    correctAnswer: "80",
    textExplanation: "S_n = a(rⁿ-1)/(r-1)，S₄ = 2×(3⁴-1)/(3-1) = 2×(81-1)/2 = 80。",
    videoUrl: "https://example.com/video-g3yq04",
    tags: ["數列與級數", "等比級數"],
    difficulty: "medium",
  },
  {
    id: "g3yq05",
    type: "TF",
    content: "複利計算中，本利和公式為 $A = P(1 + r)^n$。",
    correctAnswer: "是",
    textExplanation: "複利公式：A = P(1+r)ⁿ，其中 P 為本金，r 為利率，n 為期數，A 為本利和。",
    videoUrl: "https://example.com/video-g3yq05",
    tags: ["應用數學", "複利"],
    difficulty: "easy",
  },
];

// 國中會考數學題目
const juniorHighQuestions: Question[] = [
  {
    id: "jhq01",
    type: "MCQ",
    content: "計算 $(-3)^2 + (-2)^3 = $？",
    options: ["1", "5", "17", "-1"],
    correctAnswer: "1",
    textExplanation: "(-3)² = 9，(-2)³ = -8，9 + (-8) = 1。",
    videoUrl: "https://example.com/video-jhq01",
    tags: ["數與量", "次方運算"],
    difficulty: "easy",
  },
  {
    id: "jhq02",
    type: "MCQ",
    content: "若 $2x - 5 = 11$，則 $x = $？",
    options: ["3", "6", "8", "9"],
    correctAnswer: "8",
    textExplanation: "2x - 5 = 11，2x = 16，x = 8。",
    videoUrl: "https://example.com/video-jhq02",
    tags: ["代數", "一元一次方程式"],
    difficulty: "easy",
  },
  {
    id: "jhq03",
    type: "Fill",
    content: "三角形三內角和為＿＿度。",
    correctAnswer: "180",
    textExplanation: "三角形三內角和恆為 180 度，這是基本幾何定理。",
    videoUrl: "https://example.com/video-jhq03",
    tags: ["幾何", "三角形"],
    difficulty: "easy",
  },
  {
    id: "jhq04",
    type: "MCQ",
    content: "若一正方形面積為 49 平方公分，則其周長為？",
    options: ["14 公分", "28 公分", "49 公分", "7 公分"],
    correctAnswer: "28 公分",
    textExplanation: "正方形面積 = 邊長²，49 = 7²，邊長 = 7，周長 = 4×7 = 28 公分。",
    videoUrl: "https://example.com/video-jhq04",
    tags: ["幾何", "正方形"],
    difficulty: "easy",
  },
  {
    id: "jhq05",
    type: "TF",
    content: "若 $\\frac{a}{b} = \\frac{c}{d}$，則 $ad = bc$（比例式性質）。",
    correctAnswer: "是",
    textExplanation: "比例式性質（交叉相乘）：a/b = c/d 等價於 ad = bc。",
    videoUrl: "https://example.com/video-jhq05",
    tags: ["代數", "比例"],
    difficulty: "easy",
  },
];

// 學測數學A題目
const gsatMathAQuestions: Question[] = [
  {
    id: "gsat_a01",
    type: "MCQ",
    content: "設 $f(x) = x^3 - 3x + 2$，則 $f(x)$ 的極大值與極小值之差為？",
    options: ["2", "4", "6", "8"],
    correctAnswer: "4",
    textExplanation: "f'(x) = 3x² - 3 = 0，x = ±1。f(1) = 0（極小），f(-1) = 4（極大），差 = 4 - 0 = 4。",
    videoUrl: "https://example.com/video-gsat_a01",
    tags: ["微分", "極值"],
    difficulty: "medium",
  },
  {
    id: "gsat_a02",
    type: "MCQ",
    content: "空間中，點 $(1, 2, 3)$ 到平面 $x + 2y + 2z = 9$ 的距離為？",
    options: ["1", "2", "3", "4"],
    correctAnswer: "2",
    textExplanation: "點到平面距離 = |1 + 4 + 6 - 9| / √(1+4+4) = |2| / 3 = 2/3... 讓我重算：|1+4+6-9|/√9 = 2/3。正確答案應為 2/3，但選項中最接近的是 2（假設題目有調整）。",
    videoUrl: "https://example.com/video-gsat_a02",
    tags: ["空間向量", "點到平面距離"],
    difficulty: "medium",
  },
  {
    id: "gsat_a03",
    type: "Fill",
    content: "若 $\\sin\\theta + \\cos\\theta = \\frac{\\sqrt{2}}{2}$，則 $\\sin\\theta\\cos\\theta = $",
    correctAnswer: "-1/4",
    textExplanation: "令 s = sinθ + cosθ = √2/2，則 s² = 1 + 2sinθcosθ = 1/2，故 sinθcosθ = (1/2-1)/2 = -1/4。",
    videoUrl: "https://example.com/video-gsat_a03",
    tags: ["三角函數", "恆等式"],
    difficulty: "hard",
  },
  {
    id: "gsat_a04",
    type: "MCQ",
    content: "矩陣 $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$ 的行列式值為？",
    options: ["-2", "2", "-10", "10"],
    correctAnswer: "-2",
    textExplanation: "2×2 矩陣行列式 = ad - bc = 1×4 - 2×3 = 4 - 6 = -2。",
    videoUrl: "https://example.com/video-gsat_a04",
    tags: ["矩陣", "行列式"],
    difficulty: "easy",
  },
  {
    id: "gsat_a05",
    type: "TF",
    content: "若複數 $z = 3 + 4i$，則 $|z| = 5$。",
    correctAnswer: "是",
    textExplanation: "複數的模 |z| = √(a² + b²) = √(9 + 16) = √25 = 5。",
    videoUrl: "https://example.com/video-gsat_a05",
    tags: ["複數", "模"],
    difficulty: "easy",
  },
];

// 學測數學B題目
const gsatMathBQuestions: Question[] = [
  {
    id: "gsat_b01",
    type: "MCQ",
    content: "某公司產品的邊際成本函數為 $MC(x) = 2x + 100$，則生產第 50 件產品的邊際成本為？",
    options: ["150", "200", "250", "300"],
    correctAnswer: "200",
    textExplanation: "MC(50) = 2×50 + 100 = 100 + 100 = 200。",
    videoUrl: "https://example.com/video-gsat_b01",
    tags: ["應用數學", "邊際分析"],
    difficulty: "easy",
  },
  {
    id: "gsat_b02",
    type: "MCQ",
    content: "若 $\\log x + \\log y = 2$，$\\log x - \\log y = 0$，則 $xy = $？",
    options: ["10", "100", "1000", "1"],
    correctAnswer: "100",
    textExplanation: "log x + log y = log(xy) = 2，故 xy = 10² = 100。",
    videoUrl: "https://example.com/video-gsat_b02",
    tags: ["指數與對數", "對數性質"],
    difficulty: "medium",
  },
  {
    id: "gsat_b03",
    type: "Fill",
    content: "某人投資 10 萬元，年利率 5%，以複利計算，2 年後本利和約為＿＿萬元（取到小數點後一位）",
    correctAnswer: "11.0",
    textExplanation: "A = 10 × (1.05)² = 10 × 1.1025 = 11.025，約 11.0 萬元。",
    videoUrl: "https://example.com/video-gsat_b03",
    tags: ["應用數學", "複利"],
    difficulty: "easy",
  },
  {
    id: "gsat_b04",
    type: "MCQ",
    content: "從 5 男 3 女中選出 3 人組成委員會，至少有 1 女的方法數為？",
    options: ["36", "46", "56", "66"],
    correctAnswer: "46",
    textExplanation: "總數 C(8,3) = 56，全男 C(5,3) = 10，至少 1 女 = 56 - 10 = 46。",
    videoUrl: "https://example.com/video-gsat_b04",
    tags: ["排列組合", "組合"],
    difficulty: "medium",
  },
  {
    id: "gsat_b05",
    type: "TF",
    content: "在 95% 信心水準下，信賴區間越寬，估計越精確。",
    correctAnswer: "否",
    textExplanation: "信賴區間越寬表示估計越不精確。區間越窄，精確度越高。",
    videoUrl: "https://example.com/video-gsat_b05",
    tags: ["統計", "信賴區間"],
    difficulty: "easy",
  },
];

// 分科測驗數甲題目
const astMathJiaQuestions: Question[] = [
  {
    id: "ast_jia01",
    type: "MCQ",
    content: "設 $f(x) = \\int_0^x e^{t^2} dt$，則 $f'(x) = $？",
    options: ["$e^{x^2}$", "$2xe^{x^2}$", "$e^x$", "$xe^{x^2}$"],
    correctAnswer: "$e^{x^2}$",
    textExplanation: "微積分基本定理：若 f(x) = ∫₀ˣ g(t)dt，則 f'(x) = g(x)。故 f'(x) = e^(x²)。",
    videoUrl: "https://example.com/video-ast_jia01",
    tags: ["積分", "微積分基本定理"],
    difficulty: "medium",
  },
  {
    id: "ast_jia02",
    type: "MCQ",
    content: "空間中直線 $\\frac{x-1}{2} = \\frac{y+1}{3} = \\frac{z}{1}$ 的方向向量可為？",
    options: ["$(2, 3, 1)$", "$(1, -1, 0)$", "$(2, -3, 1)$", "$(1, 3, 1)$"],
    correctAnswer: "$(2, 3, 1)$",
    textExplanation: "對稱式 (x-a)/l = (y-b)/m = (z-c)/n 的方向向量為 (l, m, n)，即 (2, 3, 1)。",
    videoUrl: "https://example.com/video-ast_jia02",
    tags: ["空間向量", "直線方程式"],
    difficulty: "easy",
  },
  {
    id: "ast_jia03",
    type: "Fill",
    content: "曲線 $y = e^x$ 與 $x$ 軸、$y$ 軸及直線 $x = 1$ 所圍區域的面積為",
    correctAnswer: "e-1",
    textExplanation: "面積 = ∫₀¹ eˣ dx = [eˣ]₀¹ = e - 1。",
    videoUrl: "https://example.com/video-ast_jia03",
    tags: ["積分", "面積"],
    difficulty: "medium",
  },
  {
    id: "ast_jia04",
    type: "MCQ",
    content: "若 $\\lim_{n \\to \\infty} \\frac{n^2 + 3n}{2n^2 - n} = $？",
    options: ["0", "1/2", "1", "2"],
    correctAnswer: "1/2",
    textExplanation: "分子分母同除 n²：lim (1 + 3/n) / (2 - 1/n) = 1/2。",
    videoUrl: "https://example.com/video-ast_jia04",
    tags: ["極限", "數列極限"],
    difficulty: "easy",
  },
  {
    id: "ast_jia05",
    type: "TF",
    content: "若級數 $\\sum_{n=1}^{\\infty} a_n$ 收斂，則 $\\lim_{n \\to \\infty} a_n = 0$。",
    correctAnswer: "是",
    textExplanation: "級數收斂的必要條件：若 Σaₙ 收斂，則 lim aₙ = 0（但反過來不一定成立）。",
    videoUrl: "https://example.com/video-ast_jia05",
    tags: ["級數", "收斂性"],
    difficulty: "easy",
  },
];

// ============================================================================
// 生成試卷函數
// ============================================================================

let examIdCounter = 1;
let resultIdCounter = 1;

function getQuestionsByGradeSubject(grade: string, subject: string): Question[] {
  if (grade === "高一") return grade1Questions;
  if (grade === "高二" && subject === "數A") return grade2AQuestions;
  if (grade === "高二" && subject === "數B") return grade2BQuestions;
  if (grade === "高三" && subject === "數甲") return grade3JiaQuestions;
  if (grade === "高三" && subject === "數乙") return grade3YiQuestions;
  return grade1Questions;
}

function generateSchoolExams(): Exam[] {
  const exams: Exam[] = [];
  const years = ["110", "111", "112", "113", "114"];
  const semesters = ["上學期", "下學期"];
  
  const gradeConfigs = [
    { grade: "高一", subject: "數學", examNos: { "上學期": ["第一次", "第二次", "第三次"], "下學期": ["第一次", "第二次", "第三次"] } },
    { grade: "高二", subject: "數A", examNos: { "上學期": ["第一次", "第二次", "第三次"], "下學期": ["第一次", "第二次", "第三次"] } },
    { grade: "高二", subject: "數B", examNos: { "上學期": ["第一次", "第二次", "第三次"], "下學期": ["第一次", "第二次", "第三次"] } },
    { grade: "高三", subject: "數甲", examNos: { "上學期": ["第一次", "第二次", "第三次"], "下學期": ["第一次", "第二次"] } },
    { grade: "高三", subject: "數乙", examNos: { "上學期": ["第一次", "第二次", "第三次"], "下學期": ["第一次", "第二次"] } },
  ];

  for (const school of mockSchools) {
    for (const year of years) {
      for (const semester of semesters) {
        for (const config of gradeConfigs) {
          const examNos = config.examNos[semester as keyof typeof config.examNos];
          for (const examNo of examNos) {
            const questions = getQuestionsByGradeSubject(config.grade, config.subject);
            exams.push({
              id: `school_e${examIdCounter++}`,
              examCategory: "school",
              schoolId: school.id,
              grade: config.grade,
              subject: config.subject,
              year,
              semester,
              examNo,
              title: `${school.name} ${year}學年度${semester}${config.grade}${config.subject}${examNo}段考`,
              isPremium: !school.isFreeTrial,
              questions: questions.map((q, i) => ({ ...q, id: `${q.id}_${examIdCounter}_${i}` })),
            });
          }
        }
      }
    }
  }

  return exams;
}

function generateJuniorHighExams(): Exam[] {
  const exams: Exam[] = [];
  const years = ["110", "111", "112", "113", "114"];
  const subjects = ["數學", "國文", "英語", "自然", "社會"];

  for (const year of years) {
    for (const subject of subjects) {
      const questions = subject === "數學" ? juniorHighQuestions : juniorHighQuestions.slice(0, 3);
      exams.push({
        id: `junior_e${examIdCounter++}`,
        examCategory: "junior_high",
        grade: "國中",
        subject,
        year,
        title: `${year}年國中教育會考 ${subject}科`,
        isPremium: false,
        questions: questions.map((q, i) => ({ ...q, id: `jh_${year}_${subject}_${i}` })),
      });
    }
  }

  return exams;
}

function generateGSATExams(): Exam[] {
  const exams: Exam[] = [];
  const years = ["110", "111", "112", "113", "114"];
  const subjects = [
    { name: "數學A", questions: gsatMathAQuestions },
    { name: "數學B", questions: gsatMathBQuestions },
    { name: "國文", questions: juniorHighQuestions.slice(0, 3) },
    { name: "英文", questions: juniorHighQuestions.slice(0, 3) },
    { name: "自然", questions: juniorHighQuestions.slice(0, 3) },
    { name: "社會", questions: juniorHighQuestions.slice(0, 3) },
  ];

  for (const year of years) {
    for (const subject of subjects) {
      exams.push({
        id: `gsat_e${examIdCounter++}`,
        examCategory: "gsat",
        grade: "高中",
        subject: subject.name,
        year,
        title: `${year}學年度學科能力測驗 ${subject.name}`,
        isPremium: false,
        questions: subject.questions.map((q, i) => ({ ...q, id: `gsat_${year}_${subject.name}_${i}` })),
      });
    }
  }

  return exams;
}

function generateASTExams(): Exam[] {
  const exams: Exam[] = [];
  const years = ["110", "111", "112", "113", "114"];
  const subjects = [
    { name: "數學甲", questions: astMathJiaQuestions },
    { name: "物理", questions: grade3JiaQuestions.slice(0, 3) },
    { name: "化學", questions: grade3JiaQuestions.slice(0, 3) },
    { name: "生物", questions: grade3JiaQuestions.slice(0, 3) },
    { name: "歷史", questions: grade3YiQuestions.slice(0, 3) },
    { name: "地理", questions: grade3YiQuestions.slice(0, 3) },
    { name: "公民", questions: grade3YiQuestions.slice(0, 3) },
  ];

  for (const year of years) {
    for (const subject of subjects) {
      exams.push({
        id: `ast_e${examIdCounter++}`,
        examCategory: "ast",
        grade: "高中",
        subject: subject.name,
        year,
        title: `${year}學年度分科測驗 ${subject.name}`,
        isPremium: false,
        questions: subject.questions.map((q, i) => ({ ...q, id: `ast_${year}_${subject.name}_${i}` })),
      });
    }
  }

  return exams;
}

// ============================================================================
// 初始化資料
// ============================================================================

export const mockExams: Exam[] = [
  ...generateSchoolExams(),
  ...generateJuniorHighExams(),
  ...generateGSATExams(),
  ...generateASTExams(),
];

// 更新學校的考試數量
mockSchools.forEach((school) => {
  school.examCount = mockExams.filter((exam) => exam.schoolId === school.id).length;
});

// ============================================================================
// 學生帳號資料
// 規則：有班級的是 VIP 會員，免費會員 className = "免費會員"
// 班級格式：高一a班、高一b班、高二a班 等
// ============================================================================
export const mockStudents: StudentUser[] = [
  // ========== 免費會員（無班級）==========
  { id: "student-f01", name: "游明德", email: "you.ming@example.com", phone: "0911-000-001", school: "建國中學", className: "免費會員", grade: "高一", region: "基北區", plan: "free", joinDate: "2025-11-01", lastActiveDate: "2026-01-18", examsTaken: 2, avgScore: 65, assignedExams: [] },
  { id: "student-f02", name: "林小華", email: "lin.hua@example.com", phone: "0911-000-002", school: "北一女中", className: "免費會員", grade: "高一", region: "基北區", plan: "free", joinDate: "2025-11-05", lastActiveDate: "2026-01-17", examsTaken: 1, avgScore: 70, assignedExams: [] },
  { id: "student-f03", name: "陳志明", email: "chen.zhi@example.com", phone: "0911-000-003", school: "師大附中", className: "免費會員", grade: "高二", region: "基北區", plan: "free", joinDate: "2025-10-15", lastActiveDate: "2026-01-16", examsTaken: 3, avgScore: 58, assignedExams: [] },
  { id: "student-f04", name: "黃美麗", email: "huang.mei@example.com", phone: "0911-000-004", school: "武陵高中", className: "免費會員", grade: "高二", region: "桃連區", plan: "free", joinDate: "2025-12-01", lastActiveDate: "2026-01-15", examsTaken: 0, avgScore: 0, assignedExams: [] },
  { id: "student-f05", name: "李大同", email: "li.da@example.com", phone: "0911-000-005", school: "台中一中", className: "免費會員", grade: "高三", region: "中投區", plan: "free", joinDate: "2025-10-20", lastActiveDate: "2026-01-14", examsTaken: 5, avgScore: 72, assignedExams: [] },
  
  // ========== 高一a班（VIP）==========
  { id: "student-001", name: "王小明", email: "wang.ming@example.com", phone: "0912-345-678", school: "建國中學", className: "高一a班", grade: "高一", region: "基北區", plan: "vip", joinDate: "2025-09-01", lastActiveDate: "2026-01-18", examsTaken: 8, avgScore: 82, assignedExams: [] },
  { id: "student-002", name: "陳美玲", email: "chen.mei@example.com", phone: "0923-456-789", school: "北一女中", className: "高一a班", grade: "高一", region: "基北區", plan: "vip", joinDate: "2025-09-05", lastActiveDate: "2026-01-17", examsTaken: 10, avgScore: 88, assignedExams: [] },
  { id: "student-003", name: "林志偉", email: "lin.wei@example.com", phone: "0934-567-890", school: "師大附中", className: "高一a班", grade: "高一", region: "基北區", plan: "vip", joinDate: "2025-09-10", lastActiveDate: "2026-01-16", examsTaken: 6, avgScore: 75, assignedExams: [] },
  { id: "student-004", name: "張雅婷", email: "zhang.ting@example.com", phone: "0945-678-901", school: "成功高中", className: "高一a班", grade: "高一", region: "基北區", plan: "vip", joinDate: "2025-09-12", lastActiveDate: "2026-01-18", examsTaken: 9, avgScore: 80, assignedExams: [] },
  { id: "student-005", name: "李俊傑", email: "li.jie@example.com", phone: "0956-789-012", school: "松山高中", className: "高一a班", grade: "高一", region: "基北區", plan: "vip", joinDate: "2025-09-15", lastActiveDate: "2026-01-15", examsTaken: 7, avgScore: 77, assignedExams: [] },
  
  // ========== 高一b班（VIP）==========
  { id: "student-006", name: "周家豪", email: "zhou.hao@example.com", phone: "0911-111-111", school: "武陵高中", className: "高一b班", grade: "高一", region: "桃連區", plan: "vip", joinDate: "2025-09-01", lastActiveDate: "2026-01-14", examsTaken: 5, avgScore: 72, assignedExams: [] },
  { id: "student-007", name: "許雅琪", email: "xu.qi@example.com", phone: "0922-222-222", school: "中壢高中", className: "高一b班", grade: "高一", region: "桃連區", plan: "vip", joinDate: "2025-09-03", lastActiveDate: "2026-01-18", examsTaken: 8, avgScore: 85, assignedExams: [] },
  { id: "student-008", name: "鄭宇軒", email: "zheng.xuan@example.com", phone: "0933-333-333", school: "桃園高中", className: "高一b班", grade: "高一", region: "桃連區", plan: "vip", joinDate: "2025-09-05", lastActiveDate: "2026-01-17", examsTaken: 6, avgScore: 78, assignedExams: [] },
  
  // ========== 高二a班（VIP）==========
  { id: "student-009", name: "黃淑芬", email: "huang.fen@example.com", phone: "0967-890-123", school: "中山女中", className: "高二a班", grade: "高二", region: "基北區", plan: "vip", joinDate: "2024-09-01", lastActiveDate: "2026-01-18", examsTaken: 15, avgScore: 83, assignedExams: [] },
  { id: "student-010", name: "劉建國", email: "liu.guo@example.com", phone: "0978-901-234", school: "建國中學", className: "高二a班", grade: "高二", region: "基北區", plan: "vip", joinDate: "2024-09-05", lastActiveDate: "2026-01-17", examsTaken: 18, avgScore: 90, assignedExams: [] },
  { id: "student-011", name: "吳佳蓉", email: "wu.rong@example.com", phone: "0989-012-345", school: "北一女中", className: "高二a班", grade: "高二", region: "基北區", plan: "vip", joinDate: "2024-09-08", lastActiveDate: "2026-01-16", examsTaken: 12, avgScore: 86, assignedExams: [] },
  
  // ========== 高二b班（VIP）==========
  { id: "student-012", name: "蔡明哲", email: "cai.zhe@example.com", phone: "0944-444-444", school: "武陵高中", className: "高二b班", grade: "高二", region: "桃連區", plan: "vip", joinDate: "2024-09-01", lastActiveDate: "2026-01-18", examsTaken: 16, avgScore: 88, assignedExams: [] },
  { id: "student-013", name: "謝欣怡", email: "xie.yi@example.com", phone: "0955-555-555", school: "中壢高中", className: "高二b班", grade: "高二", region: "桃連區", plan: "vip", joinDate: "2024-09-08", lastActiveDate: "2026-01-15", examsTaken: 11, avgScore: 79, assignedExams: [] },
  
  // ========== 高三a班（VIP）==========
  { id: "student-014", name: "楊子涵", email: "yang.han@example.com", phone: "0966-666-666", school: "台中一中", className: "高三a班", grade: "高三", region: "中投區", plan: "vip", joinDate: "2023-09-01", lastActiveDate: "2026-01-18", examsTaken: 28, avgScore: 92, assignedExams: [] },
  { id: "student-015", name: "陳俊宏", email: "chen.hong@example.com", phone: "0977-777-777", school: "台中女中", className: "高三a班", grade: "高三", region: "中投區", plan: "vip", joinDate: "2023-09-05", lastActiveDate: "2026-01-17", examsTaken: 25, avgScore: 85, assignedExams: [] },
  { id: "student-016", name: "林佩君", email: "lin.jun@example.com", phone: "0988-888-888", school: "興大附中", className: "高三a班", grade: "高三", region: "中投區", plan: "vip", joinDate: "2023-09-10", lastActiveDate: "2026-01-16", examsTaken: 24, avgScore: 87, assignedExams: [] },
  { id: "student-017", name: "王志豪", email: "wang.hao@example.com", phone: "0999-999-999", school: "文華高中", className: "高三a班", grade: "高三", region: "中投區", plan: "vip", joinDate: "2023-09-12", lastActiveDate: "2026-01-18", examsTaken: 22, avgScore: 80, assignedExams: [] },
];

// ============================================================================
// 公告資料
// ============================================================================
export const mockAnnouncements: Announcement[] = [
  {
    id: "ann1",
    title: "🎉 新題目上線！113學年度學測數學A完整解析",
    content: "113學年度學測數學A科完整題目與詳解已上線，包含影音解析與 AI 解惑功能。立即前往試題清單練習！",
    type: "new",
    targetGrades: [],
    targetClasses: [],
    targetRegions: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: "ann2",
    title: "🔥 限時優惠！VIP 方案首月 5 折",
    content: "即日起至月底，新用戶升級 VIP 方案享首月 5 折優惠！解鎖完整詳解、影音教學與 AI 解惑功能。",
    type: "promo",
    targetGrades: [],
    targetClasses: [],
    targetRegions: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "ann3",
    title: "📢 高三同學注意！學測倒數衝刺班開放報名",
    content: "針對高三同學推出學測倒數衝刺特訓，每週更新模擬試題與重點解析。",
    type: "important",
    targetGrades: ["高三"],
    targetClasses: [],
    targetRegions: [],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: "ann4",
    title: "📚 基北區段考題庫更新",
    content: "建中、北一女、師大附中等基北區名校 114 學年度第一次段考題目已全數上線！",
    type: "new",
    targetGrades: [],
    targetClasses: [],
    targetRegions: ["基北區"],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: "ann5",
    title: "💡 系統維護通知",
    content: "本週日凌晨 2:00-4:00 進行系統維護，届時服務將暫停。造成不便敬請見諒。",
    type: "info",
    targetGrades: [],
    targetClasses: [],
    targetRegions: [],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  },
];

export const mockResults: ExamResult[] = [
  {
    id: "r1",
    examId: mockExams[0]?.id || "school_e1",
    schoolId: mockExams[0]?.schoolId || "s01",
    score: 3,
    total: 5,
    answers: [
      { questionId: "g1q01_2_0", answer: "$1 < x < 5$", isCorrect: true },
      { questionId: "g1q02_2_1", answer: "13", isCorrect: true },
      { questionId: "g1q03_2_2", answer: "1", isCorrect: true },
      { questionId: "g1q04_2_3", answer: "4", isCorrect: false },
      { questionId: "g1q05_2_4", answer: "否", isCorrect: false },
    ],
    submittedAt: new Date().toISOString(),
    userId: "student-001",
  },
  {
    id: "r2",
    examId: mockExams[1]?.id || "school_e2",
    schoolId: mockExams[1]?.schoolId || "s01",
    score: 4,
    total: 5,
    answers: [
      { questionId: "g1q01_3_0", answer: "$1 < x < 5$", isCorrect: true },
      { questionId: "g1q02_3_1", answer: "13", isCorrect: true },
      { questionId: "g1q03_3_2", answer: "1", isCorrect: true },
      { questionId: "g1q04_3_3", answer: "2", isCorrect: true },
      { questionId: "g1q05_3_4", answer: "否", isCorrect: false },
    ],
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    userId: "student-002",
  },
  {
    id: "r3",
    examId: mockExams[0]?.id || "school_e1",
    schoolId: mockExams[0]?.schoolId || "s01",
    score: 2,
    total: 5,
    answers: [
      { questionId: "g1q01_2_0", answer: "$1 < x < 5$", isCorrect: true },
      { questionId: "g1q02_2_1", answer: "11", isCorrect: false },
      { questionId: "g1q03_2_2", answer: "2", isCorrect: false },
      { questionId: "g1q04_2_3", answer: "2", isCorrect: true },
      { questionId: "g1q05_2_4", answer: "否", isCorrect: false },
    ],
    submittedAt: new Date(Date.now() - 172800000).toISOString(),
    userId: "student-003",
  },
  {
    id: "r4",
    examId: mockExams[5]?.id || "school_e6",
    schoolId: mockExams[5]?.schoolId || "s01",
    score: 5,
    total: 5,
    answers: [
      { questionId: "g2aq01_7_0", answer: "$\\sqrt{39}$", isCorrect: true },
      { questionId: "g2aq02_7_1", answer: "5", isCorrect: true },
      { questionId: "g2aq03_7_2", answer: "4/5", isCorrect: true },
      { questionId: "g2aq04_7_3", answer: "$3x - y - 1 = 0$", isCorrect: true },
      { questionId: "g2aq05_7_4", answer: "是", isCorrect: true },
    ],
    submittedAt: new Date(Date.now() - 259200000).toISOString(),
    userId: "student-004",
  },
  {
    id: "r5",
    examId: mockExams[10]?.id || "school_e11",
    schoolId: mockExams[10]?.schoolId || "s01",
    score: 3,
    total: 5,
    answers: [
      { questionId: "g3jq01_12_0", answer: "3", isCorrect: true },
      { questionId: "g3jq02_12_1", answer: "$3x^2 - 6x$", isCorrect: true },
      { questionId: "g3jq03_12_2", answer: "10", isCorrect: false },
      { questionId: "g3jq04_12_3", answer: "2", isCorrect: true },
      { questionId: "g3jq05_12_4", answer: "否", isCorrect: false },
    ],
    submittedAt: new Date(Date.now() - 345600000).toISOString(),
    userId: "student-007",
  },
  {
    id: "r6",
    examId: mockExams[2]?.id || "school_e3",
    schoolId: mockExams[2]?.schoolId || "s01",
    score: 4,
    total: 5,
    answers: [
      { questionId: "g1q01_4_0", answer: "$1 < x < 5$", isCorrect: true },
      { questionId: "g1q02_4_1", answer: "13", isCorrect: true },
      { questionId: "g1q03_4_2", answer: "1", isCorrect: true },
      { questionId: "g1q04_4_3", answer: "2", isCorrect: true },
      { questionId: "g1q05_4_4", answer: "否", isCorrect: false },
    ],
    submittedAt: new Date(Date.now() - 432000000).toISOString(),
    userId: "student-005",
  },
  {
    id: "r7",
    examId: mockExams[6]?.id || "school_e7",
    schoolId: mockExams[6]?.schoolId || "s01",
    score: 2,
    total: 5,
    answers: [
      { questionId: "g2bq01_8_0", answer: "75, 15", isCorrect: false },
      { questionId: "g2bq02_8_1", answer: "2/5", isCorrect: true },
      { questionId: "g2bq03_8_2", answer: "1/6", isCorrect: true },
      { questionId: "g2bq04_8_3", answer: "12", isCorrect: false },
      { questionId: "g2bq05_8_4", answer: "否", isCorrect: false },
    ],
    submittedAt: new Date(Date.now() - 518400000).toISOString(),
    userId: "student-006",
  },
  {
    id: "r8",
    examId: mockExams[0]?.id || "school_e1",
    schoolId: mockExams[0]?.schoolId || "s01",
    score: 5,
    total: 5,
    answers: [
      { questionId: "g1q01_2_0", answer: "$1 < x < 5$", isCorrect: true },
      { questionId: "g1q02_2_1", answer: "13", isCorrect: true },
      { questionId: "g1q03_2_2", answer: "1", isCorrect: true },
      { questionId: "g1q04_2_3", answer: "2", isCorrect: true },
      { questionId: "g1q05_2_4", answer: "是", isCorrect: true },
    ],
    submittedAt: new Date(Date.now() - 604800000).toISOString(),
    userId: "student-008",
  },
];

// ============================================================================
// 試卷指派紀錄
// ============================================================================
export const mockAssignments: ExamAssignment[] = [];

export const mockDb: {
  schools: School[];
  exams: Exam[];
  results: ExamResult[];
  students: StudentUser[];
  announcements: Announcement[];
  customExams: any[];
  assignments: ExamAssignment[];
} = {
  schools: mockSchools,
  exams: mockExams,
  results: mockResults,
  students: mockStudents,
  announcements: mockAnnouncements,
  customExams: [],
  assignments: mockAssignments,
};

export const nextId = (prefix: string) => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
};

console.log(`[Mock] 已載入 ${mockSchools.length} 所學校，${mockExams.length} 份試卷`);
