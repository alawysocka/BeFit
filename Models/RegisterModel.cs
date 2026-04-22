using System.ComponentModel.DataAnnotations;

namespace BeFit.Models;

public class RegisterModel
{
    [Required(ErrorMessage = "Imię jest wymagane.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Nazwisko jest wymagane.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Adres email jest wymagany.")]
    [EmailAddress(ErrorMessage = "Niepoprawny format adresu email.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Hasło jest wymagane.")]
    [MinLength(6, ErrorMessage = "Hasło musi mieć co najmniej 6 znaków.")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Potwierdzenie hasła jest wymagane.")]
    [Compare("Password", ErrorMessage = "Podane hasła nie są identyczne.")]
    public string ConfirmPassword { get; set; } = string.Empty;
}