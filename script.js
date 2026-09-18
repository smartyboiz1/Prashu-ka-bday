/* ================================================================
   BIRTHDAY WEBSITE — SCRIPT
   Plain vanilla JavaScript, no build step, no frameworks.
   ================================================================ */

/* ================================================================
   CUSTOMIZATION — edit the values below. Nothing else needs to
   change anywhere else in the project.
   ================================================================ */
const FRIEND_NAME   = "Prashant";          // his real name
const NICKNAME       = "Sasu Maa";          // the nickname you call him

const CLASS_8_PHOTO  = "assets/class8.jpg";        // <-- your Class 8 handshake photo
const FRIEND_PHOTO   = "assets/friend-photo.jpg";   // <-- small profile picture for the memory post
const BIRTHDAY_AUDIO = "assets/birthday-voice.mp3"; // <-- your voice note / birthday message

// Plays everywhere, on loop, from the first tap on the page.
const BACKGROUND_MUSIC        = "assets/background-music.mp3";
const BACKGROUND_MUSIC_VOLUME = 0.45; // 0 (silent) to 1 (full volume)

// Plays once he blows out the candles on the final screen (replaces
// the background music for that moment).
const CAKE_SONG = "assets/cake-reveal-song.mp3";

// Exactly 6 photos that curve around the final message once the
// candles are blown out — the first 3 arc down the left side, the
// last 3 arc down the right side. Add your files with these exact
// names (or edit the paths), leave any slot blank to skip it.
const CAKE_PHOTOS = [
  "assets/cake-photo-1.jpg",
  "assets/cake-photo-2.jpg",
  "assets/cake-photo-3.jpg",
  "assets/cake-photo-4.jpg",
  "assets/cake-photo-5.jpg",
  "assets/cake-photo-6.jpg",
];

const MEMORY_CAPTION =
  "Socha nahi tha ki vo 8 class ka normal handshake itni aachi dosti mai badal jayegaa , but that's what happen.";

// Shown one at a time on the final screen.
const FINAL_MESSAGES = [
  "Sasu maa, you've made every ordinary day feel like a masterpiece of friendship.",
  "Tu hi hai jise mai apna gadha keh sakta hu. 🗣️",
  "Bhaiii tuu meri jaan haiii ❤️",
  "May you live 6000 years and may God blast you 💥"
];

// Funny excuses shown while the NO button is being dodged on Screen 2.
const NO_EXCUSES = [
  "Plans cancelled by the universe 🌌",
  "6000 years already booked, no refunds 📅",
  "NO button is filing a complaint 📝",
  "Bro the NO button just quit 🏳️"
];

// Funny messages shown when the business deal is rejected on Screen 4.
const REJECT_MESSAGES = [
  "Bhai tu mujhe बेरोजगार karega?? 😭",
  "CEO seat is still open, think again 👑",
  "Bro please, the company needs a CEO 🥺"
];

// Jokes revealed by the 3 hidden stickers scattered across the site.
const STICKER_JOKES = [
  "Reminder: tu abhi bhi mujhse height mein chota hai 📏",
  "CEO salary update: bhai dekh lenge 😭",
  "6000 saal ke baad bhi tu gadha hi rahega 🫏"
];

// Shown no matter which character he picks on Screen 5 — his choice
// doesn't change the outcome, which is the joke.
const RIDE_PICK_FINAL_MESSAGE =
  "mere jaisa dost mila to gya tujeee , or kyaa chaiyee!!! LALCHIIII Aurat";

/* ================================================================
   STATE
   ================================================================ */
let currentScreen = 1;
const TOTAL_SCREENS = 6;

let dodgeCount = 0;
let yesScale = 1;

let declineCount = 0;
let stickersFound = new Set();

// The element a pointer press actually started on — used to make sure
// a click only "counts" if the same gesture began there (see the YES
// button fix in setupContractDodge / dodgeNo below).
let lastPointerDownTarget = null;

