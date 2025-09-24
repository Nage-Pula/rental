const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter plain password: ', pwd => {
  const hash = bcrypt.hashSync(pwd, 10);
  console.log('Hash for "' + pwd + '":\n' + hash);
  rl.close();
});

// node make_hash.js --> To run this code we'll generate a hash key and we can paste it in wherever hash key is there