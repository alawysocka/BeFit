using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BeFit.Models;

public class Training
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100, ErrorMessage = "Nazwa przekracza limit znaków.")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [DataType(DataType.Date)]
    public DateTime Date { get; set; }

    [Required]
    public TimeSpan Time { get; set; }

    [Required]
    [Range(1, 100)]
    public int Capacity { get; set; }

    [Required]
    public string TrainerId { get; set; } = string.Empty;

    [ForeignKey("TrainerId")]
    public ApplicationUser? Trainer { get; set; }

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}