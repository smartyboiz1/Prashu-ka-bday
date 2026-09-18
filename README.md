# 🎂 Birthday Website for Sasu Maa

A silly, chaotic, interactive 6-screen birthday experience built with
plain HTML, CSS and JavaScript. No frameworks, no build step, no
backend — just open `index.html` in a browser.

## How to view it

- **Easiest:** double-click `index.html` to open it in your browser.
- **Better (recommended before sharing/deploying):** serve the folder
  with a tiny local server so the audio file and photos load properly
  everywhere:
  - VS Code → install the "Live Server" extension → right-click
    `index.html` → "Open with Live Server", **or**
  - Terminal → `cd` into this folder → run `python3 -m http.server`
    → open `http://localhost:8000`

## How to deploy it for free

Any static host works since there's no backend:
- **GitHub Pages** — push this folder to a repo, enable Pages in
  Settings.
- **Netlify / Vercel** — drag-and-drop the whole `birthday-website`
  folder onto their dashboard.

## Adding your own photos and voice note

Everything you need to change lives in **one place**:
`script.js`, right at the top, under the `CUSTOMIZATION` header.

```js
const FRIEND_NAME   = "Prashant";
const NICKNAME       = "Sasu Maa";
const CLASS_8_PHOTO  = "assets/class8.jpg";
const FRIEND_PHOTO   = "assets/friend-photo.jpg";
const BIRTHDAY_AUDIO = "assets/birthday-voice.mp3";

const BACKGROUND_MUSIC        = "assets/background-music.mp3";
const BACKGROUND_MUSIC_VOLUME = 0.45;
const CAKE_SONG                = "assets/cake-reveal-song.mp3";
const CAKE_PHOTOS = [
  "assets/cake-photo-1.jpg", "assets/cake-photo-2.jpg", "assets/cake-photo-3.jpg",
  "assets/cake-photo-4.jpg", "assets/cake-photo-5.jpg", "assets/cake-photo-6.jpg",
];
```

1. Drop your real files into the `assets/` folder using **exactly**
   those file names (or edit the paths above to match whatever you
   named them).
2. Save `script.js`. That's it — no other file needs to change.
3. If a photo or an audio file isn't there yet, the site won't
   break: it shows a cute placeholder instead until you add it.

Want the final-screen photos to look different? `CAKE_PHOTOS` needs
exactly 6 entries — the first 3 curve down the left of the final
message, the last 3 curve down the right. Leave a slot as `""` to
skip it.

You can also edit `MEMORY_CAPTION`, `FINAL_MESSAGES`,
`NO_EXCUSES`, `REJECT_MESSAGES` and `STICKER_JOKES` in the same
section to change any of the jokes/messages.

## The 6 screens

1. **Identity Check** — funny "who is this" verification.
2. **The 6000-Year Contract** — the NO button dodges around the
   screen (works on touch too).
3. **Our Memory** — social-post-style card with your Class 8 photo,
   like/laugh reaction counters, and a custom audio player for your
   voice note.
4. **Future Business Deal** — a fake CEO contract, funny on rejection.
5. **Choose Your Birthday Ride** — pick a teddy/cat/car/controller;
   whatever he picks, moving on always shows the same punchline toast.
6. **Final Message** — a cake with lit candles. Tapping the button
   blows them out, then the birthday message slides up into view
   framed by 6 curved, faded photos, a different song kicks in, and
   there's confetti and a replay button.

There are also 3 tiny hidden stickers (⭐ 🐾 🎮) scattered across the
screens — tapping them reveals a one-line joke. The counter top-right
tracks how many have been found.

A background song plays everywhere on loop from the moment he first
taps the screen (top-left 🔊 mutes it). It automatically quiets down
while the Screen 3 voice note is playing, and hands off entirely to
the final screen's cake-reveal song once the candles are blown out.

## About the one external resource

The only thing loaded from the internet is a single Google Font
("Baloo 2") for the rounded, playful headings/buttons. Everything
else — confetti, animations, the audio player — is hand-written
vanilla JS/CSS with zero dependencies. If you need the site to work
fully offline, delete the two `<link>` tags for Google Fonts near the
top of `index.html`; a similar-looking system font will be used
instead automatically.

## File structure

```
birthday-website/
├── index.html      → structure of all 6 screens
├── style.css        → warm brown/cream/pink palette, all animations
├── script.js         → CUSTOMIZATION section + all interactivity
├── README.md         → this file
└── assets/
    ├── README.txt              → exact file names expected here
    ├── class8.jpg              (add your own)
    ├── friend-photo.jpg        (add your own)
    ├── birthday-voice.mp3      (add your own)
    ├── background-music.mp3    (add your own)
    ├── cake-reveal-song.mp3    (add your own)
    └── cake-photo-1.jpg … cake-photo-6.jpg (add your own)
```
