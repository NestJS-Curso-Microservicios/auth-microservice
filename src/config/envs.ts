import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
	PORT: number;
	DATABASE_URL: string;
	NATS_SERVERS: string[];
	JWT_SECRET: string;
}

const envVarsSchema = joi
	.object({
		PORT: joi.number().required(),
		DATABASE_URL: joi.string().required(),
		NATS_SERVERS: joi.array().items(joi.string()).required(),
		JWT_SECRET: joi.string().required(),
	})
	.unknown(true);

const { error, value } = envVarsSchema.validate(
	{ ...process.env, NATS_SERVERS: process.env.NATS_SERVERS?.split(',') },
	{
		abortEarly: false,
	}
);

if (error) {
	throw new Error(`Config validation error: ${error.message}`);
}

export const envVars = value as EnvVars;

export const envs = {
	port: envVars.PORT,
	databaseUrl: envVars.DATABASE_URL,
	natsServers: envVars.NATS_SERVERS,
	jwtSecret: envVars.JWT_SECRET,
};
