import { ActionType, ActionValue } from "@/constants/action.types"

export type DispatchActionRequest = {
    action_type: ActionType
    device_id: number
    value: ActionValue
}

export type LastActionResponse = {
    value: ActionValue
    action_at: string
}