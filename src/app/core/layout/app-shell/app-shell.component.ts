import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AppHeaderComponent } from '../app-header/app-header.component';
import { AppSidebarComponent } from '../app-sidebar/app-sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, AppHeaderComponent, AppSidebarComponent],
  template: `
    <div class="shell-layout">
      <app-header />
      <div class="shell-body">
        <app-sidebar />
        <main class="shell-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--bg-primary);
      overflow: hidden;
    }
    .shell-body {
      display: flex;
      flex: 1;
      position: relative;
      overflow: hidden;
      min-height: 0;
    }
    .shell-content {
      flex: 1;
      padding: 2rem;
      max-width: 1380px;
      margin: 0 auto;
      width: 100%;
      overflow-y: auto;
      min-height: 0;
    }
    @media (max-width: 768px) {
      .shell-body {
        flex-direction: column;
      }
      .shell-content {
        padding: 1rem;
      }
    }
  `]
})
export class AppShellComponent { }
