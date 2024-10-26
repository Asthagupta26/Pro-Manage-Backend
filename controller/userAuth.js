const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
   if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }
   const existingUser = await User.findOne({ email });
   if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
        existingUser: true,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all the fields' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'User does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
    

    res.status(200).json({
      message: 'Login successfull',
      token,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

const updateUserName = async (req, res, next) => {

  try {
    const email = req.query.email || '';
    const name = req.query.name || '';

    if (!email || !name) {
      return res.status(400).json({
        message: 'Bad Request',
      });
    }

    const userDetails = await User.findOne({
      email,
    });

    if (!userDetails) {
      return res.status(400).json({
        message: 'Bad request',
      });
    }

    await User.updateOne(
      { email: email },
  
      {
        $set: {   
          name: name,
          email: userDetails?.email,
          password: userDetails?.password,
        
        },
      }
    );

    res.json({ message: 'Username updated successfully' });
  } catch (error) {
    next(error);
  }
};

const updateUserDetails = async (req, res, next) => {
  try {
    const email = req.query.email || '';
    const userData = req.body;


    if (!email) {
      return res.status(400).json({
        message: 'Bad Request',
      });
    }

    const userDetails = await User.findOne({
      email,
    });

    if (!userDetails) {
      return res.status(400).json({
        message: 'Bad request',
      });
    }

    if (
      userData?.oldPassword.length === 0 &&
      userData?.newPassword.length === 0
    ) {
      await User.updateOne(
        { email: email },
        {
          $set: {
            name: userData?.name,
            email: userData?.email,
            password: userDetails?.password,    
          },
        }
      );
      res.json({ message: 'Email updated successfully', updated: true });
    }

    const passwordMatch = await bcrypt.compare(
      userData?.oldPassword,
      userDetails?.password
    );

    if (!passwordMatch) {
      
      return res.status(401).json({ message: 'Password did not match', passwordMatch: false });
    } else {
      const hashedPassword = await bcrypt.hash(userData?.newPassword, 10); 

      await User.updateOne(
        { email: email },
        {
          $set: {
            name: userData?.name,
            email: userData?.email,
            password: hashedPassword,
          },
        }
      );

      res.json({ message: 'User details updated successfully', updated: true });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, updateUserName, updateUserDetails };
