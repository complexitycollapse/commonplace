import { addProperties, finalObject} from '@commonplace/utils';
import CreateInterface from './create-interface';

export default function Interpreter() {
  let obj = {
  };

  const createInterface = CreateInterface(obj);

  addProperties(obj, {
    builders: []
  });

  return finalObject(obj, {
    create: () => createInterface,
    load: pointer => {}
  });
}
