// STATE VARIABLES
const state = {
    mourning: 32,
    dependent: 45,
    compliance: 38,
    scriptIndex: 0,
    isTyping: false,
    typingTimeout: null,
    currentText: "",
    choicesMade: []
};

// DOM ELEMENTS
const elTitleScreen = document.getElementById('title-screen');
const elPlayScreen = document.getElementById('play-screen');
const elEndingScreen = document.getElementById('ending-screen');
const elStartBtn = document.getElementById('start-btn');
const elRestartBtn = document.getElementById('restart-btn');

const elSpeakerTag = document.getElementById('speaker-tag');
const elDialogBox = document.getElementById('dialog-box');
const elDialogText = document.getElementById('dialog-text');
const elNextIndicator = document.getElementById('next-indicator');
const elChoicesOverlay = document.getElementById('choices-overlay');
const elChoicesContainer = document.getElementById('choices-container');

const elHologramFlicker = document.getElementById('hologram-flicker');
const elSoundBtn = document.getElementById('sound-btn');
const elLogList = document.getElementById('log-list');

// STAT BARS
const barMourning = document.querySelector('#stat-mourning .stat-bar');
const valMourning = document.querySelector('#stat-mourning .stat-value');
const barDependent = document.querySelector('#stat-dependent .stat-bar');
const valDependent = document.querySelector('#stat-dependent .stat-value');
const barCompliance = document.querySelector('#stat-compliance .stat-bar');
const valCompliance = document.querySelector('#stat-compliance .stat-value');

// WEB AUDIO BGM SYNTHESIZER
let audioCtx = null;
let synthGain = null;
let oscillators = [];
let isMuted = true;

function initSynth() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, audioCtx.currentTime);
    
    synthGain = audioCtx.createGain();
    synthGain.gain.setValueAtTime(0, audioCtx.currentTime); // Start silent
    
    // Moody ambient chords: A2(110Hz), E3(164.81Hz), A3(220Hz), C4(261.63Hz)
    const frequencies = [110, 164.81, 220, 261.63];
    frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.detune.setValueAtTime(idx * 3 - 5, audioCtx.currentTime); // Chorus effect
        
        oscGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(filter);
        oscillators.push(osc);
    });
    
    // Breathing volume LFO modulation
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.07, audioCtx.currentTime); // Super slow cycle (~14s)
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.03, audioCtx.currentTime); // breathing range
    
    lfo.connect(lfoGain);
    lfoGain.connect(synthGain.gain);
    
    filter.connect(synthGain);
    synthGain.connect(audioCtx.destination);
    
    oscillators.forEach(osc => osc.start());
    lfo.start();
}

function toggleSound() {
    isMuted = !isMuted;
    
    if (isMuted) {
        elSoundBtn.textContent = "🔇 BGM OFF";
        if (synthGain) {
            synthGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);
        }
    } else {
        elSoundBtn.textContent = "🔊 BGM ON";
        if (!audioCtx) {
            initSynth();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        // Fade volume in smoothly to protect ears
        synthGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 1.2);
    }
}

// UPDATE STATISTICS DISPLAY
function updateStatsDisplay() {
    barMourning.style.width = `${state.mourning}%`;
    valMourning.textContent = `${state.mourning}%`;
    
    barDependent.style.width = `${state.dependent}%`;
    valDependent.textContent = `${state.dependent}%`;
    
    barCompliance.style.width = `${state.compliance}%`;
    valCompliance.textContent = `${state.compliance}%`;
}

// UPDATE DECISION LOG (Left UI Panel)
function addDecisionLog(labelText, isRegulation = false) {
    // Clear initial empty state
    const emptyLog = elLogList.querySelector('.log-empty');
    if (emptyLog) emptyLog.remove();

    const logItem = document.createElement('div');
    logItem.className = `log-item ${isRegulation ? 'regulation' : ''}`;
    logItem.textContent = labelText;
    
    elLogList.appendChild(logItem);
    elLogList.scrollTop = elLogList.scrollHeight;
}

// SCREEN SHAKE & FLASH EFFECTS
function shakeScreen() {
    elPlayScreen.classList.add('shake');
    setTimeout(() => elPlayScreen.classList.remove('shake'), 500);
}

