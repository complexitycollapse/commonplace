import EdlBuilder from "./Builders/edl-builder";
import FlightBuilder from "./Builders/flight-builder";
import LinkBuilder from "./Builders/link-builder";

export default function CreateInterface(interpreter) {
  return {
    edl: () => {
      const builder = EdlBuilder(0);
      interpreter.builders.push(builder);
      return builder;
    },

    flight: () => {
      const builder = FlightBuilder();
      interpreter.builders.push(builder);
      return builder;
    },
    link: () => {
      const builder = LinkBuilder();
      interpreter.builders.push(builder);
      return builder;
    }
  };
}
