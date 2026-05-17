import { format, parse } from 'date-fns';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { concatMap, filter, from, last, of, switchMap, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { Chip } from 'primeng/chip';
import { DatePickerModule } from 'primeng/datepicker';
import { EditorModule } from 'primeng/editor';
import { FileUpload } from 'primeng/fileupload';
import { PanelModule } from 'primeng/panel';
import { HistoryService } from '@my-sons-story/history/services/history.service';
import { HistoryStore } from '@my-sons-story/history/stores/history.store';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';
import { NotificationService } from '@shared/services/notification.service';

@Component({
  selector: 'app-history-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    Chip,
    DatePickerModule,
    EditorModule,
    FileUpload,
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
  private readonly historyService = inject(HistoryService);
  private readonly notify = inject(NotificationService);
  protected readonly store = inject(HistoryStore);
  protected readonly personCtx = inject(PersonContextStore);

  protected readonly editId = computed(() => this.route.snapshot.paramMap.get('id'));
  protected readonly isNew = computed(() => !this.editId());
  protected readonly pendingFiles = signal<File[]>([]);
  private readonly fileUpload = viewChild(FileUpload);

  protected readonly form = this.fb.group({
    story: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)] }),
    journalDate: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
  });

  ngOnInit(): void {
    const id = this.editId();
    if (id) {
      this.store.loadDetail({ id });
      toObservable(this.store.selected)
        .pipe(
          filter((r): r is NonNullable<typeof r> => !!r && r.id === id),
          take(1),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((r) => {
          const d = parse(r.journalDate, 'yyyy-MM-dd', new Date());
          this.form.patchValue({ story: r.story, journalDate: d });
        });
    } else {
      this.store.resetDetail();
      this.form.reset({ story: '', journalDate: null });
      this.pendingFiles.set([]);
    }
  }

  ngAfterViewInit(): void {
    queueMicrotask(() => {
      this.fileUpload()?.clear();
      this.syncPendingFromUploader();
    });
  }

  protected syncPendingFromUploader(): void {
    const fu = this.fileUpload();
    this.pendingFiles.set(fu?.files?.length ? [...fu.files] : []);
  }

  submit(): void {
    if (!this.personCtx.selectedPerson()) {
      this.notify.showToastWarn('Selecciona un hijo antes de guardar una historia.');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const journalDate = format(v.journalDate!, 'yyyy-MM-dd');
    const birthdateId = this.personCtx.selectedPerson()!.id;
    const body = { story: v.story, journalDate, birthdateId };
    const id = this.editId();
    const files = this.pendingFiles();

    const save$ = id ? this.historyService.update(id, body) : this.historyService.create(body);

    save$
      .pipe(
        switchMap((saved) => {
          const hid = saved.id;
          if (!files.length) return of(saved);
          return from(files).pipe(
            concatMap((f) => this.historyService.uploadAndRegister(hid, f)),
            last(),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notify.showToastSuccess('Historia guardada correctamente.');
          this.store.loadList();
          void this.router.navigate(['/historias']);
        },
        error: () => this.notify.showToastError('Error al guardar o subir archivos.'),
      });
  }
}
