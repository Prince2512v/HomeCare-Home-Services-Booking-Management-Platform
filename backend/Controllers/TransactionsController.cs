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
    [Route("api/transactions")]
    public class TransactionsController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public TransactionsController(HomeCareDbContext context)
        {
            _context = context;
        }

        [HttpGet("list")]
        public async Task<ActionResult<ApiResponse<object>>> GetList(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] decimal? minAmount = null,
            [FromQuery] decimal? maxAmount = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] string? sortField = null,
            [FromQuery] string? sortDirection = null)
        {
            var query = _context.Transactions
                .Include(t => t.Booking)
                    .ThenInclude(b => b!.Service)
                .Include(t => t.User)
                .AsQueryable();

            var list = await query.ToListAsync();

            var mapped = list.Select(t => new
            {
                id = t.Id,
                transactionId = t.PaymentIntentId,
                userName = t.User?.Name ?? "Unknown",
                mobileNumber = t.User?.Phone ?? "",
                serviceName = t.Booking?.Service?.Name ?? "Unknown Service",
                transactionAmount = t.Amount,
                paymentMethod = t.Booking?.PaymentMethod ?? "Stripe",
                transactionDate = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            }).ToList();

            // Filters
            if (minAmount.HasValue)
            {
                mapped = mapped.Where(t => t.transactionAmount >= minAmount.Value).ToList();
            }

            if (maxAmount.HasValue)
            {
                mapped = mapped.Where(t => t.transactionAmount <= maxAmount.Value).ToList();
            }

            if (!string.IsNullOrEmpty(paymentMethod))
            {
                mapped = mapped.Where(t => t.paymentMethod.Equals(paymentMethod, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            // Compute filterMeta before pagination
            var maxAmountMeta = mapped.Any() ? mapped.Max(t => t.transactionAmount) : 0;

            // Sorting
            if (!string.IsNullOrEmpty(sortField))
            {
                var desc = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true;
                mapped = sortField.ToLower() switch
                {
                    "username" or "name" => desc ? mapped.OrderByDescending(t => t.userName).ToList() : mapped.OrderBy(t => t.userName).ToList(),
                    "transactionamount" or "amount" => desc ? mapped.OrderByDescending(t => t.transactionAmount).ToList() : mapped.OrderBy(t => t.transactionAmount).ToList(),
                    "transactiondate" or "date" => desc ? mapped.OrderByDescending(t => t.transactionDate).ToList() : mapped.OrderBy(t => t.transactionDate).ToList(),
                    "transactionid" => desc ? mapped.OrderByDescending(t => t.transactionId).ToList() : mapped.OrderBy(t => t.transactionId).ToList(),
                    _ => mapped
                };
            }

            var totalRecords = mapped.Count;

            // Pagination
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
                    maxAmount = maxAmountMeta
                }
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<object>>> GetById(int id)
        {
            var t = await _context.Transactions
                .Include(t => t.Booking)
                    .ThenInclude(b => b!.Service)
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (t == null) return NotFound(ApiResponse<object>.Failure("Transaction not found"));

            var detail = new
            {
                id = t.Id,
                userId = t.UserId,
                userName = t.User?.Name ?? "Unknown",
                mobileNumber = t.User?.Phone ?? "",
                transactionId = t.PaymentIntentId,
                serviceName = t.Booking?.Service?.Name ?? "Unknown Service",
                serviceId = t.Booking?.ServiceId.ToString() ?? "",
                transactionAmount = t.Amount,
                paymentType = t.Booking?.PaymentMethod == "Stripe" ? "Online" : "Offline",
                paymentMethod = t.Booking?.PaymentMethod ?? "Stripe",
                transactionDate = t.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
            };

            return Ok(ApiResponse<object>.Success(detail));
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
        {
            var transaction = await _context.Transactions.FindAsync(id);
            if (transaction == null) return NotFound(ApiResponse<bool>.Failure("Transaction not found"));

            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();
            return Ok(ApiResponse<bool>.Success(true, "Transaction deleted successfully"));
        }

        [HttpGet("user/{id}")]
        public async Task<ActionResult<ApiResponse<object>>> GetByUser(int id, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Transactions
                .Include(t => t.Booking)
                    .ThenInclude(b => b!.Service)
                .Where(t => t.UserId == id);

            var list = await query.ToListAsync();

            var mapped = list.Select(t => new
            {
                id = t.Id,
                transactionId = t.PaymentIntentId,
                serviceName = t.Booking?.Service?.Name ?? "Unknown Service",
                transactionAmount = t.Amount,
                paymentMethod = t.Booking?.PaymentMethod ?? "Stripe"
            }).ToList();

            var totalRecords = mapped.Count;

            if (pageSize > 0 && pageNumber > 0)
            {
                mapped = mapped.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
            }

            var result = new
            {
                records = mapped,
                totalRecords
            };

            return Ok(ApiResponse<object>.Success(result));
        }
    }
}
