import { collection, doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase-config';
import { useUserStore } from './userStore';
import { decryptMessage } from './pubprivKeys';

export const useChatroomStore = create((set, get) => ({
    chatId: null,
    roomInformation: null,

    changeChat: async (chatId) => {
        const chatroomRef = collection(db, 'chatrooms');
        const docRef = doc(chatroomRef, chatId);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists) {
            return set({
                chatId: chatId,
                roomInformation: docSnap.data(),
            })
        }

        return set({
            chatId: null,
            roomInformation: null,
        })
    },

    rawFetch: (roomId, chatContent, aesKey) => {
        let chat = get().roomInformation;
        const runTime = chatContent.messages.length - chat?.length || 0;

        let AESprop = {
            iv: chatContent.iv,
            key: aesKey.key
        };
        
        if (chat === null || get().chatId !== roomId || runTime <= 0)
        {
            for (let i in chatContent.messages)
            {
                let message = chatContent.messages[i];
                if (message.content.type === 'schedule') continue;

                if (message.content.type !== 'quiz') {
                    message.content.cont = decryptMessage(message,
                    AESprop.key,
                    AESprop.iv);
                    
                    continue;
                }
                
                const obj = message.content.cont = decryptMessage(message,
                AESprop.key,
                AESprop.iv);

                message.content.name = obj.name;
                message.content.id = obj.id;
            }

            return set(state=>({...state, roomInformation: chatContent}));
        } else {
            let clone = chat.concat();

            if (runTime > 0) {
                for (let i = chat.length; i < chatContent.messages.length; i++) {
                    let message = chatContent.messages[i];
                    
                    if (message.content.type === 'schedule') {
                        clone.push(message);
                        continue;
                    }

                    if (message.content.type !== 'quiz') {
                        message.content.cont = decryptMessage(message,
                            AESprop.key,
                            AESprop.iv);
                        
                        clone.push(message);
                        continue;
                    }
                    
                    const obj = message.content.cont = decryptMessage(message,
                    AESprop.key,
                    AESprop.iv);

                    message.content.name = obj.name;
                    message.content.id = obj.id;    
                    
                    clone.push(message);
                }

                return set(state=>({...state, roomInformation: {
                    ...chatContent,
                    messages: clone,
                }}));
            }
        }
        return set(state=>({...state, roomInformation: chatContent}));
    },

    reset: () =>{ 
        return set({
            chatId: null,
            roomInformation: null,
        })
    }
}))
