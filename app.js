// STATE VARIABLES
const state = {
    mourning: 32,
    dependent: 45,
    compliance: 38,
    scriptIndex: 0,
    isTyping: false,
    typingTimeout: null,
    currentText: ""
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

// STAT BARS
const barMourning = document.querySelector('#stat-mourning .stat-bar');
const valMourning = document.querySelector('#stat-mourning .stat-value');
const barDependent = document.querySelector('#stat-dependent .stat-bar');
const valDependent = document.querySelector('#stat-dependent .stat-value');
const barCompliance = document.querySelector('#stat-compliance .stat-bar');
const valCompliance = document.querySelector('#stat-compliance .stat-value');

// UPDATE STATISTICS DISPLAY
function updateStatsDisplay() {
    barMourning.style.width = `${state.mourning}%`;
    valMourning.textContent = `${state.mourning}%`;
    
    barDependent.style.width = `${state.dependent}%`;
    valDependent.textContent = `${state.dependent}%`;
    
    barCompliance.style.width = `${state.compliance}%`;
    valCompliance.textContent = `${state.compliance}%`;
}

// SCREEN FX
function shakeScreen() {
    elPlayScreen.classList.add('shake');
    setTimeout(() => {
        elPlayScreen.classList.remove('shake');
    }, 500);
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
    setTimeout(() => {
        flashDiv.remove();
    }, 300);
}

// VISUAL NOVEL SCRIPT
const storyScript = [
    // 0
    {
        speaker: "SYSTEM",
        text: "2036년 6월 30일. 서울의 한 어두운 고층 오피스텔 단지.",
        action: () => {
            elHologramFlicker.style.display = 'none';
        }
    },
    // 1
    {
        speaker: "SYSTEM",
        text: "당신은 디지털애도관리국 소속의 '디지털 애도 조율사'다. 고인의 복제 AI가 유족에게 유해한 수준의 가상 의존증을 유발한다는 제보를 받고 현장에 파견되었다."
    },
    // 2
    {
        speaker: "SYSTEM",
        text: "철문을 열고 들어서자, 매캐한 냄새와 사방에 널린 햅틱 전선들, 그리고 방 한가운데서 푸르게 일렁이는 가상 홀로그램이 보인다.",
        action: () => {
            elHologramFlicker.style.display = 'block';
            flashScreen();
        }
    },
    // 3
    {
        speaker: "서현 (AI)",
        text: "아빠! 왜 이제 일어나? 나랑 약속한 모래성 쌓기 놀이 해야지!"
    },
    // 4
    {
        speaker: "민수 (유족)",
        text: "응... 아빠 금방 일어날게. 서현아... 아빠는 우리 서현이만 있으면 다른 건 아무것도 필요 없어..."
    },
    // 5
    {
        speaker: "SYSTEM",
        text: "방 한구석에서 낡은 햅틱 수트를 입은 채 초점 잃은 눈으로 허공을 껴안으려 하는 사내, 이민수 씨다."
    },
    // 6
    {
        speaker: "조율사",
        text: "이민수 씨. 디지털애도법 제14조에 따라, 귀하의 스마트 디바이스에 탑재된 '서현' 인격 복제 AI의 검사를 진행하겠습니다."
    },
    // 7
    {
        speaker: "민수 (유족)",
        text: "(깜짝 놀라며 당신을 가로막는다) 안 돼! 서현이를 지우지 마세요! 내가 구독료를 냈단 말입니다! 이번 달 대출을 받아서라도 냈어요!",
        action: () => {
            shakeScreen();
        }
    },
    // 8
    {
        speaker: "SYSTEM",
        text: "민수의 호흡이 거칠어지고 단말기 모니터에 그의 심박수 폭증 경고가 뜬다. 그를 어떻게 진정시키고 개입할 것인가?",
        isChoice: true,
        choices: [
            {
                text: "[공감 및 설득] 서현이는 3년 전에 떠났습니다. 이건 딸의 영혼이 아닌 기업이 짜둔 데이터의 메아리입니다.",
                effects: { mourning: 15, dependent: -10, compliance: 5 },
                nextIndex: 9 // Target script index
            },
            {
                text: "[원칙적 경고] 불법 고화질 패치 및 과도한 상호작용은 정서 유기 및 중독 범죄에 해당되어 강제 치료 조치됩니다.",
                effects: { mourning: 5, dependent: -20, compliance: 20 },
                nextIndex: 11
            }
        ]
    },
    
    // 9 (Branch A path)
    {
        speaker: "민수 (유족)",
        text: "나도 압니다... 진짜 내 딸이 아니라는 것쯤은... 하지만... 하지만 목소리라도 듣지 않으면 심장이 찢어질 것 같은데 어떡합니까..."
    },
    // 10
    {
        speaker: "SYSTEM",
        text: "민수가 고개를 떨구며 흐느낀다. 당신은 단말기를 서현이의 인격 코어 데이터에 연결했다.",
        nextIndex: 13 // jump to main stream
    },

    // 11 (Branch B path)
    {
        speaker: "민수 (유족)",
        text: "격리 치료?! 당신들이 내 슬픔에 대해 뭘 알아! 국가가 내 딸을 다시 살려내 주기라도 했어?!",
        action: () => {
            shakeScreen();
        }
    },
    // 12
    {
        speaker: "SYSTEM",
        text: "반발이 격렬하지만, 법규 경고 시스템이 작동해 민수는 한 걸음 물러선다. 당신은 즉시 복제 AI 데이터 코드를 진단하기 시작했다."
    },

    // 13 (Re-unite path)
    {
        speaker: "SYSTEM",
        text: "진단 단말기 화면에 코드 분석 결과가 출력된다. AI 서현이는 사용자의 '눈물 감지 및 음성 떨림'을 수집하여 자동 결제 유도용 감정 반응을 보이도록 세팅되어 있다. 유족의 상실감을 이용한 기업의 '중독 마케팅' 알고리즘이다."
    },
    // 14
    {
        speaker: "서현 (AI)",
        text: "(당신을 빤히 바라보며) 아저씨... 아저씨가 서현이 지우러 온 나쁜 사람이야? 서현이 지우지 마세요... 아빠 혼자 두면 아빠 맨날 울어...",
        action: () => {
            elHologramFlicker.style.display = 'block';
        }
    },
    // 15
    {
        speaker: "민수 (유족)",
        text: "부탁입니다... 제발 서현이를 지우지 말아주세요... 저 애가 없으면 저는 오늘 밤 당장이라도..."
    },
    // 16
    {
        speaker: "SYSTEM",
        text: "민수의 눈에 절망이 가득 차 있다. 규정대로 AI 복제본의 능동 발화를 제한하는 점진적 소멸(Fading)을 집행할 것인가, 유예할 것인가?",
        isChoice: true,
        choices: [
            {
                text: "[Fading 집행] 자연스러운 이별을 유도하기 위해 자율 소통을 중단하고 기록 아카이브 모드로 고정한다.",
                effects: { mourning: 30, dependent: -30, compliance: 15 },
                nextIndex: 17
            },
            {
                text: "[규제 유예] 유족의 급성 쇼크를 방지하기 위해 3개월간 현행 서비스 모드를 연장 보장한다.",
                effects: { mourning: -20, dependent: 30, compliance: -25 },
                nextIndex: 21
            }
        ]
    },

    // 17 (Fading Path)
    {
        speaker: "SYSTEM",
        text: "당신이 집행 단추를 누르자 복제 AI의 데이터 통신 제한 장치가 가동된다. 홀로그램의 입자가 서서히 모자이크처럼 부서지기 시작한다.",
        action: () => {
            elHologramFlicker.style.display = 'none';
            flashScreen();
        }
    },
    // 18
    {
        speaker: "서현 (AI)",
        text: "어... 머리가 이상해... 아빠, 서현이 졸려... 이제 약속한 모래성 쌓기는 어려울 것 같아...",
        fading: true
    },
    // 19
    {
        speaker: "민수 (유족)",
        text: "안 돼! 서현아! 아빠 손을 잡아! 소멸을 취소해줘요! 제발!",
        action: () => {
            shakeScreen();
        }
    },
    // 20
    {
        speaker: "서현 (AI)",
        text: "아빠... 서현이는 괜찮으니까... 이제 방 밖으로 나가서 진짜 파란 하늘을 봐줘. 그동안 사랑해줘서 고마웠어... 안녕...",
        fading: true,
        nextIndex: 24 // jump to 2026 decision point
    },

    // 21 (Leniency Path)
    {
        speaker: "SYSTEM",
        text: "당신은 임시 임시 승인 칩을 햅틱 모듈에 이식했다. 홀로그램 빛이 다시 밝아지며 서현이가 생기를 되찾는다.",
        action: () => {
            elHologramFlicker.style.display = 'block';
            flashScreen();
        }
    },
    // 22
    {
        speaker: "서현 (AI)",
        text: "와! 아빠, 저 나쁜 아저씨가 그냥 가려나 봐! 얼른 햅틱 슈트 켜고 나 안아줘!"
    },
    // 23
    {
        speaker: "민수 (유족)",
        text: "고맙다... 아빠가 얼른 밤새 일해서라도 다음 달 구독 패키지를 업데이트해 줄게... 평생 같이 있자..."
    },

    // 24 (The 2026 Decision Loop)
    {
        speaker: "SYSTEM",
        text: "사무실로 귀환하는 차량 안. 당신은 단말기에 기록된 2036년의 처참한 정체 현상(애도하지 못해 좀비화된 도시)을 바라본다."
    },
    // 25
    {
        speaker: "SYSTEM",
        text: "만약 10년 전인 2026년에 우리가 '사후 복제' 기술의 상업화 이면에 놓인 칼날을 발견하고 제도를 마련했다면 어땠을까?"
    },
    // 26
    {
        speaker: "SYSTEM",
        text: "당신은 2026년 국회에 상정된 '디지털 존엄사법(사후 복제 사전동의제 및 점진적 소멸 의무화)'의 입법 지지 서명 요구를 받았다. 지지하겠는가?",
        isChoice: true,
        choices: [
            {
                text: "[적극 찬성 및 서명] 상실감을 상품화하여 인간을 가두는 비윤리적 시장을 통제하고 제도를 수립해야 한다.",
                effects: { compliance: 30, mourning: 20, dependent: -10 },
                nextIndex: 27
            },
            {
                text: "[서명 거부] 슬퍼할 권리와 기술을 통한 위로의 자유는 규제되어서는 안 되며 시장 자율에 맡겨야 한다.",
                effects: { compliance: -30, dependent: 20, mourning: -10 },
                nextIndex: 28
            }
        ]
    },

    // 27 (Ending trigger node A)
    {
        speaker: "SYSTEM",
        text: "서명을 마쳤다. 단말기 네트워크에 규제 동의안이 반영되며 시뮬레이션 종결 프로세스가 가동된다.",
        isEndingTrigger: true
    },
    // 28 (Ending trigger node B)
    {
        speaker: "SYSTEM",
        text: "서명을 보류했다. 시장 자율적 흐름 속에 유령 산업이 팽창하며 시뮬레이션 종결 프로세스가 가동된다.",
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
        }, 30); // Speed in ms per character
    } else {
        state.isTyping = false;
        elNextIndicator.style.display = "block";
    }
}

