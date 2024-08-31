import EdlModel from "./edl-model";
import FlightModel from "./flight-model";

export default function CreateInterface(interpreter) {
  return {
    edl: () => {
      const model = EdlModel(0);
      interpreter.models.push(model);
      return model;
    },

    flight: () => {
      const model = FlightModel(0);
      interpreter.models.push(model);
      return model;
    }
  };
}
