import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase-config';
import { useUserStore } from './userStore';

export const useIndChatStore = create((set) => ({
    chatId: null,
    receiver: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,

    changeChat: (chatId, receiver) => {
        const currentUser = useUserStore.getState().currentUser;

        if (receiver.blocked.includes(currentUser.id)) {
            return set({
                chatId,
                receiver: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            })
        }

        if (currentUser.blocked.includes(receiver.id)) {
            return set({
                chatId,
                receiver: null,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            })
        }

        return set({
            chatId,
            receiver: receiver,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
        })
    },

    changeBlock: () => {
        set(state=>({...state, isReceiverBlocked: !state.isReceiverBlocked}))
    },

    reset: () =>{ 
        return set({
            chatId: null,
            receiver: null,
            isCurrentUserBlocked: false,
            isReceiverBlocked: false,
        })
    }
}))
