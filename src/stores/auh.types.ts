export type AuthStore = {
    accessToken: string,
    setAuth: (token: string) => void
    clearAuth: () => void
}

export type UserInfo = {
    user_id: number,
    name: string
    role: number
    is_active: boolean
}