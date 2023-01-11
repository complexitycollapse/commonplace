export function RecordLinkParser(link, fields) {
  let currentRecord = undefined, records = [], fieldIndex = -1;
  link.ends.forEach(end => {
    let index = fields.indexOf(end.name);
    if (index >= 0) {
      if (index > fieldIndex) {
        if (currentRecord === undefined) { currentRecord = {}; }
        currentRecord[end.name] = end.pointers;
      } else {
        records.push(currentRecord);
        currentRecord = {};
        currentRecord[end.name = end.pointers];
      }
      fieldIndex = index;
    }
  });

  if (currentRecord !== undefined) { records.push(currentRecord); }
  return records;
}
