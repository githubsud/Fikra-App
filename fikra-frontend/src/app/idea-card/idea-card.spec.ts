import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdeaCard } from './idea-card';

describe('IdeaCard', () => {
  let component: IdeaCard;
  let fixture: ComponentFixture<IdeaCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IdeaCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IdeaCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
