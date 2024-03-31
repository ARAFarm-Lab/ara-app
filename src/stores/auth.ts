import { create } from "zustand";
import { AuthStore } from "./auh.types";
import { createJSONStorage, persist } from "zustand/middleware";

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