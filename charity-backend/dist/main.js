"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
async function bootstrap() {
    var _a, _b;
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix("api");
    app.enableCors({
        origin: (_b = (_a = process.env.CORS_ORIGIN) === null || _a === void 0 ? void 0 : _a.split(",")) !== null && _b !== void 0 ? _b : ["http://localhost:3000"],
        credentials: true,
    });
    app.use((0, helmet_1.default)());
    app.use((0, compression_1.default)());
    app.use((req, res, next) => {
        res.removeHeader('X-Powered-By');
        res.removeHeader('Server');
        next();
    });
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new response_interceptor_1.ResponseInterceptor(), new logging_interceptor_1.LoggingInterceptor());
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidUnknownValues: false,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle("Charity API")
        .setDescription("Charity backend API documentation")
        .setVersion("1.0")
        .addBearerAuth({ type: "http", scheme: "bearer", bearerFormat: "JWT" })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup("api/docs", app, document);
    const port = process.env.PORT || 4000;
    await app.listen(port);
    common_1.Logger.log(`Charity backend running on http://localhost:${port}/api`);
    common_1.Logger.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map