import { ActionIcon, ActionSource, ActionType, ActionValue } from "@/constants/action"

export type Action = {
    id: number,
    type: ActionType,
    name: string
    icon: ActionIcon
}

export type DispatchActionRequest = {
    actuator_id: number
    device_id: number
    value: ActionValue
}

export type LastActionResponse = {
    value: ActionValue
    action_at: string
}

export type ActionHistory = {
    value: ActionValue
    action_by: ActionSource
    action_at: string,
    action: Action
}