const DICTIONARY = {
  en: {
    // Welcome
    "badge_task": "Task 01/03",
    "app_title": "Attention & Working Memory",
    "app_tagline": "High-precision cognitive profiling for competitive e-sports.",
    "intake_title": "Candidate Intake / Registration",
    "label_name": "Legal Name",
    "label_email": "Email Address",
    "label_age": "Age",
    "label_gender": "Gender",
    "gender_select": "Select...",
    "gender_male": "Male",
    "gender_female": "Female",
    "gender_other": "Other",
    "gender_none": "Do not want to declare",
    "label_handle": "Gamer Handle",
    "privacy_text": "I agree to the <a href='#' style='color:var(--accent-volt); text-decoration:none;'>Privacy Policy</a> and consent to the collection of my cognitive and device telemetry data for evaluation purposes.",
    "disclaimer_text": "Please secure <strong>12 minutes</strong> to complete this task. If you are not able to complete all tasks in a row within 12 mins, you will need to try again. The system logs you out automatically.",
    "btn_init": "Initialize Assessment →",
    "powered_by": "Powered by",
    "lang_toggle": "日本語",

    // Instructions
    "btn_ready": "I'm Ready — Begin →",
    "dist_tip": "This task measures your ability to <strong>filter out irrelevant information</strong> while maintaining memory for relevant items.",
    "dist_color": "Colored = Remember these",
    "dist_gray": "Gray = IGNORE (distractors)",
    "step_title": "Step by Step",

    // Task 1: VWM Pure
    "t1_tag": "TASK 1 OF 3",
    "t1_title": "Working Memory Capacity task",
    "t1_sum": "This task challenges your visual short-term memory capacity. How many items can you remember?",
    "t1_s1": "A fixation cross <strong>+</strong> appears — focus on it.",
    "t1_s2": "You will briefly see coloured squares on the screen. Your task is to remember the color of the square as many items as you can within the brief flash moment.",
    "t1_s3": "After a blank, the squares reappear at which you need to indicate the one square still being coloured (“the target”) is same as the previous display or different by pressing a button.",
    "t1_s4": "<strong style='color:var(--accent-volt)'>Respond as accurate as possible, try your best to get all trials correct. Speed is not important in this task.</strong>",

    // Task 2: VWM Distractor
    "t2_tag": "TASK 2 OF 3",
    "t2_title": "Working Memory Filtering task",
    "t2_sum": "Same as before — but now <strong>gray distractor items</strong> also appear. You must <strong>completely ignore</strong> the gray items and remember only the colored ones.",
    "t2_s1": "Colored target items AND gray distractor items appear together.",
    "t2_s2": "<strong>Focus only on the colored items</strong> — ignore everything gray.",
    "t2_s3": "A blank period follows — hold the target colors in memory.",
    "t2_s4": "One target reappears in color; the rest are empty outlines.",
    "t2_s5": "Decide if that one colored item is the SAME or DIFFERENT.",
    "t2_s6": "<strong style='color:var(--accent-volt)'>Respond as accurate as possible, try your best to get all trials correct. Speed is not important in this task.</strong>",

    // Task 3: ANT
    "t3_tag": "TASK 3 OF 3",
    "t3_title": "Attention Network Test",
    "t3_sum": "An arrow will appear on screen, flanked by other arrows. Identify the direction of the <strong>center arrow only</strong> as fast as possible.",
    "t3_s1": "A fixation cross appears in the center.",
    "t3_s2": "Sometimes a brief circle cue will flash — indicating timing or location.",
    "t3_s3": "An arrow target appears above or below center, surrounded by flankers.",
    "t3_s4": "Identify only the <strong>center arrow</strong> direction — ignore flankers.",
    "t3_s5": "Press <kbd>←</kbd> for LEFT, <kbd>→</kbd> for RIGHT.",
    "t3_s6": "Respond as quickly and accurately as possible.",

    // Keys
    "key_same": "Same",
    "key_diff": "Different",
    "key_left": "Left",
    "key_right": "Right",

    // Engine
    "eng_ready": "READY",
    "eng_set": "SET",
    "eng_go": "GO",

    // Transition
    "tr_title": "Phase Complete",
    "tr_task": "Task",
    "tr_of3": "of 3 completed",
    "tr_break": "Take a short break. When you're ready, proceed to the next phase.",
    "tr_continue": "Continue →",

    // Complete
    "cv_title": "Assessment Complete",
    "cv_acc": "You successfully completed with {acc}% accuracy! Well Done!",
    "cv_msg": "Your results have been securely recorded and will be reviewed by our team. We'll be in touch soon.",
    "cv_status": "Status",
    "cv_candidate": "Candidate",
    "cv_tasks": "Tasks completed",
    "cv_id": "Assessment ID",
    "cv_submit": "Submitted (Cloud Sync Ready)",
    "cv_close": "You may now close this window.",

    // Task View
    "tv_skip": "Skip Section ⤑",
    "tv_skipping": "SKIPPING...",
    "tv_targets": "Targets",
    "tv_distractors": "Distractors"
  },
  ja: {
    // Welcome
    "badge_task": "タスク 01/03",
    "app_title": "注意力とワーキングメモリ",
    "app_tagline": "競技eスポーツのための高精度認知プロファイリング。",
    "intake_title": "候補者登録 / 登録フォーム",
    "label_name": "氏名",
    "label_email": "メールアドレス",
    "label_age": "年齢",
    "label_gender": "性別",
    "gender_select": "選択してください...",
    "gender_male": "男性",
    "gender_female": "女性",
    "gender_other": "その他",
    "gender_none": "回答しない",
    "label_handle": "ゲーマーハンドル",
    "privacy_text": "<a href='#' style='color:var(--accent-volt); text-decoration:none;'>プライバシーポリシー</a>に同意し、評価目的での認知およびデバイステレメトリデータの収集に同意します。",
    "disclaimer_text": "このタスクを完了するために<strong>12分</strong>を確保してください。12分以内にすべてのタスクを連続して完了できない場合は、もう一度やり直す必要があります。システムは自動的にログアウトします。",
    "btn_init": "評価を開始する →",
    "powered_by": "提供：",
    "lang_toggle": "English",

    // Instructions
    "btn_ready": "準備完了 — 始める →",
    "dist_tip": "このタスクは、関連するアイテムの記憶を維持しながら、<strong>無関係な情報を除外する能力</strong>を測定します。",
    "dist_color": "色付き = これらを記憶する",
    "dist_gray": "灰色 = 無視する（妨害）",
    "step_title": "ステップバイステップ",

    // Task 1: VWM Pure
    "t1_tag": "タスク 1 / 3",
    "t1_title": "ワーキングメモリ容量タスク",
    "t1_sum": "このタスクは、視覚的な短期記憶容量に挑戦します。あなたはいくつのアイテムを覚えられますか？",
    "t1_s1": "中央に十字マーク <strong>+</strong> が表示されます。それに注目してください。",
    "t1_s2": "画面に色付きの四角形が一瞬表示されます。あなたのタスクは、その短い瞬間にできるだけ多くの四角形の色を覚えることです。",
    "t1_s3": "空白の後、四角形が再び表示されます。そのうちの1つだけが色付けされています（「ターゲット」）。それが以前の表示と同じ色か、違う色かをボタンを押して指示してください。",
    "t1_s4": "<strong style='color:var(--accent-volt)'>可能な限り正確に回答し、すべての試行で正解するように最善を尽くしてください。このタスクでは速度は重要ではありません。</strong>",

    // Task 2: VWM Distractor
    "t2_tag": "タスク 2 / 3",
    "t2_title": "ワーキングメモリフィルタリングタスク",
    "t2_sum": "前回と同じですが、今回は<strong>灰色の妨害アイテム</strong>も表示されます。灰色のアイテムは<strong>完全に無視</strong>し、色付きのアイテムだけを覚えてください。",
    "t2_s1": "色付きのターゲットアイテムと灰色の妨害アイテムが一緒に表示されます。",
    "t2_s2": "<strong>色付きのアイテムだけに集中してください</strong> — 灰色のものはすべて無視してください。",
    "t2_s3": "空白の時間が続きます — ターゲットの色を記憶にとどめてください。",
    "t2_s4": "ターゲットの1つが再び色付きで表示されます。残りは空の輪郭です。",
    "t2_s5": "その色付きのアイテムが同じ（SAME）か違う（DIFFERENT）かを判断してください。",
    "t2_s6": "<strong style='color:var(--accent-volt)'>可能な限り正確に回答し、すべての試行で正解するように最善を尽くしてください。このタスクでは速度は重要ではありません。</strong>",

    // Task 3: ANT
    "t3_tag": "タスク 3 / 3",
    "t3_title": "アテンション・ネットワーク・テスト",
    "t3_sum": "画面に矢印が表示され、両側を他の矢印に挟まれています。<strong>中央の矢印の方向だけ</strong>を可能な限り早く特定してください。",
    "t3_s1": "中央に十字マークが表示されます。",
    "t3_s2": "時々、短い円のキュー（合図）が点滅します — これはタイミングや場所を示します。",
    "t3_s3": "中央の上または下に、側面を囲まれた矢印のターゲットが表示されます。",
    "t3_s4": "<strong>中央の矢印の方向</strong>だけを特定してください — 側面の矢印は無視してください。",
    "t3_s5": "左の場合は <kbd>←</kbd> を、右の場合は <kbd>→</kbd> を押してください。",
    "t3_s6": "可能な限り早く、正確に回答してください。",

    // Keys
    "key_same": "同じ",
    "key_diff": "違う",
    "key_left": "左",
    "key_right": "右",

    // Engine
    "eng_ready": "準備",
    "eng_set": "用意",
    "eng_go": "スタート",

    // Transition
    "tr_title": "フェーズ完了",
    "tr_task": "タスク",
    "tr_of3": "/ 3 完了",
    "tr_break": "短い休憩を取ってください。準備ができたら、次のフェーズに進んでください。",
    "tr_continue": "次へ進む →",

    // Complete
    "cv_title": "評価完了",
    "cv_acc": "正解率 {acc}% で無事完了しました！よくできました！",
    "cv_msg": "結果は安全に記録され、私たちのチームによって審査されます。近日中にご連絡いたします。",
    "cv_status": "ステータス",
    "cv_candidate": "候補者",
    "cv_tasks": "完了したタスク",
    "cv_id": "評価ID",
    "cv_submit": "送信済み (クラウド同期準備完了)",
    "cv_close": "このウィンドウを閉じてかまいません。",

    // Task View
    "tv_skip": "スキップ ⤑",
    "tv_skipping": "スキップしています...",
    "tv_targets": "ターゲット",
    "tv_distractors": "妨害アイテム"
  }
};

let currentLang = localStorage.getItem('vwm_lang') || 'en';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (DICTIONARY[lang]) {
    currentLang = lang;
    localStorage.setItem('vwm_lang', lang);
  }
}

export function t(key, vars = {}) {
  let str = DICTIONARY[currentLang][key] || DICTIONARY['en'][key] || key;
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}
