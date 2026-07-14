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
const elSceneTitle = document.getElementById('scene-title');
const elVnStage = document.getElementById('vn-stage');

// STAT BARS
const barMourning = document.querySelector('#stat-mourning .stat-bar');
const valMourning = document.querySelector('#stat-mourning .stat-value');
const barDependent = document.querySelector('#stat-dependent .stat-bar');
const valDependent = document.querySelector('#stat-dependent .stat-value');
const barCompliance = document.querySelector('#stat-compliance .stat-bar');
const valCompliance = document.querySelector('#stat-compliance .stat-value');

// WEB AUDIO BGM SYNTHESIZER (Moody, dark atmospheric drone)
let audioCtx = null;
let synthGain = null;
let oscillators = [];
let isMuted = true;

function initSynth() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, audioCtx.currentTime); // low-pass filter
    
    synthGain = audioCtx.createGain();
    synthGain.gain.setValueAtTime(0, audioCtx.currentTime);
    
    const frequencies = [82.4, 110, 164.81, 220]; // E2, A2, E3, A3
    frequencies.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.detune.setValueAtTime(idx * 4 - 6, audioCtx.currentTime);
        
        oscGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        
        osc.connect(oscGain);
        oscGain.connect(filter);
        oscillators.push(osc);
    });
    
    const lfo = audioCtx.createOscillator();
    lfo.frequency.setValueAtTime(0.08, audioCtx.currentTime); // slow breathing LFO
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.03, audioCtx.currentTime);
    
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
            synthGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
        }
    } else {
        elSoundBtn.textContent = "🔊 BGM ON";
        if (!audioCtx) {
            initSynth();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        synthGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.8);
    }
}

// WEB SPEECH API & MP3 AUDIO DUBBING SYSTEM
const ttsSynth = window.speechSynthesis;
let currentAudio = null;

function speakDialogue(text, speaker, audioPath) {
    // 1. Stop any ongoing voice acting audio or generic TTS
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (ttsSynth) {
        ttsSynth.cancel();
    }

    if (audioPath) {
        // Play high-quality pre-recorded Voice Actor MP3
        currentAudio = new Audio(audioPath);
        currentAudio.play().catch(e => {
            console.log("Voice Actor MP3 failed or not loaded. Falling back to browser TTS:", e);
            playTtsFallback(text, speaker);
        });
    } else {
        playTtsFallback(text, speaker);
    }
}

