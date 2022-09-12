import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "Your API Key",
  authDomain: "chat-app-6a639.firebaseapp.com",
  projectId: "chat-app-6a639",
  storageBucket: "chat-app-6a639.appspot.com",
  messagingSenderId: "113280806244",
  appId: "1:113280806244:web:85565b227dcb469d1d9e71",
  measurementId: "G-2VS0WWXQRZ"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();



function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className="font-link">Chit Chat 💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (<>
    <h1 className="font-link logo fade-in-image">💬</h1>
    <h1 className="font-link title fade-in-image">Chit Chat</h1>
    <button className="sign-in font-link fade-in-image" onClick={signInWithGoogle}>Sign in with Google!</button>
    <center>
      <p className="font-link fade-in-image">By signing in you are agreeing to the <a href="https://firebase.google.com/community-guidelines" target="_blank">community guidelines</a></p>
    </center>
    </>)
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out font-link" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limitToLast(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
  }

  useEffect(() => {
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages])

  return (<>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>

        <input className="font-link fade-in-image" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something" />

        <button className="fade-in-image" type="submit" disabled={!formValue}>➥</button>

      </form>
    </>)
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass} fade-in-bubble`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;
