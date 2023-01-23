import { Component, TemplateRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgModel, FormControl } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import {
  TodoListsClient, TodoItemsClient, BackgroundColourClient, TagsClient,
  TodoListDto, TodoItemDto, PriorityLevelDto, BackgroundColourDto,
  CreateTodoListCommand, UpdateTodoListCommand,
  CreateTodoItemCommand, UpdateTodoItemDetailCommand, TagDto, CreateTagCommand
} from '../web-api-client';
import { IDropdownSettings, NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-todo-component',
  templateUrl: './todo.component.html',
  styleUrls: ['./todo.component.scss']
})
export class TodoComponent implements OnInit {
  debug = false;
  deleting = false;
  deleteCountDown = 0;
  deleteCountDownInterval: any;
  lists: TodoListDto[];
  priorityLevels: PriorityLevelDto[];
  dropdownSettings: IDropdownSettings = {};
  dropDownForm: FormGroup;
  dropdownList = [];
  selectedTags = [];
  tags: TagDto[];
  selectedTag: TagDto;
  backgroundColours: BackgroundColourDto[];
  selectedColour: BackgroundColourDto;
  selectedList: TodoListDto;
  selectedItem: TodoItemDto;
  newListEditor: any = {};
  listOptionsEditor: any = {};
  newListModalRef: BsModalRef;
  filteredItems: any = [];
  searchQuery = '';
  listOptionsModalRef: BsModalRef;
  deleteListModalRef: BsModalRef;
  itemDetailsModalRef: BsModalRef;
  itemDetailsFormGroup = this.fb.group({
    id: [null],
    listId: [null],
    backgroundColourId: [null],
    tags: [null],
    priority: [''],
    note: ['']
  });
  colour: any;

