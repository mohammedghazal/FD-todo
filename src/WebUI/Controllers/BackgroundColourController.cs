using Microsoft.AspNetCore.Mvc;
using Todo_App.Application.TodoLists.Queries.GetTodos;

namespace Todo_App.WebUI.Controllers;
public class BackgroundColourController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<BackgroundColourDto>>> Get()
    {
        return await Mediator.Send(new GetBackgroundColoursQuery());
    }
}