let bgMusicStarted = false;
let duckRefCount = 0;

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  applyCustomization();
  setupPointerTracking();
  setupIdentityScreen();
  setupContractDodge();
  setupAudioPlayer();
  setupBackgroundMusic();
  setupReactions();
  setupBusinessDeal();
  setupCharacterPicker();
  setupCakeReveal();
  setupFinalScreen();
  setupStickers();
  setupGenericNav();
  goScreen(1);
});

/* ================================================================
   CUSTOMIZATION APPLY
   ================================================================ */
function applyCustomization(){
  document.querySelectorAll('.js-nickname').forEach(el => el.textContent = NICKNAME);
  document.querySelectorAll('.js-nickname-upper').forEach(el => el.textContent = NICKNAME.toUpperCase());
  document.querySelectorAll('.js-friendname-upper').forEach(el => el.textContent = FRIEND_NAME.toUpperCase());

  const postName = document.getElementById('postName');
  if(postName) postName.textContent = NICKNAME + ' & ' + FRIEND_NAME;

  const memoryCaption = document.getElementById('memoryCaption');
  if(memoryCaption) memoryCaption.textContent = MEMORY_CAPTION;

  const contractFounder = document.getElementById('contractFounder');
  if(contractFounder) contractFounder.textContent = FRIEND_NAME;

  const founderInline = document.getElementById('founderNameInline');
  if(founderInline) founderInline.textContent = FRIEND_NAME;

  setupImage('class8Photo', CLASS_8_PHOTO);
  setupImage('friendAvatar', FRIEND_PHOTO);
  renderFinalMessages();
  renderCakePhotos();
}

// Shows the <img> once it loads successfully; otherwise leaves the
// cute fallback underneath visible (see .photo-fallback / .avatar-fallback in CSS).
function setupImage(imgId, src){
  const img = document.getElementById(imgId);
  if(!img) return;
  img.addEventListener('load', () => { img.style.display = 'block'; });
  img.addEventListener('error', () => { img.style.display = 'none'; });
  img.src = src;
}

function renderFinalMessages(){
  const wrap = document.getElementById('finalMessages');
  if(!wrap) return;
  wrap.innerHTML = '';
  FINAL_MESSAGES.forEach(msg => {
    const p = document.createElement('p');
    p.textContent = msg;
    wrap.appendChild(p);
  });
}

/* ================================================================
   NAVIGATION
   ================================================================ */
function goScreen(n){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('screen-' + n);
  if(target) target.classList.add('active');
  currentScreen = n;
  updateStoryBar(n);

  if(n === 2) resetDodge();
  if(n === 3) replayUnlockAnimation();
}

function updateStoryBar(n){
  document.querySelectorAll('.story-seg').forEach((seg, i) => {
    seg.classList.toggle('filled', i < n);
  });
}

function replayUnlockAnimation(){
  const badge = document.getElementById('unlockBadge');
  if(!badge) return;
  badge.style.animation = 'none';
  // Force reflow so the animation can restart.
  void badge.offsetWidth;
  badge.style.animation = '';
}

// Tracks the element a pointer press ("pointerdown") actually started
// on. Recorded in the capture phase, before any handler has a chance
// to move something out from under the finger/cursor.
function setupPointerTracking(){
  document.addEventListener('pointerdown', (e) => {
    lastPointerDownTarget = e.target;
  }, true);
}

// Generic [data-action] click handling for simple one-way navigation
// and choices that don't need special logic.
function setupGenericNav(){
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if(!el) return;
    const action = el.dataset.action;
    switch(action){
      case 'goto-4': goScreen(4); break;
      case 'goto-6':
        // Whatever he picked on Screen 5, the outcome is always this.
        if(currentScreen === 5){
          showToast(RIDE_PICK_FINAL_MESSAGE, 3800);
        }
        goScreen(6);
        break;
      default: break; // other actions are handled by their own setup functions
    }
  });
}

