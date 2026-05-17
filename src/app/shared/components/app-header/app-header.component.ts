import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeStore } from '@shared/stores/theme/theme.store';
import { PersonContextStore } from '@shared/stores/person-context/person-context.store';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, ImageModule, ButtonModule, TooltipModule],
  templateUrl: './app-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent {
  protected readonly themeStore = inject(ThemeStore);
  protected readonly personCtx = inject(PersonContextStore);
}
