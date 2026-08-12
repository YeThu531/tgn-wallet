/* =========================================================
   TGN WALLET - FIREBASE
   Firebase initialization + Firestore helpers
   ========================================================= */

const firebaseConfig = {
  apiKey: "AIzaSyAc-8EzwZcJvhouuk9Vkx6Ngj_hgjRMiKg",
  authDomain: "tgn-wallet.firebaseapp.com",
  projectId: "tgn-wallet",
  storageBucket: "tgn-wallet.firebasestorage.app",
  messagingSenderId: "347838161609",
  appId: "1:347838161609:web:27b90e794b383d0ddb2318",
  measurementId: "G-250N1M7FB4"
};

let firebaseApp = null;
let db = null;
let firebaseReady = false;

let firestore = null;


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

export async function initFirebase() {

  if (firebaseReady && db) {
    return true;
  }

  try {

    const firebase =
      await import(
        "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js"
      );

    firestore =
      await import(
        "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js"
      );

    firebaseApp =
      firebase.initializeApp(
        firebaseConfig
      );

    db =
      firestore.getFirestore(
        firebaseApp
      );

    firebaseReady = true;

    console.log(
      "Firebase connected ✓"
    );

    return true;

  } catch (error) {

    console.error(
      "Firebase initialization failed:",
      error
    );

    firebaseReady = false;
    db = null;

    return false;
  }
}


/* =========================================================
   FIREBASE STATUS
   ========================================================= */

export function isFirebaseReady() {
  return firebaseReady && !!db;
}

export function getDB() {
  return db;
}


/* =========================================================
   FIRESTORE
   ========================================================= */

export async function getUser(
  telegramId
) {

  await initFirebase();

  if (!db || !telegramId) {
    return null;
  }

  const ref =
    firestore.doc(
      db,
      "users",
      String(telegramId)
    );

  const snap =
    await firestore.getDoc(ref);

  if (!snap.exists()) {
    return null;
  }

  return {
    id: snap.id,
    ...snap.data()
  };
}


/* =========================================================
   CREATE / UPDATE USER
   ========================================================= */

export async function saveUser(
  telegramId,
  data
) {

  await initFirebase();

  if (!db || !telegramId) {
    return false;
  }

  const ref =
    firestore.doc(
      db,
      "users",
      String(telegramId)
    );

  await firestore.setDoc(
    ref,
    data,
    {
      merge: true
    }
  );

  return true;
}


/* =========================================================
   AIRDROP TASKS
   ========================================================= */

export async function getAirdropTasks() {

  await initFirebase();

  if (!db) {
    return [];
  }

  const q =
    firestore.query(

      firestore.collection(
        db,
        "airdropTasks"
      ),

      firestore.where(
        "active",
        "==",
        true
      )

    );

  const snapshot =
    await firestore.getDocs(q);

  return snapshot.docs.map(
    doc => ({
      id: doc.id,
      ...doc.data()
    })
  );
}


/* =========================================================
   CLAIM AIRDROP TASK
   ========================================================= */

export async function claimAirdropTask(
  telegramId,
  taskId
) {

  await initFirebase();

  if (!db) {
    throw new Error(
      "Firebase is not connected"
    );
  }

  if (!telegramId || !taskId) {
    throw new Error(
      "telegramId and taskId are required"
    );
  }

  const userRef =
    firestore.doc(
      db,
      "users",
      String(telegramId)
    );

  const claimRef =
    firestore.doc(
      db,
      "userTasks",
      String(telegramId) +
      "_" +
      String(taskId)
    );

  const previous =
    await firestore.getDoc(
      claimRef
    );

  if (previous.exists()) {

    return {
      ok: false,
      alreadyClaimed: true
    };

  }

  let result = null;

  await firestore.runTransaction(
    db,
    async transaction => {

      const userSnap =
        await transaction.get(
          userRef
        );

      if (!userSnap.exists()) {
        throw new Error(
          "User not found"
        );
      }

      const user =
        userSnap.data() || {};

      const points =
        Number(
          user.airdropPoints || 0
        );

      const taskRef =
        firestore.doc(
          db,
          "airdropTasks",
          String(taskId)
        );

      const taskSnap =
        await transaction.get(
          taskRef
        );

      if (!taskSnap.exists()) {
        throw new Error(
          "Task not found"
        );
      }

      const task =
        taskSnap.data() || {};

      const reward =
        Number(
          task.reward ||
          task.points ||
          0
        );

      transaction.set(
        claimRef,
        {
          telegramId:
            String(telegramId),

          taskId:
            String(taskId),

          reward,

          claimedAt:
            firestore.serverTimestamp()
        }
      );

      transaction.set(
        userRef,
        {
          airdropPoints:
            points + reward,

          updatedAt:
            firestore.serverTimestamp()
        },
        {
          merge: true
        }
      );

      result = {
        reward,
        newPoints:
          points + reward
      };

    }
  );

  return {
    ok: true,
    ...result
  };
}


/* =========================================================
   EXPORT FIRESTORE HELPERS
   ========================================================= */

export {
  firebaseApp,
  db,
  firestore
};
