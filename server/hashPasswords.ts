import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';

const USERS_FILE = path.join(__dirname, 'users.json');

async function hashPasswords() {
  const users = JSON.parse(await fs.readFile(USERS_FILE, 'utf-8'));

  const updatedUsers = await Promise.all(
    users.map(async (user: { username: string; password: string }) => {
      if (!user.password.startsWith('$2b$')) { // Skip if already hashed
        user.password = await bcrypt.hash(user.password, 10);
      }
      return user;
    })
  );

  await fs.writeFile(USERS_FILE, JSON.stringify(updatedUsers, null, 2));
  console.log('User passwords have been hashed and updated.');
}

hashPasswords().catch(console.error);
