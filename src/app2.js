import { initializeApp } from 'firebase/app';
import { getFirestore, collection, serverTimestamp,
         addDoc, onSnapshot, query, orderBy, where
} from 'firebase/firestore';
import { format, intervalToDuration, dateFns, distanceInWords, formatDistance } from 'date-fns'

const firebaseConfig = {
    apiKey: "AIzaSyD5bY19c64cL2uUKRe6MHK0mpkMuEGkC6U",
    authDomain: "chat-f936d.firebaseapp.com",
    projectId: "chat-f936d",
    storageBucket: "chat-f936d.appspot.com",
    messagingSenderId: "50156961242",
    appId: "1:50156961242:web:121ab7b3f679836b73d4e3"
  };

 initializeApp(firebaseConfig);
 const db = getFirestore();
 const colRef = collection(db, 'chatCol');

 class Chatroom {
    constructor(username, room){
        this.username = username;
        this.room = room;
        this.query = query(colRef, where('room', '==', this.room), orderBy('created_at'));
        this.podglad;
        this.currName = document.querySelector('.currName');
    }

    async addChats(msg){
        await addDoc(colRef, 
            {
                msg: msg,
                user: this.username,
                room: this.room,
                created_at: serverTimestamp()
            }
        );
        console.log('Wiadomość dodana');
    }

    getChats(callback){
        this.podglad = onSnapshot(this.query, (snapshoot) => {
            snapshoot.docChanges().forEach( (ee) => {
                callback(ee)
            });
        });   
    }

    updateName(newName = `${this.username}`){
        newName = newName[0].toUpperCase() + newName.slice(1);
        this.username = newName;
        this.currName.innerHTML = `Curretly logged as: ${this.username}`
    }

    updateRoom(newRoom){

        if(this.room === newRoom){
            console.log(this.room, 'stary room')
        }else{
            if(this.podglad){
                this.podglad();
            };
            this.room = newRoom;
            this.query = query(colRef, where('room', '==', this.room), orderBy('created_at'));
            console.log(this.room, 'nowy room');
        };
    }

 };

 const chatroom = new Chatroom('Anon', 'general');
 chatroom.updateName();

/////////// Klasa formatki HTML'A do wyświetlania nowych i starych wiadomości


class ChatFormatka{
    constructor(){
    }

    render(lista, list){
        const xd = list.created_at.toDate();
        const when = formatDistance(
            xd,
            new Date(),
            { addSuffix: true }
            );

        const ee = `
        <li class="list-group-item">
            <span class="user">${list.user}:</span>
            <span>${list.msg}</span>
            <div class="time">${when}</div>
        </li>`;
        lista.innerHTML += ee;
    }

}

const chatFormatka = new ChatFormatka();

//////////////// APP GENERAL CHANNEL ////////////////

// Wysyłanie wiadomości do firestore
const sendMessage = document.querySelector('.new-chat');

sendMessage.addEventListener('submit', (e) => {
    e.preventDefault();
    const wiadomosc = sendMessage.message.value.trim();
    chatroom.addChats(wiadomosc);
    e.target.reset();
});

// wysyłanie nowego imienia do firestore
const sendNewName = document.querySelector('.new-name');

sendNewName.addEventListener('submit', (e) => {
    e.preventDefault();
    const noweImie = sendNewName.name.value.trim();
    chatroom.updateName(noweImie);
    e.target.reset();
});


// wybór pokoju i update podglądu czatu
const sendRoom = document.querySelector('.chat-rooms');
const dostep = document.querySelector('.chat-list');

sendRoom.addEventListener('click', (e) => {
    e.preventDefault();
    dostep.innerHTML = '';
    const nowyPokoj = e.target.id;

    chatroom.updateRoom(`${nowyPokoj}`);
    chatroom.getChats( data => {

            const xx = data.doc.data();
            if(xx.created_at){
            chatFormatka.render(dostep, xx);
            }
    });

    dostep.scroll(0, -200);

});
