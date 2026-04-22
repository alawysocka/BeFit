using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BeFit.Models;

public class Reservation
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string ParticipantId { get; set; } = string.Empty;

    [ForeignKey("ParticipantId")]
    public ApplicationUser? Participant { get; set; }

    [Required]
    public int TrainingId { get; set; }

    [ForeignKey("TrainingId")]
    public Training? Training { get; set; }
}