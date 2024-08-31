import EdlModel from "./edl-model";

export default function CreateInterface(interpreter) {
  return {
    edl: () => {
      const model = EdlModel(0);
      interpreter.models.push(model);
      return model;
    }
  };
}
