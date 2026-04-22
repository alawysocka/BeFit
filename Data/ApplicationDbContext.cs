using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace BeFit.Models;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Training> Trainings { get; set; }
    public DbSet<Reservation> Reservations { get; set; }

    public DbSet<Trainer> Trainers { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Reservation>()
            .HasOne(r => r.Participant)
            .WithMany(u => u.Reservations)
            .HasForeignKey(r => r.ParticipantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Reservation>()
            .HasOne(r => r.Training)
            .WithMany(t => t.Reservations)
            .HasForeignKey(r => r.TrainingId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Training>()
            .HasOne(t => t.Trainer)
            .WithMany(u => u.Trainings)
            .HasForeignKey(t => t.TrainerId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}