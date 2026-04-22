namespace ATStool.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set;}
        public string Message { get; set; }
        public T? Data { get; set; }
        public List<string> Errors { get; set; }

        public static ApiResponse<T> Ok(string message, T data) => new()
        {
            Success = true,
            Message = message,
            Data = data
        };

        public static ApiResponse<T> Fail(string message, List<string>? errors = null) => new()
        {
            Success = false,
            Message = message,
            Errors = errors ?? new()
        };
    }
}