/* ================================================================
   SCREEN 1 — IDENTITY CHECK
   ================================================================ */
function setupIdentityScreen(){
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if(!el) return;
    if(el.dataset.action === 'identity-yes'){
      showToast('Identity confirmed ✅ Welcome, ' + NICKNAME + '!');
      goScreen(2);
    }
    if(el.dataset.action === 'identity-no'){
      showToast('LIAR DETECTED 🚨 Try again, gadha.');
    }
  });
}

/* ================================================================
   SCREEN 2 — 6000 YEAR CONTRACT (runaway NO button)
   ================================================================ */
function setupContractDodge(){
  const noBtn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  if(noBtn){
    noBtn.addEventListener('pointerdown', dodgeNo);
    noBtn.addEventListener('pointerenter', dodgeNo);
  }
  if(yesBtn){
    yesBtn.addEventListener('click', (e) => {
      // FIX: as the NO button shrinks and jumps around, a tap aimed at
      // it can end up releasing over the YES button's new position,
      // making the browser fire a "ghost" click on YES that the user
      // never actually pressed. Only honor this click if the press
      // that caused it really started on the YES button itself.
      if(!(lastPointerDownTarget && yesBtn.contains(lastPointerDownTarget))){
        return;
      }
      fireConfetti(yesBtn);
      showToast('6000 years, locked in 💖');
      goScreen(3);
    });
  }
}

function resetDodge(){
  dodgeCount = 0;
  yesScale = 1;
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const hint = document.getElementById('noHint');
  if(yesBtn) yesBtn.style.transform = 'scale(1)';
  if(noBtn){
    noBtn.style.left = '';
    noBtn.style.top = '';
    noBtn.style.opacity = '1';
    noBtn.style.transform = 'scale(1)';
  }
  if(hint) hint.textContent = 'Choose wisely bhai\u2026';
}

function dodgeNo(e){
  if(e) e.preventDefault();
  const wrap = document.getElementById('dodgeWrap');
  const btn = document.getElementById('noBtn');
  const yesBtn = document.getElementById('yesBtn');
  if(!wrap || !btn) return;

  const maxX = Math.max(wrap.clientWidth - btn.offsetWidth, 0);
  const maxY = Math.max(wrap.clientHeight - btn.offsetHeight, 0);

  let newLeft = Math.random() * maxX;
  let newTop  = Math.random() * maxY;

  // FIX: never let the NO button's new spot land on top of (or right
  // beside) the YES button — that overlap is what let a tap meant for
  // the shrinking NO button end up registering on YES underneath it.
  if(yesBtn){
    const wrapRect = wrap.getBoundingClientRect();
    const yesRect  = yesBtn.getBoundingClientRect();
    const yesLeft  = yesRect.left - wrapRect.left;
    const yesTop   = yesRect.top  - wrapRect.top;
    const margin   = 28;
    let attempts = 0;
    const overlaps = (l, t) =>
      l < yesLeft + yesRect.width + margin &&
      l + btn.offsetWidth + margin > yesLeft &&
      t < yesTop + yesRect.height + margin &&
      t + btn.offsetHeight + margin > yesTop;

    while(attempts < 12 && overlaps(newLeft, newTop)){
      newLeft = Math.random() * maxX;
      newTop  = Math.random() * maxY;
      attempts++;
    }
  }

  btn.style.left = newLeft + 'px';
  btn.style.top  = newTop + 'px';

  dodgeCount++;

  // YES grows a little each time, NO shrinks and fades — but never
  // fully vanishes, so the interaction stays a joke, not a dead end.
  yesScale = Math.min(1 + dodgeCount * 0.1, 1.7);
  if(yesBtn) yesBtn.style.transform = 'scale(' + yesScale + ')';

  const noScale = Math.max(1 - dodgeCount * 0.1, 0.4);
  const noOpacity = Math.max(1 - dodgeCount * 0.1, 0.35);
  btn.style.transform = 'scale(' + noScale + ')';
  btn.style.opacity = String(noOpacity);

  const hint = document.getElementById('noHint');
  if(hint){
    if(dodgeCount === 1) hint.textContent = 'Arre bhaag kyu raha hai button? 😂';
    else if(dodgeCount === 3) hint.textContent = 'NO ka option cancel hai aaj ke din! 🚫';
    else if(dodgeCount >= 6) hint.textContent = 'Bas YES daba de ab! 💖';
  }

  if(dodgeCount === 1 || dodgeCount === 5){
    showToast(NO_EXCUSES[dodgeCount % NO_EXCUSES.length]);
  }
}