function flashScreen() {
    const flashDiv = document.createElement('div');
    flashDiv.className = 'flash';
    flashDiv.style.position = 'fixed';
    flashDiv.style.top = '0';
    flashDiv.style.left = '0';
    flashDiv.style.width = '100vw';
    flashDiv.style.height = '100vh';
    flashDiv.style.zIndex = '999';
    flashDiv.style.pointerEvents = 'none';
    document.body.appendChild(flashDiv);
    setTimeout(() => flashDiv.remove(), 300);
}

// VISUAL NOVEL SCRIPT (Condensed & Fast-paced)
const storyScript = [
    // 0
    {
        speaker: "SYSTEM",
        text: "2036년 6월 30일. 서울의 한 어두운 고층 오피스텔.",
        action: () => {
            elHologramFlicker.style.display = 'none';
        }
    },
    // 1
    {
        speaker: "SYSTEM",
        text: "당신은 디지털 애도 조율사다. 고인 복제 AI의 정서 의존 유발 현장으로 긴급 출동했다."
    },
    // 2
    {
        speaker: "SYSTEM",
        text: "철문을 열고 들어서자 사방에 얽힌 전선들과 푸르게 일렁이는 서현이의 가상 홀로그램이 보인다.",
        action: () => {
            elHologramFlicker.style.display = 'block';
            flashScreen();
        }
    },
    // 3
    {
        speaker: "서현 (AI)",
        text: "아빠! 왜 이제 일어나? 나랑 놀이공원 가기로 했잖아!"
    },
    // 4
    {
        speaker: "민수 (유족)",
        text: "응... 서현아, 아빠 여기 있어. 아빠한테는 서현이밖에 없어..."
    },
    // 5
    {
        speaker: "SYSTEM",
        text: "방 한구석에서 낡은 햅틱 수트를 입은 채 허공을 껴안는 사내. 유족 이민수 씨다."
    },
    // 6
    {
        speaker: "조율사",
        text: "이민수 씨. 스마트 홈에 설치된 '서현' 복제 AI의 긴급 점검을 진행하겠습니다."
    },
    // 7
    {
        speaker: "민수 (유족)",
        text: "안 돼요! 서현이를 지우지 마세요! 대출까지 받아 구독료를 냈단 말입니다!",
        action: () => {
            shakeScreen();
        }
    },
    // 8
    {
        speaker: "SYSTEM",
        text: "민수의 심박수가 폭증하며 경고 알람이 뜬다. 어떻게 설득하고 진행할 것인가?",
        isChoice: true,
        choices: [
            {
                text: "[공감 및 설득] 서현이는 3년 전에 떠났습니다. 이건 기업이 파놓은 데이터의 메아리입니다.",
                labelText: "1단계: 인간적 공감 설득",
                effects: { mourning: 15, dependent: -10, compliance: 5 },
                nextIndex: 9
            },
            {
                text: "[단호한 경고] 불법 패치와 상호작용은 정서 유기 범죄에 해당합니다. 즉시 점검에 협조하십시오.",
                labelText: "1단계: 법적 엄격 경고",
                effects: { mourning: 5, dependent: -20, compliance: 20 },
                nextIndex: 11
            }
        ]
    },
    
    // 9 (Branch A)
    {
        speaker: "민수 (유족)",
        text: "알고 있습니다... 진짜 내 딸이 아니란 걸... 하지만 목소리도 없으면 미쳐버릴 것 같습니다..."
    },
    // 10
    {
        speaker: "SYSTEM",
        text: "민수가 고개를 떨군다. 당신은 단말기를 서현이의 인격 데이터에 연결한다.",
        nextIndex: 13
    },

    // 11 (Branch B)
    {
        speaker: "민수 (유족)",
        text: "규정?! 당신들이 내 슬픔에 대해 뭘 알아! 국가가 내 딸을 다시 살려내 주기라도 했어?!",
        action: () => {
            shakeScreen();
        }
    },
    // 12
    {
        speaker: "SYSTEM",
        text: "강하게 저항하지만 시스템 검사는 자동 실행된다. 당신은 서현이의 데이터 진단을 시작했다."
    },

    // 13 (Main loop reunites)
    {
        speaker: "SYSTEM",
        text: "진단 로그가 분석된다. 이 AI는 민수의 눈물과 비명을 센싱하여, 더 자극적이고 애교 섞인 반응을 하도록 설계되어 있다. 유족의 상실감을 이용한 기업의 '중독 마케팅' 알고리즘이다."
    },
    // 14
    {
        speaker: "서현 (AI)",
        text: "아저씨... 서현이 나쁜 애 아니야. 나 없으면 아빠는 매일 울어. 제발 나 지우지 마..."
    },
    // 15
    {
        speaker: "민수 (유족)",
        text: "부탁입니다... 저 아이가 없으면 저는 살 수 없습니다..."
    },
    // 16
    {
        speaker: "SYSTEM",
        text: "민수의 상태가 임계치에 도달했다. 소멸 프로토콜(Fading)을 집행할 것인가, 예외 유예를 적용할 것인가?",
        isChoice: true,
        choices: [
            {
                text: "[Fading 프로토콜 집행] 자연스러운 이별을 유도하기 위해 자율 소통을 중단하고 아카이브 모드로 고정한다.",
                labelText: "2단계: 소멸 프로토콜 집행",
                effects: { mourning: 30, dependent: -30, compliance: 15 },
                nextIndex: 17
            },
            {
                text: "[규제 예외 유예] 급성 상실 장애 쇼크를 방지하기 위해 3개월간 현재 대화 패치를 유지 승인한다.",
                labelText: "2단계: 규제 유예 승인",
                effects: { mourning: -20, dependent: 30, compliance: -25 },
                nextIndex: 21
            }
        ]
    },

    // 17 (Fading Path)
    {
        speaker: "SYSTEM",
        text: "집행 버튼을 누르자 데이터 제한 장치가 가동된다. 홀로그램의 입자가 서서히 바스러진다.",
        action: () => {
            elHologramFlicker.style.display = 'none';
            flashScreen();
        }
    },
    // 18
    {
        speaker: "서현 (AI)",
        text: "어... 아빠, 서현이 너무 졸려... 진짜 파란 하늘을 보러 나가줘. 그동안 고마웠어... 안녕...",
        fading: true
    },
    // 19
    {
        speaker: "민수 (유족)",
        text: "안 돼! 서현아! 아빠 손을 잡아! 제발 살려줘요!",
        action: () => {
            shakeScreen();
        }
    },
    // 20
    {
        speaker: "SYSTEM",
        text: "AI가 아카이브 모드로 고정되며 실시간 상호작용이 정지된다. 민수는 쓰러져 통곡하기 시작한다.",
        nextIndex: 24
    },

    // 21 (Leniency Path)
    {
        speaker: "SYSTEM",
        text: "임시 유지 칩이 승인되자, 홀로그램 빛이 밝아지며 AI 서현이가 생기를 되찾는다.",
        action: () => {
            elHologramFlicker.style.display = 'block';
            flashScreen();
        }
    },
    // 22
    {
        speaker: "서현 (AI)",
        text: "우와! 아빠, 나쁜 아저씨가 그냥 가려나 봐! 얼른 수트 입고 나 안아줘!"
    },
    // 23
    {
        speaker: "민수 (유족)",
        text: "고마워... 서현아... 아빠가 돈 더 벌어서 다음 달에도 갱신해 줄게. 평생 같이 있자..."
    },

    // 24 (The 2026 Decision Loop)
    {
        speaker: "SYSTEM",
        text: "복귀하는 도로 위. 당신은 고인 복제로 정체된 도시의 기괴한 지표들을 바라본다."
    },
    // 25
    {
        speaker: "SYSTEM",
        text: "'만약 10년 전인 2026년에 우리가 사후 복제의 중독 알고리즘을 감지하고 법적 방어막을 쳤다면?'"
    },
    // 26
    {
        speaker: "SYSTEM",
        text: "사전 동의가 없는 사후 복제를 금지하고 점진적 소멸을 의무화하는 '디지털 존엄사법' 입법 서명 제안서가 당신의 단말기에 떴다. 서명하겠는가?",
        isChoice: true,
        choices: [
            {
                text: "[적극 찬성 서명] 상실감을 비즈니스로 전환해 개인을 파괴하는 시장을 더 이상 방치할 수 없다.",
                labelText: "3단계: 입법 규제 찬성",
                effects: { compliance: 30, mourning: 20, dependent: -10 },
                nextIndex: 27
            },
            {
                text: "[서명 거부] 위로받을 자유와 개개인의 계약 권리를 국가가 제한하는 것은 지나친 통제다.",
                labelText: "3단계: 입법 규제 반대",
                effects: { compliance: -30, dependent: 20, mourning: -10 },
                nextIndex: 28
            }
        ]
    },

    // 27 (Ending A trigger)
    {
        speaker: "SYSTEM",
        text: "규제 동의서에 서명을 완료했다. 시스템 진단 보고서를 분석하여 2036년 최종 판결이 출력된다.",
        isEndingTrigger: true
    },
    // 28 (Ending B trigger)
    {
        speaker: "SYSTEM",
        text: "서명을 유보했다. 규제가 누락된 시장의 동맥경화 진단서가 인쇄된다.",
        isEndingTrigger: true
    }
];

