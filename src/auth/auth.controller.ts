import {
  Controller, Post, Patch, Body, Headers, UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly firebaseService: FirebaseService,
  ) {}

  private async getUid(authHeader: string): Promise<string> {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();
    const decoded = await this.firebaseService.verifyToken(token);
    return decoded.uid;
  }

  @Post('sync')
  async sync(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();
    const decoded = await this.firebaseService.verifyToken(token);
    return this.authService.syncUser({
      firebaseUid: decoded.uid,
      email: decoded.email ?? '',
      displayName: decoded.name,
      photoURL: decoded.picture,
    });
  }

  @Patch('profile')
  async updateProfile(
    @Headers('authorization') auth: string,
    @Body() body: { role?: string; country?: string; dialCode?: string; phone?: string },
  ) {
    const uid = await this.getUid(auth);
    return this.authService.updateProfile(uid, { ...body, profileCompleted: true });
  }
}
