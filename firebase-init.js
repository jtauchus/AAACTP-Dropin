// Shared Firebase setup for index.html (the board) and admin.html (weekly reset).
// Firestore holds the one live document both pages read/write, so every
// device — the board iPad and everyone's phones — sees the same state.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCrFQz8rzEDJZOFFuq-6jWOd3jHjoVtY5M",
  authDomain: "aaactp-dropin.firebaseapp.com",
  projectId: "aaactp-dropin",
  storageBucket: "aaactp-dropin.firebasestorage.app",
  messagingSenderId: "1023606153714",
  appId: "1:1023606153714:web:b13b55b189d7ef61648b6b"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Single shared document: every court, player, and pool for tonight's board.
export const BOARD_DOC_PATH = ["boards", "friday"];

export function freshBoardState(){
  var courts = [];
  for (var i=1;i<=8;i++){
    courts.push({ id:i, status:'idle', mode:null, teamA:[], teamB:[] });
  }
  return {
    players: {},
    courts: courts,
    pool: [],
    pools: [],
    history: { partner:{}, opponent:{} },
    sessionStarted: false
  };
}