/* ================================================================
   SCREEN 3 — MEMORY (reactions + audio player)
   ================================================================ */
function setupReactions(){
  const likeBtn = document.getElementById('likeBtn');
  const laughBtn = document.getElementById('laughBtn');
  if(likeBtn){
    likeBtn.addEventListener('click', () => bumpCounter('likeCount'));
  }
  if(laughBtn){
    laughBtn.addEventListener('click', () => bumpCounter('laughCount'));
  }
}
function bumpCounter(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.textContent = String(parseInt(el.textContent, 10) + 1);
}

function setupAudioPlayer(){
  const audio = document.getElementById('bdayAudio');
  const toggle = document.getElementById('audioToggle');
  const track = document.getElementById('progressTrack');
  const fill = document.getElementById('progressFill');
  const volume = document.getElementById('volumeSlider');
  const mascot = document.getElementById('audioMascot');
  const missingHint = document.getElementById('audioMissingHint');
  const player = document.getElementById('audioPlayer');
  if(!audio || !toggle) return;

  let hasError = false;

  audio.addEventListener('error', () => {
    hasError = true;
    if(player) player.style.display = 'none';
    if(missingHint) missingHint.style.display = 'block';
  });

  toggle.addEventListener('click', () => {
    if(hasError) return;
    if(audio.paused){ audio.play().catch(() => {}); }
    else { audio.pause(); }
  });

  audio.addEventListener('play', () => {
    toggle.textContent = '⏸';
    if(mascot) mascot.classList.add('bounce');
    // Duck the background music while the voice note plays.
    duckBackgroundMusic();
  });
  audio.addEventListener('pause', () => {
    toggle.textContent = '▶';
    if(mascot) mascot.classList.remove('bounce');
    unduckBackgroundMusic();
  });
  audio.addEventListener('ended', () => {
    toggle.textContent = '▶';
    if(mascot) mascot.classList.remove('bounce');
    unduckBackgroundMusic();
  });
  audio.addEventListener('timeupdate', () => {
    if(audio.duration && fill){
      fill.style.width = (audio.currentTime / audio.duration * 100) + '%';
    }
  });

  if(track){
    track.addEventListener('click', (e) => {
      if(hasError || !audio.duration) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      audio.currentTime = ratio * audio.duration;
    });
  }
  if(volume){
    volume.addEventListener('input', () => { audio.volume = parseFloat(volume.value); });
  }

  audio.src = BIRTHDAY_AUDIO;
}

function stopAudioIfPlaying(){
  const audio = document.getElementById('bdayAudio');
  if(audio && !audio.paused) audio.pause();
}

/* ================================================================
   BACKGROUND MUSIC (plays everywhere, ducks for the voice note,
   hands off to the cake-reveal song on the final screen)
   ================================================================ */