  tagsFilterValues: any;
  constructor(
    private listsClient: TodoListsClient,
    private itemsClient: TodoItemsClient,
    private coloursClient: BackgroundColourClient,
    private tagsClient: TagsClient,
    private modalService: BsModalService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.listsClient.get().subscribe(
      result => {
        this.lists = result.lists;
        this.priorityLevels = result.priorityLevels;
        if (this.lists.length) {
          this.selectedList = this.lists[0];
          this.filteredItems = [...this.selectedList?.items];
        }
      },
      error => console.error(error)
    );

    this.tagsClient.get().subscribe(
      result => {
        this.tags = result;
      },
      error => console.error(error)
    );

    this.coloursClient.get().subscribe(
      result => {
        this.backgroundColours = result;
      },
      error => console.error(error)
    );

    if (this.tags && this.tags.length > 0) {
      this.dropdownList = this.tags.map(x => {
        return {
          id: x.id,
          tagName: x.tagName
        }
      })
    }
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'tagName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
    };
  }
  onSearchAndTagsFilter( id: any) {
     
    this.filteredItems = this.lists.find(x => x.id === id)?.items;
    console.log(this.searchQuery);
    
    if(!!this.searchQuery) {
      this.filteredItems = [...this.selectedList.items.filter(x => x.title?.toLowerCase().includes(this.searchQuery?.toLowerCase()))];
    } else {
      this.filteredItems = [...this.selectedList.items]
    }
  if(this.tagsFilterValues?.length)
      this.filteredItems = this.filteredItems.filter(x => x.tags?.some(t => this.tagsFilterValues?.some(ft => ft.id == t.id)));
  }

  // Lists
  remainingItems(list: TodoListDto): number {
    return list.items.filter(t => !t.done).length;
  }

  showNewListModal(template: TemplateRef<any>): void {
    this.newListModalRef = this.modalService.show(template);
    setTimeout(() => document.getElementById('title').focus(), 250);
  }

  newListCancelled(): void {
    this.newListModalRef.hide();
    this.newListEditor = {};
  }

  addList(): void {
    const list = {
      id: 0,
      title: this.newListEditor.title,
      items: []
    } as TodoListDto;

    this.listsClient.create(list as CreateTodoListCommand).subscribe(
      result => {
        list.id = result;
        this.lists.push(list);
        this.selectedList = list;
        this.newListModalRef.hide();
        this.newListEditor = {};
      },
      error => {
        const errors = JSON.parse(error.response);

        if (errors && errors.Title) {
          this.newListEditor.error = errors.Title[0];
        }

        setTimeout(() => document.getElementById('title').focus(), 250);
      }
    );
  }

  showListOptionsModal(template: TemplateRef<any>) {
    this.listOptionsEditor = {
      id: this.selectedList.id,
      title: this.selectedList.title
    };

    this.listOptionsModalRef = this.modalService.show(template);
  }

  updateListOptions() {
    const list = this.listOptionsEditor as UpdateTodoListCommand;
    this.listsClient.update(this.selectedList.id, list).subscribe(
      () => {
        (this.selectedList.title = this.listOptionsEditor.title),
          this.listOptionsModalRef.hide();
        this.listOptionsEditor = {};
      },
      error => console.error(error)
    );
  }

  confirmDeleteList(template: TemplateRef<any>) {
    this.listOptionsModalRef.hide();
    this.deleteListModalRef = this.modalService.show(template);
  }

  deleteListConfirmed(): void {
    this.listsClient.delete(this.selectedList.id).subscribe(
      () => {
        this.deleteListModalRef.hide();
        this.lists = this.lists.filter(t => t.id !== this.selectedList.id);
        this.selectedList = this.lists.length ? this.lists[0] : null;
      },
      error => console.error(error)
    );
  }

  // Items
  showItemDetailsModal(template: TemplateRef<any>, item: TodoItemDto): void {
    this.selectedItem = item;
    this.itemDetailsFormGroup.patchValue(this.selectedItem);

    this.itemDetailsModalRef = this.modalService.show(template);
    this.itemDetailsModalRef.onHidden.subscribe(() => {
      this.stopDeleteCountDown();
    });
  }

  updateItemDetails(): void {
    const item = new UpdateTodoItemDetailCommand(this.itemDetailsFormGroup.value);

    item.tags = item.tags.map(x => {
      return new TagDto(x);
    });

    this.itemsClient.updateItemDetails(this.selectedItem.id, item).subscribe(
      () => {
        if (this.selectedItem.listId !== item.listId) {
          this.selectedList.items = this.selectedList.items.filter(
            i => i.id !== this.selectedItem.id
          );
          const listIndex = this.lists.findIndex(
            l => l.id === item.listId
          );
          this.selectedItem.listId = item.listId;
          this.lists[listIndex].items.push(this.selectedItem);
        }

        this.selectedItem.priority = item.priority;
        this.selectedItem.backgroundColourId = item.backgroundColourId;
        this.selectedItem.note = item.note;
        this.selectedItem.tags = item.tags || [];
        this.itemDetailsModalRef.hide();
        this.itemDetailsFormGroup.reset();
      },
      error => console.error(error)
    );
  }

  addItem() {
    const item = new TodoItemDto({
      id: 0,
      listId: this.selectedList.id,
      backgroundColourId: 0,
      priority: this.priorityLevels[0].value,

      title: '',
      done: false
    });

    this.selectedList.items.push(item);
    const index = this.selectedList.items.length - 1;
    this.editItem(item, 'itemTitle' + index);
  }

  editItem(item: TodoItemDto, inputId: string): void {
    this.selectedItem = item;
    setTimeout(() => document.getElementById(inputId).focus(), 100);
  }

  updateItem(item: TodoItemDto, pressedEnter: boolean = false): void {
    const isNewItem = item.id === 0;

    if (!item.title.trim()) {
      this.deleteItem(item);
      return;
    }

    if (item.id === 0) {
      this.itemsClient
        .create({
          ...item, listId: this.selectedList.id
        } as CreateTodoItemCommand)
        .subscribe(
          result => {
            item.id = result;
          },
          error => console.error(error)
        );
    } else {
      this.itemsClient.update(item.id, item).subscribe(
        () => console.log('Update succeeded.'),
        error => console.error(error)
      );
    }

    this.selectedItem = null;

    if (isNewItem && pressedEnter) {
      setTimeout(() => this.addItem(), 250);
    }
  }

  deleteItem(item: TodoItemDto, countDown?: boolean) {
    if (countDown) {
      if (this.deleting) {
        this.stopDeleteCountDown();
        return;
      }
      this.deleteCountDown = 3;
      this.deleting = true;
      this.deleteCountDownInterval = setInterval(() => {
        if (this.deleting && --this.deleteCountDown <= 0) {
          this.deleteItem(item, false);
        }
      }, 1000);
      return;
    }
    this.deleting = false;
    if (this.itemDetailsModalRef) {
      this.itemDetailsModalRef.hide();
    }

    if (item.id === 0) {
      const itemIndex = this.selectedList.items.indexOf(this.selectedItem);
      this.selectedList.items.splice(itemIndex, 1);
    } else {
      this.itemsClient.delete(item.id).subscribe(
        () =>
        (this.selectedList.items = this.selectedList.items.filter(
          t => t.id !== item.id
        )),
        error => console.error(error)
      );
    }
  }

  stopDeleteCountDown() {
    clearInterval(this.deleteCountDownInterval);
    this.deleteCountDown = 0;
    this.deleting = false;
  }

  getColour(item: any) {
    return this.backgroundColours?.find(x => x.id === item.backgroundColourId)?.colourName;
  }

}
