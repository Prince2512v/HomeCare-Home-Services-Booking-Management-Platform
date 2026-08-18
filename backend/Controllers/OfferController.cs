using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OfferController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public OfferController(HomeCareDbContext context)
        {
            _context = context;
        }

        [HttpGet("list")]
        public async Task<ActionResult<ApiResponse<object>>> GetList(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] decimal? discountPercentage = null,
            [FromQuery] int? appliedCountMin = null,
            [FromQuery] int? appliedCountMax = null,
            [FromQuery] bool? availability = null,
            [FromQuery] string? sortField = null,
            [FromQuery] string? sortDirection = null)
        {
            var offers = await _context.Offers.ToListAsync();
            var bookings = await _context.Bookings.ToListAsync();

            var mapped = offers.Select(o =>
            {
                var appliedCount = bookings.Count(b => b.Discount > 0);

                return new
                {
                    id = o.Id,
                    couponCode = o.Code,
                    couponDescription = $"Get {o.DiscountPercentage:F0}% off on minimum purchase of ₹{o.MinOrderAmount:F0}",
                    discountPercentage = o.DiscountPercentage,
                    appliedCount = appliedCount,
                    isActive = o.IsActive
                };
            }).ToList();

            if (discountPercentage.HasValue)
            {
                mapped = mapped.Where(o => o.discountPercentage == discountPercentage.Value).ToList();
            }

            if (appliedCountMin.HasValue)
            {
                mapped = mapped.Where(o => o.appliedCount >= appliedCountMin.Value).ToList();
            }

            if (appliedCountMax.HasValue)
            {
                mapped = mapped.Where(o => o.appliedCount <= appliedCountMax.Value).ToList();
            }

            if (availability.HasValue)
            {
                mapped = mapped.Where(o => o.isActive == availability.Value).ToList();
            }

            var maxBookingCount = mapped.Any() ? mapped.Max(o => o.appliedCount) : 0;

            if (!string.IsNullOrEmpty(sortField))
            {
                var desc = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true;
                mapped = sortField.ToLower() switch
                {
                    "couponcode" => desc ? mapped.OrderByDescending(o => o.couponCode).ToList() : mapped.OrderBy(o => o.couponCode).ToList(),
                    "discountpercentage" => desc ? mapped.OrderByDescending(o => o.discountPercentage).ToList() : mapped.OrderBy(o => o.discountPercentage).ToList(),
                    "appliedcount" => desc ? mapped.OrderByDescending(o => o.appliedCount).ToList() : mapped.OrderBy(o => o.appliedCount).ToList(),
                    _ => mapped
                };
            }

            var totalRecords = mapped.Count;

            if (pageSize > 0 && pageNumber > 0)
            {
                mapped = mapped.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
            }

            var result = new
            {
                records = mapped,
                totalRecords,
                filterMeta = new
                {
                    maxBookingCount
                }
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        // GET /api/offer — returns active offers in the format the frontend expects
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<ActiveOfferResponse>>>> GetActiveOffers()
        {
            var now = DateTime.UtcNow;
            var offers = await _context.Offers
                .Where(o => o.IsActive && o.ExpiryDate > now)
                .ToListAsync();

            var result = offers.Select(o => new ActiveOfferResponse
            {
                Id = o.Id,
                CouponCode = o.Code,
                CouponDescription = $"Get {o.DiscountPercentage:F0}% off on minimum purchase of ₹{o.MinOrderAmount:F0}",
                DiscountPercentage = o.DiscountPercentage,
                AppliedCount = 0,
                MaxUsage = 100,
                ExpiresAt = o.ExpiryDate.ToString("yyyy-MM-dd")
            }).ToList();

            return Ok(ApiResponse<List<ActiveOfferResponse>>.Success(result));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
        {
            var o = await _context.Offers.FindAsync(id);
            if (o == null) return NotFound(ApiResponse<object>.Failure("Offer not found"));

            var bookings = await _context.Bookings.ToListAsync();
            var appliedCount = bookings.Count(b => b.Discount > 0);

            var detail = new
            {
                id = o.Id,
                couponCode = o.Code,
                couponDescription = $"Get {o.DiscountPercentage:F0}% off on minimum purchase of ₹{o.MinOrderAmount:F0}",
                discountPercentage = o.DiscountPercentage,
                appliedCount = appliedCount,
                isActive = o.IsActive
            };

            return Ok(ApiResponse<object>.Success(detail));
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<object>>> Create([FromBody] CreateOfferRequest request)
        {
            var offer = new Offer
            {
                Code = request.CouponCode,
                DiscountPercentage = request.DiscountPercentage,
                MaxDiscountAmount = 500,
                MinOrderAmount = 300,
                ExpiryDate = DateTime.UtcNow.AddMonths(12),
                IsActive = request.IsActive
            };

            _context.Offers.Add(offer);
            await _context.SaveChangesAsync();

            var detail = new
            {
                id = offer.Id,
                couponCode = offer.Code,
                couponDescription = $"Get {offer.DiscountPercentage:F0}% off on minimum purchase of ₹{offer.MinOrderAmount:F0}",
                discountPercentage = offer.DiscountPercentage,
                appliedCount = 0,
                isActive = offer.IsActive
            };

            return Ok(ApiResponse<object>.Success(detail, "Offer created successfully"));
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> Update(int id, [FromBody] UpdateOfferRequest request)
        {
            var offer = await _context.Offers.FindAsync(id);
            if (offer == null) return NotFound(ApiResponse<object>.Failure("Offer not found"));

            offer.Code = request.CouponCode;
            offer.DiscountPercentage = request.DiscountPercentage;
            offer.IsActive = request.IsActive;

            await _context.SaveChangesAsync();

            var detail = new
            {
                id = offer.Id,
                couponCode = offer.Code,
                couponDescription = $"Get {offer.DiscountPercentage:F0}% off on minimum purchase of ₹{offer.MinOrderAmount:F0}",
                discountPercentage = offer.DiscountPercentage,
                appliedCount = 0,
                isActive = offer.IsActive
            };

            return Ok(ApiResponse<object>.Success(detail, "Offer updated successfully"));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var offer = await _context.Offers.FindAsync(id);
            if (offer == null) return NotFound(ApiResponse<bool>.Failure("Offer not found"));

            _context.Offers.Remove(offer);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Success(true, "Offer deleted successfully"));
        }

        // GET /api/offer/checkout-summary/{serviceId}
        // Returns checkout summary for a given service, with optional offer applied
        [HttpGet("checkout-summary/{serviceId}")]
        public async Task<ActionResult<ApiResponse<FrontendCheckoutSummary>>> CheckoutSummaryGet(int serviceId)
        {
            var service = await _context.Services.FindAsync(serviceId);
            if (service == null)
                return NotFound(ApiResponse<FrontendCheckoutSummary>.Failure("Service not found"));

            var summary = new FrontendCheckoutSummary
            {
                ServiceId = serviceId,
                ServiceName = service.Name,
                ItemsTotal = service.Price,
                TaxPercentage = 0,
                TaxAmount = 0,
                DiscountAmount = 0,
                TotalAmount = service.Price,
                AppliedOfferId = null,
                AppliedCouponCode = null
            };

            return Ok(ApiResponse<FrontendCheckoutSummary>.Success(summary));
        }

        // POST /api/offer/validate — accepts { serviceId, offerId } and returns CheckoutSummary
        [HttpPost("validate")]
        [Route("/api/offer/validate")]
        public async Task<ActionResult<ApiResponse<FrontendCheckoutSummary>>> ValidateOffer(ValidateCouponFrontendRequest request)
        {
            var service = await _context.Services.FindAsync(request.ServiceId);
            if (service == null)
                return BadRequest(ApiResponse<FrontendCheckoutSummary>.Failure("Service not found"));

            var offer = await _context.Offers.FindAsync(request.OfferId);
            if (offer == null || !offer.IsActive || offer.ExpiryDate < DateTime.UtcNow)
                return BadRequest(ApiResponse<FrontendCheckoutSummary>.Failure("Invalid or expired offer"));

            if (service.Price < offer.MinOrderAmount)
                return BadRequest(ApiResponse<FrontendCheckoutSummary>.Failure($"Minimum order amount of {offer.MinOrderAmount} required"));

            var discountAmount = service.Price * (offer.DiscountPercentage / 100m);
            if (discountAmount > offer.MaxDiscountAmount)
                discountAmount = offer.MaxDiscountAmount;

            var summary = new FrontendCheckoutSummary
            {
                ServiceId = request.ServiceId,
                ServiceName = service.Name,
                ItemsTotal = service.Price,
                TaxPercentage = 0,
                TaxAmount = 0,
                DiscountAmount = discountAmount,
                TotalAmount = service.Price - discountAmount,
                AppliedOfferId = offer.Id,
                AppliedCouponCode = offer.Code
            };

            return Ok(ApiResponse<FrontendCheckoutSummary>.Success(summary, $"Coupon '{offer.Code}' applied! You save ₹{discountAmount:F0}"));
        }

        // Keep legacy POST checkout-summary for backward compat
        [HttpPost("checkout-summary")]
        public async Task<ActionResult<ApiResponse<CheckoutSummaryResponse>>> CheckoutSummary(OfferValidateRequest request)
        {
            decimal originalAmount = request.Amount;
            decimal discountAmount = 0;
            string codeUsed = string.Empty;

            if (!string.IsNullOrEmpty(request.Code))
            {
                var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Code == request.Code && o.IsActive && o.ExpiryDate > DateTime.UtcNow);
                if (offer != null && originalAmount >= offer.MinOrderAmount)
                {
                    discountAmount = originalAmount * (offer.DiscountPercentage / 100m);
                    if (discountAmount > offer.MaxDiscountAmount)
                    {
                        discountAmount = offer.MaxDiscountAmount;
                    }
                    codeUsed = offer.Code;
                }
            }

            var response = new CheckoutSummaryResponse
            {
                OriginalAmount = originalAmount,
                DiscountAmount = discountAmount,
                TotalAmount = originalAmount - discountAmount,
                CouponCode = codeUsed
            };

            return Ok(ApiResponse<CheckoutSummaryResponse>.Success(response));
        }
    }

    public class CreateOfferRequest
    {
        public string CouponCode { get; set; } = string.Empty;
        public string CouponDescription { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public bool IsActive { get; set; }
    }

    public class UpdateOfferRequest
    {
        public int Id { get; set; }
        public string CouponCode { get; set; } = string.Empty;
        public string CouponDescription { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public bool IsActive { get; set; }
    }
}
