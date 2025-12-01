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
exports.ProjectSchema = exports.Project = exports.ProjectContentSchema = exports.ProjectContent = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let ProjectContent = class ProjectContent {
};
exports.ProjectContent = ProjectContent;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 2 }),
    __metadata("design:type", String)
], ProjectContent.prototype, "language_code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 100 }),
    __metadata("design:type", String)
], ProjectContent.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, maxlength: 300 }),
    __metadata("design:type", String)
], ProjectContent.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ProjectContent.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ProjectContent.prototype, "images", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ProjectContent.prototype, "videos", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], ProjectContent.prototype, "documents", void 0);
exports.ProjectContent = ProjectContent = __decorate([
    (0, mongoose_1.Schema)({ _id: false })
], ProjectContent);
exports.ProjectContentSchema = mongoose_1.SchemaFactory.createForClass(ProjectContent);
let Project = class Project {
};
exports.Project = Project;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Project.prototype, "bannerPhotoUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Project.prototype, "imageGallery", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Project.prototype, "videoGallery", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ProjectContentSchema], default: [] }),
    __metadata("design:type", Array)
], Project.prototype, "contents", void 0);
exports.Project = Project = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: "project",
    })
], Project);
exports.ProjectSchema = mongoose_1.SchemaFactory.createForClass(Project);
//# sourceMappingURL=project.schema.js.map