import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginUserAuthDto, RegisterUserAuthDto } from './dto';

@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@MessagePattern('auth.register.user')
	async registerUser(@Payload() registerUserAuthDto: RegisterUserAuthDto) {
		return await this.authService.registerUser(registerUserAuthDto);
	}

	@MessagePattern('auth.login.user')
	async loginUser(@Payload() loginUserAuthDto: LoginUserAuthDto) {
		return await this.authService.loginUser(loginUserAuthDto);
	}

	@MessagePattern('auth.verify.user')
	async verifyUser(@Payload() token: string) {
		return await this.authService.verifyUser(token);
	}
}
