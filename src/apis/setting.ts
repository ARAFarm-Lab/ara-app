import network from "@/utils/network";
import { Actuator } from "./setting.types";

const getActuators = (device_id: number): Promise<Actuator[]> => network.get(`/actuators?device_id=${device_id}`)
const updateActuator = (actuator: Actuator) => network.patch('/actuator', JSON.stringify(actuator))

export default {
    getActuators,
    updateActuator,

    QUERY_KEY_GET_ACTUATORS: "getActuators",
}