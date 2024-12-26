const db = require('../startup/database'); 
exports.getAllNewsData = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM content';
    db.query(sql, (err, results) => {
      if (err) {
        reject('Error executing query: ' + err);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getNewsByIdData = (newsId) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM content WHERE id = ?';
      db.query(sql, [newsId], (err, results) => {
        if (err) {
          reject('Error executing query: ' + err);
        } else {
          resolve(results);
        }
      });
    });
  };


