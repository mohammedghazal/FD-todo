using MediatR;
using Todo_App.Application.Common.Exceptions;
using Todo_App.Application.Common.Interfaces;
using Todo_App.Application.TodoLists.Queries.GetTodos;
using Todo_App.Domain.Entities;
using Todo_App.Domain.Enums;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace Todo_App.Application.TodoItems.Commands.UpdateTodoItemDetail;

public record UpdateTodoItemDetailCommand : IRequest
{
    public int Id { get; init; }

    public int ListId { get; init; }

    public int BackgroundColourId { get; init; }

    public PriorityLevel Priority { get; init; }

    public string? Note { get; init; }
    
    public List<TagDto>? Tags { get; init; }
}

public class UpdateTodoItemDetailCommandHandler : IRequestHandler<UpdateTodoItemDetailCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateTodoItemDetailCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(UpdateTodoItemDetailCommand request, CancellationToken cancellationToken)
    {
        if (request != null)
        {
            var entity = await _context.TodoItems
            .FindAsync(new object[] { request.Id }, cancellationToken);

            if (entity == null)
            {
                throw new NotFoundException(nameof(TodoItem), request.Id);
            }

            entity.ListId = request.ListId;
            entity.BackgroundColourId = request.BackgroundColourId;
            entity.Priority = request.Priority;
            entity.Note = request.Note;

            var currentTodoItemTags = _context.TodoItemTags.Where( x=> x.TodoItemId == request.Id );

            _context.TodoItemTags.RemoveRange(currentTodoItemTags);

            var tagsIds = request?.Tags?.Select(x => x.Id).ToList();

            if (tagsIds != null && tagsIds.Any())
            {
                foreach (var tagId in tagsIds)
                {
                   await _context.TodoItemTags.AddAsync(new TodoItemTag()
                    {
                        TagId = tagId,
                        TodoItemId = request!.Id
                    });
                }
            }
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Unit.Value;
    }
}
