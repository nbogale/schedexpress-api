import { Controller, Get, Param, Put, Body, UseGuards, Post, UseInterceptors, UploadedFile, Res, HttpStatus, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { StudentsService } from './students.service';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateBulkStudentsDto } from './dto/create-bulk-students.dto';
import { FileParserService } from '../common/file-parser.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly fileParserService: FileParserService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({ status: 200, description: 'Return all students' })
  findAll() {
    return this.studentsService.findAll();
  }

  @Get('counselor/:counselorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get students assigned to a counselor' })
  @ApiResponse({ status: 200, description: 'Return students assigned to the counselor' })
  findByCounselor(@Param('counselorId') counselorId: string) {
    return this.studentsService.findByCounselor(counselorId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a student by id' })
  @ApiResponse({ status: 200, description: 'Return the student' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({ status: 200, description: 'The student has been successfully updated' })
  @ApiResponse({ status: 404, description: 'Student not found' })
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Get(':id/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a student\'s schedule' })
  @ApiResponse({ status: 200, description: 'Return the student\'s schedule' })
  @ApiResponse({ status: 404, description: 'Student or schedule not found' })
  getSchedule(@Param('id') id: string) {
    // This is a proxy endpoint that will redirect to the schedules controller
    // We'll implement this redirection in a way that's compatible with the frontend expectations
    return this.studentsService.getStudentSchedule(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new student' })
  @ApiResponse({ status: 201, description: 'The student has been successfully created' })
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple students in bulk' })
  @ApiResponse({ status: 201, description: 'Bulk student creation completed' })
  @ApiResponse({ status: 400, description: 'Invalid data provided' })
  createBulk(@Body() createBulkStudentsDto: CreateBulkStudentsDto) {
    return this.studentsService.createBulk(createBulkStudentsDto);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload CSV/Excel file to create students in bulk' })
  @ApiResponse({ status: 201, description: 'File uploaded and processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or data' })
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    
    let parseResult;
    
    if (fileExtension === 'csv') {
      const fileContent = file.buffer.toString('utf-8');
      parseResult = this.fileParserService.parseCSV(fileContent);
    } else if (['xlsx', 'xls'].includes(fileExtension || '')) {
      parseResult = this.fileParserService.parseExcel(file.buffer);
    } else {
      throw new BadRequestException('Unsupported file format. Please upload CSV or Excel file.');
    }

    if (parseResult.errors.length > 0) {
      return {
        success: false,
        errors: parseResult.errors,
        totalRows: parseResult.totalRows,
        validRows: parseResult.validRows,
      };
    }

    if (parseResult.data.length === 0) {
      throw new BadRequestException('No valid data found in the file');
    }

    // Use the new method that handles level to gradeLevelId conversion
    const result = await this.studentsService.createBulkFromParsedData(parseResult.data);
    
    return {
      success: true,
      ...result,
      fileInfo: {
        originalName: file.originalname,
        size: file.size,
        totalRows: parseResult.totalRows,
        validRows: parseResult.validRows,
      },
    };
  }

  @Get('template/csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download CSV template for bulk student upload' })
  async downloadCSVTemplate(@Res() res: Response) {
    const csvContent = this.fileParserService.generateCSVTemplate();
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students-template.csv"');
    res.status(HttpStatus.OK).send(csvContent);
  }

  @Get('template/excel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.COUNSELOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download Excel template for bulk student upload' })
  async downloadExcelTemplate(@Res() res: Response) {
    const excelBuffer = this.fileParserService.generateExcelTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="students-template.xlsx"');
    res.status(HttpStatus.OK).send(excelBuffer);
  }
}
