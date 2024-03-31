export type NotificationType = 'success' | 'danger'

export type NotificationStore = {
    message: string
    type: NotificationType,
    is_open: boolean,
    fire: (message: string, type?: NotificationType) => void,
    clear: () => void
}