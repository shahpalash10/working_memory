/* ============================================================
   CogScreen — Main Entry Point
   ============================================================ */

import './styles/index.css';
import './styles/tasks.css';
import './styles/admin.css';
import { initRouter } from './router.js';

// Single init — avoid double firing
initRouter();
