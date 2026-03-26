/** Shape of file from multer (memory storage) when no @types/multer is present */
export interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}