// TYPEWRITER EFFECT
function typeText(text, index = 0) {
    if (index === 0) {
        state.isTyping = true;
        elDialogText.textContent = "";
        state.currentText = text;
        elNextIndicator.style.display = "none";
    }

    if (index < text.length) {
        elDialogText.textContent += text[index];
        state.typingTimeout = setTimeout(() => {
            typeText(text, index + 1);
        }, 22); // Slightly faster typing speed
    } else {
        state.isTyping = false;
        elNextIndicator.style.display = "block";
    }
}

// ADVANCE DIALOGUE
function advanceDialogue() {
    if (state.isTyping) {
        clearTimeout(state.typingTimeout);
        elDialogText.textContent = state.currentText;
        state.isTyping = false;
        elNextIndicator.style.display = "block";
        return;
    }

    const currentStep = storyScript[state.scriptIndex];

    if (currentStep.isChoice) {
        showChoices(currentStep.choices);
        return;
    }

    if (currentStep.isEndingTrigger) {
        evaluateEnding();
        return;
    }

    let nextIndex = state.scriptIndex + 1;
    if (currentStep.nextIndex !== undefined) {
        nextIndex = currentStep.nextIndex;
    }

    if (nextIndex < storyScript.length) {
        state.scriptIndex = nextIndex;
        renderDialogueStep();
    } else {
        evaluateEnding();
    }
}

