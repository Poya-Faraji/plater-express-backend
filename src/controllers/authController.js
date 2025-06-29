import prisma from '../../prismaClient.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwtHandler.js';

// User registration
export const register = async (req, res) => {
  try {
    const { username, password, fname, lname, codeMeli, userType } = req.body;

    // Validate required fields
    if (!username || !password || !fname || !lname || !codeMeli || !userType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { codeMeli }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Username or national ID(code meli) already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash,
        fname,
        lname,
        codeMeli,
        userType
      }
    });

    // Generate JWT
    const token = generateToken(newUser.id);

    // Return response without password hash
    const { passwordHash: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ user: userWithoutPassword, token });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// User login
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = generateToken(user.id);

    // Return response without password hash
    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};