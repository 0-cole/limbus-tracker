// electron/mirrorGrinderEngine.cjs
// Clean-room, safety-first Mirror Dungeon automation engine for Limbus Tracker
// Features Gaussian randomized humanized cadence, active-window fail-safe, and live event telemetry.

const { EventEmitter } = require('events');
const { spawn } = require('child_process');
const path = require('path');

class MirrorGrinderEngine extends EventEmitter {
  constructor() {
    super();
    this.state = 'IDLE'; // IDLE, RUNNING, PAUSED, STOPPED, ERROR
    this.config = {
      mode: 'NORMAL', // NORMAL, HARD, LUXCAVATION
      priorityPacks: ['HellsChicken', 'TheOutcast'],
      bannedPacks: ['NoonOfViolet', 'WarpExpress', 'TimekillingTime'],
      humanCadence: true,
      autoRotateTeams: false,
      maxRuns: 3,
      selectedKeyword: 'BURN'
    };
    this.currentRun = 0;
    this.currentFloor = 1;
    this.sessionStartTime = null;
    this.runStartTime = null;
    this.powershellProc = null;
    this.loopTimer = null;
    this.isLimbusFocused = false;
    this.logs = [];
  }

  log(msg, level = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { timestamp, msg, level };
    this.logs.unshift(entry);
    if (this.logs.length > 200) this.logs.pop();
    this.emit('log', entry);
    this.emit('telemetry', this.getStatus());
  }

  getStatus() {
    return {
      state: this.state,
      config: this.config,
      currentRun: this.currentRun,
      currentFloor: this.currentFloor,
      isLimbusFocused: this.isLimbusFocused,
      sessionElapsedMs: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
      runElapsedMs: this.runStartTime ? Date.now() - this.runStartTime : 0,
      recentLogs: this.logs.slice(0, 30)
    };
  }

  // Gaussian random sampler for natural human input timing
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

  // Gaussian delay utility
  async humanDelay(meanMs = 120, stdDevMs = 25, minMs = 50, maxMs = 260) {
    const delay = this.randomGaussian(meanMs, stdDevMs, minMs, maxMs);
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Initialize persistent low-latency PowerShell driver for window checks and input simulation
  initDriver() {
    if (this.powershellProc) return;

    // PowerShell session that exposes Window and SendInput utilities
    const psScript = `
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class WinDriver {
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, System.Text.StringBuilder text, int count);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
    [DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, int dwExtraInfo);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
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
            $isLimbus = $title -like "*Limbus*"
            Write-Output "WINDOW:$isLimbus"
        }
        "KEY_PRESS" {
            # $parts[1] = VirtualKey code, $parts[2] = holdMs
            $vk = [byte]$parts[1]
            $hold = [int]$parts[2]
            [WinDriver]::keybd_event($vk, 0, 0, 0)
            Start-Sleep -Milliseconds $hold
            [WinDriver]::keybd_event($vk, 0, 2, 0) # KEYEVENTF_KEYUP
            Write-Output "KEY:OK"
        }
        "CLICK" {
            # Left click down and up
            $hold = [int]$parts[1]
            [WinDriver]::mouse_event(0x0002, 0, 0, 0, 0) # LEFTDOWN
            Start-Sleep -Milliseconds $hold
            [WinDriver]::mouse_event(0x0004, 0, 0, 0, 0) # LEFTUP
            Write-Output "CLICK:OK"
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

  async sendKey(vkCode, holdMean = 95) {
    const holdMs = Math.round(this.randomGaussian(holdMean, 18, 45, 180));
    this.sendCommand(`KEY_PRESS ${vkCode} ${holdMs}`);
    await this.humanDelay(150, 30, 80, 280);
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

    this.log(`Charge Grinder MD engine engaged! Target Mode: ${this.config.mode} | Keyword: ${this.config.selectedKeyword}`, 'info');
    this.log('Anti-Detection Cadence: Gaussian Micro-Jitter (90ms ± 25ms) active. Alt-Tab Auto-Pause enabled.', 'info');

    this.runLoop();
    this.emit('telemetry', this.getStatus());
  }

  // Stops the automation engine
  stop() {
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
    this.log('Mirror Dungeon Grinder disengaged.', 'info');
    this.emit('telemetry', this.getStatus());
  }

  // Main tactical polling and execution cycle
  async runLoop() {
    if (this.state !== 'RUNNING' && this.state !== 'PAUSED') return;

    // Check window active state
    this.sendCommand('CHECK_WINDOW');

    if (this.state === 'RUNNING' && this.isLimbusFocused) {
      // Execute turn automation step
      try {
        await this.executeTacticalStep();
      } catch (err) {
        this.log(`Tactical step error: ${err.message}`, 'error');
      }
    }

    // Schedule next iteration with Gaussian pacing (never robotic periodic clock ticks)
    const nextInterval = Math.round(this.randomGaussian(1100, 180, 750, 1800));
    this.loopTimer = setTimeout(() => this.runLoop(), nextInterval);
  }

  // Individual tactical action based on Charge-Grinder reverse-engineered flow
  async executeTacticalStep() {
    // 1. Send Win-Rate hotkey ('P' = VK 80)
    // Walpth's bot presses 'P' up to 3 times with 0.5s intervals to engage Win Rate
    await this.sendKey(80, 100);
    
    // 2. Short micro-delay before turn execution confirmation
    await this.humanDelay(250, 40, 120, 450);

    // 3. Send Start Combat / Space / Enter ('Enter' = VK 13)
    await this.sendKey(13, 90);

    this.log('Turn synchronized: Win Rate [P] engaged -> Turn confirmed [Enter]', 'debug');
  }
}

module.exports = {
  mirrorGrinder: new MirrorGrinderEngine()
};