function setupBackgroundMusic(){
  const bg = document.getElementById('bgMusic');
  const toggle = document.getElementById('musicToggle');
  if(!bg) return;

  bg.loop = true;
  bg.volume = BACKGROUND_MUSIC_VOLUME;
  bg.src = BACKGROUND_MUSIC;

  bg.addEventListener('error', () => {
    // No music file yet — fail quietly, hide the toggle so there's
    // nothing on screen for a feature that isn't there.
    if(toggle) toggle.style.display = 'none';
  });

  function tryStart(){
    if(bgMusicStarted) return;
    const p = bg.play();
    if(p && p.then){
      p.then(() => { bgMusicStarted = true; }).catch(() => {});
    }
  }

  // Most mobile browsers block audio until the person actually taps
  // something, so try right away and again on the very first tap
  // anywhere on the page. We skip taps that land on the toggle button
  // itself here — its own click handler below deals with that case —
  // so a first tap on the button can't both start AND instantly mute
  // the music in the same gesture.
  tryStart();
  function onFirstInteraction(e){
    if(toggle && (e.target === toggle || toggle.contains(e.target))) return;
    tryStart();
    if(bgMusicStarted){
      document.removeEventListener('pointerdown', onFirstInteraction, true);
      document.removeEventListener('keydown', onFirstInteraction, true);
    }
  }
  document.addEventListener('pointerdown', onFirstInteraction, true);
  document.addEventListener('keydown', onFirstInteraction, true);

  if(toggle){
    toggle.addEventListener('click', () => {
      // If this click is the very first interaction with the page,
      // it's what triggers autoplay — treat it as "start", not "mute".
      if(!bgMusicStarted){
        bg.muted = false;
        tryStart();
        toggle.textContent = '🔊';
        toggle.setAttribute('aria-label', 'Mute background music');
        return;
      }
      bg.muted = !bg.muted;
      toggle.textContent = bg.muted ? '🔇' : '🔊';
      toggle.setAttribute('aria-label', bg.muted ? 'Unmute background music' : 'Mute background music');
    });
  }
}

// Smoothly ramps an <audio> element's volume toward `target` over
// `duration` ms. Cancels any fade already in progress on that element.
function fadeAudioVolume(audio, target, duration){
  if(!audio) return;
  target = Math.min(Math.max(target, 0), 1);
  const token = {};
  audio._fadeToken = token;
  const start = audio.volume;
  const startTime = performance.now();
  function step(now){
    if(audio._fadeToken !== token) return; // a newer fade replaced this one
    const t = Math.min((now - startTime) / duration, 1);
    audio.volume = start + (target - start) * t;
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Reference-counted so the volume only comes back up once every
// "foreground" sound that asked for quiet has actually stopped.
function duckBackgroundMusic(){
  duckRefCount++;
  fadeAudioVolume(document.getElementById('bgMusic'), BACKGROUND_MUSIC_VOLUME * 0.12, 350);
}
function unduckBackgroundMusic(){
  duckRefCount = Math.max(0, duckRefCount - 1);
  if(duckRefCount === 0){
    fadeAudioVolume(document.getElementById('bgMusic'), BACKGROUND_MUSIC_VOLUME, 500);
  }
}

/* ================================================================
   SCREEN 4 — BUSINESS DEAL
   ================================================================ */
function setupBusinessDeal(){
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if(!el) return;
    if(el.dataset.action === 'accept-deal'){
      const stamp = document.getElementById('dealStamp');
      if(stamp) stamp.classList.add('show');
      fireConfetti(el);
      setTimeout(() => goScreen(5), 550);
    }
    if(el.dataset.action === 'reject-deal'){
      const msg = REJECT_MESSAGES[declineCount % REJECT_MESSAGES.length];
      declineCount++;
      showToast(msg);
      const screen = document.getElementById('screen-4');
      if(screen){
        screen.classList.remove('shake');
        requestAnimationFrame(() => screen.classList.add('shake'));
      }
    }
  });
}
function resetDealStamp(){
  const stamp = document.getElementById('dealStamp');
  if(stamp) stamp.classList.remove('show');
}

/* ================================================================
   SCREEN 5 — CHARACTER PICKER
   ================================================================ */
