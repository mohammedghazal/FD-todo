using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Todo_App.Domain.Entities;
public class Tag : BaseAuditableEntity
{
    public string? TagName { get; set; }

    public IList<TodoItemTag> TodoItemTag { get;  private set; } = new List<TodoItemTag>();

}
