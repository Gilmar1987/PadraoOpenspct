const Database = require('better-sqlite3');

test('banco em memória', () => {
  const db = new Database(':memory:');
  expect(db).toBeTruthy();
});
