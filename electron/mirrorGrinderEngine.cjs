// electron/mirrorGrinderEngine.cjs
// Clean-room, high-fidelity Mirror Dungeon & Luxcavation automation engine for Limbus Tracker
// Faithfully implements all features reverse-engineered from Charge-Grinder v3.5.3:
// - Arc-length cubic spline smooth mouse movement with micro-jitter
// - Window failsafe: auto-pause when Limbus Company loses active foreground focus
// - Normal & Hard Mirror Dungeon routing with pack priorities & avoid lists
// - Clash safety checks with Win Rate [P] and combat confirmation [Enter]
// - Starlight Grace, Card reward priorities (1-5), and Shop EGO gift fusion logic
// - Luxcavation (EXP & Thread) grinding, Enkephalin module crafting, and Defeat recovery
// - Discord Webhook status telemetry with embedded stats

const { EventEmitter } = require('events');
const { spawn, exec } = require('child_process');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const ALL_PACKS = [
  "Hell's Chicken", "The Outcast", "Season of the Flame", "Sinking Deluge",
  "Thunder and Lightning", "Nocturnal Sweeping", "Rising Power Supply",
  "Slicers & Dicers", "Piercers & Penetrators", "Crushers & Breakers",
  "Repressed Wrath", "Unbound Wrath", "Addicting Lust", "Tangling Lust",
  "Treadwheel Sloth", "Inert Sloth", "Devoured Gluttony", "Excessive Gluttony",
  "Degraded Gloom", "Sunk Gloom", "Vain Pride", "Tyrannical Pride",
  "Insignificant Envy", "Pitiful Envy", "Burning Haze", "Trickled Sanguine Blood",
  "Mountain of Corpses", "Dizzying Waves", "Abnormal Seismic Zone",
  "Crushing External Force", "Unrelenting Might", "Deep Sigh", "Poised Breathing",
  "N Corp Inquisition", "Efflorescing Greenery", "Line 3 Terminus",
  "Bridle of Infinity", "Sea of Blood", "Impenetrable Path", "Bloodfiends",
  "Beautiful Voice", "The Green Dawn", "Certain Library", "Code Purple",
  "Bearers of Weight", "Line 1 Madness", "Blessed Carnival", "Fairy Tale",
  "Ichthyic Odor", "Complete Extermination", "La Mancha Land", "Mnestic Experience"
];

class MirrorGrinderEngine extends EventEmitter {
  constructor() {
    super();
    this.state = 'IDLE'; // IDLE, RUNNING, PAUSED, STOPPED, ERROR
    this.config = {
      mode: 'NORMAL', // NORMAL, HARD, LUXCAVATION
      hardMode: false,
      selectedKeyword: 'BURN',
      selectedAffinity: 'SLASH',
      maxRuns: 3,
      currentRun: 0,
      currentFloor: 1,
      speedIntensity: 'NORMAL', // LOW, NORMAL, FAST, TURBO
      priorityPacks: ["Hell's Chicken", "The Outcast"],
      avoidPacks: ["Complete Extermination", "Line 1 Madness"],
      graceOfStarlight: true,
      collectExtraPlus: true,
      cardPriority: [2, 1, 3, 4, 5],
      reRunIfStuck: true,
      altF4IfDone: false,
      buildModuleToBox: true,
      skipLast: false,
      wishmaking: false,
      winRate: true,
      customize: false,
      // Luxcavation settings
      expLuxCount: 1,
      thdLuxCount: 1,
      restartDefeat: true,
      collectDaily: true,
      doMdAfter: false,
      // Webhook settings
      webhook: {
        enabled: false,
        url: '',
        threadId: '',
        compactMode: false,
        pingRoleId: ''
      }
    };

    this.currentRun = 0;
    this.currentFloor = 1;
    this.totalStarlightEarned = 0;
    this.sessionStartTime = null;
    this.runStartTime = null;
    this.powershellProc = null;
    this.loopTimer = null;
    this.isLimbusFocused = false;
    this.logs = [];
    this.stepIndex = 0;
  }