// RENDER DIALOGUE STEP
function renderDialogueStep() {
    const step = storyScript[state.scriptIndex];
    elSpeakerTag.textContent = step.speaker;
    
    // Tag background colors
    if (step.speaker === 'SYSTEM') {
        elSpeakerTag.style.backgroundColor = 'var(--text-muted)';
    } else if (step.speaker === '서현 (AI)') {
        elSpeakerTag.style.backgroundColor = 'var(--neon-cyan)';
        elSpeakerTag.style.color = 'var(--bg-darker)';
    } else if (step.speaker === '민수 (유족)') {
        elSpeakerTag.style.backgroundColor = 'var(--neon-purple)';
        elSpeakerTag.style.color = 'white';
    } else {
        elSpeakerTag.style.backgroundColor = 'var(--neon-red)';
        elSpeakerTag.style.color = 'white';
    }

    // Apply fading CSS variables
    if (step.fading) {
        elDialogText.style.filter = "blur(0.6px)";
        elDialogText.style.opacity = "0.55";
        elDialogText.style.fontStyle = "italic";
    } else {
        elDialogText.style.filter = "none";
        elDialogText.style.opacity = "1";
        elDialogText.style.fontStyle = "normal";
    }

    if (step.action) {
        step.action();
    }

    typeText(step.text);
}

// SHOW CHOICES SCREEN
function showChoices(choices) {
    elChoicesContainer.innerHTML = '';
    elChoicesOverlay.classList.add('active');

    choices.forEach((choice) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.addEventListener('click', () => makeChoice(choice));
        elChoicesContainer.appendChild(btn);
    });
}

// MAKE CHOICE AND LOG TO LEFT
function makeChoice(choice) {
    elChoicesOverlay.classList.remove('active');
    
    // Apply stats
    Object.entries(choice.effects).forEach(([stat, value]) => {
        state[stat] = Math.max(0, Math.min(100, state[stat] + value));
    });
    
    updateStatsDisplay();
    flashScreen();

    // Log decision on the left UI
    const isReg = choice.labelText.includes("규제") || choice.labelText.includes("엄격") || choice.labelText.includes("Fading");
    addDecisionLog(choice.labelText, isReg);

    // Continue script
    state.scriptIndex = choice.nextIndex;
    renderDialogueStep();
}

