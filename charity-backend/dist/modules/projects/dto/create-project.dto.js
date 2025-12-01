"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectContentDto = exports.CreateProjectDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const enhanced_project_schema_1 = require("../../../db/schemas/enhanced-project.schema");
class CreateProjectDto {
}
exports.CreateProjectDto = CreateProjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Banner photo URL' }),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "bannerPhotoUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Image gallery URLs', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "imageGallery", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Video gallery URLs', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "videoGallery", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project content in multiple languages' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProjectContentDto),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "contents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: enhanced_project_schema_1.ProjectStatus, default: enhanced_project_schema_1.ProjectStatus.DRAFT }),
    (0, class_validator_1.IsEnum)(enhanced_project_schema_1.ProjectStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: enhanced_project_schema_1.ProjectCategory }),
    (0, class_validator_1.IsEnum)(enhanced_project_schema_1.ProjectCategory),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique project slug' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' }),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Target amount in USD' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "targetAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR'], default: 'USD' }),
    (0, class_validator_1.IsEnum)(['USD', 'EUR', 'GBP', 'AED', 'SAR']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project start date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateProjectDto.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project end date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateProjectDto.prototype, "endDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project location' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project city' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project country' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Latitude coordinate' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-90),
    (0, class_validator_1.Max)(90),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Longitude coordinate' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(-180),
    (0, class_validator_1.Max)(180),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProjectDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Project manager ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[0-9a-fA-F]{24}$/, { message: 'Invalid project manager ID format' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "projectManager", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Team member IDs', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.Matches)(/^[0-9a-fA-F]{24}$/, { each: true, message: 'Invalid team member ID format' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "teamMembers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Priority level', enum: ['low', 'medium', 'high', 'urgent'] }),
    (0, class_validator_1.IsEnum)(['low', 'medium', 'high', 'urgent']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "priority", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether project is featured', default: false }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProjectDto.prototype, "isFeatured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Whether project is visible', default: true }),
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateProjectDto.prototype, "isVisible", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Project tags', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Required skills', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "skills", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'External links', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "externalLinks", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Website URL' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "websiteUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Social media URL' }),
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "socialMediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contact email' }),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "contactEmail", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contact phone' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, { message: 'Invalid phone number format' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProjectDto.prototype, "contactPhone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Documents URLs', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateProjectDto.prototype, "documents", void 0);
class ProjectContentDto {
}
exports.ProjectContentDto = ProjectContentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Language code (e.g., en, ar, fr)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[a-z]{2}$/, { message: 'Language code must be 2 lowercase letters' }),
    __metadata("design:type", String)
], ProjectContentDto.prototype, "language_code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project title' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], ProjectContentDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project description' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(20),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], ProjectContentDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project content' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(50),
    __metadata("design:type", String)
], ProjectContentDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Content images', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ProjectContentDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Content videos', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ProjectContentDto.prototype, "videos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Content documents', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ProjectContentDto.prototype, "documents", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Content tags', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ProjectContentDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Meta description for SEO' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(160),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProjectContentDto.prototype, "metaDescription", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Meta keywords for SEO' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ProjectContentDto.prototype, "metaKeywords", void 0);
//# sourceMappingURL=create-project.dto.js.map