import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase-config';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  
  fetchUserInfo: async (uid) => {
    if (!uid) return set({currentUser:null, isLoading: false});

    try{
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists())
            {
              set({currentUser: docSnap.data(), isLoading: false});
            }
        else
            set({currentUser: null, isLoading: false});
    } catch {
        set({currentUser:null, isLoading: false})
    }
  },

  fetchMoreInfo: async (uid, type) => {
    if (!uid) return set(state=>({...state}));

    try{
        const docRef = doc(db, type, uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists())
            set(state=>{
              let test = {
                ...state,
                currentUser: {
                  ...state.currentUser,
                  }
              }

              test['currentUser'][type] = docSnap.data();

              return test;
            });
        else
            set(state=>({...state}));
    } catch {
      set(state=>({...state}));
    }
  },

  rawFetch(inf) {
    set({currentUser: inf, isLoading: false});
  },

  resetUserInfo: async () => {
    set({currentUser:null, isLoading: false});
  },

}))
