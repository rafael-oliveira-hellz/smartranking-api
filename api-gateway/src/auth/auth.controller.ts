import { Controller, Body, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AwsCognitoService } from 'src/aws/aws-cognito.service';
import { AuthLoginUserDto } from './dtos/auth-login-user.dto';
import { AuthUserRegisterDto } from './dtos/auth-signup-user.dto';

@Controller('api/v1/auth')
export class AuthController {

    constructor (
        private awsCognitoService: AwsCognitoService
    ) {}

    @Post('/signup')
    @UsePipes(ValidationPipe)
    async signup(
        @Body() authUserRegisterDto: AuthUserRegisterDto) {

            return await this.awsCognitoService.signupUser(authUserRegisterDto)
    }

    @Post('/login')
    @UsePipes(ValidationPipe)
    async login (
        @Body() authLoginUserDto: AuthLoginUserDto) {

            return await this.awsCognitoService.userAuthenticate(authLoginUserDto)

    }

}
