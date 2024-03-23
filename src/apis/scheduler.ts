import network from "@/utils/network";
import { CreateSchedulerRequest, ScheduledTask } from "./scheduler.types";

const createSchedule = (request: CreateSchedulerRequest) => network.post("/schedule", JSON.stringify(request))
const deleteSchedule = (id: number) => network.delete(`/schedule?id=${id}`)
const getUpcomingSchedules = (): Promise<ScheduledTask[]> => network.get("/schedules")
const updateSchedule = (schedule: ScheduledTask) => network.patch("/schedule", JSON.stringify(schedule))

export default {
    createSchedule,
    deleteSchedule,
    getUpcomingSchedules,
    updateSchedule,

    QUERY_KEY_GET_UPCOMING_SCHEDULES: 'getUpcomingSchedules'
}