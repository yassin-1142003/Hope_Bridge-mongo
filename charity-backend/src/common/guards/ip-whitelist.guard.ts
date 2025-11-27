import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IpWhitelistGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const clientIp = this.getClientIp(request);
    const allowedIps = this.configService.get<string>('ALLOWED_IPS')?.split(',') || [];

    if (allowedIps.length === 0) {
      return true; // If no IPs are configured, allow all requests
    }

    if (!allowedIps.includes(clientIp)) {
      throw new ForbiddenException(`IP ${clientIp} is not allowed`);
    }

    return true;
  }

  private getClientIp(request: any): string {
    return request.ip || 
           request.connection.remoteAddress || 
           request.socket.remoteAddress ||
           (request.connection.socket ? request.connection.socket.remoteAddress : null) ||
           '0.0.0.0';
  }
}
