using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.SignalR;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using HomeCare_BE.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly HomeCareDbContext _context;
        private readonly IHubContext<BookingHub> _hubContext;

        public BookingController(HomeCareDbContext context, IHubContext<BookingHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpGet("list")]
        public async Task<ActionResult<ApiResponse<object>>> GetList(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? serviceTypeId = null,
            [FromQuery] string? date = null,
            [FromQuery] string? time = null,
            [FromQuery] int? bookedServicesMin = null,
            [FromQuery] int? bookedServicesMax = null,
            [FromQuery] decimal? amountMin = null,
            [FromQuery] decimal? amountMax = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] string? status = null,
            [FromQuery] string? sortField = null,
            [FromQuery] string? sortDirection = null)
        {
            var bookings = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Service)
                    .ThenInclude(s => s!.SubCategory)
                        .ThenInclude(sc => sc!.Category)
                .ToListAsync();

            var addresses = await _context.Addresses.ToListAsync();

            // Group by UserId and PaymentMethod
            var grouped = bookings.GroupBy(b => new { b.UserId, b.PaymentMethod }).Select(g =>
            {
                var first = g.First();
                var userBookings = g.ToList();

                // Get user address
                var addr = addresses.FirstOrDefault(a => a.UserId == g.Key.UserId);
                var addressText = addr?.FullAddress ?? first.Address;

                return new
                {
                    userId = g.Key.UserId,
                    customerName = first.User?.Name ?? "Unknown",
                    mobileNumber = first.User?.Phone ?? "",
                    email = first.User?.Email ?? "",
                    totalBookedServices = userBookings.Count,
                    address = addressText,
                    totalBookingAmount = userBookings.Sum(b => b.TotalAmount),
                    paymentMethod = g.Key.PaymentMethod,
                    bookingsList = userBookings
                };
            }).ToList();

            var filtered = grouped.AsQueryable();

            if (serviceTypeId.HasValue)
            {
                filtered = filtered.Where(g => g.bookingsList.Any(b => b.Service != null && 
                                                                       b.Service.SubCategory != null && 
                                                                       b.Service.SubCategory.Category != null && 
                                                                       b.Service.SubCategory.Category.ServiceTypeId == serviceTypeId.Value));
            }

            if (!string.IsNullOrEmpty(date))
            {
                if (DateTime.TryParse(date, out DateTime parsedDate))
                {
                    filtered = filtered.Where(g => g.bookingsList.Any(b => b.BookingDate.Date == parsedDate.Date));
                }
            }

            if (!string.IsNullOrEmpty(time))
            {
                filtered = filtered.Where(g => g.bookingsList.Any(b => b.SlotTime.Contains(time, StringComparison.OrdinalIgnoreCase)));
            }

            if (bookedServicesMin.HasValue)
            {
                filtered = filtered.Where(g => g.totalBookedServices >= bookedServicesMin.Value);
            }

            if (bookedServicesMax.HasValue)
            {
                filtered = filtered.Where(g => g.totalBookedServices <= bookedServicesMax.Value);
            }

            if (amountMin.HasValue)
            {
                filtered = filtered.Where(g => g.totalBookingAmount >= amountMin.Value);
            }

            if (amountMax.HasValue)
            {
                filtered = filtered.Where(g => g.totalBookingAmount <= amountMax.Value);
            }

            if (!string.IsNullOrEmpty(paymentMethod))
            {
                filtered = filtered.Where(g => g.paymentMethod.Equals(paymentMethod, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrEmpty(status))
            {
                filtered = filtered.Where(g => g.bookingsList.Any(b => b.Status.Equals(status, StringComparison.OrdinalIgnoreCase)));
            }

            var finalGroupedList = filtered.ToList();

            var maxAmount = finalGroupedList.Any() ? finalGroupedList.Max(g => g.totalBookingAmount) : 0;
            var maxBookedServices = finalGroupedList.Any() ? finalGroupedList.Max(g => g.totalBookedServices) : 0;

            if (!string.IsNullOrEmpty(sortField))
            {
                var desc = sortDirection?.Equals("desc", StringComparison.OrdinalIgnoreCase) == true;
                finalGroupedList = sortField.ToLower() switch
                {
                    "customername" or "name" => desc ? finalGroupedList.OrderByDescending(g => g.customerName).ToList() : finalGroupedList.OrderBy(g => g.customerName).ToList(),
                    "totalbookedservices" or "bookedservices" => desc ? finalGroupedList.OrderByDescending(g => g.totalBookedServices).ToList() : finalGroupedList.OrderBy(g => g.totalBookedServices).ToList(),
                    "totalbookingamount" or "amount" => desc ? finalGroupedList.OrderByDescending(g => g.totalBookingAmount).ToList() : finalGroupedList.OrderBy(g => g.totalBookingAmount).ToList(),
                    _ => finalGroupedList
                };
            }

            var totalRecords = finalGroupedList.Count;

            if (pageSize > 0 && pageNumber > 0)
            {
                finalGroupedList = finalGroupedList.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
            }

            var records = finalGroupedList.Select(g => new
            {
                userId = g.userId,
                customerName = g.customerName,
                mobileNumber = g.mobileNumber,
                email = g.email,
                totalBookedServices = g.totalBookedServices,
                address = g.address,
                totalBookingAmount = g.totalBookingAmount,
                paymentMethod = g.paymentMethod
            }).ToList();

            var result = new
            {
                records,
                totalRecords,
                filterMeta = new
                {
                    maxAmount,
                    maxBookedServices
                }
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        [HttpPost]
        [Route("/api/booking")]
        public async Task<ActionResult<ApiResponse<BookingResponseDto>>> Create([FromHeader(Name = "Authorization")] string? authHeader = null, [FromBody] FrontendBookingRequest request = null!)
        {
            var userId = GetUserIdFromToken(authHeader);
            if (userId == null)
            {
                userId = 2;
            }

            var service = await _context.Services.FindAsync(request.ServiceId);
            if (service == null)
            {
                return NotFound(ApiResponse<BookingResponseDto>.Failure("Service not found"));
            }

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
            {
                matchingExperts = experts;
            }

            ServicePartner? expert = null;
            if (matchingExperts.Any())
            {
                // Find the expert with the fewest bookings to distribute load
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

            var paymentMethodStr = request.PaymentMethod == 1 ? "Stripe" : "Cash";

            var booking = new Booking
            {
                UserId = userId.Value,
                ServiceId = request.ServiceId,
                ServicePartnerId = expert?.Id,
                BookingDate = parsedDate,
                SlotTime = request.BookingTime ?? "",
                Status = expert != null ? "Assigned" : "Pending",
                Address = $"AddressId:{request.AddressId}",
                PaymentMethod = paymentMethodStr,
                PaymentStatus = paymentMethodStr == "Stripe" ? "Paid" : "Pending",
                Amount = service.Price,
                Discount = 0,
                TotalAmount = service.Price,
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Create a Transaction record so admin Payments & Transactions page shows data
            var transactionPrefix = paymentMethodStr == "Stripe" ? "pi_" : "txn_";
            var transaction = new Transaction
            {
                BookingId = booking.Id,
                UserId = userId.Value,
                Amount = booking.TotalAmount,
                PaymentIntentId = transactionPrefix + Guid.NewGuid().ToString().Substring(0, 10),
                Status = "Succeeded",
                CreatedAt = DateTime.UtcNow
            };
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            booking.Service = service;
            booking.User = await _context.Users.FindAsync(userId.Value);
            booking.ServicePartner = expert;

            try
            {
                var notification = new
                {
                    bookingId = booking.Id,
                    serviceName = service.Name,
                    customerName = booking.User?.Name ?? "Customer",
                    amount = booking.TotalAmount,
                    bookingDate = booking.BookingDate.ToString("yyyy-MM-dd"),
                    slotTime = booking.SlotTime,
                    status = booking.Status
                };
                await _hubContext.Clients.All.SendAsync("NewBookingCreated", notification);
            }
            catch (Exception ex)
            {
                Console.WriteLine("[SignalR Hub Notification Exception]: " + ex.Message);
            }

            var response = new BookingResponseDto
            {
                Id = booking.Id,
                BookingDate = booking.BookingDate.ToString("yyyy-MM-dd"),
                BookingTime = booking.SlotTime,
                Status = booking.Status,
                PaymentStatus = booking.PaymentStatus,
                BookingAmount = booking.TotalAmount,
                PaymentMethod = booking.PaymentMethod,
                DurationMinutes = 0,
                AssignedPartner = expert != null && expert.User != null ? new AssignedPartnerDto
                {
                    Id = expert.Id,
                    FullName = expert.User.Name,
                    ProfileImageUrl = expert.ProfileImageUrl,
                    TotalJobsCompleted = 0
                } : null
            };

            return Ok(ApiResponse<BookingResponseDto>.Success(response, "Booking created successfully"));
        }

        [HttpGet("my-bookings")]
        public async Task<ActionResult<ApiResponse<object>>> GetMyBookings(
            [FromHeader(Name = "Authorization")] string? authHeader = null,
            [FromQuery] int? tab = null)
        {
            var userId = GetUserIdFromToken(authHeader) ?? 2;

            var query = _context.Bookings
                .Include(b => b.Service)
                    .ThenInclude(s => s!.SubCategory)
                        .ThenInclude(sc => sc!.Category)
                            .ThenInclude(c => c!.ServiceType)
                .Include(b => b.ServicePartner)
                    .ThenInclude(sp => sp!.User)
                .Where(b => b.UserId == userId);

            if (tab.HasValue)
            {
                if (tab.Value == 1) // Upcoming
                {
                    query = query.Where(b => b.Status == "Pending" || b.Status == "Assigned");
                }
                else if (tab.Value == 2) // Completed
                {
                    query = query.Where(b => b.Status == "Completed" || b.Status == "Cancelled");
                }
            }

            var bookingsList = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
            var userAddresses = await _context.Addresses.Where(a => a.UserId == userId).ToListAsync();

            var mapped = bookingsList.Select(b => {
                // Parse duration
                int durationInMinutes = 60; // default fallback
                if (b.Service != null && !string.IsNullOrEmpty(b.Service.Duration))
                {
                    // e.g. "4 hours" or "1.5 hours" or "60 minutes"
                    var durationStr = b.Service.Duration.ToLower();
                    if (durationStr.Contains("hour"))
                    {
                        var numStr = new string(durationStr.TakeWhile(c => char.IsDigit(c) || c == '.').ToArray());
                        if (double.TryParse(numStr, out double hours))
                        {
                            durationInMinutes = (int)(hours * 60);
                        }
                    }
                    else if (durationStr.Contains("min"))
                    {
                        var numStr = new string(durationStr.TakeWhile(c => char.IsDigit(c)).ToArray());
                        if (int.TryParse(numStr, out int mins))
                        {
                            durationInMinutes = mins;
                        }
                    }
                }

                // Map status to frontend enum values:
                // Pending = 1, Confirmed = 2, Completed = 3, Cancelled = 4
                int statusEnum = 1; // Default Pending
                if (b.Status == "Assigned") statusEnum = 2; // Confirmed
                else if (b.Status == "Completed") statusEnum = 3;
                else if (b.Status == "Cancelled") statusEnum = 4;

                // Map payment status: Failed = 1, Success = 2, Pending = 3
                int paymentStatusEnum = 3; // Default Pending
                if (b.PaymentStatus == "Paid") paymentStatusEnum = 2;
                else if (b.PaymentStatus == "Failed") paymentStatusEnum = 1;

                // Find address
                UserAddress? addressObj = null;
                if (!string.IsNullOrEmpty(b.Address) && b.Address.StartsWith("AddressId:"))
                {
                    if (int.TryParse(b.Address.Substring("AddressId:".Length), out int addrId))
                    {
                        addressObj = userAddresses.FirstOrDefault(a => a.Id == addrId);
                    }
                }
                if (addressObj == null)
                {
                    addressObj = userAddresses.FirstOrDefault();
                }

                var addressMapped = addressObj != null ? new
                {
                    addressId = addressObj.Id,
                    houseFlatNumber = addressObj.HouseFlatNumber,
                    landmark = addressObj.Landmark,
                    fullAddress = addressObj.FullAddress,
                    saveAs = addressObj.SaveAs
                } : null;

                var partnerMapped = b.ServicePartner != null ? new
                {
                    id = b.ServicePartner.Id,
                    fullName = b.ServicePartner.User?.Name ?? "Expert",
                    profileImageUrl = b.ServicePartner.ProfileImageUrl,
                    role = "Expert Partner",
                    mobileNumber = b.ServicePartner.User?.Phone ?? ""
                } : null;

                return new
                {
                    id = b.Id,
                    serviceId = b.ServiceId,
                    serviceName = b.Service?.Name ?? "Unknown",
                    durationInMinutes = durationInMinutes,
                    serviceTypeId = b.Service?.SubCategory?.Category?.ServiceTypeId ?? 0,
                    serviceTypeName = b.Service?.SubCategory?.Category?.ServiceType?.ServiceName ?? "Unknown",
                    bookingDate = b.BookingDate.ToString("yyyy-MM-dd"),
                    bookingTime = b.SlotTime,
                    bookingAmount = b.TotalAmount,
                    status = statusEnum,
                    paymentStatus = paymentStatusEnum,
                    address = addressMapped,
                    assignedPartner = partnerMapped
                };
            }).ToList();

            return Ok(ApiResponse<object>.Success(mapped));
        }

        [HttpGet("{userId}/details")]
        public async Task<ActionResult<ApiResponse<object>>> GetDetailsByUser(
            int userId,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] int? serviceTypeId = null,
            [FromQuery] string? date = null,
            [FromQuery] string? time = null,
            [FromQuery] decimal? amountMin = null,
            [FromQuery] decimal? amountMax = null,
            [FromQuery] string? status = null)
        {
            var query = _context.Bookings
                .Include(b => b.Service)
                    .ThenInclude(s => s!.SubCategory)
                        .ThenInclude(sc => sc!.Category)
                .Include(b => b.ServicePartner)
                    .ThenInclude(sp => sp!.User)
                .Where(b => b.UserId == userId);

            if (!string.IsNullOrEmpty(paymentMethod))
            {
                query = query.Where(b => b.PaymentMethod == paymentMethod);
            }

            if (serviceTypeId.HasValue)
            {
                query = query.Where(b => b.Service != null && 
                                         b.Service.SubCategory != null && 
                                         b.Service.SubCategory.Category != null && 
                                         b.Service.SubCategory.Category.ServiceTypeId == serviceTypeId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(b => b.Status == status);
            }

            var bookings = await query.ToListAsync();

            var mapped = bookings.Select(b => new
            {
                bookingId = b.Id,
                serviceId = b.ServiceId,
                serviceName = b.Service?.Name ?? "",
                serviceType = b.Service?.SubCategory?.Category?.CategoryName ?? "",
                bookingDate = b.BookingDate.ToString("yyyy-MM-dd"),
                bookingTime = b.SlotTime,
                assignedPartnerId = b.ServicePartnerId,
                assignedExpertName = b.ServicePartner?.User?.Name,
                assignedExpertImageUrl = b.ServicePartner?.ProfileImageUrl,
                status = b.Status,
                bookingAmount = b.TotalAmount,
                canChangeExpert = b.Status == "Pending" || b.Status == "Assigned",
                canComplete = b.Status == "Assigned",
                canCancel = b.Status == "Pending" || b.Status == "Assigned",
                canDelete = b.Status == "Completed" || b.Status == "Cancelled"
            }).ToList();

            return Ok(ApiResponse<object>.Success(mapped));
        }

        [HttpGet("available-experts")]
        public async Task<ActionResult<ApiResponse<List<ServicePartner>>>> GetAvailableExperts()
        {
            var experts = await _context.ServicePartners
                .Include(sp => sp.User)
                .Where(sp => sp.Status == "Approved" && sp.IsActive)
                .ToListAsync();

            return Ok(ApiResponse<List<ServicePartner>>.Success(experts));
        }

        [HttpPost("change-expert")]
        public async Task<ActionResult<ApiResponse<Booking>>> ChangeExpert([FromQuery] int bookingId, [FromBody] AssignExpertRequest request)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return NotFound(ApiResponse<Booking>.Failure("Booking not found"));

            var expert = await _context.ServicePartners.FindAsync(request.ExpertId);
            if (expert == null) return NotFound(ApiResponse<Booking>.Failure("Expert not found"));

            booking.ServicePartnerId = expert.Id;
            booking.Status = "Assigned";
            await _context.SaveChangesAsync();

            // Populate navigations
            booking.ServicePartner = expert;
            booking.Service = await _context.Services.FindAsync(booking.ServiceId);

            return Ok(ApiResponse<Booking>.Success(booking, "Expert assigned successfully"));
        }

        [HttpPut("{bookingId}/complete")]
        public async Task<ActionResult<ApiResponse<Booking>>> Complete(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return NotFound(ApiResponse<Booking>.Failure("Booking not found"));

            booking.Status = "Completed";
            booking.PaymentStatus = "Paid";
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<Booking>.Success(booking, "Booking completed successfully"));
        }

        [HttpPost("cancel")]
        public async Task<ActionResult<ApiResponse<Booking>>> Cancel([FromQuery] int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return NotFound(ApiResponse<Booking>.Failure("Booking not found"));

            booking.Status = "Cancelled";
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<Booking>.Success(booking, "Booking cancelled successfully"));
        }

        [HttpDelete("customer/{userId}/payment/{paymentMethod}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteBookingsByPayment(int userId, string paymentMethod)
        {
            var bookings = await _context.Bookings
                .Where(b => b.UserId == userId && b.PaymentMethod == paymentMethod)
                .ToListAsync();

            _context.Bookings.RemoveRange(bookings);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.Success("Bookings deleted successfully"));
        }

        [HttpDelete("{bookingId}")]
        public async Task<ActionResult<ApiResponse<string>>> DeleteBooking(int bookingId)
        {
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null) return NotFound(ApiResponse<string>.Failure("Booking not found"));

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.Success("Booking deleted successfully"));
        }

        [HttpGet("{bookingId}/invoice")]
        public async Task<IActionResult> DownloadInvoice(int bookingId)
        {
            var booking = await _context.Bookings
                .Include(b => b.Service)
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
            {
                return NotFound();
            }

            var customerName = (booking.User?.Name ?? "Customer").Replace("(", "").Replace(")", "");
            var serviceName = (booking.Service?.Name ?? "Service").Replace("(", "").Replace(")", "");
            var amount = booking.TotalAmount;
            var dateStr = booking.BookingDate.ToString("yyyy-MM-dd");
            var paymentStatus = booking.PaymentStatus;
            var paymentMethod = booking.PaymentMethod;

            // Resolve actual user address
            string fullAddress = booking.Address;
            if (!string.IsNullOrEmpty(booking.Address) && booking.Address.StartsWith("AddressId:"))
            {
                if (int.TryParse(booking.Address.Substring("AddressId:".Length), out int addrId))
                {
                    var addressObj = await _context.Addresses.FindAsync(addrId);
                    if (addressObj != null)
                    {
                        fullAddress = addressObj.FullAddress;
                    }
                }
            }
            fullAddress = (fullAddress ?? "Customer Address").Replace("(", "").Replace(")", "");
            if (fullAddress.Length > 40)
            {
                fullAddress = fullAddress.Substring(0, 37) + "...";
            }

            // Construct drawing commands outside BT/ET, and text commands inside BT/ET
            var streamParts = new List<string>
            {
                // Header Bar (Indigo color)
                "0.31 0.27 0.90 rg",
                "50 700 512 60 re f",
                
                // Header Text
                "BT",
                "/F2 20 Tf",
                "1 1 1 rg",
                "70 722 Td",
                "(HomeCare Invoice) Tj",
                "ET",

                // Info Box background (Light gray)
                "0.95 0.95 0.96 rg",
                "50 540 512 140 re f",
                
                // Info Box border (Gray)
                "0.8 0.8 0.8 RG",
                "1 w",
                "50 540 512 140 re s",

                // Info Box Left Column Text
                "BT",
                "/F2 11 Tf",
                "0.12 0.16 0.22 rg",
                "70 645 Td",
                "(INVOICE TO:) Tj",
                "ET",

                "BT",
                "/F1 14 Tf",
                "0.12 0.16 0.22 rg",
                "70 620 Td",
                $"({customerName}) Tj",
                "ET",

                "BT",
                "/F1 11 Tf",
                "0.37 0.41 0.49 rg",
                "70 598 Td",
                $"({fullAddress}) Tj",
                "ET",

                // Info Box Right Column Text
                "BT",
                "/F2 11 Tf",
                "0.12 0.16 0.22 rg",
                "330 645 Td",
                $"Invoice No: #INV-{booking.Id} Tj",
                "ET",

                "BT",
                "/F1 11 Tf",
                "0.37 0.41 0.49 rg",
                "330 620 Td",
                $"Date: {dateStr} Tj",
                "ET",

                "BT",
                "/F1 11 Tf",
                "0.37 0.41 0.49 rg",
                "330 598 Td",
                $"Payment Method: {paymentMethod} Tj",
                "ET",

                "BT",
                "/F1 11 Tf",
                "0.37 0.41 0.49 rg",
                "330 576 Td",
                $"Status: {paymentStatus} Tj",
                "ET",

                // Table Header background
                "0.90 0.90 0.92 rg",
                "50 460 512 30 re f",

                // Table Header Text
                "BT",
                "/F2 11 Tf",
                "0.12 0.16 0.22 rg",
                "70 470 Td",
                "(Service Booked) Tj",
                "ET",

                "BT",
                "/F2 11 Tf",
                "0.12 0.16 0.22 rg",
                "450 470 Td",
                "(Amount) Tj",
                "ET",

                // Table Row Text
                "BT",
                "/F1 12 Tf",
                "0.12 0.16 0.22 rg",
                "70 420 Td",
                $"({serviceName}) Tj",
                "ET",

                "BT",
                "/F1 12 Tf",
                "0.12 0.16 0.22 rg",
                "450 420 Td",
                $"(${amount}) Tj",
                "ET",

                // Underline line
                "0.90 0.90 0.92 RG",
                "1 w",
                "50 400 m",
                "562 400 l S",

                // Total Box background
                "0.93 0.95 0.97 rg",
                "330 310 232 50 re f",
                
                // Total Box border
                "0.31 0.27 0.90 RG",
                "1.5 w",
                "330 310 232 50 re s",

                // Total Box Text
                "BT",
                "/F2 12 Tf",
                "0.31 0.27 0.90 rg",
                "350 330 Td",
                "(Total Paid:) Tj",
                "ET",

                "BT",
                "/F2 14 Tf",
                "0.31 0.27 0.90 rg",
                "470 330 Td",
                $"(${amount}) Tj",
                "ET",

                // Footer Text
                "BT",
                "/F1 10 Tf",
                "0.5 0.5 0.5 rg",
                "220 180 Td",
                "(Thank you for using HomeCare!) Tj",
                "ET",

                "BT",
                "/F1 9 Tf",
                "0.6 0.6 0.6 rg",
                "170 160 Td",
                "(If you have any questions, please contact our support.) Tj",
                "ET"
            };

            string streamContent = string.Join("\n", streamParts);
            byte[] streamBytes = System.Text.Encoding.UTF8.GetBytes(streamContent);
            int streamLength = streamBytes.Length;

            // Construct full PDF containing page resources, contents, catalog, and trailer
            string pdfHeader = "%PDF-1.4\n" +
                               "1 0 obj\n" +
                               "<< /Type /Catalog /Pages 2 0 R >>\n" +
                               "endobj\n" +
                               "2 0 obj\n" +
                               "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n" +
                               "endobj\n" +
                               "3 0 obj\n" +
                               "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] " +
                               "/Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >> " +
                               "/Contents 4 0 R >>\n" +
                               "endobj\n" +
                               "4 0 obj\n" +
                               $"<< /Length {streamLength} >>\n" +
                               "stream\n";

            string pdfFooter = "\nendstream\n" +
                               "endobj\n" +
                               "xref\n" +
                               "0 5\n" +
                               "0000000000 65535 f\n" +
                               "0000000009 00000 n\n" +
                               "0000000062 00000 n\n" +
                               "0000000121 00000 n\n" +
                               "0000000300 00000 n\n" +
                               "trailer\n" +
                               "<< /Size 5 /Root 1 0 R >>\n" +
                               "startxref\n" +
                               "480\n" +
                               "%%EOF";

            byte[] headerBytes = System.Text.Encoding.UTF8.GetBytes(pdfHeader);
            byte[] footerBytes = System.Text.Encoding.UTF8.GetBytes(pdfFooter);

            byte[] fullPdfBytes = new byte[headerBytes.Length + streamBytes.Length + footerBytes.Length];
            Buffer.BlockCopy(headerBytes, 0, fullPdfBytes, 0, headerBytes.Length);
            Buffer.BlockCopy(streamBytes, 0, fullPdfBytes, headerBytes.Length, streamBytes.Length);
            Buffer.BlockCopy(footerBytes, 0, fullPdfBytes, headerBytes.Length + streamBytes.Length, footerBytes.Length);

            return File(fullPdfBytes, "application/pdf", $"invoice-{bookingId}.pdf");
        }

        // Slot Availability
        [HttpGet("slot-availability")]
        [Route("/api/booking/slot-availability")]
        public async Task<ActionResult<ApiResponse<object>>> SlotAvailability(
            [FromQuery] int serviceId,
            [FromQuery] int serviceTypeId,
            [FromQuery] string bookingDate,
            [FromQuery] string bookingTime)
        {
            // Find all active and approved partners
            var experts = await _context.ServicePartners
                .Include(sp => sp.User)
                .Where(sp => sp.Status == "Approved" && sp.IsActive)
                .ToListAsync();

            // Filter by assigned services
            var expert = experts
                .FirstOrDefault(sp => sp.AssignedServices.Split(',', StringSplitOptions.RemoveEmptyEntries)
                                       .Select(s => s.Trim())
                                       .Contains(serviceId.ToString()));

            // Fallback to the first approved partner if none explicitly matched
            if (expert == null)
            {
                expert = experts.FirstOrDefault();
            }

            var result = new
            {
                isAvailable = expert != null,
                message = expert != null ? "Slot is available" : "No partner available for this slot",
                partner = expert != null ? new { id = expert.Id, name = expert.User?.Name ?? "Expert" } : null
            };

            return Ok(ApiResponse<object>.Success(result));
        }

        private int? GetUserIdFromToken(string? authHeader)
        {
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                return null;
            }

            try
            {
                var token = authHeader.Substring("Bearer ".Length);
                var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var key = System.Text.Encoding.ASCII.GetBytes("SecretKeySuperLongNameForTestingJWTBearer12345");
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
