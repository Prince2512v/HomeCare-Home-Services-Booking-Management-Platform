using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api")]
    public class AuthController : ControllerBase
    {
        private readonly HomeCareDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(HomeCareDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("auth/login")]
        public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.PasswordHash == request.Password);
            if (user == null)
            {
                return Unauthorized(ApiResponse<LoginResponse>.Failure("Invalid email or password", 401));
            }

            var token = GenerateJwtToken(user);
            var response = new LoginResponse
            {
                AccessToken = token,
                UserId = user.Id,
                Name = user.Name,
                Email = user.Email,
                Role = user.Role
            };

            return Ok(ApiResponse<LoginResponse>.Success(response, "Login successful"));
        }

        [HttpPost("otp/send")]
        public async Task<ActionResult<ApiResponse<string>>> SendOtp(SendOtpRequest request)
        {
            // Generate a random 4-digit OTP
            string code = new Random().Next(1000, 10000).ToString();
            var expiry = DateTime.UtcNow.AddMinutes(5);

            var newOtp = new Otp
            {
                Phone = request.Phone,
                Email = request.Email,
                OtpCode = code,
                ExpiryTime = expiry,
                IsUsed = false
            };

            _context.Otps.Add(newOtp);
            await _context.SaveChangesAsync();

            // Print OTP to console for local testing / demo runs
            Console.WriteLine($"=============================");
            Console.WriteLine($"[DEMO OTP]: {code} (for {request.Email ?? request.Phone})");
            Console.WriteLine($"=============================");

            // Send OTP via email
            try
            {
                var recipient = string.IsNullOrEmpty(request.Email) ? request.Phone : request.Email;
                if (!string.IsNullOrEmpty(request.Email))
                    await SendOtpEmailAsync(request.Email, code);
            }
            catch (Exception ex)
            {
                // Log the error but don't fail the request — OTP is saved in DB
                Console.WriteLine($"[Email Error] Failed to send OTP email: {ex.Message}");
            }

            return Ok(ApiResponse<string>.Success("OTP sent successfully to " + (string.IsNullOrEmpty(request.Phone) ? request.Email : request.Phone), "OTP Sent"));
        }

        [HttpPost("otp/verify")]
        public async Task<ActionResult<ApiResponse<OtpVerificationResponse>>> VerifyOtp(VerifyOtpRequest request)
        {
            var otpRecord = await _context.Otps
                .OrderByDescending(o => o.ExpiryTime)
                .FirstOrDefaultAsync(o => 
                    (o.Phone == request.Phone || o.Email == request.Email) && 
                    o.OtpCode == request.Otp && 
                    !o.IsUsed && 
                    o.ExpiryTime > DateTime.UtcNow);

            if (otpRecord == null)
            {
                return BadRequest(ApiResponse<OtpVerificationResponse>.Failure("Invalid or expired OTP", 400));
            }

            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            // Find or create the user
            User? user = null;
            if (!string.IsNullOrEmpty(request.Phone))
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Phone == request.Phone);
            }
            else if (!string.IsNullOrEmpty(request.Email))
            {
                user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            }

            if (user == null)
            {
                user = new User
                {
                    Name = "User " + (string.IsNullOrEmpty(request.Phone) ? request.Email.Split('@')[0] : request.Phone.Substring(Math.Max(0, request.Phone.Length - 4))),
                    Email = request.Email,
                    Phone = request.Phone,
                    Role = "Customer",
                    IsActive = true
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            var token = GenerateJwtToken(user);
            var response = new OtpVerificationResponse
            {
                Token = token,
                User = new OtpUserResponse
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email ?? string.Empty,
                    Phone = user.Phone ?? string.Empty,
                    Role = user.Role
                }
            };

            return Ok(ApiResponse<OtpVerificationResponse>.Success(response, "OTP verified successfully"));
        }

        [HttpGet("users/profile")]
        public async Task<ActionResult<ApiResponse<User>>> GetProfile([FromHeader(Name = "Authorization")] string authHeader)
        {
            var userId = GetUserIdFromToken(authHeader);
            if (userId == null)
            {
                return Unauthorized(ApiResponse<User>.Failure("Unauthorized", 401));
            }

            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null)
            {
                return NotFound(ApiResponse<User>.Failure("User not found", 404));
            }

            return Ok(ApiResponse<User>.Success(user));
        }

        [HttpPut("users/profile")]
        public async Task<ActionResult<ApiResponse<User>>> UpdateProfile([FromHeader(Name = "Authorization")] string authHeader, UpdateProfileRequest request)
        {
            var userId = GetUserIdFromToken(authHeader);
            if (userId == null)
            {
                return Unauthorized(ApiResponse<User>.Failure("Unauthorized", 401));
            }

            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null)
            {
                return NotFound(ApiResponse<User>.Failure("User not found", 404));
            }

            user.Name = request.Name;
            user.Email = request.Email;
            user.Phone = request.Phone;

            await _context.SaveChangesAsync();
            return Ok(ApiResponse<User>.Success(user, "Profile updated successfully"));
        }

        // Profile update endpoints
        [HttpPut("users/profile/phone")]
        public async Task<ActionResult<ApiResponse<string>>> UpdatePhone(
            [FromHeader(Name = "Authorization")] string authHeader,
            [FromBody] UpdatePhoneRequest request)
        {
            var userId = GetUserIdFromToken(authHeader);
            if (userId == null)
                return Unauthorized(ApiResponse<string>.Failure("Unauthorized", 401));

            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null)
                return NotFound(ApiResponse<string>.Failure("User not found", 404));

            user.Phone = request.MobileNumber;
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.Success(request.MobileNumber, "Phone updated successfully"));
        }

        [HttpPost("users/profile/email/send-otp")]
        public async Task<ActionResult<ApiResponse<string>>> SendEmailOtp(
            [FromHeader(Name = "Authorization")] string authHeader,
            [FromBody] SendEmailOtpRequest request)
        {
            var userId = GetUserIdFromToken(authHeader);
            if (userId == null)
                return Unauthorized(ApiResponse<string>.Failure("Unauthorized", 401));

            // Generate & save OTP for email change
            string code = new Random().Next(1000, 10000).ToString();
            var newOtp = new Otp
            {
                Email = request.NewEmail,
                OtpCode = code,
                ExpiryTime = DateTime.UtcNow.AddMinutes(5),
                IsUsed = false
            };
            _context.Otps.Add(newOtp);
            await _context.SaveChangesAsync();

            Console.WriteLine($"=============================");
            Console.WriteLine($"[DEMO EMAIL CHANGE OTP]: {code} (for {request.NewEmail})");
            Console.WriteLine($"=============================");

            // Send email
            try { await SendOtpEmailAsync(request.NewEmail, code); }
            catch (Exception ex) { Console.WriteLine($"[Email Error] {ex.Message}"); }

            return Ok(ApiResponse<string>.Success(request.NewEmail, "OTP sent to new email"));
        }

        [HttpPut("users/profile/email")]
        public async Task<ActionResult<ApiResponse<string>>> UpdateEmail(
            [FromHeader(Name = "Authorization")] string authHeader,
            [FromBody] UpdateEmailRequest request)
        {
            var userId = GetUserIdFromToken(authHeader);
            if (userId == null)
                return Unauthorized(ApiResponse<string>.Failure("Unauthorized", 401));

            // Verify OTP
            var otp = await _context.Otps
                .Where(o => o.Email == request.NewEmail && o.OtpCode == request.Otp
                         && !o.IsUsed && o.ExpiryTime > DateTime.UtcNow)
                .OrderByDescending(o => o.ExpiryTime)
                .FirstOrDefaultAsync();

            if (otp == null)
                return BadRequest(ApiResponse<string>.Failure("Invalid or expired OTP", 400));

            otp.IsUsed = true;

            var user = await _context.Users.FindAsync(userId.Value);
            if (user == null)
                return NotFound(ApiResponse<string>.Failure("User not found", 404));

            user.Email = request.NewEmail;
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<string>.Success(request.NewEmail, "Email updated successfully"));
        }

        [HttpPost("otp/refresh")]
        public ActionResult<ApiResponse<OtpVerificationResponse>> RefreshToken()
        {
            return Ok(ApiResponse<OtpVerificationResponse>.Success(new OtpVerificationResponse
            {
                Token = "dummy-refreshed-token",
                User = new OtpUserResponse()
            }));
        }

        [HttpPost("otp/logout")]
        public ActionResult<ApiResponse<string>> Logout()
        {
            return Ok(ApiResponse<string>.Success("Logged out successfully"));
        }

        [HttpPost("auth/logout")]
        public ActionResult<ApiResponse<string>> AdminLogout()
        {
            return Ok(ApiResponse<string>.Success("Logged out successfully"));
        }

        // ──── Forgot / Reset password flow ────

        [HttpPost("auth/forgot-password")]
        public async Task<ActionResult<ApiResponse<ForgotPasswordResponse>>> ForgotPassword(ForgotPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest(ApiResponse<ForgotPasswordResponse>.Failure("Email is required"));

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
            {
                // Don't reveal whether the email exists – always return success
                return Ok(ApiResponse<ForgotPasswordResponse>.Success(
                    new ForgotPasswordResponse { Message = "If this email is registered, you will receive a password reset link." },
                    "If this email is registered, you will receive a password reset link."));
            }

            // Generate a unique reset token and store it in the Otp table
            var resetToken = Guid.NewGuid().ToString("N");
            var otp = new Otp
            {
                Email = request.Email,
                OtpCode = resetToken,
                ExpiryTime = DateTime.UtcNow.AddMinutes(15),
                IsUsed = false
            };
            _context.Otps.Add(otp);
            await _context.SaveChangesAsync();

            // Build reset link (admin frontend runs on port 4200)
            var resetLink = $"http://localhost:4200/auth/reset-password?token={resetToken}&email={Uri.EscapeDataString(request.Email)}";

            Console.WriteLine($"=============================");
            Console.WriteLine($"[DEMO RESET LINK]: {resetLink}");
            Console.WriteLine($"=============================");

            // Send email with reset link
            try
            {
                await SendResetPasswordEmailAsync(request.Email, resetLink);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Email Error] Failed to send reset email: {ex.Message}");
            }

            return Ok(ApiResponse<ForgotPasswordResponse>.Success(
                new ForgotPasswordResponse { Message = "Password reset link sent to your email." },
                "Password reset link sent to your email."));
        }

        [HttpGet("auth/validate-reset-token")]
        public async Task<ActionResult<ApiResponse<object>>> ValidateResetToken([FromQuery] string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                return BadRequest(ApiResponse<object>.Failure("Token is required"));

            var otpRecord = await _context.Otps
                .FirstOrDefaultAsync(o => o.OtpCode == token && !o.IsUsed && o.ExpiryTime > DateTime.UtcNow);

            if (otpRecord == null)
                return BadRequest(ApiResponse<object>.Failure("Invalid or expired reset token"));

            return Ok(ApiResponse<object>.Success(null!, "Token is valid"));
        }

        [HttpPost("auth/reset-password")]
        public async Task<ActionResult<ApiResponse<ResetPasswordResponse>>> ResetPassword(ResetPasswordRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Token))
                return BadRequest(ApiResponse<ResetPasswordResponse>.Failure("Token is required"));

            if (request.NewPassword != request.ConfirmPassword)
                return BadRequest(ApiResponse<ResetPasswordResponse>.Failure("Passwords do not match"));

            if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 6)
                return BadRequest(ApiResponse<ResetPasswordResponse>.Failure("Password must be at least 6 characters"));

            var otpRecord = await _context.Otps
                .FirstOrDefaultAsync(o => o.OtpCode == request.Token && !o.IsUsed && o.ExpiryTime > DateTime.UtcNow);

            if (otpRecord == null)
                return BadRequest(ApiResponse<ResetPasswordResponse>.Failure("Invalid or expired reset token"));

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == otpRecord.Email);
            if (user == null)
                return NotFound(ApiResponse<ResetPasswordResponse>.Failure("User not found"));

            // Update password and mark token as used
            user.PasswordHash = request.NewPassword;
            otpRecord.IsUsed = true;
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<ResetPasswordResponse>.Success(
                new ResetPasswordResponse { Message = "Password has been reset successfully." },
                "Password has been reset successfully."));
        }

        private async Task SendResetPasswordEmailAsync(string toEmail, string resetLink)
        {
            var smtp = _configuration.GetSection("Smtp");
            var host = smtp["Host"] ?? "smtp.gmail.com";
            var port = int.Parse(smtp["Port"] ?? "587");
            var username = smtp["Username"] ?? string.Empty;
            var password = smtp["Password"] ?? string.Empty;
            var fromEmail = smtp["FromEmail"] ?? username;
            var fromName = smtp["FromName"] ?? "HomeCare";

            using var client = new System.Net.Mail.SmtpClient(host, port)
            {
                EnableSsl = true,
                Credentials = new System.Net.NetworkCredential(username, password)
            };

            var body = $@"
                <div style='font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;'>
                  <h2 style='color:#4f46e5;'>HomeCare Password Reset</h2>
                  <p>We received a request to reset your password. Click the button below to set a new password:</p>
                  <a href='{resetLink}' style='display:inline-block;margin:24px 0;padding:14px 28px;background-color:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;'>Reset Password</a>
                  <p style='color:#64748b;font-size:13px;'>This link is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
                  <hr style='border:none;border-top:1px solid #eee;margin:24px 0;'/>
                  <p style='color:#94a3b8;font-size:11px;'>If the button doesn't work, copy and paste this link into your browser:<br/>{resetLink}</p>
                </div>";

            var mail = new System.Net.Mail.MailMessage
            {
                From = new System.Net.Mail.MailAddress(fromEmail, fromName),
                Subject = "HomeCare — Reset Your Password",
                Body = body,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            await client.SendMailAsync(mail);
        }

        private async Task SendOtpEmailAsync(string toEmail, string otpCode)
        {
            var smtp = _configuration.GetSection("Smtp");
            var host = smtp["Host"] ?? "smtp.gmail.com";
            var port = int.Parse(smtp["Port"] ?? "587");
            var username = smtp["Username"] ?? string.Empty;
            var password = smtp["Password"] ?? string.Empty;
            var fromEmail = smtp["FromEmail"] ?? username;
            var fromName = smtp["FromName"] ?? "HomeCare";

            using var client = new System.Net.Mail.SmtpClient(host, port)
            {
                EnableSsl = true,
                Credentials = new System.Net.NetworkCredential(username, password)
            };

            var body = $@"
                <div style='font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:12px;'>
                  <h2 style='color:#4f46e5;'>HomeCare OTP Verification</h2>
                  <p>Use the following OTP to sign in to your HomeCare account.</p>
                  <div style='font-size:36px;font-weight:bold;letter-spacing:12px;color:#1e293b;margin:24px 0;'>{otpCode}</div>
                  <p style='color:#64748b;font-size:13px;'>This OTP is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
                  <hr style='border:none;border-top:1px solid #eee;margin:24px 0;'/>
                  <p style='color:#94a3b8;font-size:11px;'>If you did not request this, please ignore this email.</p>
                </div>";

            var mail = new System.Net.Mail.MailMessage
            {
                From = new System.Net.Mail.MailAddress(fromEmail, fromName),
                Subject = $"Your HomeCare OTP: {otpCode}",
                Body = body,
                IsBodyHtml = true
            };
            mail.To.Add(toEmail);

            await client.SendMailAsync(mail);
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            // A simple key for local development
            var key = Encoding.ASCII.GetBytes("SecretKeySuperLongNameForTestingJWTBearer12345");
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] 
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Name),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private int? GetUserIdFromToken(string authHeader)
        {
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return null;
            }

            try
            {
                var token = authHeader.Substring("Bearer ".Length);
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes("SecretKeySuperLongNameForTestingJWTBearer12345");
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userIdStr = jwtToken.Payload[ClaimTypes.NameIdentifier]?.ToString();
                if (userIdStr != null && int.TryParse(userIdStr, out int userId))
                {
                    return userId;
                }
            }
            catch
            {
                return null;
            }

            return null;
        }
    }
}
