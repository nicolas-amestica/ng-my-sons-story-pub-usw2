import { format, parse } from 'date-fns';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, of, switchMap, take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { BirthdateService } from '@my-sons-story/birthdate/services/birthdate.service';
import { BirthdateStore } from '@my-sons-story/birthdate/stores/birthdate.store';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';
import { NotificationService } from '@shared/services/notification.service';
import { STORAGE_KEYS } from '@shared/constants/storage-keys.constant';

@Component({
  selector: 'app-birthdate-form-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    CheckboxModule,
    InputTextModule,
    DatePickerModule,
    PanelModule,
    MessageModule,
  ],
  templateUrl: './birthdate-form.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BirthdateFormPage implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly birthService = inject(BirthdateService);
  private readonly notify = inject(NotificationService);
  protected readonly store = inject(BirthdateStore);
  protected readonly personCtx = inject(PersonContextStore);

  protected readonly editId = computed(() => this.route.snapshot.paramMap.get('id'));
  protected readonly isNew = computed(() => !this.editId());

  // Foto de perfil
  protected readonly photoPreviewUrl = signal<string | null>(null);
  protected readonly pendingPhotoFile = signal<File | null>(null);

  protected readonly form = this.fb.group({
    firstName: this.fb.control('', { validators: [Validators.required] }),
    lastName: this.fb.control('', { validators: [Validators.required] }),
    birthDate: this.fb.control<Date | null>(null, { validators: [Validators.required] }),
    birthTime: this.fb.control('00:00', { validators: [Validators.required] }),
    isDefault: this.fb.control(false),
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
          const d = parse(r.birthDate, 'yyyy-MM-dd', new Date());
          const isDefault = localStorage.getItem(STORAGE_KEYS.DEFAULT_PERSON_ID) === r.id;
          this.form.patchValue({
            firstName: r.firstName,
            lastName: r.lastName,
            birthDate: d,
            birthTime: r.birthTime ?? '00:00',
            isDefault,
          });
          if (r.profilePhotoUrl) this.photoPreviewUrl.set(r.profilePhotoUrl);
        });
    } else {
      this.store.resetDetail();
      this.form.reset({ firstName: '', lastName: '', birthDate: null, birthTime: '00:00', isDefault: false });
      this.photoPreviewUrl.set(null);
      this.pendingPhotoFile.set(null);
    }
  }

  onPhotoSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.pendingPhotoFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.photoPreviewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const birthDate = format(v.birthDate!, 'yyyy-MM-dd');
    const payload = {
      firstName: v.firstName,
      lastName: v.lastName,
      birthDate,
      birthTime: v.birthTime,
    };
    const id = this.editId();
    const setAsDefault = v.isDefault;

    const req$ = id ? this.birthService.update(id, payload) : this.birthService.create(payload);
    const file = this.pendingPhotoFile();

    req$
      .pipe(
        switchMap((saved) => {
          if (!file) return of(saved);
          // Subir foto a S3
          return this.birthService.presignProfilePhoto(saved.id, file.name, file.type || 'image/jpeg').pipe(
            switchMap((presign) =>
              this.birthService.putToPresignedUrl(presign.uploadUrl, file, file.type || 'image/jpeg').pipe(
                switchMap(() => this.birthService.update(saved.id, { profilePhotoKey: presign.key })),
              ),
            ),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (saved) => {
          if (setAsDefault) {
            this.personCtx.setAsDefault(saved.id);
            this.personCtx.selectPerson(saved);
          }
          this.notify.showToastSuccess(id ? 'Actualizado correctamente.' : 'Hijo registrado.');
          this.store.loadList();
          void this.router.navigate(['/nacimientos']);
        },
        error: () => this.notify.showToastError('No se pudo guardar.'),
      });
  }
}
