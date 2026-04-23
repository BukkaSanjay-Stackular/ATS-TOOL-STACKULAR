using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using ATStool.Data;
using ATStool.DTOs;
using ATStool.Models;

namespace ATStool.Controllers
{
    [ApiController]
    [Route("api/drafts")]
    [Authorize]
    public class DraftController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DraftController(AppDbContext context)
        {
            _context = context;
        }

        private string CurrentUsername =>
            User.FindFirstValue("username") ?? User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;

        // GET /api/drafts?createdBy=&assignedTo=
        [HttpGet]
        public async Task<IActionResult> GetDrafts([FromQuery] string? createdBy, [FromQuery] string? assignedTo)
        {
            var allDrafts = await _context.Drafts.ToListAsync();

            if (!string.IsNullOrEmpty(createdBy))
            {
                allDrafts = allDrafts.Where(d => d.CreatedBy == createdBy).ToList();
            }
            else if (!string.IsNullOrEmpty(assignedTo))
            {
                allDrafts = allDrafts
                    .Where(d => d.AssignedTo != null && d.AssignedTo.Contains(assignedTo))
                    .ToList();
            }

            return Ok(allDrafts);
        }

        // POST /api/drafts
        [HttpPost]
        public async Task<IActionResult> CreateDraft([FromBody] CreateDraftDto dto)
        {
            var draft = new Draft
            {
                ExperienceLevel = dto.ExperienceLevel ?? string.Empty,
                JobTitle = dto.JobTitle ?? string.Empty,
                Location = dto.Location ?? string.Empty,
                WorkMode = dto.WorkMode ?? string.Empty,
                WorkHours = dto.WorkHours ?? string.Empty,
                Duration = dto.Duration ?? string.Empty,
                StipendSalary = dto.StipendSalary ?? string.Empty,
                FulltimeOfferSalary = dto.FulltimeOfferSalary ?? string.Empty,
                YearsOfExperience = dto.YearsOfExperience ?? string.Empty,
                RoleDescription = dto.RoleDescription,
                Status = "draft",
                CreatedBy = CurrentUsername,
                CreatedAt = DateTime.UtcNow,
            };

            _context.Drafts.Add(draft);
            await _context.SaveChangesAsync();

            return Ok(draft);
        }

