export type AuthRequest = {
    email: string
    password: string
    name: string
}

export type AuthResponse = {
    token: string
}