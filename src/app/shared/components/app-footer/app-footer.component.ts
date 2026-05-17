import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './app-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFooterComponent {
  protected readonly version = signal(environment.version ?? '1.0.0');
}
