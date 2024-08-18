import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
	const logger = new Logger('Bootstrap-Auth');
	const app = await NestFactory.createMicroservice<MicroserviceOptions>(
		AppModule,
		{
			transport: Transport.NATS,
			options: {
				servers: envs.natsServers,
			},
		}
	);
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
		})
	);
	await app.listen().then(() => {
		logger.log(
			`Auth Microservice is running on http://localhost:${envs.port}`
		);
	});
}
bootstrap().then(() => console.log('Auth Microservice is running'));
