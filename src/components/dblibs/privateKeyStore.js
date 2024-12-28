import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useKeyStore = create(
  persist(
    (set, get) => ({
        id: null,
        keys: null,
        roomKeys: {},

        setRoomKey: (roomId, key) => set(state=>({
          ...state,
          roomKeys: {...state.roomKeys, [roomId]: key}
        })),
        setKey: (id, key) => set(state=>({...state, id, keys: key })),
        resetKey: () => set({id: null, keys: null, roomKeys: {}})
    }),
    {
        name: 'key-persist',
        storage: createJSONStorage(() => sessionStorage),
    },
  ),
)