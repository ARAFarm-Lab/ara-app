import { create } from "zustand";
import { TabState } from "./tab.types";

const useTabStore = create<TabState>()(
    (set) => ({
        tab: 1,
        setTab: (tab: number) => set({ tab })
    })
)

export default useTabStore