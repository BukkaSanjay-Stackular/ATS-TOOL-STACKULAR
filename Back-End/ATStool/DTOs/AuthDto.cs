// DTOs/AuthDto.cs
namespace ATStool.DTOs
{
    public class RegisterDto
    {
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string UserType { get; set; }  
    }

    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}