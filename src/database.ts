// 3rd party dependencies
import { QuickDB } from 'quick.db';
import path from 'path';

// local dependencies
import config from './config.json';

/**
 * The database instance
 * */
export const db = new QuickDB({ filePath: path.join(__dirname, config.database.path) });