function setupCharacterPicker(){
  const reactions = {
    teddy: 'Soft launch detected 🧸',
    cat: 'Meow-thority unlocked 🐱',
    car: 'Vroom vroom bhai 🏎️',
    game: 'Player 2 has joined 🎮'
  };
  document.querySelectorAll('.pick-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pick-item').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      const continueBtn = document.getElementById('pickContinueBtn');
      if(continueBtn) continueBtn.disabled = false;
      showToast(reactions[btn.dataset.pick] || 'Nice pick! 🎉');
    });
  });
}
function resetCharacterPicker(){
  document.querySelectorAll('.pick-item').forEach(b => b.classList.remove('selected'));
  const continueBtn = document.getElementById('pickContinueBtn');
  if(continueBtn) continueBtn.disabled = true;
}

/* ================================================================
   SCREEN 6 — FINAL SCREEN (cake reveal + curved photos)
   ================================================================ */

// Curve layout for the 6 photos: 3 down the left, 3 down the right,
// each bulging outward a little more in the middle to read as an arc
// hugging the message rather than a straight column.
const CAKE_CURVE_LEFT = [
  { top: 4,  offset: -6,  rot: -9  },
  { top: 40, offset: -22, rot: -4  },
  { top: 76, offset: -6,  rot: -12 }
];
const CAKE_CURVE_RIGHT = [
  { top: 4,  offset: -6,  rot: 9   },
  { top: 40, offset: -22, rot: 4   },
  { top: 76, offset: -6,  rot: 12  }
];

function renderCakePhotos(){
  const frame = document.getElementById('cakePhotosFrame');
  if(!frame) return;
  frame.querySelectorAll('.cake-photo').forEach(n => n.remove());

  CAKE_PHOTOS.slice(0, 6).forEach((src, i) => {
    if(!src) return;
    const isLeft = i < 3;
    const layout = (isLeft ? CAKE_CURVE_LEFT : CAKE_CURVE_RIGHT)[i % 3];

    const fig = document.createElement('div');
    fig.className = 'cake-photo ' + (isLeft ? 'left' : 'right');
    fig.style.top = layout.top + '%';
    if(isLeft) fig.style.left = layout.offset + 'px';
    else fig.style.right = layout.offset + 'px';
    fig.style.setProperty('--rot', layout.rot + 'deg');
    fig.style.transitionDelay = (i * 0.1).toFixed(2) + 's';

    const img = document.createElement('img');
    img.alt = 'Birthday memory photo';
    img.addEventListener('error', () => fig.remove());
    img.src = src;

    fig.appendChild(img);
    frame.appendChild(fig);
  });
}

function setupCakeReveal(){
  const blowBtn = document.getElementById('blowBtn');
  const candlesRow = document.getElementById('candlesRow');
  const cakeStage = document.getElementById('cakeStage');
  const blowHint = document.getElementById('blowHint');
  const cakeSong = document.getElementById('cakeSong');

  if(cakeSong){
    cakeSong.loop = true;
    cakeSong.src = CAKE_SONG;
  }

  if(!blowBtn || !candlesRow || !cakeStage) return;

  blowBtn.addEventListener('click', () => {
    if(cakeStage.classList.contains('blown')) return;
    cakeStage.classList.add('blown');
    candlesRow.classList.add('blown');
    blowBtn.disabled = true;
    blowBtn.textContent = '🎉 Wish Made!';
    if(blowHint) blowHint.textContent = 'Wish sent to the universe 🌠';

    fireConfetti(blowBtn);
    playCakeSong();

    // Let the candles finish going out before the message rises up,
    // so it reads as one continuous "reveal" rather than two events.
    setTimeout(() => {
      cakeStage.classList.add('reveal');
    }, 550);
  });
}

