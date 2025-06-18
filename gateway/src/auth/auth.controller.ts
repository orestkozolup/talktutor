import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import axios from 'axios';
import { Response, Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard } from './jwt-auth.guard';

const oAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const USER_SERVICE_URL =
  process.env.USER_SERVICE_URL || 'http://localhost:3002';

@Controller('auth')
export class AuthController {
  @Post('google-login')
  async googleLogin(@Body('token') token: string, @Res() res: Response) {
    const ticket = await oAuthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    let user;
    try {
      const response = await axios.post(`${USER_SERVICE_URL}/users`, {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        googleId: payload.sub,
      });
      user = response.data;
    } catch (err) {
      console.error('Failed to create/fetch user:', err.message);
      return res.status(500).json({ message: 'Internal server error' });
    }

    const appJwt = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
        sub: payload.sub,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    res.cookie('jwt', appJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 * 1000,
    });

    res.json({
      user: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request) {
    return { user: req['user'] };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('jwt');
    res.json({ message: 'Logged out' });
  }
}
