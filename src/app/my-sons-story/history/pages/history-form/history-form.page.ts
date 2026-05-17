import { format, parse } from 'date-fns';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { concatMap, from, last, of, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { EditorModule } from 'primeng/editor';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { HistoryService } from '@my-sons-story/history/services/history.service';
import { HistoryStore } from '@my-sons-story/history/stores/history.store';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';
import { NotificationService } from '@shared/services/notification.service';
import { compressImage } from '@my-sons-story/shared/utils/image-compress.util';

@Component({
  selector: 'app-history-form-page',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    BadgeModule,
    ButtonModule,
    DatePickerModule,
    EditorModule,
    FileUploadModule,
    PanelModule,
  ],
  templateUrl: './history-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryFormPage implements OnInit, AfterViewInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly historyService = inject(HistoryService);
  private readonly notify = inject(NotificationService);
  protected readonly store = inject(HistoryStore);
  protected readonly personCtx = inject(PersonContextStore);

  protected readonly editId = computed(() => this.route.snapshot.paramMap.get('id'));
  protected readonly isNew = computed(() => !this.editId());
  protected readonly isSaving = signal(false);
  protected readonly pendingFiles = signal<File[]>([]);
  protected storyHtml = '';

  private readonly fileUploadRef = viewChild(FileUpload);

  protected readonly form = this.fb.group({
    journalDate: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      const r = this.store.selected();
      const id = this.editId();
      if (r && id && r.id === id) {
        const d = parse(r.journalDate, 'yyyy-MM-dd', new Date());
        this.storyHtml = r.story ?? '';
        untracked(() => {
          this.form.patchValue({ journalDate: d });
          this.cdr.markForCheck();
        });
      }
    });
  }

  ngOnInit(): void {
    const id = this.editId();
    if (id) {
      this.store.loadDetail({ id });
    } else {
      this.store.resetDetail();
      this.storyHtml = '';
      this.form.reset({ journalDate: new Date() });
      this.pendingFiles.set([]);
    }
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => this.syncFiles());
  }

  protected syncFiles(): void {
    this.pendingFiles.set([...(this.fileUploadRef()?.files ?? [])]);
  }

  protected onFilesCleared(): void {
    this.pendingFiles.set([]);
  }

  protected clearAllFiles(): void {
    this.fileUploadRef()?.clear();
    this.pendingFiles.set([]);
  }

  submit(): void {
    if (!this.personCtx.selectedPerson()) {
      this.notify.showToastWarn('Selecciona un hijo antes de guardar una historia.');
      return;
    }
    if (!this.storyHtml.trim()) {
      this.notify.showToastWarn('Escribe una historia antes de guardar.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const journalDate = format(v.journalDate!, 'yyyy-MM-dd');
    const birthdateId = this.personCtx.selectedPerson()!.id;
    const body = { story: this.storyHtml, journalDate, birthdateId };
    const id = this.editId();
    const files = this.pendingFiles();

    const save$ = id ? this.historyService.update(id, body) : this.historyService.create(body);

    this.isSaving.set(true);
    save$
      .pipe(
        switchMap((saved) => {
          const hid = saved.id;
          if (!files.length) return of(saved);
          return from(files).pipe(
            concatMap((f) =>
              from(compressImage(f, 1200, 0.85)).pipe(
                switchMap((compressed) => this.historyService.uploadAndRegister(hid, compressed)),
              ),
            ),
            last(),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.notify.showToastSuccess('Historia guardada correctamente.');
          this.store.loadList();
          void this.router.navigate(['/historias']);
        },
        error: () => {
          this.isSaving.set(false);
          this.notify.showToastError('Error al guardar o subir archivos.');
        },
      });
  }
}
