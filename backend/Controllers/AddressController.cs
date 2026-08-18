using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeCare_BE.Data;
using HomeCare_BE.Models;
using HomeCare_BE.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace HomeCare_BE.Controllers
{
    [ApiController]
    [Route("api/address")]
    public class AddressController : ControllerBase
    {
        private readonly HomeCareDbContext _context;

        public AddressController(HomeCareDbContext context)
        {
            _context = context;
        }

        private int? GetUserIdFromToken(string authHeader)
        {
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                return null;
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
                    return userId;
            }
            catch { }
            return null;
        }

        // GET /api/address — returns paginated addresses for the current user
        [HttpGet]
        public async Task<ActionResult<ApiResponse<AddressListDto>>> GetAddresses(
            [FromHeader(Name = "Authorization")] string? authHeader = null)
        {
            var userId = GetUserIdFromToken(authHeader) ?? 2; // fallback to demo user

            var addresses = await _context.Addresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            var records = addresses.Select(a => new AddressDto
            {
                AddressId = a.Id.ToString(),
                UserId = a.UserId,
                HouseFlatNumber = a.HouseFlatNumber,
                Landmark = a.Landmark,
                FullAddress = a.FullAddress,
                SaveAs = a.SaveAs,
                Latitude = a.Latitude,
                Longitude = a.Longitude,
                CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
            }).ToList();

            var response = new AddressListDto
            {
                TotalRecords = records.Count,
                Records = records
            };

            return Ok(ApiResponse<AddressListDto>.Success(response));
        }

        // POST /api/address — create a new address
        [HttpPost]
        public async Task<ActionResult<ApiResponse<AddressDto>>> Create(
            [FromHeader(Name = "Authorization")] string? authHeader = null,
            [FromBody] CreateAddressDto? request = null)
        {
            var userId = GetUserIdFromToken(authHeader) ?? 2;

            var address = new UserAddress
            {
                UserId = userId,
                HouseFlatNumber = request.HouseFlatNumber,
                Landmark = request.Landmark,
                FullAddress = request.FullAddress,
                SaveAs = request.SaveAs,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                CreatedAt = DateTime.UtcNow
            };

            _context.Addresses.Add(address);
            await _context.SaveChangesAsync();

            var dto = new AddressDto
            {
                AddressId = address.Id.ToString(),
                UserId = address.UserId,
                HouseFlatNumber = address.HouseFlatNumber,
                Landmark = address.Landmark,
                FullAddress = address.FullAddress,
                SaveAs = address.SaveAs,
                Latitude = address.Latitude,
                Longitude = address.Longitude,
                CreatedAt = address.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
            };

            return Ok(ApiResponse<AddressDto>.Success(dto, "Address saved successfully"));
        }

        // PUT /api/address/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<ApiResponse<AddressDto>>> Update(
            int id,
            [FromHeader(Name = "Authorization")] string? authHeader = null,
            [FromBody] CreateAddressDto? request = null)
        {
            var userId = GetUserIdFromToken(authHeader) ?? 2;

            var address = await _context.Addresses.FindAsync(id);
            if (address == null || address.UserId != userId)
                return NotFound(ApiResponse<AddressDto>.Failure("Address not found"));

            address.HouseFlatNumber = request.HouseFlatNumber;
            address.Landmark = request.Landmark;
            address.FullAddress = request.FullAddress;
            address.SaveAs = request.SaveAs;
            address.Latitude = request.Latitude;
            address.Longitude = request.Longitude;

            await _context.SaveChangesAsync();

            var dto = new AddressDto
            {
                AddressId = address.Id.ToString(),
                UserId = address.UserId,
                HouseFlatNumber = address.HouseFlatNumber,
                Landmark = address.Landmark,
                FullAddress = address.FullAddress,
                SaveAs = address.SaveAs,
                Latitude = address.Latitude,
                Longitude = address.Longitude,
                CreatedAt = address.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ")
            };

            return Ok(ApiResponse<AddressDto>.Success(dto, "Address updated successfully"));
        }

        // DELETE /api/address/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult<ApiResponse<string>>> Delete(
            int id,
            [FromHeader(Name = "Authorization")] string? authHeader = null)
        {
            var userId = GetUserIdFromToken(authHeader) ?? 2;

            var address = await _context.Addresses.FindAsync(id);
            if (address == null || address.UserId != userId)
                return NotFound(ApiResponse<string>.Failure("Address not found"));

            _context.Addresses.Remove(address);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string>.Success("Address deleted successfully"));
        }

        // POST /api/address/reverse-geocode
        [HttpPost("reverse-geocode")]
        public ActionResult<ApiResponse<object>> ReverseGeocode([FromBody] ReverseGeocodeRequest request)
        {
            // Return a simple display without external API call
            var response = new
            {
                displayTitle = $"Lat: {request.Latitude:F4}, Lon: {request.Longitude:F4}",
                displaySubtitle = "Selected location"
            };
            return Ok(ApiResponse<object>.Success(response));
        }

        // GET /api/address/search?searchQuery=...
        [HttpGet("search")]
        public async Task<ActionResult<ApiResponse<List<object>>>> SearchAddress([FromQuery] string searchQuery)
        {
            // Forward search to Nominatim (OpenStreetMap) - no API key needed
            try
            {
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Add("User-Agent", "HomeCareApp/1.0");
                var url = $"https://nominatim.openstreetmap.org/search?q={Uri.EscapeDataString(searchQuery)}&format=json&limit=5&addressdetails=1";
                var responseMsg = await httpClient.GetAsync(url);
                if (responseMsg.IsSuccessStatusCode)
                {
                    var json = await responseMsg.Content.ReadAsStringAsync();
                    return Content(
                        $"{{\"isSuccess\":true,\"statusCode\":200,\"message\":\"Success\",\"data\":{json},\"errorMessages\":[]}}",
                        "application/json");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Nominatim Error] {ex.Message}");
            }

            // Fallback empty result
            return Ok(ApiResponse<List<object>>.Success(new List<object>()));
        }
    }
}
