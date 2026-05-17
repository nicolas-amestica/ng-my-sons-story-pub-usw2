import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { AppFooterComponent } from '@shared/components/app-footer/app-footer.component';
import { ThemeStore } from '@shared/stores/theme/theme.store';
import { BirthdateService } from '@my-sons-story/birthdate/services/birthdate.service';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule, AppHeaderComponent, AppFooterComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly themeStore = inject(ThemeStore);
  private readonly birthdateService = inject(BirthdateService);
  private readonly personCtx = inject(PersonContextStore);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.themeStore.loadTheme();
    this.birthdateService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((records) => this.personCtx.loadDefault(records));
  }
}
