using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Todo_App.Domain.Entities;

namespace Todo_App.Infrastructure.Persistence.Configurations;
public class BackgroundColourConfiguration : IEntityTypeConfiguration<BackgroundColour>
{
    public void Configure(EntityTypeBuilder<BackgroundColour> builder)
    {
        builder.Property(t => t.ColourName)
            .HasMaxLength(7)
            .IsRequired();
 
    }
}
