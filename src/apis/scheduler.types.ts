import { SchedulerRecurringMode } from "@/constants/scheduler.types"
import { DispatchActionRequest } from "./action.types"

export type CreateSchedulerRequest = {
    name: string
    description: string
    actions: DispatchActionRequest[]
    scheduled_at: string
    recurring_mode: SchedulerRecurringMode
}

export type ScheduledTask = CreateSchedulerRequest & {
    id: number
}