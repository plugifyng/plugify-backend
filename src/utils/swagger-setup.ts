import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export class SwaggerSetup {
  static setup(app: INestApplication, path: string) {
    const options = new DocumentBuilder()
      .setTitle('Plugify Backend documentation')
      .setDescription('Plugify Backend documentation')
      .addServer('http://localhost:3001', 'Local Server') // You can add multiple servers
      .addBearerAuth()
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    const uiOptions: SwaggerCustomOptions = {
      customSiteTitle: 'Plugify Backend',
    };

    SwaggerModule.setup(path, app, document, uiOptions);
  }
}
