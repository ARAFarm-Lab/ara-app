import network from "@/utils/network";
import { GetSensorReportRequest, SensorReport } from "./report.types";

const getSensorReport = (request: GetSensorReportRequest): Promise<SensorReport> => network.post(`/chart`, JSON.stringify(request))

export default {
    getSensorReport,

    QUERY_GET_SENSOR_REPORT: "getSensorReport"
}