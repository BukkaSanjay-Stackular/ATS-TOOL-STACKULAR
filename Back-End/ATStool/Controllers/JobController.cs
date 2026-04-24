using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ATStool.Data;
using ATStool.DTOs;
using ATStool.Models;
using ATStool.Services;


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

        public JobController(AppDbContext context,ExternalApiService apiService,IConfiguration config)
        {
            _context = context;
            _apiService = apiService;
            _config = config;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllJobs()
        {
            var jobs = await _context.Jobs.Where(job => job.IsActive).ToListAsync();

            return Ok(ApiResponse<object>.Ok("Jobs fetched successfully.", jobs));
        }

        //GET api/jobs/all -Admin/Recruiter can see all including inactive
        [HttpGet("all")]
        [Authorize(Roles = "Admin,Recruiter,Interviewer")]
        public async Task<IActionResult> GetAllJobsAdmin()
        {
            var jobs = await _context.Jobs.ToListAsync();
            return Ok(ApiResponse<object>.Ok("All jobs fetched successfully.", jobs));
        }

        //Get api/drafts/{id}
        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> GetJobById
            (Guid id)
        {
            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
            {
                return NotFound(ApiResponse<string>.Fail("Job not Found."));
            }

            return Ok(ApiResponse<object>.Ok("Job fetched successfully.", job));
        }

        //Post api/drafts - Only admin or Recruiter can post jobs
        [HttpPost]
        [Authorize(Roles = "Admin,Recruiter")]
        public async Task<IActionResult> CreateJob(CreateJobDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();

                return BadRequest(ApiResponse<string>.Fail("Validation failed.", errors));
            }

            var job = new Jobs
            {
                JobTitle = dto.JobTitle,
                Location = dto.Location,
                WorkMode = dto.WorkMode,
                WorkHours = dto.WorkHours,
                Duration = dto.Duration,
                EmploymentType = dto.EmploymentType,
                RoleDescription = dto.RoleDescription,
                AssignedTo = dto.AssignedTo,
                Stipend = dto.Stipend,
                Salary = dto.Salary,
                FullTimeOfferSalary = dto.FullTimeOfferSalary,
                ExperienceYears = dto.ExperienceYears,
                PostedDate = dto.PostedDate == default ? DateTime.UtcNow : dto.PostedDate,
                DeadLine = dto.DeadLine,
                IsActive = true
            };

            //object jobFormat = new
            //{
            //    jobTitle = job.JobTitle,
            //    experienceLevel = job.ExperienceLevel,
            //    location = job.Location,
            //    workMode = job.WorkMode,
            //    workHours = job.WorkHours,
            //    duration = job.Duration,
            //    stipend = job.Stipend.ToString(),                     // ← convert to string
            //    salary = job.Salary.ToString(),                       // ← convert to string
            //    fullTimeOfferSalary = job.FullTimeOfferSalary.ToString(), // ← convert to string
            //    experienceYears = job.ExperienceYears.ToString(),     // ← convert to string
            //    roleDescription = job.RoleDescription,
            //    companyName = "Stackular"
            //};


            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();


            //Send job to external API and get RoleDescription back
            //var externalUrl = _config["ExternalApi:BaseUrl"];

            //var testPayload = new
            //{
            //    userId = 1,
            //    id = 1,
            //    title = "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
            //    body = "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
            //};

            //var externalResponse = await _apiService.PostAsync<ExternalApiResponse>(externalUrl, jobFormat); // ✅ returns object - main

            //job.RoleDescription = externalResponse.Jd; - main

            //Update RoleDescription with the response from external API
            //job.RoleDescription = externalResponse.jd;

            //job.RoleDescription = externalResponse.body;
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetJobById), new
            {
                id
             = job.Id
            }, ApiResponse<object>.Ok("Job created successfully.", job));
        }

        //PUT api/drafts/{id} - Admin or Recruiter,Interviewer can update
        [HttpPatch("{id:guid}")]
        [Authorize(Roles = "Admin,Recruiter")]
        public async Task<IActionResult> UpdateJob(Guid id, PatchJobDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();

                return BadRequest(ApiResponse<string>.Fail("Validation failed", errors));
            }

            var job = await _context.Jobs.FindAsync(id);

            if (job == null)
            {
                return NotFound(ApiResponse<string>.Fail("Job not found"));
            }

            // Only update fields that are provided (not null)
            if (dto.JobTitle != null) job.JobTitle = dto.JobTitle;
            if (dto.Location != null) job.Location = dto.Location;
            if (dto.EmploymentType != null) job.EmploymentType = dto.EmploymentType;
            if (dto.WorkMode != null) job.WorkMode = dto.WorkMode;
            if (dto.WorkHours != null) job.WorkHours = dto.WorkHours;
            if (dto.Duration != null) job.Duration = dto.Duration;
            if (dto.RoleDescription != null) job.RoleDescription = dto.RoleDescription;
            if (dto.AssignedTo != null) job.AssignedTo = dto.AssignedTo;
            if (dto.Stipend != null) job.Stipend = dto.Stipend.Value;
            if (dto.Salary != null) job.Salary = dto.Salary.Value;
            if (dto.FullTimeOfferSalary != null) job.FullTimeOfferSalary = dto.FullTimeOfferSalary.Value;
            if (dto.ExperienceYears != null) job.ExperienceYears = dto.ExperienceYears.Value;
            if (dto.PostedDate != null) job.PostedDate = dto.PostedDate.Value;
            if (dto.DeadLine != null) job.DeadLine = dto.DeadLine.Value;
            if (dto.IsActive != null) job.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();

            return Ok(ApiResponse<object>.Ok("Job updated successfully.", job));
        }





        //Patch api/drafts/{id}/toggle - Soft enable/disable a job
        [HttpPatch("{id:guid}/toggle")]
        [Authorize(Roles = "Admin,Recruiter,Interviewer")]
        public async Task<IActionResult> ToggleJobStatus(Guid id)
        {
            var job = await _context.Jobs.FindAsync(id);
            if (job == null)
            {
                return NotFound(ApiResponse<string>.Fail("Job not found."));
            }

            job.IsActive = !job.IsActive;
            await _context.SaveChangesAsync();

            var status = job.IsActive ? "activated" : "deactivated";

            return Ok(ApiResponse<object>.Ok($"Job {status} successfully.", new
            {
                job.Id,
                job
            .IsActive
            }));

        }

        //DELETE api/drafts/{id} - Hard delete, Admin only
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,Recruiter")]
        public async Task<IActionResult> DeleteJob(Guid id)
        {
            var job = await _context.Jobs.FindAsync(id);

            if (job == null) return NotFound(ApiResponse<string>.Fail("Job not found."));

            _context.Jobs.Remove(job);
            await _context.SaveChangesAsync();

            return Ok(ApiResponse<string?>.Ok("Job deleted successfully.", null));
        }

    }

}