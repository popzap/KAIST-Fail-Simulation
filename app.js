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

// BGM PLAYER FOR bgm1.mp3
let bgmAudio = null;
let isMuted = true;

function initBgm() {
    if (bgmAudio) return;
    bgmAudio = new Audio('audio/bgm1.mp3');
    bgmAudio.loop = true;
    bgmAudio.volume = 0.25; // Clean background volume level
}

function toggleSound() {
    isMuted = !isMuted;
    
    if (isMuted) {
        elSoundBtn.textContent = "🔇 BGM OFF";
        if (bgmAudio) {
            bgmAudio.pause();
        }
    } else {
        elSoundBtn.textContent = "🔊 BGM ON";
        if (!bgmAudio) {
            initBgm();
        }
        bgmAudio.play().catch(e => {
            console.log("BGM autoplay delayed until user interaction:", e);
        });
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
        audio: "audio/audio_0_2036년_7월_1일__서울_중앙_의료센터_.mp3",
        action: () => {
            elHologramFlicker.style.display = 'none';
        }
    },
    // 1
    {
        speaker: "SYSTEM",
        text: "당신은 2026년 교통사고 이후 의식을 잃었다가 10년 만에 깨어났다.",
        audio: "audio/audio_1_당신은_2026년_교통사고_이후_의식을_잃었다가_10년_만에_깨어났다_.mp3"
    },
    // 2
    {
        speaker: "주인공",
        text: "…… 여기가 어디지…?",
        audio: "audio/audio_2____여기가_어디지__.mp3"
    },
    // 3
    {
        speaker: "의사",
        text: "정신이 드셨군요 환자분. 환자분은 10년만에 깨어나 현재는 2036년입니다.",
        audio: "audio/audio_3_정신이_드셨군요_환자분__환자분은_10년만에_깨어나_현재는_2036년입니다_.mp3"
    },
    // 4
    {
        speaker: "주인공",
        text: "2036년...? 무슨 소리죠?",
        audio: "audio/audio_4_2036년_____무슨_소리죠_.mp3"
    },
    // 5
    {
        speaker: "의사",
        text: "많이 당황스럽겠지만 곧 익숙해질 겁니다.",
        audio: "audio/audio_5_많이_당황스럽겠지만_곧_익숙해질_겁니다_.mp3"
    },
    // 6
    {
        speaker: "SYSTEM",
        text: "병원을 나온 당신은 낯선 서울 거리를 걷기 시작했다.",
        sceneTitle: "CHAPTER 2: 유령의 거리",
        background: "seoul_street_2036.png",
        audio: "audio/audio_6_병원을_나온_당신은_낯선_서울_거리를_걷기_시작했다_.mp3"
    },
    // 7
    {
        speaker: "SYSTEM",
        text: "횡단보도 앞. 한 노인이 갑자기 쓰러졌다.",
        audio: "audio/audio_7_횡단보도_앞__한_노인이_갑자기_쓰러졌다_.mp3"
    },
    // 8
    {
        speaker: "SYSTEM",
        text: "주변 사람들은 힐끗 바라볼 뿐 아무도 움직이지 않는다.",
        audio: "audio/audio_8_주변_사람들은_힐끗_바라볼_뿐_아무도_움직이지_않는다_.mp3"
    },
    // 9: Choice 1
    {
        speaker: "SYSTEM",
        text: "당신은 어떻게 행동할 것인가?",
        isChoice: true,
        audio: "audio/audio_9_당신은_어떻게_행동할_것인가_.mp3",
        choices: [
            {
                text: "[도와준다]",
                labelText: "1단계: 노인 조사 - 도와준다",
                effects: { mourning: 10, dependent: -10, compliance: 10 },
                nextIndex: 10
            },
            {
                text: "[관찰한다]",
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
        audio: "audio/audio_10_누군가_일일구_좀_불러주세요_.mp3"
    },
    // 11
    {
        speaker: "행인",
        text: "왜요?",
        audio: "audio/audio_11_왜요_.mp3"
    },
    // 12
    {
        speaker: "주인공",
        text: "죽을 수도 있잖아요!",
        audio: "audio/audio_12_죽을_수도_있잖아요_.mp3"
    },
    // 13
    {
        speaker: "행인",
        text: "죽으면 복제하면 되는데요?",
        audio: "audio/audio_13_죽으면_복제하면_되는데요_.mp3",
        action: () => {
            shakeScreen();
            flashScreen();
        },
        nextIndex: 17
    },

    // 14: Path 1B (관찰한다)
    {
        speaker: "행인",
        text: "곧 죽겠네.",
        audio: "audio/audio_14_곧_죽겠네_.mp3"
    },
    // 15
    {
        speaker: "다른 행인",
        text: "복제는 해놨겠지…",
        audio: "audio/audio_15_복제는_해놨겠지_.mp3"
    },
    // 16
    {
        speaker: "주인공",
        text: "...?",
        audio: "",
        nextIndex: 17
    },

    // 17: Common Path
    {
        speaker: "SYSTEM",
        text: "곧이어 드론이 와서 환자를 이송한다.",
        audio: "audio/audio_16_곧이어_드론이_와서_환자를_이송한다_.mp3"
    },
    // 18
    {
        speaker: "주인공",
        text: "저기요... 저 사람 죽을지도 모르잖아요! 다들 왜 이렇게 평온한 겁니까?",
        audio: "audio/audio_17_저기요____저_사람_죽을지도_모르잖아요__다들_왜_이렇게_평온한_겁니까_.mp3"
    },
    // 19
    {
        speaker: "SYSTEM",
        text: "하지만 사람들은 귀찮다는 듯 고개를 돌릴 뿐, 거리는 아무 일도 없었다는 듯 무심하게 흘러간다.",
        audio: "audio/audio_18_하지만_사람들은_귀찮다는_듯_고개를_돌릴_뿐__거리는_아무_~.mp3"
    },
    // 20
    {
        speaker: "SYSTEM",
        text: "혼란스러운 당신은 광장 한복판에 우뚝 서서 주변을 둘러보았다.",
        audio: "audio/audio_19_혼란스러운_당신은_광장_한복판에_우뚝_서서_주변을_둘러보았다_.mp3"
    },
    // 21
    {
        speaker: "주인공",
        text: "(주변 광고판을 둘러 보며) \"기억을 복제한다고...? 영원한 만남...?\"",
        audio: "audio/audio_20_기억을_복제한다고_____영원한_만남____.mp3"
    },
    // 22
    {
        speaker: "주인공",
        text: "내가 알던 세상이... 완전히 달라져 버렸잖아.",
        audio: "audio/audio_21_내가_알던_세상이____완전히_달라져_버렸잖아_.mp3"
    },
    // 23
    {
        speaker: "SYSTEM",
        text: "그렇게 낯선 세상의 모습에 충격을 받은 채로 며칠의 시간이 흐른 어느 날.",
        audio: "audio/audio_22_그렇게_낯선_세상의_모습에_충격을_받은_채로_며칠의_시간이_흐른_어느_날_.mp3"
    },
    // 24
    {
        speaker: "SYSTEM",
        text: "당신은 과거의 지인이 세상을 떠났다는 연락을 받는다.",
        sceneTitle: "CHAPTER 3: 이주 센터",
        background: "migration_center_2036.png",
        audio: "audio/audio_23_당신은_과거의_지인이_세상을_떠났다는_연락을_받는다_.mp3"
    },
    // 25
    {
        speaker: "SYSTEM",
        text: "하지만 모바일 안내장에는 장례식이라는 단어 대신 ‘이주식’이라는 낯선 단어가 적혀 있었다.",
        audio: "audio/audio_24_하지만_모바일_안내장에는_장례식이라는_단어_대신__이주식_이~.mp3"
    },
    // 26
    {
        speaker: "SYSTEM",
        text: "이주식장에 도착한 당신. 빈소는 텅 비어 있고, 조문객은 다섯 명 남짓뿐이다.",
        audio: "audio/audio_25_이주식장에_도착한_당신__빈소는_텅_비어_있고__조문객은_다~.mp3"
    },
    // 27
    {
        speaker: "주인공",
        text: "이게... 장례식이라고? 사람이 왜 이렇게 없지?",
        audio: "audio/audio_26_이게____장례식이라고__사람이_왜_이렇게_없지_.mp3"
    },
    // 28
    {
        speaker: "상주",
        text: "다들 직접 오진 않고 추모 메시지만 보냈으니까요. 어차피 AI가 고인 말투로 자동 답장해주잖아요.",
        audio: "audio/audio_27_다들_직접_오진_않고_추모_메시지만_보냈으니까요__어차피_A~.mp3"
    },
    // 29
    {
        speaker: "주인공",
        text: "자동 답장이라니... 다들 슬프지도 않은 건가요?",
        audio: "audio/audio_28_자동_답장이라니____다들_슬프지도_않은_건가요_.mp3"
    },
    // 30
    {
        speaker: "조문객",
        text: "요즘 누가 번거롭게 삼일장을 치러요. 반나절이면 다 끝나는 ‘이주식’이 보편화된 지 오래인데.",
        audio: "audio/audio_29_요즘_누가_번거롭게_삼일장을_치러요__반나절이면_다_끝나는_~.mp3"
    },
    // 31
    {
        speaker: "SYSTEM",
        text: "빈소 중앙의 스크린이 켜지며, 방금 세상을 떠난 지인의 모습이 나타난다. 표정과 목소리, 생각까지 생전과 똑같은 완벽한 복제본이다.",
        audio: "audio/audio_30_빈소_중앙의_스크린이_켜지며__방금_세상을_떠난_지인의_모습~.mp3",
        action: () => {
            elHologramFlicker.style.display = 'block';
            flashScreen();
        }
    },
    // 32
    {
        speaker: "SYSTEM",
        text: "사람들은 슬퍼하며 눈물을 흘리는 대신, 스크린을 보며 지인의 복제본과 일상적인 대화를 나누기 시작한다.",
        audio: "audio/audio_31_사람들은_슬퍼하며_눈물을_흘리는_대신__스크린을_보며_지인의~.mp3"
    },
    // 33: Choice 2
    {
        speaker: "SYSTEM",
        text: "지인의 복제본이 당신에게 대화를 요청했다. 당신은 어떻게 반응할 것인가?",
        sceneTitle: "CHAPTER 4: 갈림길",
        isChoice: true,
        audio: "audio/audio_32_지인의_복제본이_당신에게_대화를_요청했다__당신은_어떻게_반응할_것인가_.mp3",
        choices: [
            {
                text: "[수락한다]",
                labelText: "2단계: 대화 수락 - 가상 이식",
                effects: { mourning: -32, dependent: 45, compliance: -20 },
                nextIndex: 34
            },
            {
                text: "[거절한다]",
                labelText: "2단계: 대화 거절 - 현실 수용",
                effects: { mourning: 48, dependent: -35, compliance: 32 },
                nextIndex: 45
            }
        ]
    },

    // 34: Ending A path (수락)
    {
        speaker: "지인의 복제본",
        text: "오랜만이야, 살아있었구나. 너보다 내가 먼저 죽었네",
        audio: "audio/audio_33_오랜만이야__살아있었구나__너보다_내가_먼저_죽었네.mp3"
    },
    // 35
    {
        speaker: "주인공",
        text: "너... 죽은 거 아니야?",
        audio: "audio/audio_34_너____죽은_거_아니야_.mp3"
    },
    // 36
    {
        speaker: "지인의 복제본",
        text: "육체만 죽었을 뿐이지, 내 생각은 그대로 복제되어 있는걸.",
        audio: "audio/audio_35_육체만_죽었을_뿐이지__내_생각은_그대로_복제되어_있는걸_.mp3"
    },
    // 37
    {
        speaker: "주인공",
        text: "어... 그래. 네가 죽었다는 게 아직도 실감이 안 나는데, 이렇게 눈앞에서 목소리를 들으니까 기분이 이상하네.",
        audio: "audio/audio_36_어____그래__네가_죽었다는_게_아직도_실감이_안_나는데_~.mp3"
    },
    // 38
    {
        speaker: "지인의 복제본",
        text: "너무 슬퍼 하지마, 나는 잘 복제되어 있잖아. 죽기 전에 의식과 기억을 미리 다 옮겨놨거든.",
        audio: "audio/audio_37_너무_슬퍼_하지마__나는_잘_복제되어_있잖아__죽기_전에_의~.mp3"
    },
    // 39
    {
        speaker: "주인공",
        text: "그래... 이렇게라도 계속 이야기할 수 있다면 좋은 거겠지...",
        audio: "audio/audio_38_그래____이렇게라도_계속_이야기할_수_있다면_좋은_거겠지___.mp3"
    },
    // 40
    {
        speaker: "SYSTEM",
        text: "그날 이후, 당신은 매일 태블릿을 켜 지인의 복제본을 부르고 일상적인 대화를 나누기 시작했다.",
        audio: "audio/audio_39_그날_이후__당신은_매일_태블릿을_켜_지인의_복제본을_부르고~.mp3"
    },
    // 41
    {
        speaker: "SYSTEM",
        text: "하지만 심리 전문가들의 경고처럼, 그것은 애도를 돕는 것이 아니라 지연시키는 과정일 뿐이었다.",
        audio: "audio/audio_40_하지만_심리_전문가들의_경고처럼__그것은_애도를_돕는_것이_~.mp3"
    },
    // 42
    {
        speaker: "SYSTEM",
        text: "곁에 그 존재가 계속 있으니 부재가 처리되지 않았고, 당신은 애도의 첫 단계인 부정에 머문 채 끝내 작별하지 못했다.",
        audio: "audio/audio_41_곁에_그_존재가_계속_있으니_부재가_처리되지_않았고__당신은~.mp3"
    },
    // 43
    {
        speaker: "SYSTEM",
        text: "시간이 흐르며, 누군가 세상을 떠나도 다시 만날 수 있다는 생각이 만연해지자 당신 역시 타인의 죽음을 상실로 받아들이지 않게 되었다.",
        audio: "audio/audio_42_시간이_흐르며__누군가_세상을_떠나도_다시_만날_수_있다는_~.mp3"
    },
    // 44
    {
        speaker: "SYSTEM",
        text: "결과적으로 타인의 고통에 대한 공감을 잃어버린 당신은, 어딘가 아픈 사람을 보며 그저 '그냥 죽고 새로 태어나'라고 말하는 무감각한 사회의 일원이 되었다.",
        audio: "audio/audio_43_결과적으로_타인의_고통에_대한_공감을_잃어버린_당신은__어딘~.mp3",
        isEndingTrigger: true,
        endingType: "A"
    },

    // 45: Ending B path (거절)
    {
        speaker: "주인공",
        text: "아니... 거절할게. 넌 내 친구의 기억을 가졌지만, 진짜 내 친구는 아니야.",
        audio: "audio/audio_44_아니____거절할게__넌_내_친구의_기억을_가졌지만__진짜_내_친구는_아니야_.mp3"
    },
    // 46
    {
        speaker: "지인의 복제본",
        text: "왜 그래? 난 너랑 이렇게 대화할 수 있고, 예전과 똑같이 생각하고 반응하는데. 죽음은 이제 끝이 아니잖아.",
        audio: "audio/audio_45_왜_그래__난_너랑_이렇게_대화할_수_있고__예전과_똑같이_~.mp3"
    },
    // 47
    {
        speaker: "주인공",
        text: "그건 가짜 위로일 뿐이야. 네 육신이 죽었는데 끝없이 대화하는 건, 진정한 작별을 회피하는 거라고.",
        audio: "audio/audio_46_그건_가짜_위로일_뿐이야__네_육신이_죽었는데_끝없이_대화하~.mp3"
    },
    // 48
    {
        speaker: "SYSTEM",
        text: "당신은 복제본과의 대화를 끊고 뒤돌아섰다.",
        audio: "audio/audio_47_당신은_복제본과의_대화를_끊고_뒤돌아섰다_.mp3"
    },
    // 49
    {
        speaker: "SYSTEM",
        text: "당신은 단호한 거절을 한 뒤 죽음이 되돌릴 수 있는 일이 되며 생명의 무게가 지워졌던 2036년의 사회에 작은 파문을 일으켰다.",
        audio: "audio/audio_48_당신은_단호한_거절을_한_뒤_죽음이_되돌릴_수_있는_일이_되~.mp3"
    },
    // 50
    {
        speaker: "SYSTEM",
        text: "이후 당신은 사람들이 슬퍼하는 법을 잊지 않도록 온전히 애도하고 작별하는 법을 가르쳐야 한다고 목소리를 내기 시작했다.",
        audio: "audio/audio_49_이후_당신은_사람들이_슬퍼하는_법을_잊지_않도록_온전히_애도~.mp3"
    },
    // 51
    {
        speaker: "SYSTEM",
        text: "또한 자신의 뜻에 따라 사후 AI 복제를 거부하고 영원한 안식을 선택할 권리를 법으로 보장하는 시민운동에 뛰어들었다.",
        audio: "audio/audio_50_또한_자신의_뜻에_따라_사후_AI_복제를_거부하고_영원한_안~.mp3"
    },
    // 52
    {
        speaker: "SYSTEM",
        text: "애도할 권리를 되찾고 슬픔을 피하지 않는 것, 그것이 당신이 지켜내고자 한 진정한 삶의 무게였다.",
        audio: "audio/audio_51_애도할_권리를_되찾고_슬픔을_피하지_않는_것__그것이_당신이~.mp3",
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
    const elNote = document.querySelector('.integrated-note');

    if (endingType === "B") {
        // Ending B (Success) - Hide Incorrect Note
        if (elNote) {
            elNote.style.display = 'none';
        }
        elEndingType.textContent = "ENDING B (인간성 사수)";
        elEndingTitle.textContent = "마지막 인간성을 지켜내다";
        elEndingDesc.innerHTML = `
            당신은 단호한 거절을 한 뒤 죽음이 되돌릴 수 있는 일이 되며 생명의 무게가 지워졌던 2036년의 사회에 작은 파문을 일으켰습니다.<br><br>
            이후 당신은 사람들이 슬퍼하는 법을 잊지 않도록 온전히 애도하고 작별하는 법을 가르쳐야 한다고 목소리를 내기 시작했습니다.<br><br>
            또한 자신의 뜻에 따라 사후 AI 복제를 거부하고 영원한 안식을 선택할 권리를 법으로 보장하는 시민운동에 뛰어들었습니다.<br><br>
            애도할 권리를 되찾고 슬픔을 피하지 않는 것, 그것이 당신이 지켜내고자 한 진정한 삶의 무게였습니다.
        `;
    } else {
        // Ending A (Failure) - Show Incorrect Note
        if (elNote) {
            elNote.style.display = 'block';
        }
        elEndingType.textContent = "ENDING A (가치의 소멸)";
        elEndingTitle.textContent = "상실을 잃어버린 세계";
        elEndingDesc.innerHTML = `
            그날 이후, 당신은 매일 태블릿을 켜 지인의 복제본을 부르고 일상적인 대화를 나누기 시작했습니다.<br><br>
            하지만 심리 전문가들의 경고처럼, 그것은 애도를 돕는 것이 아니라 지연시키는 과정일 뿐이었습니다.<br><br>
            곁에 그 존재가 계속 있으니 부재가 처리되지 않았고, 당신은 애도의 첫 단계인 부정에 머문 채 끝내 작별하지 못했습니다.<br><br>
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
