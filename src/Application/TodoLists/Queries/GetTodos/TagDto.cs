using AutoMapper;
using Todo_App.Domain.Entities;
using Todo_App.Application.Common.Mappings;
namespace Todo_App.Application.TodoLists.Queries.GetTodos;
public class TagDto : IMapFrom<Tag>
{
    public int Id { get; set; }
    public string? TagName { get; set; }

    public void Mapping(Profile profile)
    {
        profile.CreateMap<Tag, TagDto>();
    }
}
