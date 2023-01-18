using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Todo_App.Application.Common.Interfaces;
using Todo_App.Domain.Enums;

namespace Todo_App.Application.TodoLists.Queries.GetTodos;
public record GetBackgroundColoursQuery : IRequest<List<BackgroundColourDto>>;

public class GetBackgroundColoursQueryHandler : IRequestHandler<GetBackgroundColoursQuery ,List< BackgroundColourDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetBackgroundColoursQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<List<BackgroundColourDto>> Handle(GetBackgroundColoursQuery request, CancellationToken cancellationToken)
    {
        return await _context.BackgroundColours
        .AsNoTracking()
        .ProjectTo<BackgroundColourDto>(_mapper.ConfigurationProvider)
        .OrderBy(t => t.Id)
        .ToListAsync(cancellationToken);
    }
}
