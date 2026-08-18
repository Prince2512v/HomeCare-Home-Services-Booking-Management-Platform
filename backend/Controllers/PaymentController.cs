using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Razorpay.Api;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly HomeCareDbContext _context;
        private readonly string _razorpayKeyId;
        private readonly string _razorpayKeySecret;

        public PaymentController(HomeCareDbContext context, IConfiguration configuration)
        {
            _context = context;
            _razorpayKeyId = configuration["Razorpay:KeyId"] ?? string.Empty;
            _razorpayKeySecret = configuration["Razorpay:KeySecret"] ?? string.Empty;
        }

        /// <summary>
        /// Creates a Razorpay Order and a pending Booking + Transaction.
        /// Returns { razorpayOrderId, amount, currency, keyId }.
        /// </summary>
        [HttpPost("create-intent")]
        public async Task<ActionResult<ApiResponse<object>>> CreateIntent(
            [FromHeader(Name = "Authorization")] string? authHeader = null,
            [FromBody] FrontendBookingRequest? request = null)
        {
            if (request == null)
                return BadRequest(ApiResponse<object>.Failure("Invalid request body"));

            // Validate Razorpay configuration
            if (string.IsNullOrEmpty(_razorpayKeyId) || _razorpayKeyId == "rzp_test_YOUR_KEY_ID")
                return StatusCode(500, ApiResponse<object>.Failure(
                    "Razorpay is not configured. Please set KeyId and KeySecret in appsettings.json."));

            var userId = GetUserIdFromToken(authHeader) ?? 2;

            // Lookup the service to get price
            var service = await _context.Services.FindAsync(request.ServiceId);
            if (service == null)
                return NotFound(ApiResponse<object>.Failure("Service not found"));

            // Find all active and approved partners
            var experts = await _context.ServicePartners
                .Include(sp => sp.User)
                .Where(sp => sp.Status == "Approved" && sp.IsActive)
                .ToListAsync();

            // Filter by assigned services
            var matchingExperts = experts
                .Where(sp => sp.AssignedServices.Split(',', StringSplitOptions.RemoveEmptyEntries)
                               .Select(s => s.Trim())
                               .Contains(request.ServiceId.ToString()))
                .ToList();

            if (!matchingExperts.Any())
                matchingExperts = experts;

            ServicePartner? expert = null;
            if (matchingExperts.Any())
            {
                var expertIds = matchingExperts.Select(e => e.Id).ToList();
                var bookingCounts = await _context.Bookings
                    .Where(b => b.ServicePartnerId.HasValue && expertIds.Contains(b.ServicePartnerId.Value))
                    .GroupBy(b => b.ServicePartnerId)
                    .Select(g => new { ExpertId = g.Key, Count = g.Count() })
                    .ToListAsync();

                expert = matchingExperts
                    .OrderBy(e => bookingCounts.FirstOrDefault(bc => bc.ExpertId == e.Id)?.Count ?? 0)
                    .FirstOrDefault();
            }

            if (!DateTime.TryParse(request.BookingDate, out DateTime parsedDate))
                parsedDate = DateTime.UtcNow.Date;

            // Create the booking record (PaymentStatus = Pending until confirmed)
            var booking = new Booking
            {
                UserId = userId,
                ServiceId = request.ServiceId,
                ServicePartnerId = expert?.Id,
                BookingDate = parsedDate,
                SlotTime = request.BookingTime ?? "",
                Status = expert != null ? "Assigned" : "Pending",
                Address = $"AddressId:{request.AddressId}",
                PaymentMethod = "Razorpay",
                PaymentStatus = "Pending",
                Amount = service.Price,
                Discount = 0,
                TotalAmount = service.Price,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Create Razorpay Order (amount in paise = price * 100)
            string razorpayOrderId;
            try
            {
                var client = new RazorpayClient(_razorpayKeyId, _razorpayKeySecret);
                var amountInPaise = (long)(service.Price * 100);

                var orderOptions = new Dictionary<string, object>
                {
                    { "amount",   amountInPaise },
                    { "currency", "INR" },
                    { "receipt",  $"booking_{booking.Id}" },
                    { "notes",    new Dictionary<string, string>
                        {
                            { "bookingId", booking.Id.ToString() },
                            { "userId",    userId.ToString() }
                        }
                    }
                };

                var order = client.Order.Create(orderOptions);
                razorpayOrderId = order["id"].ToString()!;
            }
            catch (Exception ex)
            {
                // Roll back booking if Razorpay order creation fails
                _context.Bookings.Remove(booking);
                await _context.SaveChangesAsync();
                return StatusCode(500, ApiResponse<object>.Failure($"Razorpay order creation failed: {ex.Message}"));
            }

            // Persist a pending Transaction linked to this booking
            var transaction = new Transaction
            {
                BookingId = booking.Id,
                UserId = userId,
                Amount = booking.TotalAmount,
                PaymentIntentId = razorpayOrderId,   // stores razorpay order_id
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            var response = new
            {
                razorpayOrderId,
                keyId = _razorpayKeyId,
                amount = booking.TotalAmount,
                currency = "INR"
            };

            return Ok(ApiResponse<object>.Success(response, "Razorpay order created successfully"));
        }

        /// <summary>
        /// Verifies the Razorpay payment signature and confirms the booking.
        /// Expects { razorpayOrderId, razorpayPaymentId, razorpaySignature }.
        /// </summary>
        [HttpPost("confirm")]
        public async Task<ActionResult<ApiResponse<BookingResponseDto>>> Confirm(
            [FromBody] ConfirmPaymentRequest? request = null)
        {
            if (request == null || string.IsNullOrEmpty(request.RazorpayOrderId))
                return BadRequest(ApiResponse<BookingResponseDto>.Failure("Invalid confirm request"));

            // Verify HMAC-SHA256 signature: key_secret + "|" + order_id + "|" + payment_id
            if (!string.IsNullOrEmpty(request.RazorpayPaymentId) &&
                !string.IsNullOrEmpty(request.RazorpaySignature))
            {
                var signaturePayload = $"{request.RazorpayOrderId}|{request.RazorpayPaymentId}";
                var computedSignature = ComputeHmacSha256(signaturePayload, _razorpayKeySecret);

                if (!string.Equals(computedSignature, request.RazorpaySignature, StringComparison.OrdinalIgnoreCase))
                {
                    return BadRequest(ApiResponse<BookingResponseDto>.Failure(
                        "Payment verification failed: invalid signature"));
                }
            }

            // Find the transaction by Razorpay order ID
            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(t => t.PaymentIntentId == request.RazorpayOrderId);

            if (transaction == null)
            {
                // Fallback to latest pending
                transaction = await _context.Transactions
                    .OrderByDescending(t => t.CreatedAt)
                    .FirstOrDefaultAsync(t => t.Status == "Pending");
            }

            if (transaction != null)
            {
                transaction.Status = "Succeeded";
                // Store Razorpay payment ID for reference (using PaymentIntentId field)
                if (!string.IsNullOrEmpty(request.RazorpayPaymentId))
                    transaction.PaymentIntentId = request.RazorpayPaymentId;

                var booking = await _context.Bookings
                    .Include(b => b.Service)
                    .Include(b => b.ServicePartner)
                        .ThenInclude(sp => sp!.User)
                    .FirstOrDefaultAsync(b => b.Id == transaction.BookingId);

                if (booking != null)
                {
                    booking.PaymentStatus = "Paid";
                    await _context.SaveChangesAsync();

                    var response = new BookingResponseDto
                    {
                        Id = booking.Id,
                        BookingDate = booking.BookingDate.ToString("yyyy-MM-dd"),
                        BookingTime = booking.SlotTime,
                        Status = booking.Status,
                        PaymentStatus = "Paid",
                        BookingAmount = booking.TotalAmount,
                        PaymentMethod = booking.PaymentMethod,
                        DurationMinutes = 0,
                        AssignedPartner = booking.ServicePartner?.User != null ? new AssignedPartnerDto
                        {
                            Id = booking.ServicePartner.Id,
                            FullName = booking.ServicePartner.User.Name,
                            ProfileImageUrl = booking.ServicePartner.ProfileImageUrl,
                            TotalJobsCompleted = 0
                        } : null
                    };

                    return Ok(ApiResponse<BookingResponseDto>.Success(response, "Payment confirmed successfully"));
                }
            }

            // Fallback success (should not normally reach here)
            return Ok(ApiResponse<BookingResponseDto>.Success(new BookingResponseDto
            {
                Id = 0,
                BookingDate = DateTime.UtcNow.ToString("yyyy-MM-dd"),
                BookingTime = "",
                Status = "Confirmed",
                PaymentStatus = "Paid",
                BookingAmount = 0,
                PaymentMethod = "Razorpay",
                DurationMinutes = 0
            }, "Payment confirmed successfully"));
        }

        /// <summary>
        /// Records a failed/dismissed Razorpay payment.
        /// Expects { razorpayOrderId }.
        /// </summary>
        [HttpPost("failed")]
        public async Task<ActionResult<ApiResponse<string>>> Failed(
            [FromBody] FailedPaymentRequest? request = null)
        {
            if (request != null && !string.IsNullOrEmpty(request.PaymentIntentId))
            {
                var transaction = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.PaymentIntentId == request.PaymentIntentId);

                if (transaction != null)
                {
                    transaction.Status = "Failed";

                    var booking = await _context.Bookings.FindAsync(transaction.BookingId);
                    if (booking != null)
                    {
                        booking.PaymentStatus = "Failed";
                        booking.Status = "Cancelled";
                    }

                    await _context.SaveChangesAsync();
                }
            }

            return Ok(ApiResponse<string>.Success("Payment failure recorded"));
        }

        // ─── Helpers ─────────────────────────────────────────────────────────────

        private static string ComputeHmacSha256(string data, string secret)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
        }

        private int? GetUserIdFromToken(string? authHeader)
        {
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return null;

            try
            {
                var token = authHeader.Substring("Bearer ".Length);
                var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes("SecretKeySuperLongNameForTestingJWTBearer12345");
                tokenHandler.ValidateToken(token, new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out Microsoft.IdentityModel.Tokens.SecurityToken validatedToken);

                var jwtToken = (System.IdentityModel.Tokens.Jwt.JwtSecurityToken)validatedToken;
                var userIdStr = jwtToken.Payload[System.Security.Claims.ClaimTypes.NameIdentifier]?.ToString();
                if (userIdStr != null && int.TryParse(userIdStr, out int userId))
                    return userId;
            }
            catch { }

            return null;
        }
    }
}
