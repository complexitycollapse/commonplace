import { addMethods, addProperties } from "@commonplace/utils";
import LinkModel from "./link-model";

export default function FlightModel() {
  const obj = LinkModel();
  addProperties(obj, {
    isFlight: true
  });

  addMethods(obj, {
    addEdl: edlModel => {
      const end = obj.appendEnd("edl");
      end.setValue(edlModel);
    },
    getModels: () => obj.ends.filter(end => end.name === "edl" 
      && end.value).map(end => end.value)
  });

  return obj;
}
