import { create } from 'zustand';

import { NotificationStore, NotificationType } from './notification.types';

const useNotification = create<NotificationStore>()(
    (set) => ({
        message: "",
        type: "success",
        fire: (message: string, type: NotificationType = 'success') => {
            set(() => ({ message, type, is_open: true }))
        },
        is_open: false,
        clear: () => {
            set(() => ({ message: "", is_open: false }))
        }
    })
)

export default useNotification