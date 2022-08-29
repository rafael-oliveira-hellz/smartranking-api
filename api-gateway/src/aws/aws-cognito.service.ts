import { Injectable } from "@nestjs/common";
import { 
    CognitoUserPool,
    CognitoUserAttribute, 
    CognitoUser,
    AuthenticationDetails
} from 'amazon-cognito-identity-js'
import { AuthLoginUserDto } from "src/auth/dtos/auth-login-user.dto";
import { AuthUserRegisterDto } from "src/auth/dtos/auth-signup-user.dto";
import { AwsCognitoConfig } from './aws-cognito.config'

@Injectable()
export class AwsCognitoService {

    private userPool: CognitoUserPool

    constructor( 
        private authConfig: AwsCognitoConfig
    ) {

        this.userPool = new CognitoUserPool({
            UserPoolId: this.authConfig.userPoolId,
            ClientId: this.authConfig.clientId
        })

    }

    async signupUser (authUserRegisterDto: AuthUserRegisterDto) {

        const { name, email, password, phoneNumber } = authUserRegisterDto

        return new Promise((resolve, reject) => {
            this.userPool.signUp(
                email,
                password,
                [
                    new CognitoUserAttribute({
                        Name: 'phone_number', Value: phoneNumber
                    }),
                    new CognitoUserAttribute({
                        Name: 'name', Value: name
                    })                
                ], null,
                (err, result) => {
                    if (!result) {
                        reject(err)
                    } else {
                        resolve(result.user)
                    }
                }
            )
        })
    }


    async userAuthenticate(authLoginUserDto: AuthLoginUserDto) {

        const { email, password } =  authLoginUserDto

        const userData = {
            Username: email,
            Pool: this.userPool
        }

        const authenticationDetails = new AuthenticationDetails({
            Username: email,
            Password: password
        })

        const userCognito = new CognitoUser(userData)

        return new Promise((resolve, reject) => {
            userCognito.authenticateUser(authenticationDetails, {

                onSuccess: (result) => {
                    resolve(result)
                },
                onFailure: ((err) => {
                    reject(err)
                })

            })

        })

    }
    


}