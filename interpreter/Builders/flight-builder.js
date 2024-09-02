import { addMethods, addProperties } from "@commonplace/utils";
import LinkBuilder from "./link-builder";

export default function FlightBuilder() {
  const obj = LinkBuilder();
  addProperties(obj, {
    isFlight: true
  });

  addMethods(obj, {
    addEdl: edlBuilder => {
      const end = obj.appendEnd("edl");
      end.setValue(edlBuilder);
    },
    getBuilders: () => obj.ends.filter(end => end.name === "edl" 
      && end.value).map(end => end.value)
  });

  return obj;
}
