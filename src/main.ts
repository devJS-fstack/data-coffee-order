import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app/app.module";
import * as mongoose from "mongoose";
import { join } from "path";

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    mongoose.set("debug", true);
    app.enableCors({
        origin: true,
        methods: "GET,POST,PUT,PATCH,DELETE",
        maxAge: 30,
    });
    app.useStaticAssets(join(__dirname, "../../", "store"));
    await app.listen(process.env.PORT || 3900);
}
bootstrap();
