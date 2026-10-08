import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import config from '../config/env.js';
import fs from 'fs';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const createStorage = (subDir) => {
  const uploadPath = path.join(config.uploadDir, subDir);
  ensureDir(uploadPath);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${randomUUID()}${ext}`);
    }
  });
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-rar-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

export const uploadDocument = multer({
  storage: createStorage('documents'),
  limits: { fileSize: config.maxFileSize },
  fileFilter
}).single('file');

export const uploadMaterial = multer({
  storage: createStorage('materials'),
  limits: { fileSize: config.maxFileSize },
  fileFilter
}).single('file');

export const uploadPhoto = multer({
  storage: createStorage('photos'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB for photos
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed for profile photos'), false);
  }
}).single('photo');
