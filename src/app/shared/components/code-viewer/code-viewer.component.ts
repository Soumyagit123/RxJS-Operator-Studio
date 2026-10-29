import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-code-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="code-viewer-container glass-panel">
      <div class="code-viewer-header">
        <div class="code-title">
          <span class="file-icon">⚡</span>
          <span class="title-text">{{ title || 'TypeScript Implementation' }}</span>
        </div>
        <button class="copy-btn" (click)="copyCode()" [attr.aria-label]="copied() ? 'Copied' : 'Copy code'">
          <span>{{ copied() ? '✓ Copied' : '📋 Copy' }}</span>
        </button>
      </div>
      <div class="code-viewer-body">
        <pre><code class="language-typescript">{{ code }}</code></pre>
      </div>
    </div>
  `,
  styles: [`
    .code-viewer-container {
      margin: 1.25rem 0;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border-subtle);
      border-top: 1px solid var(--border-specular);
      background: #090d16;
      box-shadow: var(--shadow-md);
    }
    [data-theme="light"] .code-viewer-container {
      background: #0f172a; /* Keep dark IDE contrast for code readability even in light mode */
      border-color: rgba(15, 23, 42, 0.15);
      border-top-color: rgba(255, 255, 255, 0.9);
    }
    .code-viewer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.25rem;
      background: rgba(255, 255, 255, 0.04);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
    }
    .code-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.86rem;
      font-weight: 700;
      color: #e2e8f0;
      letter-spacing: -0.01em;
    }
    .file-icon {
      color: #38bdf8;
    }
    .copy-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .copy-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      color: #ffffff;
      transform: scale(1.04);
      border-color: rgba(255, 255, 255, 0.3);
    }
    .code-viewer-body {
      padding: 1.25rem;
      overflow-x: auto;
      max-height: 440px;
    }
    pre {
      margin: 0;
      font-family: var(--font-mono);
      font-size: 0.88rem;
      line-height: 1.65;
      color: #f1f5f9;
    }
    code {
      white-space: pre;
    }
  `]
})
export class CodeViewerComponent {
  @Input() code = '';
  @Input() title = '';

  readonly copied = signal(false);

  copyCode(): void {
    if (!this.code) return;
    navigator.clipboard.writeText(this.code).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    }).catch(() => {
      // Fallback or ignore
    });
  }
}
