import { SchedulerRecurringMode } from "@/constants/scheduler"
import { DispatchActionRequest } from "./action.types"
import { ScheduleStatus } from "@/constants/action"

export type CreateSchedulerRequest = {
    name: string
    description: string
    duration: number | null
    actions: DispatchActionRequest[],
    scheduled_at: string
    recurring_mode: SchedulerRecurringMode,
}

export type ScheduledTask = CreateSchedulerRequest & {
    id: number
    last_run_status: ScheduleStatus,
    last_run_at: string,
    next_run_at: string
}