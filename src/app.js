import { initializeApp } from 'firebase/app';
import { getFirestore, collection,
         onSnapshot, addDoc, serverTimestamp, orderBy, where, query
} from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyARpI_MnNEnUYtWntUpgCcewycxkUvvmZ4",
    authDomain: "chat1-6d1ca.firebaseapp.com",
    projectId: "chat1-6d1ca",
    storageBucket: "chat1-6d1ca.appspot.com",
    messagingSenderId: "401460197680",
    appId: "1:401460197680:web:d7c91a820f7dd4708a70f5"
  };
initializeApp(firebaseConfig);
const db = getFirestore();
// const refCol = collection(db, 'chatCol')

// Adding new chat documents 

class Chatroom{
    constructor(username, room){
        this.username = username,
        this. room = room,
        this.refCol = collection(db, 'chatCol'),
        this.querry = query(this.refCol,
            where('room', '==', this.room),
            orderBy('created_at', 'desc')),
        this.unsub
    }

    async addchat(message){
        const chat = {
            msg: message,
            username: this.username,
            room: this.room,
            created_at: serverTimestamp()
        }
        const response = await addDoc(this.refCol, chat);
    }

    getChat(callback) { 
        this.unsub = onSnapshot(this.refCol, (snapshoot) => {
            snapshoot.docChanges().forEach( change => {
                if(change.type === 'added'){
                    callback(change.doc.data())
                }
            })
        })
    }

    updateName(username){
        this.username = username;
    }

    updateRoom(room){
        this.room = room;
        
        if(this.unsub){
            console.log('room updated');
            this.unsub();
        }
    }

}

const chatroom = new Chatroom("MArian", 'general');
chatroom.addchat("Siemano")

////////////////CHAT UI//////////////////////

const chatList = document.querySelector('.chat-list');


class ChatUI{
    constructor(list){
        this.list = list;
    }

    render(data){
        const html = `
        <li class="list-group-item">
            <span>${data.username}</span>
            <span>${data.msg}</span>
            <div>${data.created_at}</div>
        </li>
        `;
        this.list.innerHTML =+ html;
    }
};

const chatUI = new ChatUI(chatList);

chatroom.getChat( (dane) => {
    chatUI.render(dane)
})