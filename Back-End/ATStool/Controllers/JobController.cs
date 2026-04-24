using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ATStool.Data;
using ATStool.DTOs;
using ATStool.Models;
using ATStool.Services;
using ATStool.Constants;

namespace ATStool.Controllers
{
    [ApiController]
    [Route("api/drafts")]
    [Authorize]
    public class JobController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ExternalApiService _apiService;
        private readonly IConfiguration _config;

        public JobController(AppDbContext context, ExternalApiService apiService, IConfiguration config)
        {
            _context = context;
            _apiService = apiService;
            _config = config;
        }

        // GET api/drafts
        [HttpGet]
        public async Task<IActionResult> GetAllJobs()
        {
            var jobs = await _context.Jobs.Where(job => job.Status == "active").ToListAsync();
            return Ok(ApiResponse<object>.Ok("Jobs fetched successfully.", jobs));
        }

        // GET api/drafts/all - Admin/recruitment/interviewer can see all
        [HttpGet("all")]
        [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Recruitment + "," + AppRoles.Interviewer)]
        public async Task<IActionResult> GetAllJobsAdmin()
        {
            var jobs = await _context.Jobs.ToListAsync();
            return Ok(ApiResponse<object>.Ok("All jobs fetched successfully.", jobs));
        }

        // GET api/drafts/{id}
        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> GetJobById(Guid id)
        {
            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
                return NotFound(ApiResponse<string>.Fail("Job not Found."));

            return Ok(ApiResponse<object>.Ok("Job fetched successfully.", job));
        }

        //GET api/drafts/{id}/generate
        [HttpGet("{id:Guid}/generate")]
        public async Task<IActionResult> GetJobDraft(Guid id)
        {
            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
                return NotFound(ApiResponse<string>.Fail("Job not Found."));

            return Ok(ApiResponse<object>.Ok("Job fetched successfully.", job));
        }

        // POST api/drafts - Only Admin or recruitment can post jobs
        [HttpPost]
        [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Recruitment)]
        public async Task<IActionResult> CreateJob(CreateJobDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<string>.Fail("Validation failed.", errors));
            }

            var userName = User.Identity?.Name ?? "Unknown";

            var job = new Jobs
            {
                JobTitle = dto.JobTitle,
                Location = dto.Location,
                ExperienceLevel = dto.ExperienceLevel,
                WorkMode = dto.WorkMode,
                WorkHours = dto.WorkHours,
                Duration = dto.Duration,
                StipendSalary = dto.StipendSalary,
                FulltimeOfferSalary = dto.FulltimeOfferSalary,
                YearsOfExperience = dto.YearsOfExperience,
                RoleDescription = dto.RoleDescription,
                Status = "draft",
                CreatedBy = userName,
                CreatedAt = DateTime.UtcNow,
                GeneratedId = string.Empty,
                AssignedTo = []
            };

            object jobFormat = new
            {
                jobTitle = job.JobTitle,
                experienceLevel = job.ExperienceLevel,
                location = job.Location,
                workMode = job.WorkMode,
                workHours = job.WorkHours,
                duration = job.Duration,
                stipendSalary = job.StipendSalary,
                fulltimeOfferSalary = job.FulltimeOfferSalary,
                yearsOfExperience = job.YearsOfExperience,
                roleDescription = job.RoleDescription,
                companyName = "Stackular"
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            var externalUrl = _config["ExternalApi:BaseUrl"];
            var externalResponse = await _apiService.PostAsync<ExternalApiResponse>(externalUrl, jobFormat);
            job.RoleDescription = externalResponse.Jd;
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJobById), new { id = job.Id },
                ApiResponse<object>.Ok("Job created successfully.", job));
        }

        // PATCH api/drafts/{id} - Admin or recruitment can update
        [HttpPatch("{id:guid}")]
        [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Recruitment)]
        public async Task<IActionResult> UpdateJob(Guid id, PatchJobDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(ApiResponse<string>.Fail("Validation failed", errors));
            }

            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
                return NotFound(ApiResponse<string>.Fail("Job not found"));

            if (dto.JobTitle != null) job.JobTitle = dto.JobTitle;
            if (dto.Location != null) job.Location = dto.Location;
            if (dto.ExperienceLevel != null) job.ExperienceLevel = dto.ExperienceLevel;
            if (dto.WorkMode != null) job.WorkMode = dto.WorkMode;
            if (dto.WorkHours != null) job.WorkHours = dto.WorkHours;
            if (dto.Duration != null) job.Duration = dto.Duration;
            if (dto.StipendSalary != null) job.StipendSalary = dto.StipendSalary;
            if (dto.FulltimeOfferSalary != null) job.FulltimeOfferSalary = dto.FulltimeOfferSalary;
            if (dto.YearsOfExperience != null) job.YearsOfExperience = dto.YearsOfExperience;
            if (dto.RoleDescription != null) job.RoleDescription = dto.RoleDescription;
            if (dto.AssignedTo != null) job.AssignedTo = dto.AssignedTo;
            if (dto.Status != null) job.Status = dto.Status;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok("Job updated successfully.", job));
        }

        // PATCH api/drafts/{id}/toggle - Soft enable/disable a job
        [HttpPatch("{id:guid}/toggle")]
        [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Recruitment + "," + AppRoles.Interviewer)]
        public async Task<IActionResult> ToggleJobStatus(Guid id)
        {
            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
                return NotFound(ApiResponse<string>.Fail("Job not found."));

            job.Status = job.Status == "active" ? "draft" : "active";
            var status = job.Status == "active" ? "activated" : "deactivated";

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok($"Job {status} successfully.", new
            {
                job.Id,
                job.Status
            }));
        }

        // DELETE api/drafts/{id} - Hard delete, Admin or recruitment only
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = AppRoles.Admin + "," + AppRoles.Recruitment)]
        public async Task<IActionResult> DeleteJob(Guid id)
        {
            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
                return NotFound(ApiResponse<string>.Fail("Job not found."));

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string?>.Ok("Job deleted successfully.", null));
        }
    }
}
