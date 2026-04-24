namespace ATStool.Constants
{
    public static class AppRoles
    {
        public const string Admin = "Admin";
        public const string Recruitment = "recruitment";
        public const string Interviewer = "interviewer";

        public static string Normalize(string? role)
        {
            if (string.IsNullOrWhiteSpace(role))
                return string.Empty;

            return role.Trim().ToLowerInvariant() switch
            {
                "recruiter" or "recruitment" => Recruitment,
                "interviewer" => Interviewer,
                "admin" => Admin,
                _ => role
            };
        }

        public static bool IsKnown(string role)
        {
            var normalized = Normalize(role);
            return normalized == Admin || normalized == Recruitment || normalized == Interviewer;
        }
    }
}
