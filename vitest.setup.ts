import { vi } from 'vitest';

// グローバルモックの設定
// 環境変数のモック
vi.stubEnv('GITHUB_ACTIONS', 'true');