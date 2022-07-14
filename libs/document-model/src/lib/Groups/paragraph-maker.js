import { finalObject } from "../utils";

export function BlockMaker(zettel) {

  function blocks() {
    let blocks = [];
    let currentBlock = [];

    function breakBlock() {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
    }

    function beginsBlock(attributes) {
      return attributes.get("break") || !inline(attributes);
    }

    function inline(attributes) {
      return attributes.get("layout mode") === "inline";
    }

    function processList(list) {
      list.forEach(z => {
        let attributes = z.attributes().values();

        if (beginsBlock(attributes)) { breakBlock(); }

        if (z.edl) {
          processList(z.children);
          if (!inline(attributes)) { breakBlock(); }
        }
        else if (inline(attributes)) { currentBlock.push(z); }
        else { blocks.push(z); }
      });
    }

    processList(zettel);
    return blocks;
  }

  return finalObject({}, { blocks });
}
