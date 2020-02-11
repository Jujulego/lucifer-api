import express from 'express';

import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Application
const app = express();

// Options
app.set('trust poxy', true);

// Middlewares
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

export default app;