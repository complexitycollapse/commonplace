import { addProperties, finalObject} from '@commonplace/utils';

export default function Interpreter() {
  let obj = {};

  return finalObject(obj, {
    select: model => {},
    create: () => {},
    load: pointer => {}
  });
}
