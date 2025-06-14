import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

  app.enableCors({
    origin: frontendOrigin,
    credentials: true, // only if using cookies or auth headers
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
