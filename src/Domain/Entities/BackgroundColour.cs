using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Todo_App.Domain.Entities;
public class BackgroundColour : BaseAuditableEntity
{
    public string? ColourName { get; set; }
}
