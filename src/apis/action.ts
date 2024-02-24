import network from "@/utils/network";
import {
    DispatchActionRequest,
    LastActionResponse
} from './action.types'
import { ActionType } from '@/constants/action'

const dispatchAction = (request: DispatchActionRequest) => network.post("/board/dispatch", JSON.stringify(request))
const getLastAction = (device_id: number, action_type: ActionType): Promise<LastActionResponse> => network.get(`/last-action?device_id=${device_id}&action_type=${action_type}`)

export default {
    dispatchAction,
    getLastAction
}