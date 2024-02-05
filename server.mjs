import express from "express";
import parsePlatonus from './parser.mjs';
import parsePlan from './planParser.mjs';
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.json());

app.get('/hello', (req, res) => {
  const message = { message: 'Hello' };
  res.json(message);
});

app.post('/parse', async (req, res) => {
  req.timeout = 3 * 60 * 1000;
  try {
    const { username, password } = req.body;
    console.log("Received request with user:", { username, password });

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await parsePlatonus(username, password);
    console.log("Sending response with result:", result);
    res.status(200).json({ result });

  } catch (error) {
    console.error("Error caught:", error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/parse-plan', async (req, res) => {
  req.timeout = 3 * 60 * 1000;
  try {
    const { username, password } = req.body;
    console.log("Received request with user:", { username, password });

    if(!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = await parsePlan(username, password);
    console.log("Sending response with result:", result);
    res.status(200).json({ result });
  } catch(error) {
    console.error("Error caught:", error.stack);
    res.status(500).json({ error: 'Iternal server error' });
  }
}); 

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
