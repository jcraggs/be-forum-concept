exports.formatDates = list => {
  if (list.length === 0) return [];
  return list.map(item => {
    const itemCopy = { ...item };
    let dateObj = new Date(itemCopy.created_at);
    itemCopy.created_at = dateObj;
    return itemCopy;
  });
};

exports.makeRefObj = list => {
  if (list.length === 0) return {};
  return list.reduce((refObj, item) => {
    refObj[item.title] = item.article_id;
    return refObj;
  }, {});
};

exports.formatComments = (comments, articleRef) => {
  return comments.map(item => {
    const itemCopy = { ...item };
    itemCopy.author = itemCopy.created_by;
    delete itemCopy.created_by;
    itemCopy.article_id = articleRef[itemCopy.belongs_to];
    delete itemCopy.belongs_to;
    return itemCopy;
  });
};
