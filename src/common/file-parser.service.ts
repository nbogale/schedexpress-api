import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';

export interface ParsedStudentData {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  level: number;
  graduationYear?: number;
}

export interface ParseResult {
  data: ParsedStudentData[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

@Injectable()
export class FileParserService {
  
  /**
   * Parse CSV file content
   */
  parseCSV(fileContent: string): ParseResult {
    const result: ParseResult = {
      data: [],
      errors: [],
      totalRows: 0,
      validRows: 0,
    };

    try {
      const parsed = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim().toLowerCase(),
      });

      result.totalRows = parsed.data.length;

      parsed.data.forEach((row: any, index: number) => {
        const rowNumber = index + 2; // +2 because of 0-based index and header row
        
        try {
          const parsedRow = this.validateAndTransformRow(row, rowNumber);
          if (parsedRow) {
            result.data.push(parsedRow);
            result.validRows++;
          }
        } catch (error) {
          result.errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      });

    } catch (error) {
      throw new BadRequestException('Invalid CSV file format');
    }

    return result;
  }

  /**
   * Parse Excel file content
   */
  parseExcel(fileBuffer: Buffer): ParseResult {
    const result: ParseResult = {
      data: [],
      errors: [],
      totalRows: 0,
      validRows: 0,
    };

    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON with headers
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new BadRequestException('Excel file must have at least a header row and one data row');
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1);

      result.totalRows = dataRows.length;

      dataRows.forEach((row: any[], index: number) => {
        const rowNumber = index + 2; // +2 because of 0-based index and header row
        
        try {
          // Convert row array to object using headers
          const rowObject: any = {};
          headers.forEach((header, colIndex) => {
            if (header) {
              rowObject[header.trim().toLowerCase()] = row[colIndex] || '';
            }
          });

          const parsedRow = this.validateAndTransformRow(rowObject, rowNumber);
          if (parsedRow) {
            result.data.push(parsedRow);
            result.validRows++;
          }
        } catch (error) {
          result.errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      });

    } catch (error) {
      throw new BadRequestException('Invalid Excel file format');
    }

    return result;
  }

  /**
   * Validate and transform a single row
   */
  private validateAndTransformRow(row: any, rowNumber: number): ParsedStudentData | null {
    const requiredFields = ['firstname', 'lastname', 'email', 'studentid', 'level'];
    
    // Check for required fields
    for (const field of requiredFields) {
      if (!row[field] || row[field].toString().trim() === '') {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email.trim())) {
      throw new Error('Invalid email format');
    }

    // Transform and validate data
    const parsedRow: ParsedStudentData = {
      firstName: row.firstname.toString().trim(),
      lastName: row.lastname.toString().trim(),
      email: row.email.toString().trim().toLowerCase(),
      studentId: row.studentid.toString().trim(),
      level: parseInt(row.level.toString()),
    };

    // Validate level is a valid number
    const level = parseInt(row.level.toString());
    if (isNaN(level) || level < 1 || level > 12) {
      throw new Error('Invalid level (must be between 1-12)');
    }
    parsedRow.level = level;

    // Handle optional fields
    if (row.graduationyear) {
      const graduationYear = parseInt(row.graduationyear.toString());
      if (isNaN(graduationYear) || graduationYear < 2000 || graduationYear > 2100) {
        throw new Error('Invalid graduation year (must be between 2000-2100)');
      }
      parsedRow.graduationYear = graduationYear;
    }

    return parsedRow;
  }

  /**
   * Generate sample CSV template
   */
  generateCSVTemplate(): string {
    const headers = [
      'FirstName',
      'LastName', 
      'Email',
      'StudentID',
      'Level',
      'GraduationYear'
    ];

    const sampleData = [
      'John',
      'Doe',
      'john.doe@school.edu',
      'S100001',
      '9',
      '2028'
    ];

    return Papa.unparse([headers, sampleData]);
  }

  /**
   * Generate sample Excel template
   */
  generateExcelTemplate(): Buffer {
    const headers = [
      'FirstName',
      'LastName', 
      'Email',
      'StudentID',
      'Level',
      'GraduationYear'
    ];

    const sampleData = [
      'John',
      'Doe',
      'john.doe@school.edu',
      'S100001',
      '9',
      '2028'
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
