import { ActionSource, ActionType, ActionValue } from "@/constants/action"

export type DispatchActionRequest = {
    action_type: ActionType
    device_id: number
    value: ActionValue
}

export type LastActionResponse = {
    value: ActionValue
    action_at: string
}

export type ActionHistory = {
    action_type: ActionType
    value: ActionValue
    action_by: ActionSource
    action_at: string
}