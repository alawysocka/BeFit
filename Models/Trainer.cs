using System.ComponentModel.DataAnnotations;

namespace BeFit.Models;

public class Trainer
{
    [Key]
    public int Id { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

}