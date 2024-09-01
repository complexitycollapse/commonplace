import EdlModel from "./Models/edl-model";
import FlightModel from "./Models/flight-model";

export default function CreateInterface(interpreter) {
  return {
    edl: () => {
      const model = EdlModel(0);
      interpreter.models.push(model);
      return model;
    },

    flight: () => {
      const model = FlightModel();
      interpreter.models.push(model);
      return model;
    }
  };
}