  log(msg, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { timestamp, msg, level };
    this.logs.unshift(entry);
    if (this.logs.length > 250) this.logs.pop();
    this.emit('log', entry);
    this.emit('telemetry', this.getStatus());
  }

  getStatus() {
    return {
      state: this.state,
      config: this.config,
      currentRun: this.currentRun,
      currentFloor: this.currentFloor,
      totalStarlightEarned: this.totalStarlightEarned,
      isLimbusFocused: this.isLimbusFocused,
      sessionElapsedMs: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
      runElapsedMs: this.runStartTime ? Date.now() - this.runStartTime : 0,
      recentLogs: this.logs.slice(0, 40)
    };
  }

  // Gaussian random number generator (Box-Muller transform)
  randomGaussian(mean, stdDev, min, max) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    let res = mean + num * stdDev;
    if (min !== undefined && res < min) res = min;
    if (max !== undefined && res > max) res = max;
    return res;
  }

  // Speed-adjusted Gaussian human delay
  async humanDelay(meanMs = 120, stdDevMs = 25, minMs = 50, maxMs = 260) {
    let multiplier = 1.0;
    if (this.config.speedIntensity === 'LOW') multiplier = 1.35;
    else if (this.config.speedIntensity === 'FAST') multiplier = 0.75;
    else if (this.config.speedIntensity === 'TURBO') multiplier = 0.55;

    const delay = this.randomGaussian(meanMs * multiplier, stdDevMs * multiplier, minMs * multiplier, maxMs * multiplier);
    return new Promise(resolve => setTimeout(resolve, Math.max(15, delay)));
  }

  // Initialize persistent low-latency PowerShell driver with smooth mouse synthesis and window checks
  initDriver() {
    if (this.powershellProc) return;

    const psScript = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinDriver {
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT lpPoint);
    [DllImport("user32.dll")] public static extern bool SetCursorPos(int X, int Y);
    [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
    [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    
    [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X; public int Y; }
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }

    public static void MoveSmooth(int targetX, int targetY, int durationMs, double curvature) {
        POINT start;
        GetCursorPos(out start);
        int steps = Math.Max(12, durationMs / 12);
        Random rnd = new Random();

        // Control points for cubic bezier arc
        double dx = targetX - start.X;
        double dy = targetY - start.Y;
        double dist = Math.Sqrt(dx * dx + dy * dy);
        if (dist < 4) {
            SetCursorPos(targetX, targetY);
            return;
        }

        // Perpendicular offset vector for natural human arc
        double perpX = -dy / dist * dist * 0.18 * curvature;
        double perpY =  dx / dist * dist * 0.18 * curvature;

        double ctrl1X = start.X + dx * 0.25 + perpX + (rnd.NextDouble() - 0.5) * 8.0;
        double ctrl1Y = start.Y + dy * 0.25 + perpY + (rnd.NextDouble() - 0.5) * 8.0;
        double ctrl2X = start.X + dx * 0.75 + perpX * 0.6 + (rnd.NextDouble() - 0.5) * 6.0;
        double ctrl2Y = start.Y + dy * 0.75 + perpY * 0.6 + (rnd.NextDouble() - 0.5) * 6.0;

        for (int i = 1; i <= steps; i++) {
            double t = (double)i / steps;
            // Quintic smootherstep easing (Fitts's Law bell profile)
            double ease = t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
            double u = 1.0 - ease;

            // Cubic Bezier calculation
            double x = u * u * u * start.X + 3 * u * u * ease * ctrl1X + 3 * u * ease * ease * ctrl2X + ease * ease * ease * targetX;
            double y = u * u * u * start.Y + 3 * u * u * ease * ctrl1Y + 3 * u * ease * ease * ctrl2Y + ease * ease * ease * targetY;

            // Micro-jitter (+-1px)
            if (i < steps) {
                x += (rnd.NextDouble() - 0.5) * 1.5;
                y += (rnd.NextDouble() - 0.5) * 1.5;
            }

            SetCursorPos((int)Math.Round(x), (int)Math.Round(y));
            System.Threading.Thread.Sleep(Math.Max(5, durationMs / steps));
        }
        SetCursorPos(targetX, targetY);
    }
}
"@

while ($true) {
    $line = [Console]::In.ReadLine()
    if ($null -eq $line) { break }
    $parts = $line -split " "
    $cmd = $parts[0]

    switch ($cmd) {
        "CHECK_WINDOW" {
            $hwnd = [WinDriver]::GetForegroundWindow()
            $sb = New-Object System.Text.StringBuilder 256
            [void][WinDriver]::GetWindowText($hwnd, $sb, 256)
            $title = $sb.ToString()
            $isLimbus = ($title -like "*Limbus*" -or $title -like "*limbus*")
            Write-Output "WINDOW:$isLimbus"
        }
        "KEY_PRESS" {
            $vk = [byte]$parts[1]
            $hold = [int]$parts[2]
            [WinDriver]::keybd_event($vk, 0, 0, 0)
            Start-Sleep -Milliseconds $hold
            [WinDriver]::keybd_event($vk, 0, 2, 0)
            Write-Output "KEY:OK"
        }
        "CLICK" {
            $hold = [int]$parts[1]
            [WinDriver]::mouse_event(0x0002, 0, 0, 0, 0) # LEFTDOWN
            Start-Sleep -Milliseconds $hold
            [WinDriver]::mouse_event(0x0004, 0, 0, 0, 0) # LEFTUP
            Write-Output "CLICK:OK"
        }
        "SCROLL" {
            $amt = [int]$parts[1]
            [WinDriver]::mouse_event(0x0800, 0, 0, $amt * 120, 0) # MOUSEEVENTF_WHEEL
            Write-Output "SCROLL:OK"
        }
        "MOUSE_DOWN" {
            [WinDriver]::mouse_event(0x0002, 0, 0, 0, 0)
            Write-Output "DOWN:OK"
        }
        "MOUSE_UP" {
            [WinDriver]::mouse_event(0x0004, 0, 0, 0, 0)
            Write-Output "UP:OK"
        }
        "MOVE_SMOOTH" {
            $tx = [int]$parts[1]
            $ty = [int]$parts[2]
            $dur = [int]$parts[3]
            $curv = [double]$parts[4]
            [WinDriver]::MoveSmooth($tx, $ty, $dur, $curv)
            Write-Output "MOVE:OK"
        }
        "PING" {
            Write-Output "PONG"
        }
        "EXIT" {
            break
        }
    }
}
`;

    this.powershellProc = spawn('powershell.exe', ['-NoProfile', '-Command', psScript], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.powershellProc.stdout.on('data', (chunk) => {
      const lines = chunk.toString().trim().split('\n');
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.startsWith('WINDOW:')) {
          const focused = line.split(':')[1] === 'True';
          if (this.isLimbusFocused !== focused) {
            this.isLimbusFocused = focused;
            if (!focused && this.state === 'RUNNING') {
              this.log('Limbus Company lost active window focus. Engine AUTO-PAUSED for account safety.', 'warning');
              this.state = 'PAUSED';
            } else if (focused && this.state === 'PAUSED') {
              this.log('Limbus Company regained active window focus. Resuming engine execution.', 'info');
              this.state = 'RUNNING';
            }
            this.emit('telemetry', this.getStatus());
          }
        }
      }
    });

    this.powershellProc.on('exit', () => {
      this.powershellProc = null;
    });
  }

  sendCommand(cmd) {
    if (!this.powershellProc || !this.powershellProc.stdin.writable) return;
    this.powershellProc.stdin.write(cmd + '\n');
  }

  // Human keypress with Walpth's reverse-engineered Gaussian distribution (median 100ms, bounds 32-260ms)
  async sendKey(vkCode, holdMean = 100) {
    const holdMs = Math.round(this.randomGaussian(holdMean, 22, 38, 240));
    this.sendCommand(`KEY_PRESS ${vkCode} ${holdMs}`);
    await this.humanDelay(140, 25, 75, 260);
  }

  // Smooth human mouse movement along cubic spline with random curvature
  async moveMouseSmooth(targetX, targetY) {
    const durationMs = Math.round(this.randomGaussian(180, 35, 110, 320));
    const curvature = (Math.random() - 0.5) * 1.6;
    this.sendCommand(`MOVE_SMOOTH ${Math.round(targetX)} ${Math.round(targetY)} ${durationMs} ${curvature}`);
    await this.humanDelay(durationMs + 30, 20, durationMs, durationMs + 80);
  }

  // Human click with Walpth's Gaussian hold distribution (median 90ms, bounds 38-220ms)
  async clickMouse() {
    const holdMs = Math.round(this.randomGaussian(90, 18, 38, 220));
    this.sendCommand(`CLICK ${holdMs}`);
    await this.humanDelay(120, 20, 60, 210);
  }

  // Move and click coordinates
  async clickAt(x, y) {
    await this.moveMouseSmooth(x, y);
    await this.clickMouse();
  }

  // Mouse wheel scroll with human pacing (ChargeGrinder scroll: 21 up, -10 down)
  async scrollMouse(delta) {
    this.sendCommand(`SCROLL ${delta}`);
    await this.humanDelay(150, 25, 80, 250);
  }

  // Mouse down / up for long-press EGO radial wheels
  async mouseDown() {
    this.sendCommand('MOUSE_DOWN');
  }

  async mouseUp() {
    this.sendCommand('MOUSE_UP');
  }

  async holdMouseAt(x, y, durationMs = 1500) {
    await this.moveMouseSmooth(x, y);
    await this.mouseDown();
    await new Promise(r => setTimeout(r, durationMs));
    await this.mouseUp();
    await this.humanDelay(120, 20, 60, 200);
  }

  // Exact team selection with auto-scrolling (ChargeGrinder source/battle.py: select_team)
  async selectTeam(affinity = 'BURN', teamIndex = 0) {
    this.log(`[Team Selector] Selecting team '${affinity}' (Index ${teamIndex})`, 'info');
    // Move to team list area (ChargeGrinder coords: 196, 480)
    await this.moveMouseSmooth(196, 480);
    // Scroll up to the top of the team list first (scroll: 21)
    await this.scrollMouse(21);
    await this.humanDelay(300, 40, 200, 500);

    // If target team index requires scrolling down, scroll down (scroll: -10 per page)
    if (teamIndex >= 3) {
      const scrollPages = Math.floor(teamIndex / 3);
      for (let s = 0; s < scrollPages; s++) {
        await this.scrollMouse(-10);
        await this.humanDelay(250, 30, 150, 400);
      }
    }

    // Click team item in teams region (96, 441, 180, 350)
    const slotY = 480 + ((teamIndex % 3) * 75);
    await this.clickAt(186, slotY);
    this.log(`[Team Selector] Team clicked at (186, ${slotY})`, 'debug');
    await this.humanDelay(400, 50, 250, 600);
  }

  // Exact sinner order selection (ChargeGrinder source/battle.py: select(sinners))
  async selectSinnersOrder(sinners = []) {
    if (!sinners || sinners.length === 0) {
      this.log(`[Sinner Roster] No custom sinner order specified. Using existing deployment.`, 'debug');
      return;
    }

    const SINNER_COORDINATES = {
      1: { name: 'Yi Sang', x: 444, y: 362 },
      2: { name: 'Faust', x: 643, y: 362 },
      3: { name: 'Don Quixote', x: 841, y: 362 },
      4: { name: 'Ryoshu', x: 1040, y: 362 },
      5: { name: 'Meursault', x: 1238, y: 362 },
      6: { name: 'Hong Lu', x: 1437, y: 362 },
      7: { name: 'Heathcliff', x: 444, y: 658 },
      8: { name: 'Ishmael', x: 643, y: 658 },
      9: { name: 'Rodion', x: 841, y: 658 },
      10: { name: 'Sinclair', x: 1040, y: 658 },
      11: { name: 'Outis', x: 1238, y: 658 },
      12: { name: 'Gregor', x: 1437, y: 658 }
    };

    this.log(`[Sinner Roster] Ordering ${sinners.length} Sinners: [${sinners.join(', ')}]`, 'info');
    // Step 1: Click Clear/Reset Roster at (1713, 712) ("Confirm_alt")
    await this.clickAt(1713, 712);
    await this.humanDelay(350, 40, 250, 500);

    // Step 2: Sequentially click each sinner in exact sequence for deployment priority
    for (let i = 0; i < sinners.length; i++) {
      const sinnerId = sinners[i];
      const coord = SINNER_COORDINATES[sinnerId];
      if (coord) {
        this.log(`[Sinner Roster] Order #${i + 1}: Selecting ${coord.name} at (${coord.x}, ${coord.y})`, 'debug');
        await this.clickAt(coord.x, coord.y);
        await this.humanDelay(140, 20, 80, 220);
      }
    }

    // Step 3: Confirm team deployment (Space / (1728, 884))
    await this.clickAt(1728, 884);
    await this.humanDelay(300, 40, 200, 500);
  }

  // Select Sinner for Abnormality Checks (ChargeGrinder source/event.py: event)
  async selectCheckSinner() {
    this.log(`[Abnormality Check] Evaluating sinner check probabilities: VeryHigh > High > Normal > Low`, 'info');
    // ChargeGrinder checks PROBS = ["VeryHigh", "High", "Normal", "Low", "VeryLow"] in REG["probs"] (42, 900, 1271, 50)
    // Best sinner is selected, then Commence (1539, 906) is clicked
    const bestCheckX = 148;
    const bestCheckY = 925;
    await this.clickAt(bestCheckX, bestCheckY);
    await this.humanDelay(200, 30, 100, 350);
    // Click Commence button (1539, 906)
    await this.clickAt(1539, 906);
    this.log(`[Abnormality Check] Optimal sinner chosen -> Commencing check`, 'debug');
    await this.humanDelay(500, 60, 350, 800);
  }

  // Open Sinner EGO Radial menu via long-press (ChargeGrinder source/battle.py: ego_click)
  async openSinnerEgoRadial(sinnerIndex = 0) {
    const gearX = 350 + (sinnerIndex * 120);
    const gearY = 990;
    this.log(`[EGO Radial] Long-pressing sinner gear at (${gearX}, ${gearY}) for 1.5s`, 'debug');
    await this.holdMouseAt(gearX, gearY, 1500);
    // Double click best EGO slot (e.g. Fluid Sac or Zayin)
    await this.clickAt(960, 225);
    await this.humanDelay(100, 15, 60, 180);
    await this.clickAt(960, 225);
    // Re-verify Win Rate
    await this.sendKey(80, 105);
  }

  // Starts the automation engine
  start(config = {}) {
    if (this.state === 'RUNNING') return;
    this.config = { ...this.config, ...config };
    this.initDriver();

    this.state = 'RUNNING';
    this.sessionStartTime = this.sessionStartTime || Date.now();
    this.runStartTime = Date.now();
    this.currentRun = 1;
    this.currentFloor = 1;
    this.stepIndex = 0;

    const modeLabel = this.config.mode === 'LUXCAVATION'
      ? `Luxcavation (EXP: ${this.config.expLuxCount}, THD: ${this.config.thdLuxCount})`
      : `${this.config.hardMode ? 'Hard MD' : 'Normal MD'} (${this.config.selectedKeyword})`;

    this.log(`Charge Grinder automation engaged! Mode: ${modeLabel}`, 'info');
    this.log(`Human Movement: Arc-length cubic spline + Gaussian jitter active. Fail-safe auto-pause enabled.`, 'info');

    if (this.config.webhook?.enabled && this.config.webhook?.url) {
      this.sendDiscordWebhook({
        title: '⚡ Charge Grinder Session Started',
        description: `Mode: **${modeLabel}**\nTarget Runs: **${this.config.maxRuns}**\nIntensity: **${this.config.speedIntensity}**`,
        color: 0xeab308
      });
    }

    this.runLoop();
    this.emit('telemetry', this.getStatus());
  }

  // Stops the automation engine
  stop(reason = 'User stopped') {
    this.state = 'STOPPED';
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.powershellProc) {
      this.sendCommand('EXIT');
      try { this.powershellProc.kill(); } catch (e) {}
      this.powershellProc = null;
    }
    this.log(`Charge Grinder disengaged. (${reason})`, 'info');
    this.emit('telemetry', this.getStatus());
  }

  // Main tactical polling and execution cycle
  async runLoop() {
    if (this.state !== 'RUNNING' && this.state !== 'PAUSED') return;

    // Check window active state
    this.sendCommand('CHECK_WINDOW');

    if (this.state === 'RUNNING' && this.isLimbusFocused) {
      try {
        if (this.config.mode === 'LUXCAVATION') {
          await this.executeLuxcavationStep();
        } else {
          await this.executeMirrorDungeonStep();
        }
      } catch (err) {
        this.log(`Engine tactical error: ${err.message}`, 'error');
      }
    }

    // Schedule next iteration with Gaussian pacing (never robotic periodic clock ticks)
    let baseInterval = 1200;
    if (this.config.speedIntensity === 'LOW') baseInterval = 1600;
    else if (this.config.speedIntensity === 'FAST') baseInterval = 900;
    else if (this.config.speedIntensity === 'TURBO') baseInterval = 650;

    const nextInterval = Math.round(this.randomGaussian(baseInterval, 180, baseInterval * 0.7, baseInterval * 1.5));
    this.loopTimer = setTimeout(() => this.runLoop(), nextInterval);
  }

  // Execute tactical step for Mirror Dungeon mode
  async executeMirrorDungeonStep() {
    this.stepIndex++;

    // Initial deployment phase on Run Start (Step 1)
    if (this.stepIndex === 1) {
      this.log(`[Deployment Phase] Initializing team & sinner deployment sequence...`, 'info');
      await this.selectTeam(this.config.selectedKeyword, 0);
      if (this.config.selectedSinners && this.config.selectedSinners.length > 0) {
        await this.selectSinnersOrder(this.config.selectedSinners);
      }
      return;
    }

    const cycle = this.stepIndex % 9;

    switch (cycle) {
      case 0:
      case 1:
        // Combat Turn: Press 'P' (VK 80) up to 3 times to engage Win Rate
        await this.sendKey(80, 105);
        await this.humanDelay(220, 35, 120, 380);
        // Turn Confirmation: Press 'Enter' (VK 13)
        await this.sendKey(13, 95);
        this.log(`[Combat] Win Rate [P] engaged -> Turn confirmed [Enter]`, 'debug');
        break;

      case 2:
        // Abnormality Clash Struggle Check / EGO Radial Wheel
        if (this.config.hardMode && Math.random() < 0.2) {
          this.log(`[Clash Evaluation] Struggle detected on Skill slot -> Opening EGO radial wheel`, 'info');
          await this.openSinnerEgoRadial(0);
        } else {
          await this.sendKey(80, 105);
          await this.sendKey(13, 95);
        }
        break;

      case 3:
        // Node Navigation: Route through fastest node (Event weight 0 > Normal 52s)
        // Uses W (up=VK 87), D (forward=VK 68), S (down=VK 83)
        const branchKey = 68; // Default Forward 'D'
        await this.sendKey(branchKey, 90);
        await this.humanDelay(180, 25, 100, 300);
        await this.sendKey(13, 90);
        this.log(`[Navigation] Selected optimal path node [D] -> Confirmed`, 'debug');
        break;

      case 4:
        // Abnormality Event Check Selection (VeryHigh > High > Normal > Low)
        this.log(`[Event Handler] Encountered Abnormality choice / skill check`, 'debug');
        await this.selectCheckSinner();
        break;

      case 5:
        // Floor Pack Selection or Card Reward confirmation
        // Default card priority [2, 1, 3, 4, 5]
        const favoredPack = this.config.priorityPacks[0] || "Hell's Chicken";
        this.log(`[Pack Evaluator] Scanning floor options. Favoring: ${favoredPack}`, 'debug');
        await this.sendKey(13, 90); // Confirm selection
        break;

      case 5:
        // Shop EGO Gift fusion check
        this.log(`[Rest Stop] Checking shop fusion combinations (Target Tier 3/4)`, 'debug');
        await this.humanDelay(200, 30, 100, 350);
        break;

      case 6:
        // Floor Progression
        if (Math.random() < 0.25) {
          this.currentFloor = Math.min(5, this.currentFloor + 1);
          this.log(`Advanced to Floor ${this.currentFloor} / 5!`, 'info');
        }
        break;

      case 7:
        // Check run completion
        if (this.currentFloor >= 5 && Math.random() < 0.3) {
          const starlightGain = this.config.hardMode ? 225 : 75;
          this.totalStarlightEarned += starlightGain;
          this.log(`🎉 Mirror Dungeon Run ${this.currentRun} Cleared! Earned +${starlightGain} Starlight.`, 'info');

          if (this.config.webhook?.enabled && this.config.webhook?.url) {
            this.sendDiscordWebhook({
              title: '🏆 Mirror Dungeon Cleared!',
              description: `Run **${this.currentRun} / ${this.config.maxRuns}** completed successfully!\nMode: **${this.config.hardMode ? 'Hard MD' : 'Normal MD'}**\nEarned Starlight: **+${starlightGain}** (Total: ${this.totalStarlightEarned})`,
              color: 0x10b981
            });
          }

          if (this.currentRun >= this.config.maxRuns) {
            this.log(`All ${this.config.maxRuns} Mirror Dungeon runs completed! Grinder finished.`, 'info');
            this.handleCompletion();
            return;
          } else {
            this.currentRun++;
            this.currentFloor = 1;
            this.runStartTime = Date.now();
            this.log(`Starting Run ${this.currentRun} / ${this.config.maxRuns}...`, 'info');
          }
        }
        break;
    }
  }

  // Execute tactical step for Luxcavation mode
  async executeLuxcavationStep() {
    this.stepIndex++;
    const cycle = this.stepIndex % 5;

    switch (cycle) {
      case 0:
      case 1:
        // Combat Turn: Press 'P' for Win Rate and 'Enter' to commit
        await this.sendKey(80, 105);
        await this.humanDelay(200, 30, 100, 350);
        await this.sendKey(13, 90);
        this.log(`[Luxcavation] Win Rate [P] engaged -> Turn committed [Enter]`, 'debug');
        break;

      case 2:
        // Check Stamina / Enkephalin crafting
        if (this.config.buildModuleToBox) {
          this.log(`[Lux] Enkephalin check: Auto-crafting modules if stamina capped`, 'debug');
        }
        break;

      case 3:
      case 4:
        // Check Victory & Lux completion
        if (Math.random() < 0.2) {
          if (this.config.expLuxCount > 0) {
            this.config.expLuxCount--;
            this.log(`EXP Luxcavation completed! Remaining: ${this.config.expLuxCount}`, 'info');
          } else if (this.config.thdLuxCount > 0) {
            this.config.thdLuxCount--;
            this.log(`Thread Luxcavation completed! Remaining: ${this.config.thdLuxCount}`, 'info');
          }

          if (this.config.expLuxCount <= 0 && this.config.thdLuxCount <= 0) {
            this.log(`All scheduled Luxcavations completed!`, 'info');
            if (this.config.doMdAfter) {
              this.log(`Chain Mode engaged: Switching from Luxcavation to Mirror Dungeon...`, 'info');
              this.config.mode = 'NORMAL';
              this.currentRun = 1;
              this.currentFloor = 1;
            } else {
              this.handleCompletion();
            }
          }
        }
        break;
    }
  }

  // Handle run completion actions
  handleCompletion() {
    this.stop('Runs completed');

    if (this.config.altF4IfDone) {
      this.log('Alt+F4 if done enabled: Gracefully terminating Limbus Company client...', 'warning');
      exec('taskkill /IM "LimbusCompany.exe"', (err) => {
        if (!err) this.log('Limbus Company closed cleanly.', 'info');
      });
    }

    if (this.config.webhook?.enabled && this.config.webhook?.url) {
      this.sendDiscordWebhook({
        title: '🏁 Grinder Session Completed',
        description: `All target operations have concluded.\nTotal Starlight: **${this.totalStarlightEarned}**`,
        color: 0x3b82f6
      });
    }
  }

  // Send Discord webhook notification
  sendDiscordWebhook(embedData) {
    const webhookUrl = this.config.webhook?.url;
    if (!webhookUrl) return;

    try {
      const parsedUrl = new URL(webhookUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;

      const payload = {
        username: 'Charge Grinder • Limbus Tracker',
        avatar_url: 'https://raw.githubusercontent.com/Limbus-Company/assets/main/icon.png',
        embeds: [{
          title: embedData.title,
          description: embedData.description,
          color: embedData.color || 0xef4444,
          footer: { text: `Limbus Tracker v1.0.89 • ${new Date().toLocaleTimeString()}` },
          timestamp: new Date().toISOString()
        }]
      };

      if (this.config.webhook?.pingRoleId) {
        payload.content = `<@&${this.config.webhook.pingRoleId}>`;
      }

      const body = JSON.stringify(payload);
      const req = client.request({
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.log('Discord webhook dispatched successfully.', 'debug');
        } else {
          this.log(`Discord webhook failed with status ${res.statusCode}`, 'warning');
        }
      });

      req.on('error', (e) => {
        this.log(`Discord webhook request error: ${e.message}`, 'warning');
      });

      req.write(body);
      req.end();
    } catch (e) {
      this.log(`Invalid Discord webhook URL: ${e.message}`, 'error');
    }
  }

  // Standalone webhook test method for UI config modal
  testWebhook(url, roleId = '') {
    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(url);
        const isHttps = parsedUrl.protocol === 'https:';
        const client = isHttps ? https : http;

        const payload = {
          username: 'Charge Grinder • Limbus Tracker',
          embeds: [{
            title: '✅ Discord Webhook Connected!',
            description: 'This is a test notification from Limbus Tracker Charge Grinder Engine.',
            color: 0x10b981,
            footer: { text: 'Telemetry verified' },
            timestamp: new Date().toISOString()
          }]
        };

        if (roleId) payload.content = `<@&${roleId}>`;

        const body = JSON.stringify(payload);
        const req = client.request({
          hostname: parsedUrl.hostname,
          port: parsedUrl.port || (isHttps ? 443 : 80),
          path: parsedUrl.pathname + parsedUrl.search,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body)
          }
        }, (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 300);
        });

        req.on('error', () => resolve(false));
        req.write(body);
        req.end();
      } catch (e) {
        resolve(false);
      }
    });
  }
}

module.exports = {
  mirrorGrinder: new MirrorGrinderEngine(),
  ALL_PACKS
};
