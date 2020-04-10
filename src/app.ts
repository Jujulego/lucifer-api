import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import api from 'routes/api';
import { LoggerStream, LogLevel } from './services/logger.service';

// Application
const app = express();

// Options
app.set('trust poxy', true);

// Middlewares
app.use(morgan('dev', { stream: new LoggerStream(LogLevel.INFO) }));
app.use(helmet());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/api', api);

export default app;
