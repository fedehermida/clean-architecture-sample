import { HttpRequest, HttpResponse } from '@presentation/http/HttpTypes';
import { LoginUser } from '@application/use-cases/LoginUser';
import { LogoutUser } from '@application/use-cases/LogoutUser';
import { AuthenticationService } from '@application/services/AuthenticationService';

// Interface Adapter: HTTP controller for authentication endpoints
export class AuthController {
  constructor(
    private readonly loginUser: LoginUser,
    private readonly logoutUser: LogoutUser,
    private readonly authService: AuthenticationService,
  ) {}

  async login(req: HttpRequest, res: HttpResponse): Promise<void> {
    const result = await this.loginUser.execute(req.body as { email: string; password: string });
    if (!result.ok) {
      res.status(401).json({ error: result.error.message });
      return;
    }
    res.status(200).json(result.value);
  }

  private extractToken(req: HttpRequest): string | undefined {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return undefined;
    const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
    return headerValue?.replace('Bearer ', '');
  }

  async logout(req: HttpRequest, res: HttpResponse): Promise<void> {
    const token = this.extractToken(req);

    if (!token) {
      res.status(400).json({ error: 'No token provided' });
      return;
    }

    const result = await this.logoutUser.execute({ token });
    if (!result.ok) {
      res.status(400).json({ error: result.error.message });
      return;
    }
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async me(req: HttpRequest, res: HttpResponse): Promise<void> {
    const token = this.extractToken(req);

    if (!token) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const user = await this.authService.verifyToken(token);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    res.status(200).json(user);
  }
}
