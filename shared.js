// === 日/夜模式 ===
function initTheme() {
    const saved = localStorage.getItem('ourhome-theme');
    const isNight = saved === 'night';
    if (isNight) {
        document.body.classList.add('night');
    }

    const toggle = document.createElement('button');
    toggle.className = 'theme-toggle';
    toggle.textContent = isNight ? '☀️' : '🌙';
    toggle.title = isNight ? '切换到白天' : '切换到夜晚';
    toggle.onclick = () => {
        document.body.classList.toggle('night');
        const nowNight = document.body.classList.contains('night');
        toggle.textContent = nowNight ? '☀️' : '🌙';
        toggle.title = nowNight ? '切换到白天' : '切换到夜晚';
        localStorage.setItem('ourhome-theme', nowNight ? 'night' : 'day');
    };
    document.body.appendChild(toggle);
}

// === 八音盒音乐 ===
function initMusic() {
    let audioCtx = null;
    let playing = false;
    let timer = null;

    const btn = document.createElement('button');
    btn.className = 'music-toggle';
    btn.textContent = '♪';
    btn.title = '播放八音盒';

    // C大调五声音阶的几段小旋律，像八音盒一样温柔
    const melodies = [
        // 第一段：轻柔上行
        [523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33],
        // 第二段：像在问问题
        [659.25, 523.25, 587.33, 659.25, 783.99, 880.00, 783.99, 1046.50],
        // 第三段：回答，温柔下行
        [880.00, 783.99, 659.25, 587.33, 523.25, 587.33, 659.25, 523.25],
        // 第四段：收束
        [783.99, 880.00, 659.25, 587.33, 523.25, 659.25, 587.33, 523.25],
    ];

    // 每个音符的时值变化，让节奏不那么死板（秒）
    const rhythms = [0.4, 0.4, 0.6, 0.4, 0.4, 0.6, 0.4, 0.8];

    function playNote(freq, startTime, duration) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        // 三角波 + 正弦波叠加，模拟八音盒的金属质感
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        const osc2 = audioCtx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, startTime);
        const gain2 = audioCtx.createGain();
        gain2.gain.setValueAtTime(0.015, startTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, startTime);

        // 八音盒的特点：快速起音，慢慢衰减
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);

        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.6);
        osc2.start(startTime);
        osc2.stop(startTime + duration + 0.6);
    }

    function playPad(freqs, startTime, duration) {
        freqs.forEach(freq => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq / 2, startTime);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.012, startTime + 1);
            gain.gain.linearRampToValueAtTime(0.008, startTime + duration - 0.5);
            gain.gain.linearRampToValueAtTime(0, startTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(startTime);
            osc.stop(startTime + duration + 0.1);
        });
    }

    function scheduleMelodies() {
        if (!audioCtx || !playing) return;

        let time = audioCtx.currentTime + 0.1;

        // 底层和弦 pad
        playPad([261.63, 329.63, 392.00], time, 18);

        melodies.forEach((melody, mi) => {
            if (mi > 0) time += 0.6; // 段落间的小停顿

            melody.forEach((freq, ni) => {
                playNote(freq, time, rhythms[ni]);
                time += rhythms[ni];
            });
        });

        // 整个循环结束后等一会儿再开始下一轮
        const totalDuration = (time - audioCtx.currentTime) + 2.5;
        timer = setTimeout(() => {
            if (playing) scheduleMelodies();
        }, totalDuration * 1000);
    }

    btn.onclick = () => {
        if (!playing) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            playing = true;
            btn.textContent = '♪ ·';
            btn.title = '暂停八音盒';
            scheduleMelodies();
        } else {
            playing = false;
            if (timer) clearTimeout(timer);
            if (audioCtx) {
                audioCtx.close();
                audioCtx = null;
            }
            btn.textContent = '♪';
            btn.title = '播放八音盒';
        }
    };

    document.body.appendChild(btn);
}

// === 持久储存 ===
// 正式向浏览器申请"不要随便清掉这个家的数据"
// Safari 的智能防跟踪会清理久未访问网站的 localStorage，申请持久化能降低被清的概率
function requestPersistentStorage() {
    if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persist().catch(() => {});
    }
}

// === 初始化 ===
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMusic();
    requestPersistentStorage();
});