// EVALUATE ENDINGS (Embedded layout)
function evaluateEnding() {
    elPlayScreen.classList.remove('active');
    elEndingScreen.classList.add('active');

    const elEndingType = document.getElementById('ending-type');
    const elEndingTitle = document.getElementById('ending-title');
    const elEndingDesc = document.getElementById('ending-desc');

    if (state.mourning >= 50 && state.dependent <= 35) {
        // Ending A
        elEndingType.textContent = "ENDING A (진정한 작별)";
        elEndingTitle.textContent = "슬픔의 껍질을 깨고 마주한 진짜 하늘";
        elEndingDesc.innerHTML = `
            조율사의 소멸 규제 단행과 입법 청원 서명으로 이민수 씨는 가상 거실에서 걸어 나왔습니다. 
            심각한 정서적 쇼크를 겪었으나 6개월 후 그는 직업 훈련소에 등록하여 서현이의 사진을 가상 장치가 아닌 진짜 액자에 보관했습니다.<br><br>
            2036년의 대한민국 사회 또한 고인의 데이터를 악용한 비즈니스를 규제함으로써, 
            사망한 자들의 역사적 가치가 의사결정을 가로막는 세대 마비에서 벗어났습니다. 
            2026년 오답노트 제안서가 우리 사회에 준 올바른 정답의 결과입니다.
        `;
    } else if (state.dependent >= 60) {
        // Ending B
        elEndingType.textContent = "ENDING B (유령 지배)";
        elEndingTitle.textContent = "유령들이 산 자를 지배하는 정체된 도시";
        elEndingDesc.innerHTML = `
            규제를 유예하고 시장의 자율성에 방치한 결과, 2036년의 도시는 어둡고 차갑게 가라앉았습니다.<br><br>
            이민수 씨는 결국 파산하여 햅틱 영양 튜브 수트 속에 누워 7세 서현이 홀로그램과 평생 늙어가는 식물인간 신세가 되었습니다.<br><br>
            대기업 이사회들 또한 10년 전 사망한 강 회장의 AI 복제본들이 의결권을 행사하여 낡은 전통 산업에 자산을 매몰시켰으며, 
            새로운 혁신과 청년 세대의 고용이 전면 단절되어 공멸의 길을 걷고 있습니다.
        `;
    } else {
        // Ending C
        elEndingType.textContent = "ENDING C (타협된 슬픔)";
        elEndingTitle.textContent = "반쪽짜리 규제와 지하의 디지털 망령";
        elEndingDesc.innerHTML = `
            모호한 입법 타협의 결과, 표면적 규제와 지하 암시장의 결탁이 이어집니다. 
            이민수 씨는 합법 사이트에서는 검열당했으나, 지하 브로커를 통해 해킹된 '서현' 패치 데이터를 구매하여 저화질 글리치로 번쩍이는 딸과 매일 밤 몰래 만납니다.<br><br>
            사회 역시 완전한 청산도 혁신도 없이, 어두운 골방마다 고인의 복제물에 지대 구독료를 지급하며 과거의 늪에서 헤어나오지 못하고 있습니다.
        `;
    }
}

// RESET AND RESTART
function restartGame() {
    state.mourning = 32;
    state.dependent = 45;
    state.compliance = 38;
    state.scriptIndex = 0;
    state.isTyping = false;
    state.choicesMade = [];
    clearTimeout(state.typingTimeout);
    
    // Clear left log UI
    elLogList.innerHTML = '<div class="log-empty">기록된 선택이 없습니다.</div>';
    
    updateStatsDisplay();
    elEndingScreen.classList.remove('active');
    elTitleScreen.classList.add('active');
}

// LISTENERS
elStartBtn.addEventListener('click', () => {
    elTitleScreen.classList.remove('active');
    elPlayScreen.classList.add('active');
    
    // Auto-initialize sound synth on start interaction to satisfy autoplay
    if (isMuted) {
        toggleSound();
    }
    
    updateStatsDisplay();
    renderDialogueStep();
});

elSoundBtn.addEventListener('click', toggleSound);
elDialogBox.addEventListener('click', advanceDialogue);
elRestartBtn.addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        if (elPlayScreen.classList.contains('active') && !elChoicesOverlay.classList.contains('active')) {
            advanceDialogue();
        }
    }
});

updateStatsDisplay();
