import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand'
import { db } from './firebase-config';

const defaultState = {previewUser:null, isLoading: false, curUserProf: null, curUserMore: null};

export const usePreviewStore = create((set) => ({
  previewUser: null,
  isLoading: true,
  curUserProf: null,
  curUserMore: {},

  fetchPrUserInfo: async (uid) => {
    if (!uid) return set(defaultState);

    try{
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists())
            {
              set(state => ({...state, previewUser: docSnap.data(),
                isLoading: false}));
            }
        else
            set(defaultState);
    } catch {
        set(defaultState);
    }
  },

  resetUserInfoForLoading: () => {
    set({previewUser:null, isLoading: true, curUserProf: null, curUserMore: null});
  },

  resetUserInfo: () => {
    set(defaultState);
  },

  fetchProfile: async (uid) => {
    if (!uid) return set(state=>({...state, curUserProf: null}));

    try{
        const docRef = doc(db, "profile", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists())
            set(state=>({...state, curUserProf: docSnap.data().profileText}));
        else
            set(state=>({...state, curUserProf: null}))
    } catch {
        set(state=>({...state, curUserProf: null}))
    }
  },

  fetchProfileSubstitute: async (uid, type, defVal) => {
    if (!uid) return set(state=>({...state}));

    try{
        const docRef = doc(db, type, uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists())
            set(state=>{
              let test = {
                ...state,
                curUserMore: {
                  ...state.curUserMore,
                  }
              }

              test['curUserMore'][type] = docSnap.data();

              return test;
            });
        else
            set(state=>({...state}));
    } catch {
      set(state=>({...state}));
    }
  },

  resetProfile: async () => {
    set(state=>({...state, curUserProf:null}));
  },
}))
