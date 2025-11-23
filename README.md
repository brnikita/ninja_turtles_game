# 🐢 Teenage Mutant Ninja Turtles: The Last Ronin

A browser-based action game where you play as the Last Ronin, the lone surviving turtle who must fight endless waves of Foot Clan robots with his katana.

## 🎮 How to Play

1. Open `index.html` in any modern browser.
2. Controls:
   - **WASD** or **Arrow Keys** – movement
   - **Space** – katana attack
3. Cut down the Foot Clan robots to earn points.
4. Stay alive: enemies drain your health on contact.

## ✨ Features

- 🗡️ Responsive hack-and-slash katana combat
- 🤖 Foot Clan robot ninjas with glowing red optics
- 👹 **Boss: Shredder** appears every 500 points with special attacks
- 💪 Shredder has 300 HP, hits for 25 damage, and performs dashes
- 🏆 Defeating Shredder rewards +1000 score
- 👾 Smarter AI for both minions and the boss
- 💥 Particle effects for sparks, metal shards, and explosions
- 💥 Cinematic boss death blast
- 💚 Health bar and live score HUD
- 🎨 Visual style inspired by TMNT comics
- ♾️ Infinite enemy waves with rising difficulty

## 🛠️ Tech Stack

- HTML5 Canvas / WebGL (Three.js)
- Vanilla JavaScript
- CSS3

## 📂 Project Structure

```
src/
├── core/           # scene/camera renderer, lighting, materials, collisions
├── environment/    # city generation, props and landmarks
├── entities/       # Player, Enemy, Boss classes
├── systems/        # input, particles, combat, HUD helpers
├── state/          # shared mutable game state
└── main.js         # entry point bootstrapping the game loop
```

## 🚀 Getting Started

Because the project uses ES modules, you need to serve it via HTTP (opening `index.html` with `file://` will trigger CORS errors).

```bash
# option 1: Node
npx http-server -p 8080

# option 2: Python
python -m http.server 8080
```

Then open `http://localhost:8080/` in your browser.

## 🎯 Goal

Survive as long as you can and set a high score by slicing Foot Clan robots with the Last Ronin’s katana. Every 500 points Shredder arrives—beat him to earn a massive bonus!

---

**Cowabunga!** 🐢⚔️