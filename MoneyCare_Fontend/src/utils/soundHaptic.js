// Sound, Haptic & Voice Notification utilities using Web Audio API, Vibration API & Web Speech API

/**
 * Đọc số tiền bằng tiếng Việt tự nhiên cho AI Voice (VD: 500000 -> "500 nghìn đồng", 1500000 -> "1 triệu 500 nghìn đồng")
 * @param {number} amount
 * @returns {string}
 */
export const formatAmountToSpokenVietnamese = (amount) => {
  const n = Math.abs(Number(amount) || 0);
  if (n === 0) return '0 đồng';

  const ty = Math.floor(n / 1_000_000_000);
  const trieu = Math.floor((n % 1_000_000_000) / 1_000_000);
  const nghin = Math.floor((n % 1_000_000) / 1_000);
  const le = n % 1_000;

  const parts = [];
  if (ty > 0) parts.push(`${ty} tỷ`);
  if (trieu > 0) parts.push(`${trieu} triệu`);
  if (nghin > 0) parts.push(`${nghin} nghìn`);
  if (le > 0 && parts.length === 0) parts.push(`${le}`);

  return parts.join(' ') + ' đồng';
};

/**
 * Đọc văn bản bằng giọng nói AI qua Web Speech API (speechSynthesis)
 * @param {string} text - Câu văn bản cần đọc
 * @param {object} options - Cấu hình giọng đọc (rate, pitch, volume)
 */
export const speakVietnamese = (text, options = {}) => {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.debug('Web Speech API not supported in this browser.');
      return;
    }

    // Dừng câu đọc cũ nếu đang đọc dở để tránh xếp hàng nói chồng chéo
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = options.rate || 1.0; // Tốc độ bình thường
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume !== undefined ? options.volume : 1.0;

    // Tìm kiếm giọng đọc tiếng Việt tối ưu trong hệ thống
    const voices = window.speechSynthesis.getVoices();
    const vietnameseVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI'));
    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.debug('Speech synthesis error:', err);
  }
};

/**
 * Phát âm thanh thông báo tinh tế bằng Web Audio API (không cần tải file ngoài)
 * @param {'success' | 'error' | 'warning' | 'info'} type
 */
export const playNotificationSound = (type = 'success') => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'success') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.1); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.22); // D6

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(164.81, now + 0.2); // E3

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'warning') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(370, now + 0.1);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (err) {
    console.debug('Notification audio ignored:', err);
  }
};

/**
 * Rung phản hồi haptic feedback cho thiết bị di động / cảm ứng
 * @param {'success' | 'error' | 'warning' | 'info'} type
 */
export const triggerHaptic = (type = 'success') => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (type === 'success') {
        navigator.vibrate([25, 35, 25]);
      } else if (type === 'error') {
        navigator.vibrate([60, 40, 60]);
      } else {
        navigator.vibrate(30);
      }
    }
  } catch (err) {
    console.debug('Haptic feedback ignored:', err);
  }
};
