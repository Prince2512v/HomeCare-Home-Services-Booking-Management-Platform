using System.Collections.Generic;

namespace HomeCare_BE.DTOs
{
    public class ApiResponse<T>
    {
        public bool IsSuccess { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string> ErrorMessages { get; set; } = new List<string>();

        public static ApiResponse<T> Success(T data, string message = "Success", int statusCode = 200)
        {
            return new ApiResponse<T>
            {
                IsSuccess = true,
                StatusCode = statusCode,
                Message = message,
                Data = data
            };
        }

        public static ApiResponse<T> Failure(string message, int statusCode = 400, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                IsSuccess = false,
                StatusCode = statusCode,
                Message = message,
                Data = default,
                ErrorMessages = errors ?? new List<string> { message }
            };
        }
    }
}
