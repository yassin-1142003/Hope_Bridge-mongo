import { IsString, IsNumber, IsEnum, IsArray, IsOptional, IsDate, IsBoolean, IsUrl, Min, Max, Matches, IsEmail, ValidateNested, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProjectStatus, ProjectCategory } from '../../../db/schemas/enhanced-project.schema';

export class CreateProjectDto {
  @ApiProperty({ description: 'Banner photo URL' })
  @IsUrl()
  bannerPhotoUrl!: string;

  @ApiPropertyOptional({ description: 'Image gallery URLs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  imageGallery?: string[];

  @ApiPropertyOptional({ description: 'Video gallery URLs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  videoGallery?: string[];

  @ApiProperty({ description: 'Project content in multiple languages' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectContentDto)
  contents!: ProjectContentDto[];

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.DRAFT })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiProperty({ enum: ProjectCategory })
  @IsEnum(ProjectCategory)
  category!: ProjectCategory;

  @ApiProperty({ description: 'Unique project slug' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' })
  slug!: string;

  @ApiProperty({ description: 'Target amount in USD' })
  @IsNumber()
  @Min(1)
  targetAmount!: number;

  @ApiPropertyOptional({ enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR'], default: 'USD' })
  @IsEnum(['USD', 'EUR', 'GBP', 'AED', 'SAR'])
  @IsOptional()
  currency?: string;

  @ApiProperty({ description: 'Project start date' })
  @IsDate()
  @Type(() => Date)
  startDate!: Date;

  @ApiProperty({ description: 'Project end date' })
  @IsDate()
  @Type(() => Date)
  endDate!: Date;

  @ApiProperty({ description: 'Project location' })
  @IsString()
  location!: string;

  @ApiProperty({ description: 'Project city' })
  @IsString()
  city!: string;

  @ApiProperty({ description: 'Project country' })
  @IsString()
  country!: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Project manager ID' })
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: 'Invalid project manager ID format' })
  @IsOptional()
  projectManager?: string;

  @ApiPropertyOptional({ description: 'Team member IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @Matches(/^[0-9a-fA-F]{24}$/, { each: true, message: 'Invalid team member ID format' })
  @IsOptional()
  teamMembers?: string[];

  @ApiPropertyOptional({ description: 'Priority level', enum: ['low', 'medium', 'high', 'urgent'] })
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @ApiPropertyOptional({ description: 'Whether project is featured', default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ description: 'Whether project is visible', default: true })
  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Project tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Required skills', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  skills?: string[];

  @ApiPropertyOptional({ description: 'External links', type: [String] })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  externalLinks?: string[];

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional({ description: 'Social media URL' })
  @IsUrl()
  @IsOptional()
  socialMediaUrl?: string;

  @ApiPropertyOptional({ description: 'Contact email' })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsString()
  @Matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, { message: 'Invalid phone number format' })
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional({ description: 'Documents URLs', type: [String] })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  documents?: string[];
}

export class ProjectContentDto {
  @ApiProperty({ description: 'Language code (e.g., en, ar, fr)' })
  @IsString()
  @Matches(/^[a-z]{2}$/, { message: 'Language code must be 2 lowercase letters' })
  language_code!: string;

  @ApiProperty({ description: 'Project title' })
  @IsString()
  @MinLength(10)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Project description' })
  @IsString()
  @MinLength(20)
  @MaxLength(500)
  description!: string;

  @ApiProperty({ description: 'Project content' })
  @IsString()
  @MinLength(50)
  content!: string;

  @ApiPropertyOptional({ description: 'Content images', type: [String] })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  images?: string[];

  @ApiPropertyOptional({ description: 'Content videos', type: [String] })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  videos?: string[];

  @ApiPropertyOptional({ description: 'Content documents', type: [String] })
  @IsArray()
  @IsUrl({}, { each: true })
  @IsOptional()
  documents?: string[];

  @ApiPropertyOptional({ description: 'Content tags', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Meta description for SEO' })
  @IsString()
  @MaxLength(160)
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Meta keywords for SEO' })
  @IsString()
  @IsOptional()
  metaKeywords?: string;
}
