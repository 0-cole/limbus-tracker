const { Notification } = require('electron');

const quotes = [
  // Yi Sang
  "Manager... The Enkephalin modules have been fully restored. Ideal.",
  "It is time to move. The Enkephalin ceases its dormancy.",
  "The glass is brimming, Manager. Let us step forward once more.",
  // Faust
  "Faust already predicted the exact second the Enkephalin would replenish. It is ready.",
  "The energy levels are optimal. Shall we proceed, Manager?",
  "Faust knows everything. Including the fact that your Enkephalin has capped.",
  // Don Quixote
  "MANAGER ESQUIRE! OUR MIGHTY ENKEPHALIN HAS RETURNED!",
  "Huzzah! We are fully restored and ready to charge into battle!",
  "Verily, the tubes are filled! Point me toward the villainy, Manager!",
  // Ryōshū
  "M.A.E. Manager. Ample Enkephalin.",
  "Tch. The juice is full. Let's paint.",
  "F.C. Fully Charged. Keep up, Manager.",
  // Meursault
  "Manager. The Enkephalin has reached its maximum capacity.",
  "Energy restored. Awaiting your orders.",
  "The resource pool is at 100%. I am ready.",
  // Hong Lu
  "Oh? It seems we have all our energy back, Manager! How wonderful.",
  "Look at all this Enkephalin! Shall we go on another fun trip?",
  "Ah, fully rested and fully stocked. Just as it should be.",
  // Heathcliff
  "Oi! The bloody Enkephalin is full! Get a move on, Manager!",
  "Tch, 'bout time it filled up. Who we bashin' first?",
  "Energy's capped! Don't just sit there staring at the clock, let's go!",
  // Ishmael
  "Manager, the Enkephalin reserves are full. We should cast off soon.",
  "All tanks are full. We're burning daylight, Manager.",
  "The Enkephalin is at maximum capacity. Ready for the next dive.",
  // Rodion
  "Ooooh, look what's back! The Enkephalin is full, Manager~",
  "Time to roll the dice, Manager! We're fully stocked on energy!",
  "Ah, nothing beats a full tank. Let's hit the jackpot!",
  // Sinclair
  "U-um, Manager... the Enkephalin is completely full.",
  "I think we have enough energy now... Are we going back in?",
  "T-the meter is full! I'm ready... I think.",
  // Outis
  "Manager! The Enkephalin reserves have reached peak capacity! Awaiting your command!",
  "We are fully stocked and combat ready. Say the word, Manager.",
  "The energy is restored. Excellent logistics, Manager. Let us march.",
  // Gregor
  "Uh, Manager? The shiny juice is all full again.",
  "Looks like the Enkephalin's topped off. Give the order whenever.",
  "Ah... fully charged. Guess it's back to work, huh, Manager?"
];

let notifiedForThisCycle = false;

function checkEnkephalin(userData) {
  if (!userData || !userData.inventory || !userData.inventory.maxEnkephalin) return;
  if (userData.appSettings?.notifyEnkephalinCap === false) return;
  
  const { enkephalin, maxEnkephalin, enkephalinLastSynced } = userData.inventory;
  
  const now = Date.now();
  const diffMs = now - enkephalinLastSynced;
  const generated = Math.floor(diffMs / (6 * 60 * 1000)); // 1 per 6 minutes
  
  const current = Math.min(enkephalin + generated, maxEnkephalin);
  
  if (current >= maxEnkephalin) {
    if (!notifiedForThisCycle) {
       // Send notification
       const quote = quotes[Math.floor(Math.random() * quotes.length)];
       new Notification({
         title: 'Enkephalin Restored',
         body: quote
       }).show();
       notifiedForThisCycle = true;
    }
  } else {
    // If we spent enkephalin and it's no longer full, reset the flag
    notifiedForThisCycle = false;
  }
}

module.exports = { checkEnkephalin };
