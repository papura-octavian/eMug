namespace eMug.Server.Dtos
{
    public record RegisterDto(string Email, string Password, string? FullName);
    public record LoginDto(string Email, string Password);
}