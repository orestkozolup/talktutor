import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const frontendOrigin =
    configService.get<string>('FRONTEND_ORIGIN') || 'http://localhost:3000';

  app.enableCors({
    origin: frontendOrigin,
    credentials: true, // only if using cookies or auth headers
  });

  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);
}
bootstrap();
