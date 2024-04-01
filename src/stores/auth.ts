import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AuthStore } from './auh.types';

const useAuthStore = create<AuthStore>()(
    persist(
        set => ({
            accessToken: "",
            setAuth: token => set(() => ({ accessToken: token })),
            clearAuth: () => set(() => ({ accessToken: "" }))
        }),
        {
            name: "_ARA_auth",
            storage: createJSONStorage(() => localStorage)
        }
    )
)

export default useAuthStore