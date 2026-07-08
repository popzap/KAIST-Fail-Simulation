const fs = require('fs');
const path = require('path');
const { EdgeTTS } = require('node-edge-tts');

const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
}

// Dialogues mapping using high-quality Microsoft Edge Neural Voices
const dialogues = [
    { file: "protagonist_1.mp3", voice: "ko-KR-InJoonNeural", text: "…… 여기가 어디지…?" },
    { file: "doctor_1.mp3", voice: "ko-KR-HyunsuNeural", text: "정신이 드셨군요 환자분. 환자분은 10년만에 깨어나 현재 2036년입니다." },
    { file: "protagonist_2.mp3", voice: "ko-KR-InJoonNeural", text: "2036년...? 무슨 소리죠?" },
    { file: "doctor_2.mp3", voice: "ko-KR-HyunsuNeural", text: "많이 달라졌겠지만 곧 익숙해질 겁니다." },
    { file: "protagonist_3.mp3", voice: "ko-KR-InJoonNeural", text: "누군가 119 좀 불러주세요!" },
    { file: "pedestrian_1.mp3", voice: "ko-KR-InJoonNeural", text: "왜요?" },
    { file: "protagonist_4.mp3", voice: "ko-KR-InJoonNeural", text: "죽을 수도 있잖아요!" },
    { file: "pedestrian_2.mp3", voice: "ko-KR-InJoonNeural", text: "죽으면 업로드하면 되는데요?" },
    { file: "pedestrian_3.mp3", voice: "ko-KR-InJoonNeural", text: "곧 죽겠네." },
    { file: "pedestrian_4.mp3", voice: "ko-KR-InJoonNeural", text: "이주는 해놨겠지…" },
    { file: "protagonist_5.mp3", voice: "ko-KR-InJoonNeural", text: "...?" },
    { file: "protagonist_6.mp3", voice: "ko-KR-InJoonNeural", text: "이게... 장례식라고? 사람이 왜 이렇게 없지?" },
    { file: "sangju_1.mp3", voice: "ko-KR-InJoonNeural", text: "다들 직접 오진 않고 '추모 메시지'만 보냈으니까요. 어차피 AI가 고인 말투로 자동 답장해주잖아요." },
    { file: "protagonist_7.mp3", voice: "ko-KR-InJoonNeural", text: "자동 답장이라니... 다들 슬프지도 않은 건가요?" },
    { file: "visitor_1.mp3", voice: "ko-KR-InJoonNeural", text: "요즘 누가 번거롭게 삼일장을 치러요. 반나절이면 다 끝나는 '이주식'이 보편화된 지 오래인데." },
    { file: "clone_1.mp3", voice: "ko-KR-SunHiNeural", text: "와줘서 고마워. 다들 너무 슬퍼하지 마. 어차피 이렇게 복제본 잘 만들어 놨으니 괜찮아." },
    { file: "protagonist_8.mp3", voice: "ko-KR-InJoonNeural", text: "너... 죽은 거 아니었어?" },
    { file: "clone_2.mp3", voice: "ko-KR-SunHiNeural", text: "내 몸은 죽었지만 내 기억과 의식은 넘어와서 살아 있는거라고 할 수 있지. 죽음은 이제 이별이 아니라 또 다른 만남일 뿐이야." },
    { file: "clone_3.mp3", voice: "ko-KR-SunHiNeural", text: "오랜만이야, 너보다 내가 먼저 죽었네" },
    { file: "protagonist_9.mp3", voice: "ko-KR-InJoonNeural", text: "어... 그래. 네가 죽었다는 게 아직도 실감이 안 나는데, 이렇게 눈앞에서 목소리를 들으니까 기분이 이상하네." },
    { file: "clone_4.mp3", voice: "ko-KR-SunHiNeural", text: "너무 슬퍼 마, 복제본 잘 만들어 놨잖아. 죽기 전에 의식과 기억을 미리 다 옮겨놨거든." },
    { file: "protagonist_10.mp3", voice: "ko-KR-InJoonNeural", text: "그래... 이렇게라도 계속 이야기할 수 있다면 좋은 거겠지..." },
    { file: "protagonist_11.mp3", voice: "ko-KR-InJoonNeural", text: "아니... 거절할게. 넌 내 친구의 기억을 가졌지만, 진짜 내 친구는 아니야." },
    { file: "clone_5.mp3", voice: "ko-KR-SunHiNeural", text: "왜 그래? 난 너랑 이렇게 대화할 수 있고, 예전과 똑같이 생각하고 반응하는데. 죽음은 이제 끝이 아니잖아." },
    { file: "protagonist_12.mp3", voice: "ko-KR-InJoonNeural", text: "그건 가짜 위로일 뿐이야. 네 육신이 죽었는데 끝없이 대화하는 건, 진정한 작별을 회피하는 거라고." }
];

async function generateAll() {
    console.log("Starting Edge Neural TTS voice generation...");
    
    // We instantiate TTS clients for each voice to ensure correct settings.
    const clients = {
        "ko-KR-InJoonNeural": new EdgeTTS({ voice: "ko-KR-InJoonNeural", lang: "ko-KR" }),
        "ko-KR-SunHiNeural": new EdgeTTS({ voice: "ko-KR-SunHiNeural", lang: "ko-KR" }),
        "ko-KR-HyunsuNeural": new EdgeTTS({ voice: "ko-KR-HyunsuNeural", lang: "ko-KR" })
    };
    
    // Fallback client in case Hyunsu is not supported in the library version
    const fallbackClient = new EdgeTTS({ voice: "ko-KR-InJoonNeural", lang: "ko-KR" });

    for (let i = 0; i < dialogues.length; i++) {
        const d = dialogues[i];
        const outputPath = path.join(audioDir, d.file);
        let client = clients[d.voice] || fallbackClient;
        
        console.log(`[${i + 1}/${dialogues.length}] Generating ${d.file} using ${d.voice}...`);
        try {
            await client.ttsPromise(d.text, outputPath);
        } catch (err) {
            console.warn(`Warning: failed to generate with ${d.voice}, trying fallback InJoon...`);
            try {
                await fallbackClient.ttsPromise(d.text, outputPath);
            } catch (err2) {
                console.error(`Error: failed to generate ${d.file} completely:`, err2);
            }
        }
    }
    
    console.log("Voice generation completed successfully.");
}

generateAll().catch(err => {
    console.error("Fatal error in voice generation script:", err);
});
