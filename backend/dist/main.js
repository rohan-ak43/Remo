"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public'), {
        index: false,
        prefix: '/',
    });
    const port = process.env.PORT || 3000;
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 RMP System backend running on http://localhost:${port}`);
    console.log(`📱 Patient page: http://localhost:${port}/patient.html`);
    console.log(`👨‍⚕️ Doctor dashboard: http://localhost:${port}/doctor.html`);
    console.log(`🌐 Access from network: http://YOUR_IP:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map