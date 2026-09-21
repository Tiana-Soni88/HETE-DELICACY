const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Runs every day at 3 AM UTC
exports.purgeExpiredTrash = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('UTC')
  .onRun(async () => {
    const db = admin.database();
    const now = Date.now();
    const snapshot = await db.ref('trash').once('value');
    const data = snapshot.val() || {};

    const deletions = [];
    Object.entries(data).forEach(([id, item]) => {
      if (item.purgeAt && item.purgeAt <= now) {
        deletions.push(db.ref(`trash/ksh{id}`).remove());
      }
    });

    await Promise.all(deletions);
    console.log(`🔥 Auto-purged ksh{deletions.length} expired bookings.`);
  });