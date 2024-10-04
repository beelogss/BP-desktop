import express from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcrypt'
const app = express();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });


import connection from './dbconfig.js'

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true // Allow cookies and credentials
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set security headers (optional, for Content Security Policy)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data:; connect-src *"
  );
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (if needed)
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
import auth from './routes/auth.js'; // Your auth routes
app.use('/auth', auth);

app.get('/page', (req, res) => {
  res.render('page.ejs');
});

// DITO KANA GAWA NG MGA ROUTES app.post pag server related, pero pag may ilalagay kang display page, app.get

// parang ganto, ganyan pag magdidispaly ka ng page
app.get('/jayR', (req, res) => {
  res.render("jayR.ejs")
})

app.post('/addreward', upload.single('image'), (req, res) => {
  const reward_name = req.body.reward_name;
  const stock = req.body.stock;
  const image_url = req.file ? `/uploads/${req.file.filename}` : '';

  const query = 'INSERT INTO rewards (reward_name, stock, image_url) VALUES (?, ?, ?)';
  connection.query(query, [reward_name, stock, image_url], (err, result) => {
    if (err) {
      console.error('Error adding reward:', err);
      return res.status(500).json({ message: 'An error occurred while adding the reward' });
    }
    res.json({ message: 'Reward added successfully!' });
  });
});

// Endpoint to get all rewards
app.get('/getRewards', (req, res) => {
  const query = 'SELECT id, reward_name, stock, image_url FROM rewards';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching rewards:', err);
      return res.status(500).json({ message: 'Error fetching rewards' });
    }
    res.json(results);
  });
});

app.put('/editReward/:id', (req, res) => {
  const { id } = req.params;
  const { name, stock, image } = req.body;
  const query = 'UPDATE rewards SET name = ?, stock = ?, image = ? WHERE reward_id = ?';
  connection.query(query, [name, stock, image, id], (err, results) => {
      if (err) return res.status(500).send(err);
      res.json({ message: 'Reward updated successfully' });
  });
});

app.delete('/deleteReward/:id', (req, res) => {
  const userId = req.params.id;
  const query = `DELETE FROM rewards WHERE id = ?`;

  connection.query(query, [Id], (err, result) => {
    if (err) {
      console.error('Error deleting reward:', err);
      return res.status(500).json({ message: 'An error occurred while deleting the reward' });
    }
    res.status(200).json({ success: true, message: 'Reward deleted successfully' });
  });
});


// Serve uploaded images
app.use('/uploads', express.static('uploads'));

app.get('/getUsers', (req, res) => {
  const query = `SELECT id, student_number, name, email, collected_points FROM manageusers ORDER BY id DESC`;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'An error occurred while fetching users' });
    }
    res.status(200).json(results);
  });
});

app.delete('/deleteUser/:id', (req, res) => {
  const userId = req.params.id;
  const query = `DELETE FROM manageusers WHERE id = ?`;

  connection.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ message: 'An error occurred while deleting the user' });
    }
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  });
});

app.post('/editUser/:id', (req, res) => {
  const userId = req.params.id;
  const { studentNumber, name, email, collectedPoints } = req.body;

  const query = `UPDATE manageusers SET student_number = ?, name = ?, email = ?, collected_points = ? WHERE id = ?`;

  connection.query(query, [studentNumber, name, email, collectedPoints, userId], (err, result) => {
    if (err) {
      console.error('Error updating user:', err);
      return res.status(500).json({ message: 'An error occurred while updating the user' });
    }
    res.status(200).json({ success: true, message: 'User updated successfully' });
  });
});


app.post('/register', (req, res) => {
  // dito ka mag dedestructure ng request body, galing sa frontend
  const { studentNumber, name, email, password, confirmPassword, collectedPoints } = req.body;

  console.log(studentNumber, name, email, password, confirmPassword, collectedPoints)


  // kung ang password ay match
  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const hashed_password = bcrypt.hashSync(password, 10);

  const query = `INSERT INTO manageusers (student_number, name, email, hashed_password, collected_points) VALUES (?, ?, ?, ?, ?)`;
  connection.query(query, [studentNumber, name, email, hashed_password, collectedPoints], (err, result) => {

    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'An error occurred' });
    }
    console.log('User created successfully');
    res.status(201).json({ message: 'User created successfully' });

  })
})

export default app;
