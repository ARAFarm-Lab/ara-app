import network from "@/utils/network";
import { CreateSchedulerRequest, ScheduledTask } from "./scheduler.types";

const createSchedule = (request: CreateSchedulerRequest) => network.post("/schedule", JSON.stringify(request))
const getUpcomingSchedules = (): Promise<ScheduledTask[]> => network.get("/schedules")

export default {
    createSchedule,
    getUpcomingSchedules
}