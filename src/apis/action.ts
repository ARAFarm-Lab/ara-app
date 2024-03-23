import network from "@/utils/network";
import {
    Action,
    ActionHistory,
    DispatchActionRequest,
    LastActionResponse
} from './action.types'

const dispatchAction = (request: DispatchActionRequest) => network.post("/action/dispatch", JSON.stringify(request))
const getActions = (device_id: number): Promise<Action[]> => network.get(`/action/available?device_id=${device_id}`)
const getActionHistories = (device_id: number): Promise<ActionHistory[]> => network.get(`/action/history?device_id=${device_id}`)
const getActionValue = (device_id: number, actuator_id: number): Promise<LastActionResponse> => network.get(`/action/last?device_id=${device_id}&actuator_id=${actuator_id}`)

export default {
    dispatchAction,
    getActions,
    getActionHistories,
    getActionValue,

    QUERY_KEY_GET_ACTIONS: "getActions",
    QUERY_KEY_GET_ACTION_VALUE: "getActionValue",
    QUERY_KEY_GET_ACTION_HISTORIES: "getActionHistories"
}