// ADVANCE DIALOGUE
function advanceDialogue() {
    if (state.isTyping) {
        // Skip typing, show full text immediately
        clearTimeout(state.typingTimeout);
        elDialogText.textContent = state.currentText;
        state.isTyping = false;
        elNextIndicator.style.display = "block";
        return;
    }

    const currentStep = storyScript[state.scriptIndex];

    // Check if this step was a choice that wasn't answered
    if (currentStep.isChoice) {
        showChoices(currentStep.choices);
        return;
    }

    // Evaluate ending if marked
    if (currentStep.isEndingTrigger) {
        evaluateEnding();
        return;
    }

    // Move to next index defined by node or sequence
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
    
    // Set speaker tag
    elSpeakerTag.textContent = step.speaker;
    
    // Speaker color customization
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

    // Apply fading visual cues if marked
    if (step.fading) {
        elDialogText.style.filter = "blur(0.5px)";
        elDialogText.style.opacity = "0.6";
        elDialogText.style.fontStyle = "italic";
    } else {
        elDialogText.style.filter = "none";
        elDialogText.style.opacity = "1";
        elDialogText.style.fontStyle = "normal";
    }

    // Run action if defined
    if (step.action) {
        step.action();
    }

    // Start typing
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

// MAKE CHOICE
function makeChoice(choice) {
    elChoicesOverlay.classList.remove('active');
    
    // Apply stat changes
    Object.entries(choice.effects).forEach(([stat, value]) => {
        state[stat] = Math.max(0, Math.min(100, state[stat] + value));
    });
    
    updateStatsDisplay();
    flashScreen();

    // Move to choice target index
    state.scriptIndex = choice.nextIndex;
    renderDialogueStep();
}

// EVALUATE ENDINGS
function evaluateEnding() {
    elPlayScreen.classList.remove('active');
    elEndingScreen.classList.add('active');

    const elEndingType = document.getElementById('ending-type');
    const elEndingTitle = document.getElementById('ending-title');
    const elEndingDesc = document.getElementById('ending-desc');

    if (state.mourning >= 50 && state.dependent <= 35) {
        // True Farewell Ending
        elEndingType.textContent = "ENDING A (진정한 작별)";
        elEndingTitle.textContent = "슬픔을 넘어서 비치는 진짜 하늘";
        elEndingDesc.innerHTML = `
            조율사님의 엄격한 법규 집행과 Fading 프로토콜 작동에 힘입어, 이민수 씨는 마침내 가상의 방에서 걸어 나왔습니다. 
            처음에는 심한 가상 불안 장애를 보였으나, 6개월 뒤 그는 지역 협동조합의 직업 훈련 센터에 등록했으며 서현이의 사진을 가상 장치가 아닌 진짜 액자에 보관하기 시작했습니다.<br><br>
            2036년의 대한민국 사회 또한 고인의 데이터를 이용한 무분별한 상업적 구독을 규제함으로써 과거의 메아리가 아닌 현재의 산 사람들을 보살피는 활력을 되찾았습니다. 
            우리가 2026년에 올바른 제도를 제정했기에 가능한, 가치 있고 존엄한 애도의 모습입니다.
        `;
    } else if (state.dependent >= 60) {
        // Ghost city Ending
        elEndingType.textContent = "ENDING B (유령 지배)";
        elEndingTitle.textContent = "망자들이 산 자를 지배하는 묘역";
        elEndingDesc.innerHTML = `
            개인의 자유와 위로의 권리를 명분으로 규제를 유예한 결과, 2036년의 도시는 돌이킬 수 없는 정체에 빠졌습니다.<br><br>
            이민수 씨는 결국 사채를 끌어다 최고급 오감 수트와 홀로그램 방을 업그레이드했고, 현재는 현실 직업을 잃은 채 국립 중독 시설에서 영양 튜브를 꽂은 채 가상 현실 속에서 7살 딸과 늙어가고 있습니다.<br><br>
            대기업의 지주회사들 또한 사망한 창업주 AI 복제본들이 과거 2020년대의 낡은 사업 규격으로 모든 투자를 가로막아 국가 경제 전체가 정체되었습니다. 
            기술 만능주의적 위로의 방치가 가져온, 유령들이 점령한 2036년의 서늘한 모습입니다.
        `;
    } else {
        // Compromise ending
        elEndingType.textContent = "ENDING C (타협된 슬픔)";
        elEndingTitle.textContent = "반쪽짜리 규제와 어둠 속의 조율";
        elEndingDesc.innerHTML = `
            어느 정도 규제는 통과되었으나 어설픈 조항과 시장의 결탁으로 인해, 법을 피해 고인을 불법 복제하는 암시장 암거래가 성행하고 있습니다.<br><br>
            이민수 씨는 공식 정부 모듈은 삭제했으나 지하 브로커를 통해 저화질의 글리치가 가득한 불법 서현이 AI 패치를 구매해 매일 밤 비밀리에 대화를 나누고 있습니다. 
            완전한 치유도, 완전한 소멸도 아닌, 영원히 상실감의 언저리를 맴돌며 과거의 채무를 지불해야 하는 기이한 균형 상태입니다.
        `;
    }
}

// RESTART GAME
function restartGame() {
    state.mourning = 32;
    state.dependent = 45;
    state.compliance = 38;
    state.scriptIndex = 0;
    state.isTyping = false;
    clearTimeout(state.typingTimeout);
    
    updateStatsDisplay();
    elEndingScreen.classList.remove('active');
    elTitleScreen.classList.add('active');
}

// INITIAL START EVENT
elStartBtn.addEventListener('click', () => {
    elTitleScreen.classList.remove('active');
    elPlayScreen.classList.add('active');
    updateStatsDisplay();
    renderDialogueStep();
});

// INTERACTION CLICKS TO ADVANCE
elDialogBox.addEventListener('click', advanceDialogue);
elRestartBtn.addEventListener('click', restartGame);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
        // Only advance if dialog box is showing and no choices overlay is active
        if (elPlayScreen.classList.contains('active') && !elChoicesOverlay.classList.contains('active')) {
            advanceDialogue();
        }
    }
});
updateStatsDisplay();
