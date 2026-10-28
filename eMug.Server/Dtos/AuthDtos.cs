namespace eMug.Server.Dtos
{
    public record RegisterDto(string Email, string Password, string ConfirmPassword, string? FullName);
    public record LoginDto(string Email, string Password);
}