function playTtsFallback(text, speaker) {
    if (!ttsSynth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";

    // Fallback voice pitch/rate settings
    if (speaker === "의사") {
        utterance.pitch = 0.85;
        utterance.rate = 0.95;
    } else if (speaker === "지인의 복제본") {
        utterance.pitch = 1.06;
        utterance.rate = 1.0;
    } else if (speaker === "주인공") {
        utterance.pitch = 0.95;
        utterance.rate = 1.05;
    } else if (speaker === "SYSTEM") {
        utterance.pitch = 0.98; // Narrator tone
        utterance.rate = 1.0;
    } else if (speaker === "행인" || speaker === "다른 행인" || speaker === "조문객" || speaker === "상주") {
        utterance.pitch = 0.9;
        utterance.rate = 1.0;
    }

    const voices = ttsSynth.getVoices();
    const koVoice = voices.find(v => v.lang.includes("ko-KR"));
    if (koVoice) {
        utterance.voice = koVoice;
    }

    ttsSynth.speak(utterance);
}

// UPDATE STATISTICS DISPLAY
function updateStatsDisplay() {
    if (!barMourning || !valMourning || !barDependent || !valDependent || !barCompliance || !valCompliance) return;
    barMourning.style.width = `${state.mourning}%`;
    valMourning.textContent = `${state.mourning}%`;
    
    barDependent.style.width = `${state.dependent}%`;
    valDependent.textContent = `${state.dependent}%`;
    
    barCompliance.style.width = `${state.compliance}%`;
    valCompliance.textContent = `${state.compliance}%`;
}

// UPDATE DECISION LOG (Left UI Panel)
function addDecisionLog(labelText, isRegulation = false) {
    if (!elLogList) return;
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

// SCREEN FLASH EFFECT
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

// VISUAL NOVEL SCRIPT (Team's Customized Scenario with Dynamic Backgrounds)
const storyScript = [
    // 0
    {
        speaker: "SYSTEM",
        text: "2036년 7월 1일. 서울 중앙 의료센터.",
        sceneTitle: "CHAPTER 1: 10년의 공백",
        background: "medical_room_2036.png",
        audio: "audio/system_1.mp3",
        action: () => {
            elHologramFlicker.style.display = 'none';
        }
    },
    // 1
    {
        speaker: "SYSTEM",
        text: "당신은 2026년 교통사고 이후 의식을 잃었다가 10년 만에 깨어났다.",
        audio: "audio/system_2.mp3"
    },
    // 2
    {
        speaker: "주인공",
        text: "…… 여기가 어디지…?",
        audio: "audio/protagonist_1.mp3"
    },
    // 3
    {
        speaker: "의사",
        text: "정신이 드셨군요 환자분. 환자분은 10년만에 깨어나 현재 2036년입니다.",
        audio: "audio/doctor_1.mp3"
    },
    // 4
    {
        speaker: "주인공",
        text: "2036년...? 무슨 소리죠?",
        audio: "audio/protagonist_2.mp3"
    },
    // 5
    {
        speaker: "의사",
        text: "많이 달라졌겠지만 곧 익숙해질 겁니다.",
        audio: "audio/doctor_2.mp3"
    },
    // 6
    {
        speaker: "SYSTEM",
        text: "병원을 나온 당신은 낯선 서울 거리를 걷기 시작했다.",
        sceneTitle: "CHAPTER 2: 유령의 거리",
        background: "seoul_street_2036.png",
        audio: "audio/system_3.mp3"
    },
    // 7
    {
        speaker: "SYSTEM",
        text: "횡단보도 앞. 한 노인이 갑자기 쓰러졌다.",
        audio: "audio/system_4.mp3"
    },
    // 8
    {
        speaker: "SYSTEM",
        text: "주변 사람들은 힐끗 바라볼 뿐 아무도 움직이지 않는다.",
        audio: "audio/system_5.mp3"
    },
    // 9: Choice 1
    {
        speaker: "SYSTEM",
        text: "당신은 어떻게 행동할 것인가?",
        isChoice: true,
        audio: "audio/system_6.mp3",
        choices: [
            {
                text: "[도와준다] 노인에게 다가가 도움을 호소하고 119를 부른다.",
                labelText: "1단계: 노인 조사 - 도와준다",
                effects: { mourning: 10, dependent: -10, compliance: 10 },
                nextIndex: 10
            },
            {
                text: "[관찰한다] 차분하게 뒤에 서서 주변의 태도를 조용히 관찰한다.",
                labelText: "1단계: 노인 조사 - 관찰한다",
                effects: { mourning: -10, dependent: 10, compliance: -5 },
                nextIndex: 14
            }
        ]
    },
    
    // 10: Path 1A (도와준다)
    {
        speaker: "주인공",
        text: "누군가 119 좀 불러주세요!",
        audio: "audio/protagonist_3.mp3"
    },
    // 11
    {
        speaker: "행인",
        text: "왜요?",
        audio: "audio/pedestrian_1.mp3"
    },
    // 12
    {
        speaker: "주인공",
        text: "죽을 수도 있잖아요!",
        audio: "audio/protagonist_4.mp3"
    },
    // 13
    {
        speaker: "행인",
        text: "죽으면 업로드하면 되는데요?",
        audio: "audio/pedestrian_2.mp3",
        action: () => {
            shakeScreen();
            flashScreen();
        },
        nextIndex: 17 // Join path
    },

    // 14: Path 1B (관찰한다)
    {
        speaker: "행인",
        text: "곧 죽겠네.",
        audio: "audio/pedestrian_3.mp3"
    },
    // 15
    {
        speaker: "다른 행인",
        text: "이주는 해놨겠지…",
        audio: "audio/pedestrian_4.mp3"
    },
    // 16
    {
        speaker: "주인공",
        text: "...?",
        audio: "audio/protagonist_5.mp3",
        nextIndex: 17
    },

    // 17: Common Path
    {
        speaker: "SYSTEM",
        text: "드론이 와서 환자를 이송한다.",
        audio: "audio/system_7.mp3"
    },
    // 18
    {
        speaker: "SYSTEM",
        text: "며칠 뒤, 당신은 과거의 지인이 세상을 떠났다는 연락을 받는다.",
        sceneTitle: "CHAPTER 3: 이주 센터",
        background: "migration_center_2036.png",
        audio: "audio/system_8.mp3"
    },
    // 19
    {
        speaker: "SYSTEM",
        text: "하지만 모바일 안내장에는 장례식장이라는 단어 대신 ‘이주식’이라는 낯선 단어가 적혀 있었다.",
        audio: "audio/system_9.mp3"
    },
    // 20
    {
        speaker: "SYSTEM",
        text: "이주센터에 도착한 당신. 빈소는 텅 비어 있고, 조문객은 다섯 명 남짓뿐이다.",
        audio: "audio/system_10.mp3"
    },
    // 21
    {
        speaker: "주인공",
        text: "이게... 장례식라고? 사람이 왜 이렇게 없지?",
        audio: "audio/protagonist_6.mp3"
    },
    // 22
    {
        speaker: "상주",
        text: "다들 직접 오진 않고 '추모 메시지'만 보냈으니까요. 어차피 AI가 고인 말투로 자동 답장해주잖아요.",
        audio: "audio/sangju_1.mp3"
    },
    // 23
    {
        speaker: "주인공",
        text: "자동 답장이라니... 다들 슬프지도 않은 건가요?",
        audio: "audio/protagonist_7.mp3"
    },
    // 24
    {
        speaker: "조문객",
        text: "요즘 누가 번거롭게 삼일장을 치러요. 반나절이면 다 끝나는 '이주식'이 보편화된 지 오래인데.",
        audio: "audio/visitor_1.mp3"
    },
    // 25
    {
        speaker: "SYSTEM",
        text: "빈소 중앙의 스크린이 켜지며, 방금 세상을 떠난 지인의 모습이 나타난다. 표정과 목소리, 생각까지 생전과 똑같은 완벽한 복제본이다.",
        audio: "audio/system_11.mp3",
        action: () => {
            elHologramFlicker.style.display = 'block';
            flashScreen();
        }
    },
    // 26
    {
        speaker: "지인의 복제본",
        text: "와줘서 고마워. 다들 너무 슬퍼하지 마. 어차피 이렇게 복제본 잘 만들어 놨으니 괜찮아.",
        audio: "audio/clone_1.mp3"
    },
    // 27
    {
        speaker: "주인공",
        text: "너... 죽은 거 아니었어?",
        audio: "audio/protagonist_8.mp3"
    },
    // 28
    {
        speaker: "지인의 복제본",
        text: "내 몸은 죽었지만 내 기억과 의식은 넘어와서 살아 있는거라고 할 수 있지. 죽음은 이제 이별이 아니라 또 다른 만남일 뿐이야.",
        audio: "audio/clone_2.mp3"
    },
    // 29
    {
        speaker: "SYSTEM",
        text: "사람들은 슬퍼하며 눈물을 흘리는 대신, 태블릿을 켜서 지인의 복제본과 일상적인 대화를 나누기 시작한다.",
        audio: "audio/system_12.mp3"
    },
    // 30
    {
        speaker: "SYSTEM",
        text: "죽음이 흔해지고 언제든 되돌릴 수 있는 일이 된 사회. 살아있는 사람들의 하루도 그만큼 가볍고 사소해져 있었다.",
        audio: "audio/system_13.mp3"
    },
    // 31: Choice 2
    {
        speaker: "SYSTEM",
        text: "지인의 복제본이 당신에게 대화를 요청했다. 당신은 어떻게 반응할 것인가?",
        sceneTitle: "CHAPTER 4: 갈림길",
        isChoice: true,
        audio: "audio/system_14.mp3",
        choices: [
            {
                text: "[수락한다] 태블릿을 부르고 가상 복제본과의 일상 대화를 수락한다.",
                labelText: "2단계: 대화 수락 - 가상 이식",
                effects: { mourning: -32, dependent: 45, compliance: -20 },
                nextIndex: 32
            },
            {
                text: "[거절한다] 가짜 위로를 거부하고, 고인의 복제물 접촉 요구를 사절한다.",
                labelText: "2단계: 대화 거절 - 현실 수용",
                effects: { mourning: 48, dependent: -35, compliance: 32 },
                nextIndex: 42
            }
        ]
    },

    // 32: Ending A path (수락)
    {
        speaker: "지인의 복제본",
        text: "오랜만이야, 너보다 내가 먼저 죽었네",
        audio: "audio/clone_3.mp3"
    },
    // 33
    {
        speaker: "주인공",
        text: "어... 그래. 네가 죽었다는 게 아직도 실감이 안 나는데, 이렇게 눈앞에서 목소리를 들으니까 기분이 이상하네.",
        audio: "audio/protagonist_9.mp3"
    },
    // 34
    {
        speaker: "지인의 복제본",
        text: "너무 슬퍼 마, 복제본 잘 만들어 놨잖아. 죽기 전에 의식과 기억을 미리 다 옮겨놨거든.",
        audio: "audio/clone_4.mp3"
    },
    // 35
    {
        speaker: "주인공",
        text: "그래... 이렇게라도 계속 이야기할 수 있다면 좋은 거겠지...",
        audio: "audio/protagonist_10.mp3"
    },
    // 36
    {
        speaker: "SYSTEM",
        text: "그날 이후, 당신은 매일 태블릿을 켜 지인의 복제본을 부르고 일상적인 대화를 나누기 시작했다.",
        audio: "audio/system_15.mp3"
    },
    // 37
    {
        speaker: "SYSTEM",
        text: "하지만 심리 전문가들의 경고처럼, 그것은 애도를 돕는 것이 아니라 지연시키는 과정일 뿐이었다.",
        audio: "audio/system_16.mp3"
    },
    // 38
    {
        speaker: "SYSTEM",
        text: "곁에 그 존재가 계속 '있으니' 부재가 처리되지 않았고, 당신은 애도의 첫 단계인 부정에 머문 채 끝내 작별하지 못했다.",
        audio: "audio/system_17.mp3"
    },
    // 39
    {
        speaker: "SYSTEM",
        text: "구독료로 슬픔을 계속 붙잡아두는 거대한 사업 모델에 당신도 완벽히 편입되고 말았다.",
        audio: "audio/system_18.mp3"
    },
    // 40
    {
        speaker: "SYSTEM",
        text: "시간이 흐르며, 누군가 세상을 떠나도 다시 만날 수 있다는 생각이 만연해지자 당신 역시 타인의 죽음을 상실로 받아들이지 않게 되었다.",
        audio: "audio/system_19.mp3",
        isEndingTrigger: true,
        endingType: "A"
    },

    // 42: Ending B path (거절)
    {
        speaker: "주인공",
        text: "아니... 거절할게. 넌 내 친구의 기억을 가졌지만, 진짜 내 친구는 아니야.",
        audio: "audio/protagonist_11.mp3"
    },
    // 43
    {
        speaker: "지인의 복제본",
        text: "왜 그래? 난 너랑 이렇게 대화할 수 있고, 예전과 똑같이 생각하고 반응하는데. 죽음은 이제 끝이 아니잖아.",
        audio: "audio/clone_5.mp3"
    },
    // 44
    {
        speaker: "주인공",
        text: "그건 가짜 위로일 뿐이야. 네 육신이 죽었는데 끝없이 대화하는 건, 진정한 작별을 회피하는 거라고.",
        audio: "audio/protagonist_12.mp3"
    },
    // 45
    {
        speaker: "SYSTEM",
        text: "당신은 복제본과의 대화를 끊고 뒤돌아섰다.",
        audio: "audio/system_20.mp3"
    },
    // 46
    {
        speaker: "SYSTEM",
        text: "당신은 단호한 거절을 한 뒤 죽음이 되돌릴 수 있는 일이 되며 생명의 무게가 지워졌던 2036년의 사회에 작은 파문을 일으켰다.",
        audio: "audio/system_21.mp3"
    },
    // 47
    {
        speaker: "SYSTEM",
        text: "이후 당신은 '데스 리터러시(death literacy)' 교육을 정규 교육과정에 넣어야 한다고 목소리를 내기 시작했다.",
        audio: "audio/system_22.mp3"
    },
    // 48
    {
        speaker: "SYSTEM",
        text: "또한 생전 본인의 의사로 사후 복제를 금지할 수 있는 '디지털 소생 거부(DDNR)' 조항을 법제화하는 시민운동에 뛰어들었다.",
        audio: "audio/system_23.mp3",
        isEndingTrigger: true,
        endingType: "B"
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
        }, 22);
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
        evaluateEnding(currentStep.endingType);
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
    
    // Update Chapter Title
    if (step.sceneTitle && elSceneTitle) {
        elSceneTitle.textContent = step.sceneTitle;
    }

    // Switch Background Image Dynamically
    if (step.background) {
        elVnStage.style.backgroundImage = `url('${step.background}')`;
    }
    
    // Speaker tag coloring
    if (step.speaker === 'SYSTEM') {
        elSpeakerTag.style.backgroundColor = 'var(--text-muted)';
        elSpeakerTag.style.color = 'white';
    } else if (step.speaker === '지인의 복제본') {
        elSpeakerTag.style.backgroundColor = 'var(--neon-cyan)';
        elSpeakerTag.style.color = 'var(--bg-darker)';
    } else if (step.speaker === '주인공') {
        elSpeakerTag.style.backgroundColor = 'var(--neon-purple)';
        elSpeakerTag.style.color = 'white';
    } else {
        elSpeakerTag.style.backgroundColor = 'var(--neon-red)';
        elSpeakerTag.style.color = 'white';
    }

    // Apply fading cue
    if (step.fading) {
        elDialogText.style.filter = "blur(0.8px)";
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

    // Trigger TTS or pre-recorded Audio Dubbing
    speakDialogue(step.text, step.speaker, step.audio);

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
    
    // Apply stats
    Object.entries(choice.effects).forEach(([stat, value]) => {
        state[stat] = Math.max(0, Math.min(100, state[stat] + value));
    });
    
    updateStatsDisplay();
    flashScreen();

    // Log decision on left panel
    const isReg = choice.labelText.includes("거절") || choice.labelText.includes("도와준다");
    addDecisionLog(choice.labelText, isReg);

    // Continue script
    state.scriptIndex = choice.nextIndex;
    renderDialogueStep();
}

// EVALUATE ENDINGS
function evaluateEnding(endingType) {
    // Cancel tts/audio on ending
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (ttsSynth) ttsSynth.cancel();

    elPlayScreen.classList.remove('active');
    elEndingScreen.classList.add('active');

    const elEndingType = document.getElementById('ending-type');
    const elEndingTitle = document.getElementById('ending-title');
    const elEndingDesc = document.getElementById('ending-desc');

    if (endingType === "B") {
        // Ending B
        elEndingType.textContent = "ENDING B (인간성 사수)";
        elEndingTitle.textContent = "마지막 인간성을 지켜내다";
        elEndingDesc.innerHTML = `
            당신은 단호한 거절을 한 뒤 죽음이 되돌릴 수 있는 일이 되며 생명의 무게가 지워졌던 2036년의 사회에 작은 파문을 일으켰습니다.<br><br>
            이후 당신은 '데스 리터러시(death literacy)' 교육을 정규 교육과정에 넣어야 한다고 목소리를 내기 시작했습니다.<br><br>
            또한 생전 본인의 의사로 사후 복제를 금지할 수 있는 '디지털 소생 거부(DDNR)' 조항을 법제화하는 시민운동에 뛰어들었습니다.<br><br>
            애도할 권리를 되찾고 슬픔을 피하지 않는 것, 그것이 당신이 지켜내고자 한 진정한 삶의 무게였습니다.
        `;
    } else {
        // Ending A
        elEndingType.textContent = "ENDING A (가치의 소멸)";
        elEndingTitle.textContent = "상실을 잃어버린 세계";
        elEndingDesc.innerHTML = `
            시간이 흐르며, 누군가 세상을 떠나도 다시 만날 수 있다는 생각이 만연해지자 당신 역시 타인의 죽음을 상실로 받아들이지 않게 되었습니다.<br><br>
            결과적으로 타인의 고통에 대한 공감을 잃어버린 당신은, 어딘가 아픈 사람을 보며 그저 '그냥 죽고 새로 태어나'라고 말하는 무감각한 사회의 일원이 되었습니다.
        `;
    }
}

// RESET AND RESTART
function restartGame() {
    // Cancel tts/audio on restart
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (ttsSynth) ttsSynth.cancel();

    state.mourning = 32;
    state.dependent = 45;
    state.compliance = 38;
    state.scriptIndex = 0;
    state.isTyping = false;
    state.choicesMade = [];
    clearTimeout(state.typingTimeout);
    
    // Clear left log UI
    if (elLogList) {
        elLogList.innerHTML = '<div class="log-empty">기록된 선택이 없습니다.</div>';
    }
    
    updateStatsDisplay();
    elEndingScreen.classList.remove('active');
    elTitleScreen.classList.add('active');
}

// LISTENERS
elStartBtn.addEventListener('click', () => {
    elTitleScreen.classList.remove('active');
    elPlayScreen.classList.add('active');
    
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
