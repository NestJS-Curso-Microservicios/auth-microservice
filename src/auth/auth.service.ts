import * as bcrypt from 'bcrypt';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { LoginUserAuthDto, RegisterUserAuthDto } from './dto';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';
import { envs } from '../config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
	private readonly logger = new Logger(AuthService.name);

	constructor(private readonly jwtService: JwtService) {
		super();
	}

	onModuleInit(): any {
		this.$connect();
		this.logger.log('Connected to the Mongo Database');
	}

	private async signJWT(payload: JwtPayloadInterface) {
		return this.jwtService.sign(payload);
	}

	async registerUser(registerUserAuthDto: RegisterUserAuthDto) {
		const { email, password, name } = registerUserAuthDto;
		try {
			const user = await this.user.findUnique({
				where: {
					email,
				},
			});

			if (user) {
				throw new RpcException({
					status: 400,
					message: 'User already exists',
				});
			}

			const newUser = await this.user.create({
				data: {
					email,
					password: bcrypt.hashSync(password, 10),
					name,
				},
			});

			delete newUser.password;
			return { user: newUser, token: await this.signJWT(newUser) };
		} catch (error) {
			throw new RpcException({
				status: 400,
				message: error.message,
			});
		}
	}

	async loginUser(createAuthDto: LoginUserAuthDto) {
		const { email, password } = createAuthDto;
		try {
			const user = await this.user.findUnique({
				where: {
					email,
				},
			});

			if (!user) {
				throw new RpcException({
					status: 400,
					message: 'User not found',
				});
			}

			const isPasswordMatch = bcrypt.compareSync(password, user.password);

			if (!isPasswordMatch) {
				throw new RpcException({
					status: 400,
					message: 'Invalid password',
				});
			}

			delete user.password;
			return { user, token: await this.signJWT(user) };
		} catch (error) {
			throw new RpcException({
				status: 400,
				message: error.message,
			});
		}
	}

	async verifyUser(token: string) {
		try {
			const decoded = this.jwtService.verify(token, {
				secret: envs.jwtSecret,
			});
			const user = await this.user.findUnique({
				where: {
					id: decoded.id,
				},
			});

			if (!user) {
				throw new RpcException({
					status: 400,
					message: 'User not found',
				});
			}

			delete user.password;
			return { user, token: await this.signJWT(user) };
		} catch (error) {
			throw new RpcException({
				status: 400,
				message: error.message,
			});
		}
	}
}
