import network from "@/utils/network";
import {
    ActionHistory,
    DispatchActionRequest,
    LastActionResponse
} from './action.types'
import { ActionType } from '@/constants/action'

const dispatchAction = (request: DispatchActionRequest) => network.post("/action/dispatch", JSON.stringify(request))
const getActionHistories = (device_id: number): Promise<ActionHistory[]> => network.get(`/action/history?device_id=${device_id}`)
const getLastAction = (device_id: number, action_type: ActionType): Promise<LastActionResponse> => network.get(`/action/last?device_id=${device_id}&action_type=${action_type}`)

export default {
    dispatchAction,
    getActionHistories,
    getLastAction
}