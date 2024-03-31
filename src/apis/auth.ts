import network from "@/utils/network";
import { AuthRequest, AuthResponse } from "./auth.types";
import { UserInfo } from "@/stores/auh.types";

const getUserInfo = async (): Promise<UserInfo> => network.get('/users/info')
const loginUser = async (request: AuthRequest): Promise<AuthResponse> => network.post('/users/auth', JSON.stringify(request))
const registerUser = async (request: AuthRequest): Promise<AuthResponse> => network.post('/users', JSON.stringify(request))

export default {
    getUserInfo,
    loginUser,
    registerUser,

    QUERY_KEY_GET_USER_INFO: "getUserInfo"
}