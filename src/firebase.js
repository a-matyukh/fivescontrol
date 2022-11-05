import { initializeApp } from 'firebase/app'
import { getFirestore, doc, collection, getDocs, getDoc, setDoc } from 'firebase/firestore/lite'
const config = {
    apiKey: "AIzaSyCtT4Jc9d1VhfpyWX57MHcgswP1rDJPYFo",
    authDomain: "test-calls-c1941.firebaseapp.com",
    projectId: "test-calls-c1941",
    storageBucket: "test-calls-c1941.appspot.com",
    messagingSenderId: "614586082849",
    appId: "1:614586082849:web:eec676fe1dd9d40f1ea560"
}
const app = initializeApp(config)
const db = getFirestore(app)

async function getEvents(db) {
    const eventsCol = collection(db, 'events');
    const eventsSnapshot = await getDocs(eventsCol);
    const eventsList = eventsSnapshot.docs.map(doc => doc.data())
    console.log(eventsList)
}
export function setTrigger(prop, newValue) {
    const docRef = doc(db, 'events', prop);
    setDoc(docRef, newValue)
}