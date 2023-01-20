using Microsoft.AspNetCore.Mvc;
using Todo_App.Application.TodoLists.Queries.GetTodos;
using Todo_App.Application.Tags.Queries;
using Todo_App.Application.TodoLists.Commands.CreateTodoList;
using Todo_App.Application.Tags.Commands.CreateTag;

namespace Todo_App.WebUI.Controllers;
public class TagsController : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TagDto>>> Get()
    {
        return await Mediator.Send(new GetTagsQuery());
    }

    [HttpPost]
    public async Task<ActionResult<int>> Create(CreateTagCommand command)
    {
        return await Mediator.Send(command);
    }
}