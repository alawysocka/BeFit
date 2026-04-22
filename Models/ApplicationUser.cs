using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BeFit.Models;

public class ApplicationUser : IdentityUser
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    public ICollection<Training> Trainings { get; set; } = new List<Training>();
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}