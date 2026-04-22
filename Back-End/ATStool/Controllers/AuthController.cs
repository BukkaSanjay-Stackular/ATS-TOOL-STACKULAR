// Controllers/AuthController.cs
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ATStool.Models;
using ATStool.DTOs;
using ATStool.Services;
using Microsoft.AspNetCore.Mvc.ApiExplorer;

namespace ATStool.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly TokenService _tokenService;

        public AuthController(UserManager<User> userManager, TokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var validTypes = new[] { "Interviewer", "Recruiter", "Admin" };
            if (!validTypes.Contains(dto.UserType))
                return BadRequest("UserType must be Interviewer, Recruiter, or Admin.");

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                UserName = dto.UserName,
                UserType = dto.UserType   // ← UserType instead of Role
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, dto.UserType);  // ← UserType used as role

            return Ok(ApiResponse<object>.Ok("User successfully Created",user));
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(ApiResponse<string>.Fail("Validation failed.", errors));
            }

            var user = await _userManager.FindByNameAsync(dto.UserName);
            if (user == null)
                return Unauthorized(ApiResponse<string>.Fail("Invalid email or password"));

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!isPasswordValid)
                return Unauthorized(ApiResponse<string>.Fail("Invalid email or password."));

            var roles = await _userManager.GetRolesAsync(user);
            var userType = roles.FirstOrDefault() ?? "Interviewer";

            var token = _tokenService.GenerateToken(user, userType);

            var data = new { token, userType, name = user.FullName, email = user.Email };

            return Ok(ApiResponse<object>.Ok("Login successfull",data));
        }
    }
}