import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AppHeaderComponent } from '@shared/components/app-header/app-header.component';
import { AppFooterComponent } from '@shared/components/app-footer/app-footer.component';
import { ThemeStore } from '@shared/stores/theme/theme.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule, AppHeaderComponent, AppFooterComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly themeStore = inject(ThemeStore);

  ngOnInit(): void {
    this.themeStore.loadTheme();
  }
}