        // PATCH /api/drafts/{id}
        [HttpPatch("{id:guid}")]
        public async Task<IActionResult> UpdateDraft(Guid id, [FromBody] CreateDraftDto dto)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft == null) return NotFound(new { message = "Draft not found" });
            if (draft.CreatedBy != CurrentUsername)
                return StatusCode(403, new { message = "Only the creator can update this draft" });

            if (dto.ExperienceLevel != null) draft.ExperienceLevel = dto.ExperienceLevel;
            if (dto.JobTitle != null) draft.JobTitle = dto.JobTitle;
            if (dto.Location != null) draft.Location = dto.Location;
            if (dto.WorkMode != null) draft.WorkMode = dto.WorkMode;
            if (dto.WorkHours != null) draft.WorkHours = dto.WorkHours;
            if (dto.Duration != null) draft.Duration = dto.Duration;
            if (dto.StipendSalary != null) draft.StipendSalary = dto.StipendSalary;
            if (dto.FulltimeOfferSalary != null) draft.FulltimeOfferSalary = dto.FulltimeOfferSalary;
            if (dto.YearsOfExperience != null) draft.YearsOfExperience = dto.YearsOfExperience;
            if (dto.RoleDescription != null) draft.RoleDescription = dto.RoleDescription;

            await _context.SaveChangesAsync();
            return Ok(draft);
        }

        // PATCH /api/drafts/{id}/assign
        [HttpPatch("{id:guid}/assign")]
        public async Task<IActionResult> AssignDraft(Guid id, [FromBody] AssignDraftDto dto)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft == null) return NotFound(new { message = "Draft not found" });

            draft.AssignedTo = dto.AssignedTo ?? new List<string>();
            draft.Status = "assigned";

            await _context.SaveChangesAsync();
            return Ok(draft);
        }

        // PATCH /api/drafts/{id}/role-description
        [HttpPatch("{id:guid}/role-description")]
        public async Task<IActionResult> UpdateRoleDescription(Guid id, [FromBody] RoleDescriptionDto dto)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft == null) return NotFound(new { message = "Draft not found" });

            draft.RoleDescription = dto.RoleDescription;

            await _context.SaveChangesAsync();
            return Ok(draft);
        }

        // PATCH /api/drafts/{id}/submit
        [HttpPatch("{id:guid}/submit")]
        public async Task<IActionResult> SubmitDraft(Guid id)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft == null) return NotFound(new { message = "Draft not found" });

            draft.Status = "returned";

            await _context.SaveChangesAsync();
            return Ok(draft);
        }

        // POST /api/drafts/{id}/generate
        [HttpPost("{id:guid}/generate")]
        public async Task<IActionResult> GeneratePreview(Guid id)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft == null) return NotFound(new { message = "Draft not found" });

            var assignedToText = draft.AssignedTo != null && draft.AssignedTo.Count > 0
                ? string.Join(", ", draft.AssignedTo)
                : "To be assigned";

            var previewJD = $"""
                Job Title: {draft.JobTitle}
                Experience Level: {draft.ExperienceLevel}
                Location: {draft.Location}
                Work Mode: {draft.WorkMode}
                Work Hours: {draft.WorkHours}
                Duration: {draft.Duration}
                Stipend/Salary: {draft.StipendSalary}
                Full-Time Offer Salary: {draft.FulltimeOfferSalary}
                Years of Experience: {draft.YearsOfExperience}

                Role Description:
                {draft.RoleDescription ?? "To be filled by the interviewer."}

                About the Role:
                We are looking for a talented {draft.JobTitle} to join our team. This is a {draft.WorkMode} position based in {draft.Location}.

                What We Offer:
                - Compensation: {draft.StipendSalary}
                - Work mode: {draft.WorkMode}
                - Duration: {draft.Duration}
                - Work hours: {draft.WorkHours}

                Requirements:
                - Experience level: {draft.ExperienceLevel}
                - Years of experience: {draft.YearsOfExperience}

                Assigned To: {assignedToText}
                """;

            draft.GeneratedJd = previewJD;
            await _context.SaveChangesAsync();

            return Ok(new { previewJD });
        }

        // POST /api/drafts/{id}/finalize
        [HttpPost("{id:guid}/finalize")]
        public async Task<IActionResult> FinalizeDraft(Guid id, [FromBody] FinalizeDraftDto dto)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft == null) return NotFound(new { message = "Draft not found" });

            if (dto.ExperienceLevel != null) draft.ExperienceLevel = dto.ExperienceLevel;
            if (dto.JobTitle != null) draft.JobTitle = dto.JobTitle;
            if (dto.Location != null) draft.Location = dto.Location;
            if (dto.WorkMode != null) draft.WorkMode = dto.WorkMode;
            if (dto.WorkHours != null) draft.WorkHours = dto.WorkHours;
            if (dto.Duration != null) draft.Duration = dto.Duration;
            if (dto.StipendSalary != null) draft.StipendSalary = dto.StipendSalary;
            if (dto.FulltimeOfferSalary != null) draft.FulltimeOfferSalary = dto.FulltimeOfferSalary;
            if (dto.YearsOfExperience != null) draft.YearsOfExperience = dto.YearsOfExperience;
            if (dto.RoleDescription != null) draft.RoleDescription = dto.RoleDescription;

            // Preserve existing assigned_to unless payload explicitly provides a non-empty list
            if (dto.AssignedTo != null && dto.AssignedTo.Count > 0)
                draft.AssignedTo = dto.AssignedTo;

            draft.GeneratedJd = dto.FinalJD ?? draft.GeneratedJd;
            draft.Status = "finalized";

            await _context.SaveChangesAsync();
            return Ok(draft);
        }

        // PATCH /api/drafts/{id}/dismiss
        [HttpPatch("{id:guid}/dismiss")]
        public async Task<IActionResult> DismissDraft(Guid id, [FromBody] DismissDraftDto dto)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft == null) return NotFound(new { message = "Draft not found" });

            if (!string.IsNullOrEmpty(dto.Username) && draft.AssignedTo != null)
            {
                draft.AssignedTo = draft.AssignedTo.Where(u => u != dto.Username).ToList();
                if (draft.AssignedTo.Count == 0)
                    draft.Status = "draft";
            }

            await _context.SaveChangesAsync();
            return Ok(draft);
        }

        // DELETE /api/drafts/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteDraft(Guid id)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft == null) return NotFound(new { message = "Draft not found" });

            _context.Drafts.Remove(draft);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET /api/drafts/{id}/pdf
        [HttpGet("{id:guid}/pdf")]
        public async Task<IActionResult> GetPdf(Guid id)
        {
            var draft = await _context.Drafts.FindAsync(id);
            if (draft == null) return NotFound(new { message = "Draft not found" });

            var content = draft.GeneratedJd ?? $"Job Description for {draft.JobTitle}";
            var bytes = System.Text.Encoding.UTF8.GetBytes(content);
            return File(bytes, "application/pdf", $"{draft.JobTitle}.pdf");
        }
    }
}