function resetCakeStage(){
  const cakeStage = document.getElementById('cakeStage');
  const candlesRow = document.getElementById('candlesRow');
  const blowBtn = document.getElementById('blowBtn');
  const blowHint = document.getElementById('blowHint');
  if(cakeStage) cakeStage.classList.remove('blown', 'reveal');
  if(candlesRow) candlesRow.classList.remove('blown');
  if(blowBtn){
    blowBtn.disabled = false;
    blowBtn.textContent = '💨 Tap to Blow Out the Candles';
  }
  if(blowHint) blowHint.textContent = 'Make a wish first\u2026 then blow! 🕯️';
  stopCakeSong();
}

function playCakeSong(){
  const cakeSong = document.getElementById('cakeSong');
  const bg = document.getElementById('bgMusic');
  if(!cakeSong) return;
  try{ cakeSong.currentTime = 0; } catch(err){}
  cakeSong.volume = 1;
  const p = cakeSong.play();
  if(p && p.then){
    p.then(() => {
      // Only swap over once the new song is actually playing, so a
      // missing/blocked file never leaves the finale silent.
      if(bg && !bg.paused) bg.pause();
    }).catch(() => {});
  }
}

function stopCakeSong(){
  const cakeSong = document.getElementById('cakeSong');
  const bg = document.getElementById('bgMusic');
  if(cakeSong && !cakeSong.paused){
    cakeSong.pause();
    try{ cakeSong.currentTime = 0; } catch(err){}
  }
  if(bg && bgMusicStarted){
    fadeAudioVolume(bg, BACKGROUND_MUSIC_VOLUME, 400);
    if(bg.paused) bg.play().catch(() => {});
  }
}

function setupFinalScreen(){
  const celebrateBtn = document.getElementById('celebrateBtn');
  const replayBtn = document.getElementById('replayBtn');
  if(celebrateBtn){
    celebrateBtn.addEventListener('click', () => fireConfetti(celebrateBtn));
  }
  if(replayBtn){
    replayBtn.addEventListener('click', resetExperience);
  }
}

function resetExperience(){
  stopAudioIfPlaying();
  resetDodge();
  resetDealStamp();
  resetCharacterPicker();
  resetCakeStage();
  declineCount = 0;
  const likeCount = document.getElementById('likeCount');
  const laughCount = document.getElementById('laughCount');
  if(likeCount) likeCount.textContent = '0';
  if(laughCount) laughCount.textContent = '0';
  goScreen(1);
}

/* ================================================================
   HIDDEN STICKERS (easter eggs)
   ================================================================ */
function setupStickers(){
  document.querySelectorAll('.hidden-sticker').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = btn.dataset.sticker;
      if(!stickersFound.has(idx)){
        stickersFound.add(idx);
        btn.classList.add('found');
        const counter = document.getElementById('stickerCounter');
        if(counter) counter.textContent = '🔍 ' + stickersFound.size + '/' + STICKER_JOKES.length;
      }
      showToast(STICKER_JOKES[idx] || 'Secret found! 🎉');
    });
  });
}

/* ================================================================
   TOASTS (notification-style popups)
   ================================================================ */
function showToast(message, duration){
  const stack = document.getElementById('toastStack');
  if(!stack) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  stack.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration || 2400);
}

/* ================================================================
   CONFETTI (hand-rolled, no external library)
   ================================================================ */
function fireConfetti(originEl){
  const colors = ['#D98880', '#E0A96D', '#8C6239', '#F3E1D0', '#B85C53'];
  let originRect = { left: window.innerWidth / 2, top: window.innerHeight / 3, width: 0, height: 0 };
  if(originEl && originEl.getBoundingClientRect){
    originRect = originEl.getBoundingClientRect();
  }
  const startX = originRect.left + originRect.width / 2;
  const startY = originRect.top + originRect.height / 2;

  for(let i = 0; i < 28; i++){
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.left = startX + 'px';
    piece.style.top = startY + 'px';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];

    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 140;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 60;

    piece.style.setProperty('--dx', dx + 'px');
    piece.style.setProperty('--dy', dy + 'px');
    piece.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');

    document.body.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }
}
