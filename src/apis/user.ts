import { UserInfo } from '@/stores/auh.types';
import network from '@/utils/network';

import { AuthRequest, AuthResponse } from './user.types';

const getUserInfo = async (): Promise<UserInfo> => network.get('/users/info')
const getUserList = async (): Promise<UserInfo[]> => network.get('/users')
const loginUser = async (request: AuthRequest): Promise<AuthResponse> => network.post('/users/auth', JSON.stringify(request))
const registerUser = async (request: AuthRequest): Promise<AuthResponse> => network.post('/users', JSON.stringify(request))
const updateUser = async (request: UserInfo) => network.put("/users", JSON.stringify(request))

export default {
    getUserInfo,
    getUserList,
    loginUser,
    registerUser,
    updateUser,

    QUERY_KEY_GET_USER_INFO: "getUserInfo",
    QUERY_KEY_GET_USER_LIST: "getUserList"
}