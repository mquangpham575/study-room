import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase-config';

const defaultState = {previewUser:null, isLoading: false, curUserProf: null};

export const usePreviewStore = create((set) => ({
  previewUser: null,
  isLoading: true,
  curUserProf: null,

  fetchPrUserInfo: async (uid) => {
    if (!uid) return set({previewUser:null, isLoading: false, curUserProf: null});

    try{
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists())
            {
              set(state => ({...state, previewUser: docSnap.data(),
                isLoading: false}));
            }
        else
            set({previewUser:null, isLoading: false, curUserProf: null});
    } catch {
        set({previewUser:null, isLoading: false, curUserProf: null});
    }
  },

  resetUserInfoForLoading: () => {
    set({previewUser:null, isLoading: true, curUserProf: null});
  },

  resetUserInfo: () => {
    set(defaultState);
  },

  fetchProfile: async (uid) => {
    if (!uid) return set(defaultState);

    try{
        const docRef = doc(db, "profile", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists())
            set(state=>({...state, curUserProf: docSnap.data().profileText}));
        else
            set(defaultState)
    } catch {
        set(defaultState)
    }
  },

  resetProfile: async () => {
    set(state=>({...state, curUserProf:null}));
  },
}))
