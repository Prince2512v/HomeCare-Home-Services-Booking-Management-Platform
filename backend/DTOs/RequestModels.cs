using System;
using System.Collections.Generic;

namespace HomeCare_BE.DTOs
{
    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string AccessToken { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class SendOtpRequest
    {
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyOtpRequest
    {
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }

    public class OtpUserResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class OtpVerificationResponse
    {
        public string Token { get; set; } = string.Empty;
        public OtpUserResponse User { get; set; } = new OtpUserResponse();
    }

    public class UpdateProfileRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
    }

    public class BookingRequest
    {
        public int ServiceId { get; set; }
        public DateTime BookingDate { get; set; }
        public string SlotTime { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Discount { get; set; }
        public decimal TotalAmount { get; set; }
    }

    public class SupportTicketRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    // Unified DTO that accepts both customer frontend format and legacy format
    public class CustomerSupportTicketRequest
    {
        // Customer frontend fields
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Legacy / shared fields
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Subject { get; set; }
        public string? Message { get; set; }
    }

    public class CategoryRequest
    {
        public string CategoryName { get; set; } = string.Empty;
        public int ServiceTypeId { get; set; }
    }

    public class SubCategoryRequest
    {
        public string SubCategoryName { get; set; } = string.Empty;
        public int CategoryId { get; set; }
    }

    public class ServiceRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Duration { get; set; } = string.Empty;
        public int SubCategoryId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
    }

    public class ServicePartnerApplyRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Language { get; set; } = string.Empty;
        public string ProfileImageUrl { get; set; } = string.Empty;
        public string AttachmentUrl { get; set; } = string.Empty;
        public string AssignedServices { get; set; } = string.Empty;
    }

    public class AssignExpertRequest
    {
        public int ExpertId { get; set; }
    }

    public class OfferValidateRequest
    {
        public string Code { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class CheckoutSummaryResponse
    {
        public decimal OriginalAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public string CouponCode { get; set; } = string.Empty;
    }

    public class SlotAvailabilityRequest
    {
        public int ServiceId { get; set; }
        public DateTime Date { get; set; }
    }

    public class CreatePaymentIntentRequest
    {
        public decimal Amount { get; set; }
        public int BookingId { get; set; }
    }

    public class PaymentIntentResponse
    {
        public string ClientSecret { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
    }

    public class ConfirmPaymentRequest
    {
        // Razorpay fields
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string RazorpaySignature { get; set; } = string.Empty;

        // Legacy Stripe field (kept for backwards compatibility)
        public string PaymentIntentId { get; set; } = string.Empty;
    }

    public class FailedPaymentRequest
    {
        public string PaymentIntentId { get; set; } = string.Empty; // stores razorpay order_id
    }

    public class DashboardCardsResponse
    {
        public int TotalServicesBooked { get; set; }
        public int ActiveUsers { get; set; }
        public int ActiveServicePartners { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class MetricCardDto
    {
        public decimal CurrentValue { get; set; }
        public decimal PreviousValue { get; set; }
        public decimal ChangePercent { get; set; }
        public bool IsIncrease { get; set; }
    }

    public class UpdatePhoneRequest
    {
        public string MobileNumber { get; set; } = string.Empty;
    }

    public class SendEmailOtpRequest
    {
        public string NewEmail { get; set; } = string.Empty;
    }

    public class UpdateEmailRequest
    {
        public string NewEmail { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }

    // DTO matching the frontend's ActiveOffer interface
    public class ActiveOfferResponse
    {
        public int Id { get; set; }
        public string CouponCode { get; set; } = string.Empty;
        public string CouponDescription { get; set; } = string.Empty;
        public decimal DiscountPercentage { get; set; }
        public int AppliedCount { get; set; }
        public int MaxUsage { get; set; }
        public string ExpiresAt { get; set; } = string.Empty;
    }

    // DTO matching the frontend's CheckoutSummary interface
    public class FrontendCheckoutSummary
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal ItemsTotal { get; set; }
        public decimal TaxPercentage { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public int? AppliedOfferId { get; set; }
        public string? AppliedCouponCode { get; set; }
    }

    // DTO matching the frontend's ValidateCouponRequest interface
    public class ValidateCouponFrontendRequest
    {
        public int ServiceId { get; set; }
        public int OfferId { get; set; }
    }

    // DTO matching the frontend's CashBookingRequest (paymentMethod is int: 1=Stripe, 2=Cash)
    public class FrontendBookingRequest
    {
        public int ServiceId { get; set; }
        public int ServiceTypeId { get; set; }
        public int AddressId { get; set; }
        public string BookingDate { get; set; } = string.Empty;
        public string BookingTime { get; set; } = string.Empty;
        public int PaymentMethod { get; set; } // 1=Stripe, 2=Cash
        public int? OfferId { get; set; }
    }

    // DTO matching the frontend's BookingResponseModel interface
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public string BookingDate { get; set; } = string.Empty;
        public string BookingTime { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string PaymentStatus { get; set; } = string.Empty;
        public decimal BookingAmount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public AssignedPartnerDto? AssignedPartner { get; set; }
    }

    // DTO matching the frontend's AssignedPartner interface
    public class AssignedPartnerDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? ProfileImageUrl { get; set; }
        public int TotalJobsCompleted { get; set; }
    }

    // DTO matching the frontend's Address interface
    public class AddressDto
    {
        public string AddressId { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string HouseFlatNumber { get; set; } = string.Empty;
        public string Landmark { get; set; } = string.Empty;
        public string FullAddress { get; set; } = string.Empty;
        public string SaveAs { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }

    // DTO matching the frontend's AddressListResponse interface
    public class AddressListDto
    {
        public int TotalRecords { get; set; }
        public List<AddressDto> Records { get; set; } = new();
    }

    // DTO matching the frontend's CreateAddressRequest interface
    public class CreateAddressDto
    {
        public string HouseFlatNumber { get; set; } = string.Empty;
        public string Landmark { get; set; } = string.Empty;
        public string FullAddress { get; set; } = string.Empty;
        public string SaveAs { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }

    // DTO for reverse geocode requests
    public class ReverseGeocodeRequest
    {
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }

    // DTOs for Forgot / Reset password flow
    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ForgotPasswordResponse
    {
        public string Message { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Token { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class ResetPasswordResponse
    {
        public string Message { get; set; } = string.Empty;
    }
}
