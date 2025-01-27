import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';

interface UserData {
  users: Array<{
    username: string;
    password: string;
  }>;
}

async function createUser(username: string, password: string) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const usersFile = path.join(__dirname, 'users.json');
    
    console.log('Creating user with file:', usersFile);
    
    let userData: UserData = {
      users: []
    };
    
    try {
      const data = await fs.readFile(usersFile, 'utf-8');
      console.log('Existing users file found:', data);
      userData = JSON.parse(data);
      
      // Ensure users array exists
      if (!userData.users) {
        userData.users = [];
      }
    } catch (error) {
      console.log('No existing users file, creating new one');
    }
    
    console.log('Current userData:', userData);
    
    userData.users.push({
      username,
      password: hashedPassword
    });
    
    await fs.writeFile(usersFile, JSON.stringify(userData, null, 2));
    console.log(`User ${username} created successfully`);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

// Create test user
createUser('testuser', 'password123');