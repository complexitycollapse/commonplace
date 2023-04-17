import { useState } from 'react';

export default function TreeComponent({ treeData }) {
  return (
    <ul style={{ paddingLeft: "0.3em", marginLeft: "0.3em" }}>
      {treeData.map((node) => (
        <TreeNodeComponent key={node.key} node={node} />
      ))}
    </ul>
  );
}

function TreeNodeComponent({ node }) {
  const { children, label, value } = node;

  const [showChildren, setShowChildren] = useState(node.expanded);

  const handleClick = () => {
    setShowChildren(!showChildren);
  };
  return (
    <li style={{
      color: "rgb(221, 0, 169)",
      paddingLeft: "0.5em",
      listStyleType: showChildren ? "\"-\"" : "\"+\""
    }}>
      <div onClick={handleClick} style={{ marginBottom: "0.2em" }}>
        <span>{ label }</span>
        {value && <span style={{ color: "rgb(0, 116, 232)" }}>{value}</span>}
      </div>
      {showChildren && children && <TreeComponent treeData={children} />}
    </li>
  );
}
